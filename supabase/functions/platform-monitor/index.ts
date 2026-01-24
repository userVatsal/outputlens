/**
 * Platform Monitor - Continuous Improvement AI
 * 
 * Collects metrics on:
 * - Edge function performance (latency, error rates)
 * - AI API usage and costs
 * - Cache hit rates
 * - Processing backlogs
 * - Subscription metrics
 * 
 * Runs every 15 minutes via pg_cron
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    console.log("[MONITOR] Starting platform metrics collection...");
    const metricsToInsert: any[] = [];

    // 1. Processing backlog (unprocessed signals)
    const { count: backlogCount } = await supabase
      .from("qualitative_signals")
      .select("*", { count: "exact", head: true })
      .eq("processed", false);

    metricsToInsert.push({
      metric_type: "usage",
      metric_name: "sentiment_processing_backlog",
      metric_value: backlogCount || 0,
      dimensions: {}
    });
    console.log(`[MONITOR] Processing backlog: ${backlogCount} signals`);

    // 2. Total signals by source type
    const { data: signalsBySource } = await supabase
      .from("qualitative_signals")
      .select("source_type")
      .limit(1000);

    if (signalsBySource) {
      const sourceCounts: Record<string, number> = {};
      signalsBySource.forEach(s => {
        sourceCounts[s.source_type] = (sourceCounts[s.source_type] || 0) + 1;
      });

      Object.entries(sourceCounts).forEach(([source, count]) => {
        metricsToInsert.push({
          metric_type: "usage",
          metric_name: "signals_by_source",
          metric_value: count,
          dimensions: { source_type: source }
        });
      });
    }

    // 3. User subscription distribution
    const { data: profiles } = await supabase
      .from("profiles")
      .select("subscription_plan");

    if (profiles) {
      const planCounts: Record<string, number> = {};
      profiles.forEach(p => {
        const plan = p.subscription_plan || 'free';
        planCounts[plan] = (planCounts[plan] || 0) + 1;
      });

      Object.entries(planCounts).forEach(([plan, count]) => {
        metricsToInsert.push({
          metric_type: "conversion",
          metric_name: "users_by_plan",
          metric_value: count,
          dimensions: { plan }
        });
      });
      console.log(`[MONITOR] User distribution:`, planCounts);
    }

    // 4. Cache performance (from market_data_cache)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const { count: totalCacheEntries } = await supabase
      .from("market_data_cache")
      .select("*", { count: "exact", head: true });

    const { count: freshCacheEntries } = await supabase
      .from("market_data_cache")
      .select("*", { count: "exact", head: true })
      .gte("expires_at", now.toISOString());

    const cacheHitRate = totalCacheEntries ? (freshCacheEntries || 0) / totalCacheEntries : 0;

    metricsToInsert.push({
      metric_type: "cache",
      metric_name: "market_data_cache_entries",
      metric_value: totalCacheEntries || 0,
      dimensions: { fresh: freshCacheEntries || 0 }
    });

    metricsToInsert.push({
      metric_type: "cache",
      metric_name: "cache_freshness_rate",
      metric_value: cacheHitRate,
      dimensions: {}
    });
    console.log(`[MONITOR] Cache freshness: ${(cacheHitRate * 100).toFixed(1)}%`);

    // 5. Recent analysis activity (last 24 hours)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const { count: recentAnalyses } = await supabase
      .from("analysis_history")
      .select("*", { count: "exact", head: true })
      .gte("created_at", oneDayAgo.toISOString());

    metricsToInsert.push({
      metric_type: "usage",
      metric_name: "analyses_last_24h",
      metric_value: recentAnalyses || 0,
      dimensions: {}
    });
    console.log(`[MONITOR] Analyses last 24h: ${recentAnalyses}`);

    // 6. Agent run success rate (last 24 hours)
    const { data: agentRuns } = await supabase
      .from("agent_runs")
      .select("status, items_processed, items_failed")
      .gte("created_at", oneDayAgo.toISOString());

    if (agentRuns) {
      const totalRuns = agentRuns.length;
      const successfulRuns = agentRuns.filter(r => r.status === "completed").length;
      const totalProcessed = agentRuns.reduce((sum, r) => sum + (r.items_processed || 0), 0);
      const totalFailed = agentRuns.reduce((sum, r) => sum + (r.items_failed || 0), 0);

      metricsToInsert.push({
        metric_type: "edge_function",
        metric_name: "agent_run_success_rate",
        metric_value: totalRuns ? successfulRuns / totalRuns : 1,
        dimensions: { total_runs: totalRuns }
      });

      metricsToInsert.push({
        metric_type: "edge_function",
        metric_name: "agent_items_processed_24h",
        metric_value: totalProcessed,
        dimensions: { failed: totalFailed }
      });
    }

    // 7. Sentiment score distribution
    const { data: sentimentScores } = await supabase
      .from("sentiment_scores")
      .select("sentiment_score")
      .gte("processed_at", oneDayAgo.toISOString());

    if (sentimentScores && sentimentScores.length > 0) {
      const avgSentiment = sentimentScores.reduce((sum, s) => sum + s.sentiment_score, 0) / sentimentScores.length;
      const bullish = sentimentScores.filter(s => s.sentiment_score > 0.3).length;
      const bearish = sentimentScores.filter(s => s.sentiment_score < -0.3).length;
      const neutral = sentimentScores.length - bullish - bearish;

      metricsToInsert.push({
        metric_type: "usage",
        metric_name: "avg_sentiment_24h",
        metric_value: avgSentiment,
        dimensions: { bullish, bearish, neutral, total: sentimentScores.length }
      });
    }

    // 8. SentinelAI Security Metrics (last 24 hours)
    const { count: securityEventsCount } = await supabase
      .from("security_events")
      .select("*", { count: "exact", head: true })
      .gte("created_at", oneDayAgo.toISOString());

    metricsToInsert.push({
      metric_type: "security",
      metric_name: "security_events_24h",
      metric_value: securityEventsCount || 0,
      dimensions: {}
    });

    // Failed logins
    const { count: failedLogins } = await supabase
      .from("security_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "failed_login")
      .gte("created_at", oneDayAgo.toISOString());

    metricsToInsert.push({
      metric_type: "security",
      metric_name: "failed_logins_24h",
      metric_value: failedLogins || 0,
      dimensions: {}
    });

    // Blocked IPs
    const { count: blockedIps } = await supabase
      .from("security_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "blocked")
      .gte("created_at", oneDayAgo.toISOString());

    metricsToInsert.push({
      metric_type: "security",
      metric_name: "blocked_requests_24h",
      metric_value: blockedIps || 0,
      dimensions: {}
    });

    // Captcha challenges
    const { data: captchaChallenges } = await supabase
      .from("captcha_challenges")
      .select("success")
      .gte("issued_at", oneDayAgo.toISOString());

    if (captchaChallenges && captchaChallenges.length > 0) {
      const passed = captchaChallenges.filter(c => c.success === true).length;
      const failed = captchaChallenges.filter(c => c.success === false).length;
      const pending = captchaChallenges.length - passed - failed;
      const passRate = captchaChallenges.length > 0 ? passed / captchaChallenges.length : 1;

      metricsToInsert.push({
        metric_type: "security",
        metric_name: "captcha_stats_24h",
        metric_value: passRate,
        dimensions: { total: captchaChallenges.length, passed, failed, pending }
      });
    }

    // High severity events
    const { count: highSeverityEvents } = await supabase
      .from("security_events")
      .select("*", { count: "exact", head: true })
      .in("severity", ["high", "critical"])
      .gte("created_at", oneDayAgo.toISOString());

    metricsToInsert.push({
      metric_type: "security",
      metric_name: "high_severity_events_24h",
      metric_value: highSeverityEvents || 0,
      dimensions: {}
    });

    console.log(`[MONITOR] Security events: ${securityEventsCount}, Failed logins: ${failedLogins}, Blocked: ${blockedIps}`);

    // Insert all metrics
    if (metricsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("platform_metrics")
        .insert(metricsToInsert);

      if (insertError) {
        console.error("[MONITOR] Error inserting metrics:", insertError);
      } else {
        console.log(`[MONITOR] Inserted ${metricsToInsert.length} metrics`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        metricsCollected: metricsToInsert.length,
        summary: {
          backlog: backlogCount,
          cacheHitRate: (cacheHitRate * 100).toFixed(1) + "%",
          analysesLast24h: recentAnalyses
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[MONITOR] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
