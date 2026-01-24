/**
 * Social Media Ingestion Agent
 * 
 * Scrapes Reddit finance subreddits and financial blogs using Firecrawl
 * to gather qualitative signals for sentiment analysis.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IngestSocialRequest {
  assets?: string[];
  subreddits?: string[];
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

// Default subreddits to monitor for financial content
const DEFAULT_SUBREDDITS = [
  'wallstreetbets',
  'stocks', 
  'investing',
  'options',
  'cryptocurrency',
  'SecurityAnalysis'
];

// Financial blog URLs to scrape
const FINANCIAL_BLOGS = [
  'https://seekingalpha.com/market-news',
  'https://www.fool.com/investing-news/',
  'https://finance.yahoo.com/topic/stock-market-news/'
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
      subreddits = DEFAULT_SUBREDDITS,
      limit = 30
    }: IngestSocialRequest = await req.json().catch(() => ({}));

    console.log(`Ingesting social signals: assets=${assets.join(",") || "all"}, subreddits=${subreddits.join(",")}`);

    // Create agent run record
    const { data: run, error: runError } = await supabase
      .from("agent_runs")
      .insert({
        agent_name: "ingest-social",
        agent_type: "ingestion",
        status: "running",
        started_at: new Date().toISOString(),
        metadata: { assets, subreddits, limit }
      })
      .select()
      .single();

    if (runError) {
      console.warn("Failed to create run record:", runError.message);
    }

    let itemsProcessed = 0;
    let itemsFailed = 0;
    const signals: any[] = [];

    // Step 1: Search Reddit for each asset (or general financial discussions)
    const searchQueries = assets.length > 0
      ? assets.map(asset => `${asset} stock reddit`)
      : ['stock market reddit', 'trading reddit', 'investing reddit'];

    for (const query of searchQueries.slice(0, 5)) { // Limit to 5 queries
      try {
        console.log(`Searching: ${query}`);
        
        const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            limit: Math.min(limit, 10),
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
          // Extract asset from query or content
          const detectedAsset = assets.find(a => 
            result.title?.toUpperCase().includes(a.toUpperCase()) ||
            result.description?.toUpperCase().includes(a.toUpperCase())
          ) || null;

          // Determine source type based on URL
          let sourceType = 'social';
          if (result.url?.includes('reddit.com')) {
            sourceType = 'forum';
          } else if (result.url?.includes('seekingalpha') || result.url?.includes('fool.com')) {
            sourceType = 'research';
          }

          const content = `${result.title || ''}\n\n${result.description || ''}`.trim();
          if (!content || content.length < 20) continue;

          const contentHash = generateHash(content);

          signals.push({
            asset: detectedAsset,
            asset_type: detectedAsset ? 'stock' : null,
            source_type: sourceType,
            source_name: new URL(result.url || 'https://unknown.com').hostname,
            source_url: result.url,
            title: result.title?.slice(0, 500),
            content: content.slice(0, 5000),
            content_hash: contentHash,
            language: 'en',
            fetched_at: new Date().toISOString(),
            processed: false,
            metadata: {
              search_query: query,
              ingested_by: 'ingest-social'
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

    // Step 2: Scrape financial blog headlines
    for (const blogUrl of FINANCIAL_BLOGS.slice(0, 2)) { // Limit to 2 blogs
      try {
        console.log(`Scraping blog: ${blogUrl}`);
        
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: blogUrl,
            formats: ['markdown', 'links'],
            onlyMainContent: true,
          }),
        });

        if (!scrapeResponse.ok) {
          console.warn(`Scrape failed for ${blogUrl}: ${scrapeResponse.status}`);
          itemsFailed++;
          continue;
        }

        const scrapeData = await scrapeResponse.json();
        const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
        
        if (markdown && markdown.length > 100) {
          // Extract first few paragraphs as content
          const content = markdown.slice(0, 3000);
          const contentHash = generateHash(content);

          signals.push({
            asset: null,
            asset_type: null,
            source_type: 'research',
            source_name: new URL(blogUrl).hostname,
            source_url: blogUrl,
            title: scrapeData.data?.metadata?.title || 'Financial Blog Update',
            content,
            content_hash: contentHash,
            language: 'en',
            fetched_at: new Date().toISOString(),
            processed: false,
            metadata: {
              ingested_by: 'ingest-social'
            }
          });

          itemsProcessed++;
        }

        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error scraping ${blogUrl}:`, error);
        itemsFailed++;
      }
    }

    // Step 3: Store signals in database
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
        console.log(`Stored ${signals.length} social signals`);
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
      sources: {
        reddit: signals.filter(s => s.source_type === 'forum').length,
        research: signals.filter(s => s.source_type === 'research').length,
        social: signals.filter(s => s.source_type === 'social').length
      }
    };

    console.log("Social ingestion complete:", result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Social ingestion error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
