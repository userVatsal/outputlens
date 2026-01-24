/**
 * Agent Pipeline Orchestrator
 * 
 * Runs the full qualitative→quantitative pipeline for specified assets:
 * 1. Ingest news
 * 2. Process sentiment
 * 3. Aggregate insights
 * 
 * Can be triggered via cron job or on-demand.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PipelineRequest {
  assets?: string[];
  stages?: ("ingest" | "sentiment" | "aggregate")[];
  newsLimit?: number;
  sentimentLimit?: number;
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
      stages = ["ingest", "sentiment", "aggregate"],
      newsLimit = 50,
      sentimentLimit = 20
    }: PipelineRequest = await req.json().catch(() => ({}));

    console.log(`Running agent pipeline: stages=${stages.join(",")}, assets=${assets.join(",") || "all"}`);

    const results: Record<string, any> = {};
    const errors: string[] = [];

    // Stage 1: Ingest News
    if (stages.includes("ingest")) {
      console.log("Stage 1: Ingesting news...");
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
          results.ingest = await ingestResponse.json();
          console.log(`Ingest complete: ${results.ingest.itemsProcessed} items`);
        } else {
          const error = await ingestResponse.text();
          errors.push(`Ingest failed: ${error}`);
          console.error("Ingest error:", error);
        }
      } catch (ingestError) {
        errors.push(`Ingest error: ${ingestError}`);
        console.error("Ingest error:", ingestError);
      }

      // Small delay before next stage
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Stage 2: Process Sentiment
    if (stages.includes("sentiment")) {
      console.log("Stage 2: Processing sentiment...");
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

    // Stage 3: Aggregate Insights (for each asset)
    if (stages.includes("aggregate")) {
      console.log("Stage 3: Aggregating insights...");
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
        newsIngested: results.ingest?.itemsProcessed || 0,
        sentimentProcessed: results.sentiment?.itemsProcessed || 0,
        assetsAggregated: Object.keys(results.aggregate || {}).length
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