/**
 * YouTube Financial Content Ingestion Agent
 * 
 * Extracts video metadata and descriptions from financial YouTube channels
 * using Firecrawl for qualitative sentiment analysis.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IngestYouTubeRequest {
  assets?: string[];
  channels?: string[];
  limit?: number;
}

// Simple hash function for content deduplication
function generateHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// Major financial YouTube channels to search
const FINANCIAL_CHANNELS = [
  'CNBC',
  'Bloomberg Television',
  'Yahoo Finance',
  'The Motley Fool',
  'Financial Times'
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const firecrawlApiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!firecrawlApiKey) {
    console.error("FIRECRAWL_API_KEY not configured");
    return new Response(
      JSON.stringify({ error: "Firecrawl API key not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const {
      assets = [],
      channels = FINANCIAL_CHANNELS,
      limit = 20
    }: IngestYouTubeRequest = await req.json().catch(() => ({}));

    console.log(`Ingesting YouTube content: assets=${assets.join(",") || "all"}, channels=${channels.length}`);

    // Create agent run record
    const { data: run, error: runError } = await supabase
      .from("agent_runs")
      .insert({
        agent_name: "ingest-youtube",
        agent_type: "ingestion",
        status: "running",
        started_at: new Date().toISOString(),
        metadata: { assets, channels: channels.length, limit }
      })
      .select()
      .single();

    if (runError) {
      console.warn("Failed to create run record:", runError.message);
    }

    let itemsProcessed = 0;
    let itemsFailed = 0;
    const signals: any[] = [];

    // Build search queries for YouTube content
    const searchQueries: string[] = [];
    
    if (assets.length > 0) {
      // Search for specific assets with financial context
      for (const asset of assets.slice(0, 5)) {
        searchQueries.push(`${asset} stock analysis youtube`);
        searchQueries.push(`${asset} earnings youtube`);
      }
    } else {
      // General financial content searches
      searchQueries.push('stock market analysis youtube today');
      searchQueries.push('market news youtube today');
      searchQueries.push('trading analysis youtube');
    }

    // Add channel-specific searches
    for (const channel of channels.slice(0, 3)) {
      searchQueries.push(`${channel} youtube stock market`);
    }

    // Search for YouTube videos via Firecrawl
    for (const query of searchQueries.slice(0, 8)) { // Limit queries
      try {
        console.log(`Searching YouTube content: ${query}`);
        
        const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            limit: Math.min(limit, 5),
            tbs: 'qdr:d', // Last 24 hours
          }),
        });

        if (!searchResponse.ok) {
          console.warn(`Search failed for "${query}": ${searchResponse.status}`);
          itemsFailed++;
          continue;
        }

        const searchData = await searchResponse.json();
        const results = searchData.data || [];

        for (const result of results) {
          // Filter for YouTube results
          const isYouTube = result.url?.includes('youtube.com') || result.url?.includes('youtu.be');
          if (!isYouTube) continue;

          // Extract asset from content
          const detectedAsset = assets.find(a => 
            result.title?.toUpperCase().includes(a.toUpperCase()) ||
            result.description?.toUpperCase().includes(a.toUpperCase())
          ) || null;

          // Detect channel from result
          const channelMatch = channels.find(c =>
            result.title?.toLowerCase().includes(c.toLowerCase()) ||
            result.description?.toLowerCase().includes(c.toLowerCase())
          );

          const content = `${result.title || ''}\n\n${result.description || ''}`.trim();
          if (!content || content.length < 20) continue;

          const contentHash = generateHash(content + result.url);

          signals.push({
            asset: detectedAsset,
            asset_type: detectedAsset ? 'stock' : null,
            source_type: 'video',
            source_name: channelMatch || 'YouTube',
            source_url: result.url,
            title: result.title?.slice(0, 500),
            content: content.slice(0, 5000),
            content_hash: contentHash,
            language: 'en',
            fetched_at: new Date().toISOString(),
            processed: false,
            metadata: {
              search_query: query,
              platform: 'youtube',
              channel: channelMatch || 'unknown',
              ingested_by: 'ingest-youtube'
            }
          });

          itemsProcessed++;
        }

        // Rate limit protection
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error searching "${query}":`, error);
        itemsFailed++;
      }
    }

    // Store signals in database
    if (signals.length > 0) {
      const { error: insertError } = await supabase
        .from("qualitative_signals")
        .upsert(signals, { 
          onConflict: "content_hash",
          ignoreDuplicates: true 
        });

      if (insertError) {
        console.error("Failed to insert signals:", insertError.message);
        itemsFailed += signals.length;
        itemsProcessed = 0;
      } else {
        console.log(`Stored ${signals.length} YouTube signals`);
      }
    }

    // Update run record
    if (run?.id) {
      await supabase
        .from("agent_runs")
        .update({
          status: itemsFailed > itemsProcessed ? "failed" : "completed",
          completed_at: new Date().toISOString(),
          items_processed: itemsProcessed,
          items_failed: itemsFailed
        })
        .eq("id", run.id);
    }

    const result = {
      success: true,
      itemsProcessed,
      itemsFailed,
      videosFound: signals.length,
      uniqueChannels: [...new Set(signals.map(s => s.metadata?.channel))].filter(Boolean)
    };

    console.log("YouTube ingestion complete:", result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("YouTube ingestion error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
