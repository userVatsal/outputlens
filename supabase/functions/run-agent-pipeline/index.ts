/**
 * Agent Pipeline Orchestrator
 * 
 * Runs the full qualitative→quantitative pipeline for specified assets:
 * 1. Ingest news (Finnhub)
 * 2. Ingest social media (Reddit, blogs via Firecrawl)
 * 3. Ingest YouTube (financial video content)
 * 4. Process sentiment (Lovable AI)
 * 5. Aggregate insights (weighted by source)
 * 
 * Can be triggered via cron job or on-demand.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type PipelineStage = "ingest-news" | "ingest-social" | "ingest-youtube" | "sentiment" | "aggregate";

interface PipelineRequest {
  assets?: string[];
  stages?: PipelineStage[];
  newsLimit?: number;
  sentimentLimit?: number;
  socialSubreddits?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const {
      assets = [],
      stages = ["ingest-news", "ingest-social", "ingest-youtube", "sentiment", "aggregate"],
      newsLimit = 50,
      sentimentLimit = 30,
      socialSubreddits
    }: PipelineRequest = await req.json().catch(() => ({}));

    console.log(`Running agent pipeline: stages=${stages.join(",")}, assets=${assets.join(",") || "all"}`);

    const results: Record<string, any> = {};
    const errors: string[] = [];

    // Stage 1: Ingest News (Finnhub)
    if (stages.includes("ingest-news")) {
      console.log("Stage: Ingesting news from Finnhub...");
      try {
        const ingestResponse = await fetch(`${supabaseUrl}/functions/v1/ingest-news`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ assets, limit: newsLimit })
        });

        if (ingestResponse.ok) {
          results.ingestNews = await ingestResponse.json();
          console.log(`News ingest complete: ${results.ingestNews.itemsProcessed} items`);
        } else {
          const error = await ingestResponse.text();
          errors.push(`News ingest failed: ${error}`);
          console.error("News ingest error:", error);
        }
      } catch (ingestError) {
        errors.push(`News ingest error: ${ingestError}`);
        console.error("News ingest error:", ingestError);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Stage 2: Ingest Social Media (Reddit, blogs via Firecrawl)
    if (stages.includes("ingest-social")) {
      console.log("Stage: Ingesting social media via Firecrawl...");
      try {
        const socialResponse = await fetch(`${supabaseUrl}/functions/v1/ingest-social`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            assets, 
            subreddits: socialSubreddits,
            limit: 30 
          })
        });

        if (socialResponse.ok) {
          results.ingestSocial = await socialResponse.json();
          console.log(`Social ingest complete: ${results.ingestSocial.itemsProcessed} items`);
        } else {
          const error = await socialResponse.text();
          errors.push(`Social ingest failed: ${error}`);
          console.error("Social ingest error:", error);
        }
      } catch (socialError) {
        errors.push(`Social ingest error: ${socialError}`);
        console.error("Social ingest error:", socialError);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Stage 3: Ingest YouTube (financial video content)
    if (stages.includes("ingest-youtube")) {
      console.log("Stage: Ingesting YouTube content via Firecrawl...");
      try {
        const youtubeResponse = await fetch(`${supabaseUrl}/functions/v1/ingest-youtube`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ assets, limit: 20 })
        });

        if (youtubeResponse.ok) {
          results.ingestYoutube = await youtubeResponse.json();
          console.log(`YouTube ingest complete: ${results.ingestYoutube.itemsProcessed} items`);
        } else {
          const error = await youtubeResponse.text();
          errors.push(`YouTube ingest failed: ${error}`);
          console.error("YouTube ingest error:", error);
        }
      } catch (youtubeError) {
        errors.push(`YouTube ingest error: ${youtubeError}`);
        console.error("YouTube ingest error:", youtubeError);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Stage 4: Process Sentiment
    if (stages.includes("sentiment")) {
      console.log("Stage: Processing sentiment via Lovable AI...");
      try {
        const sentimentResponse = await fetch(`${supabaseUrl}/functions/v1/process-sentiment`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ limit: sentimentLimit })
        });

        if (sentimentResponse.ok) {
          results.sentiment = await sentimentResponse.json();
          console.log(`Sentiment complete: ${results.sentiment.itemsProcessed} items`);
        } else {
          const error = await sentimentResponse.text();
          errors.push(`Sentiment failed: ${error}`);
          console.error("Sentiment error:", error);
        }
      } catch (sentimentError) {
        errors.push(`Sentiment error: ${sentimentError}`);
        console.error("Sentiment error:", sentimentError);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Stage 5: Aggregate Insights (for each asset)
    if (stages.includes("aggregate")) {
      console.log("Stage: Aggregating insights with source weighting...");
      results.aggregate = {};

      // Get unique assets from sentiment scores if none specified
      let assetsToAggregate = assets;
      if (assetsToAggregate.length === 0) {
        const { data: recentAssets } = await supabase
          .from("sentiment_scores")
          .select("asset")
          .gte("processed_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order("processed_at", { ascending: false });

        if (recentAssets) {
          assetsToAggregate = [...new Set(recentAssets.map(r => r.asset))].slice(0, 20);
        }
      }

      for (const asset of assetsToAggregate) {
        try {
          const aggregateResponse = await fetch(`${supabaseUrl}/functions/v1/aggregate-insights`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${serviceRoleKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ asset, windowHours: 24 })
          });

          if (aggregateResponse.ok) {
            results.aggregate[asset] = await aggregateResponse.json();
          } else {
            errors.push(`Aggregate ${asset} failed`);
          }
        } catch (aggError) {
          errors.push(`Aggregate ${asset} error: ${aggError}`);
        }
      }

      console.log(`Aggregation complete for ${Object.keys(results.aggregate).length} assets`);
    }

    // Summarize results
    const summary = {
      success: errors.length === 0,
      stages: stages,
      results: {
        newsIngested: results.ingestNews?.itemsProcessed || 0,
        socialIngested: results.ingestSocial?.itemsProcessed || 0,
        youtubeIngested: results.ingestYoutube?.itemsProcessed || 0,
        sentimentProcessed: results.sentiment?.itemsProcessed || 0,
        assetsAggregated: Object.keys(results.aggregate || {}).length
      },
      sources: {
        news: results.ingestNews?.itemsProcessed || 0,
        reddit: results.ingestSocial?.sources?.reddit || 0,
        research: results.ingestSocial?.sources?.research || 0,
        youtube: results.ingestYoutube?.videosFound || 0
      },
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    };

    console.log("Pipeline complete:", summary);

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Pipeline error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});