/**
 * News Ingestion Agent
 * 
 * Fetches news articles from Finnhub and processes them for sentiment analysis.
 * Designed to be triggered via cron job or on-demand.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FinnhubNewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

interface IngestRequest {
  assets?: string[];
  category?: string;
  limit?: number;
}

// Generate content hash for deduplication
function generateHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
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
    const { assets = [], category = "general", limit = 50 }: IngestRequest = await req.json().catch(() => ({}));
    
    const FINNHUB_API_KEY = Deno.env.get("FINNHUB_API_KEY");
    if (!FINNHUB_API_KEY) {
      throw new Error("FINNHUB_API_KEY not configured");
    }

    // Log agent run start
    const { data: runData } = await supabase
      .from("agent_runs")
      .insert({
        agent_name: "news-ingestion",
        agent_type: "ingestion",
        status: "running",
        metadata: { assets, category, limit }
      })
      .select()
      .single();

    const runId = runData?.id;
    let itemsProcessed = 0;
    let itemsFailed = 0;
    const errors: string[] = [];

    // Fetch general market news
    const newsUrl = `https://finnhub.io/api/v1/news?category=${category}&token=${FINNHUB_API_KEY}`;
    console.log(`Fetching news from Finnhub: ${category}`);
    
    const newsResponse = await fetch(newsUrl);
    if (!newsResponse.ok) {
      throw new Error(`Finnhub news API error: ${newsResponse.status}`);
    }

    const newsItems: FinnhubNewsItem[] = await newsResponse.json();
    console.log(`Received ${newsItems.length} news items`);

    // Process each news item
    for (const item of newsItems.slice(0, limit)) {
      try {
        const contentHash = generateHash(item.headline + item.summary);
        
        // Extract related assets
        const relatedAssets = item.related ? item.related.split(",").map(s => s.trim()) : [];
        const primaryAsset = relatedAssets[0] || null;

        // Insert signal (ignore duplicates)
        const { error } = await supabase
          .from("qualitative_signals")
          .upsert({
            asset: primaryAsset,
            asset_type: "stock",
            source_type: "news",
            source_name: item.source,
            source_url: item.url,
            title: item.headline,
            content: item.summary || item.headline,
            content_hash: contentHash,
            published_at: new Date(item.datetime * 1000).toISOString(),
            metadata: {
              category: item.category,
              related_assets: relatedAssets,
              image: item.image,
              finnhub_id: item.id
            }
          }, { onConflict: "content_hash", ignoreDuplicates: true });

        if (error) {
          console.warn(`Failed to insert news item: ${error.message}`);
          itemsFailed++;
          errors.push(error.message);
        } else {
          itemsProcessed++;
        }
      } catch (itemError) {
        console.error(`Error processing item:`, itemError);
        itemsFailed++;
      }
    }

    // Fetch company-specific news if assets provided
    for (const asset of assets.slice(0, 5)) { // Limit to 5 assets to avoid rate limits
      try {
        const companyUrl = `https://finnhub.io/api/v1/company-news?symbol=${asset}&from=${getDateString(-7)}&to=${getDateString(0)}&token=${FINNHUB_API_KEY}`;
        const companyResponse = await fetch(companyUrl);
        
        if (companyResponse.ok) {
          const companyNews: FinnhubNewsItem[] = await companyResponse.json();
          
          for (const item of companyNews.slice(0, 10)) {
            const contentHash = generateHash(item.headline + item.summary);
            
            await supabase
              .from("qualitative_signals")
              .upsert({
                asset: asset,
                asset_type: "stock",
                source_type: "news",
                source_name: item.source,
                source_url: item.url,
                title: item.headline,
                content: item.summary || item.headline,
                content_hash: contentHash,
                published_at: new Date(item.datetime * 1000).toISOString(),
                metadata: {
                  category: "company",
                  finnhub_id: item.id
                }
              }, { onConflict: "content_hash", ignoreDuplicates: true });
            
            itemsProcessed++;
          }
        }
      } catch (assetError) {
        console.error(`Error fetching news for ${asset}:`, assetError);
        errors.push(`${asset}: ${assetError}`);
      }
    }

    // Update agent run status
    if (runId) {
      await supabase
        .from("agent_runs")
        .update({
          status: itemsFailed > itemsProcessed / 2 ? "failed" : "completed",
          completed_at: new Date().toISOString(),
          items_processed: itemsProcessed,
          items_failed: itemsFailed,
          error_message: errors.length > 0 ? errors.slice(0, 5).join("; ") : null
        })
        .eq("id", runId);
    }

    console.log(`News ingestion complete: ${itemsProcessed} processed, ${itemsFailed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        itemsProcessed,
        itemsFailed,
        message: `Ingested ${itemsProcessed} news items`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("News ingestion error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getDateString(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split("T")[0];
}