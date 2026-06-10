// FILE LOCATION: supabase/functions/run-agent-pipeline/index.ts
// ACTION: REPLACE ENTIRE FILE

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
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

    // Stage 1: Ingest News — isolated so failure does not kill pipeline
    if (stages.includes("ingest-news")) {
      console.log("Stage: Ingesting news from Finnhub...");
      try {
        const r = await fetch(`${supabaseUrl}/functions/v1/ingest-news`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ assets, limit: newsLimit })
        });
        results.ingestNews = r.ok ? await r.json() : { error: await r.text(), itemsProcessed: 0 };
        console.log(`News ingest: ${results.ingestNews.itemsProcessed ?? 0} items`);
      } catch (e) {
        errors.push(`News ingest error: ${e}`);
        results.ingestNews = { error: String(e), itemsProcessed: 0 };
        console.error("ingest-news failed (continuing pipeline):", e);
      }
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Stage 2: Ingest Social — isolated
    if (stages.includes("ingest-social")) {
      console.log("Stage: Ingesting social media...");
      try {
        const r = await fetch(`${supabaseUrl}/functions/v1/ingest-social`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ assets, subreddits: socialSubreddits, limit: 30 })
        });
        results.ingestSocial = r.ok ? await r.json() : { error: await r.text(), itemsProcessed: 0 };
        console.log(`Social ingest: ${results.ingestSocial.itemsProcessed ?? 0} items`);
      } catch (e) {
        errors.push(`Social ingest error: ${e}`);
        results.ingestSocial = { error: String(e), itemsProcessed: 0 };
        console.error("ingest-social failed (continuing pipeline):", e);
      }
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Stage 3: Ingest YouTube — isolated
    if (stages.includes("ingest-youtube")) {
      console.log("Stage: Ingesting YouTube...");
      try {
        const r = await fetch(`${supabaseUrl}/functions/v1/ingest-youtube`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ assets, limit: 20 })
        });
        results.ingestYoutube = r.ok ? await r.json() : { error: await r.text(), itemsProcessed: 0 };
        console.log(`YouTube ingest: ${results.ingestYoutube.itemsProcessed ?? 0} items`);
      } catch (e) {
        errors.push(`YouTube ingest error: ${e}`);
        results.ingestYoutube = { error: String(e), itemsProcessed: 0 };
        console.error("ingest-youtube failed (continuing pipeline):", e);
      }
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Stage 4: Process Sentiment — isolated
    if (stages.includes("sentiment")) {
      console.log("Stage: Processing sentiment...");
      try {
        const r = await fetch(`${supabaseUrl}/functions/v1/process-sentiment`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ limit: sentimentLimit })
        });
        results.sentiment = r.ok ? await r.json() : { error: await r.text(), itemsProcessed: 0 };
        console.log(`Sentiment: ${results.sentiment.itemsProcessed ?? 0} items`);
      } catch (e) {
        errors.push(`Sentiment error: ${e}`);
        results.sentiment = { error: String(e), itemsProcessed: 0 };
        console.error("process-sentiment failed (continuing pipeline):", e);
      }
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Stage 5: Aggregate Insights — isolated per asset
    if (stages.includes("aggregate")) {
      console.log("Stage: Aggregating insights...");
      results.aggregate = {};

      let assetsToAggregate = assets;
      if (assetsToAggregate.length === 0) {
        try {
          const { data: recentAssets } = await supabase
            .from("sentiment_scores")
            .select("asset")
            .gte("processed_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order("processed_at", { ascending: false });
          if (recentAssets) {
            assetsToAggregate = [...new Set(recentAssets.map(r => r.asset))].slice(0, 20);
          }
        } catch (e) {
          console.error("Could not fetch assets for aggregation:", e);
        }
      }

      for (const asset of assetsToAggregate) {
        try {
          const r = await fetch(`${supabaseUrl}/functions/v1/aggregate-insights`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ asset, windowHours: 24 })
          });
          results.aggregate[asset] = r.ok ? await r.json() : { error: await r.text() };
        } catch (e) {
          errors.push(`Aggregate ${asset} error: ${e}`);
          results.aggregate[asset] = { error: String(e) };
        }
      }
      console.log(`Aggregation complete for ${Object.keys(results.aggregate).length} assets`);
    }

    const summary = {
      success: errors.length === 0,
      stages,
      results: {
        newsIngested: results.ingestNews?.itemsProcessed || 0,
        socialIngested: results.ingestSocial?.itemsProcessed || 0,
        youtubeIngested: results.ingestYoutube?.itemsProcessed || 0,
        sentimentProcessed: results.sentiment?.itemsProcessed || 0,
        assetsAggregated: Object.keys(results.aggregate || {}).length
      },
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    };

    console.log("Pipeline complete:", summary);
    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Pipeline fatal error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});