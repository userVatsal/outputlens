/**
 * Optimization Engine - AI-Powered Continuous Improvement
 * 
 * Analyzes platform metrics and generates actionable recommendations:
 * - Cost optimization suggestions
 * - Performance improvements
 * - Feature usage insights
 * - Security enhancements
 * 
 * Runs hourly via pg_cron
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MetricSummary {
  name: string;
  value: number;
  trend?: 'up' | 'down' | 'stable';
  threshold?: number;
  status?: 'ok' | 'warning' | 'critical';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    console.log("[OPTIMIZER] Starting optimization analysis...");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    // Collect recent metrics for analysis
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get recent platform metrics
    const { data: recentMetrics } = await supabase
      .from("platform_metrics")
      .select("*")
      .gte("recorded_at", oneDayAgo.toISOString())
      .order("recorded_at", { ascending: false });

    // Aggregate metrics by type
    const metricSummaries: MetricSummary[] = [];

    // Processing backlog analysis
    const backlogMetrics = recentMetrics?.filter(m => m.metric_name === 'sentiment_processing_backlog') || [];
    if (backlogMetrics.length > 0) {
      const latestBacklog = backlogMetrics[0].metric_value;
      const avgBacklog = backlogMetrics.reduce((sum, m) => sum + m.metric_value, 0) / backlogMetrics.length;
      
      metricSummaries.push({
        name: 'processing_backlog',
        value: latestBacklog,
        threshold: 50,
        status: latestBacklog > 50 ? 'warning' : latestBacklog > 100 ? 'critical' : 'ok',
        trend: latestBacklog > avgBacklog ? 'up' : 'down'
      });
    }

    // Cache performance analysis
    const cacheMetrics = recentMetrics?.filter(m => m.metric_name === 'cache_freshness_rate') || [];
    if (cacheMetrics.length > 0) {
      const latestCacheRate = cacheMetrics[0].metric_value;
      
      metricSummaries.push({
        name: 'cache_hit_rate',
        value: latestCacheRate,
        threshold: 0.7,
        status: latestCacheRate < 0.5 ? 'warning' : latestCacheRate < 0.3 ? 'critical' : 'ok'
      });
    }

    // AI cost analysis
    const aiCostMetrics = recentMetrics?.filter(m => m.metric_type === 'ai_cost') || [];
    const totalAiCalls = aiCostMetrics.reduce((sum, m) => sum + m.metric_value, 0);
    
    metricSummaries.push({
      name: 'ai_calls_24h',
      value: totalAiCalls,
      threshold: 100,
      status: totalAiCalls > 500 ? 'warning' : 'ok'
    });

    // Edge function latency
    const latencyMetrics = recentMetrics?.filter(m => m.metric_name?.includes('latency')) || [];
    if (latencyMetrics.length > 0) {
      const avgLatency = latencyMetrics.reduce((sum, m) => sum + m.metric_value, 0) / latencyMetrics.length;
      
      metricSummaries.push({
        name: 'avg_function_latency_ms',
        value: avgLatency,
        threshold: 3000,
        status: avgLatency > 5000 ? 'critical' : avgLatency > 3000 ? 'warning' : 'ok'
      });
    }

    // Generate recommendations based on metrics
    const recommendations: any[] = [];

    // Check for high backlog
    const backlogSummary = metricSummaries.find(m => m.name === 'processing_backlog');
    if (backlogSummary && backlogSummary.status !== 'ok') {
      recommendations.push({
        category: 'performance',
        priority: backlogSummary.status === 'critical' ? 'critical' : 'high',
        title: 'High sentiment processing backlog',
        description: `${backlogSummary.value} signals are pending processing. Consider increasing batch size or processing frequency.`,
        impact_estimate: { performance_gain: 0.3, processing_time_reduction: 0.5 },
        action_type: 'automated'
      });
    }

    // Check for low cache hit rate
    const cacheSummary = metricSummaries.find(m => m.name === 'cache_hit_rate');
    if (cacheSummary && cacheSummary.status !== 'ok') {
      recommendations.push({
        category: 'cost',
        priority: 'high',
        title: 'Low market data cache hit rate',
        description: `Cache freshness is at ${(cacheSummary.value * 100).toFixed(1)}%. Consider extending cache TTL or pre-warming popular symbols.`,
        impact_estimate: { cost_reduction: 0.2, api_calls_reduction: 0.3 },
        action_type: 'manual'
      });
    }

    // Check for high AI costs
    const aiSummary = metricSummaries.find(m => m.name === 'ai_calls_24h');
    if (aiSummary && aiSummary.value > 200) {
      recommendations.push({
        category: 'cost',
        priority: 'medium',
        title: 'High AI API usage detected',
        description: `${aiSummary.value} AI calls in the last 24 hours. Consider increasing batch sizes or using flash-lite model for free tier users.`,
        impact_estimate: { cost_reduction: 0.4 },
        action_type: 'review'
      });
    }

    // Check for slow functions
    const latencySummary = metricSummaries.find(m => m.name === 'avg_function_latency_ms');
    if (latencySummary && latencySummary.status !== 'ok') {
      recommendations.push({
        category: 'performance',
        priority: latencySummary.status === 'critical' ? 'critical' : 'high',
        title: 'Elevated edge function latency',
        description: `Average latency is ${latencySummary.value.toFixed(0)}ms. Review function cold starts and external API timeouts.`,
        impact_estimate: { performance_gain: 0.25, user_experience: 0.3 },
        action_type: 'manual'
      });
    }

    // Use AI to analyze metrics and generate deeper insights if API key available
    if (LOVABLE_API_KEY && metricSummaries.length > 0) {
      try {
        const aiAnalysis = await generateAIInsights(
          metricSummaries,
          recentMetrics || [],
          LOVABLE_API_KEY
        );
        
        if (aiAnalysis) {
          recommendations.push(...aiAnalysis);
        }
      } catch (err) {
        console.error("[OPTIMIZER] AI analysis failed:", err);
      }
    }

    // Insert new recommendations
    if (recommendations.length > 0) {
      const { error: insertError } = await supabase
        .from("optimization_recommendations")
        .insert(recommendations.map(r => ({
          ...r,
          status: 'pending'
        })));

      if (insertError) {
        console.error("[OPTIMIZER] Error inserting recommendations:", insertError);
      } else {
        console.log(`[OPTIMIZER] Generated ${recommendations.length} recommendations`);
      }
    }

    // Clean up old pending recommendations (older than 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await supabase
      .from("optimization_recommendations")
      .delete()
      .eq("status", "pending")
      .lt("created_at", sevenDaysAgo.toISOString());

    return new Response(
      JSON.stringify({
        success: true,
        metricsAnalyzed: metricSummaries.length,
        recommendationsGenerated: recommendations.length,
        summaries: metricSummaries
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[OPTIMIZER] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function generateAIInsights(
  summaries: MetricSummary[],
  rawMetrics: any[],
  apiKey: string
): Promise<any[] | null> {
  const prompt = `Analyze these OutputLens platform metrics and suggest optimizations:

METRICS SUMMARY:
${summaries.map(s => `- ${s.name}: ${s.value} (status: ${s.status || 'ok'}, trend: ${s.trend || 'stable'})`).join('\n')}

RAW METRICS (last 24h sample):
${rawMetrics.slice(0, 20).map(m => `- ${m.metric_name}: ${m.metric_value} at ${m.recorded_at}`).join('\n')}

Generate 1-2 actionable recommendations focusing on:
1. Cost optimization (AI calls, API usage)
2. Performance improvement (latency, caching)
3. User experience (feature adoption, conversion)

For each recommendation provide:
- category: 'cost' | 'performance' | 'feature' | 'security'
- priority: 'critical' | 'high' | 'medium' | 'low'
- title: Brief title
- description: Actionable description with specific metrics
- impact_estimate: { cost_reduction?: number, performance_gain?: number }
- action_type: 'automated' | 'manual' | 'review'`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You are a platform optimization AI that analyzes metrics and generates actionable improvement recommendations. Be specific and data-driven." },
          { role: "user", content: prompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_recommendations",
            description: "Generate optimization recommendations based on metrics",
            parameters: {
              type: "object",
              properties: {
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      category: { type: "string", enum: ["cost", "performance", "feature", "security"] },
                      priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                      title: { type: "string" },
                      description: { type: "string" },
                      impact_estimate: { type: "object" },
                      action_type: { type: "string", enum: ["automated", "manual", "review"] }
                    },
                    required: ["category", "priority", "title", "description"]
                  }
                }
              },
              required: ["recommendations"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_recommendations" } }
      }),
    });

    if (!response.ok) {
      console.error("[OPTIMIZER] AI API error:", response.status);
      return null;
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      return null;
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    return parsed.recommendations || [];
    
  } catch (err) {
    console.error("[OPTIMIZER] AI insights error:", err);
    return null;
  }
}
