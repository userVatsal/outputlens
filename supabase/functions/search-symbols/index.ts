import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  query: string;
  market?: string;
  limit?: number;
}

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
  displaySymbol: string;
}

function mapQuoteType(qt: string): string {
  switch ((qt || '').toUpperCase()) {
    case 'EQUITY': return 'stock';
    case 'ETF': return 'etf';
    case 'CRYPTOCURRENCY': return 'crypto';
    case 'INDEX': return 'index';
    case 'MUTUALFUND': return 'etf';
    default: return 'stock';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, limit = 10 }: SearchRequest = await req.json();

    if (!query || query.length < 1) {
      return new Response(
        JSON.stringify({ results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=${Math.max(10, limit)}&newsCount=0&enableFuzzyQuery=true&quotesQueryId=tss_match_phrase_query`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let results: SearchResult[] = [];
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; OutputLens/1.0)',
          'Accept': 'application/json',
        },
      });
      clearTimeout(timeout);

      if (!response.ok) {
        console.error(`[SEARCH] Yahoo error: ${response.status}`);
        throw new Error(`Yahoo Finance API error: ${response.status}`);
      }

      const data = await response.json();
      const quotes = Array.isArray(data?.quotes) ? data.quotes : [];

      results = quotes
        .filter((q: any) => {
          const qt = (q.quoteType || '').toUpperCase();
          return qt !== 'FUTURE' && qt !== 'CURRENCY' && !!q.symbol;
        })
        .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
        .slice(0, limit)
        .map((q: any) => ({
          symbol: q.symbol,
          name: q.shortname || q.longname || q.symbol,
          type: mapQuoteType(q.quoteType),
          exchange: q.exchDisp || q.exchange || 'Yahoo',
          displaySymbol: q.symbol,
        }));
    } catch (err: any) {
      clearTimeout(timeout);
      console.error('[SEARCH] Yahoo fetch failed:', err?.message || err);
      results = [];
    }

    console.log(`[SEARCH] Found ${results.length} results for "${query}"`);

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[SEARCH] Error:', error?.message);
    return new Response(
      JSON.stringify({ error: error?.message || 'Search failed', results: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
