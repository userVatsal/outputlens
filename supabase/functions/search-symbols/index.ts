import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  query: string;
  market: 'US' | 'EU' | 'Asia' | 'Crypto';
  limit?: number;
}

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
  displaySymbol: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, market, limit = 8 }: SearchRequest = await req.json();

    if (!query || query.length < 1) {
      return new Response(
        JSON.stringify({ results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!finnhubApiKey) {
      throw new Error('FINNHUB_API_KEY not configured');
    }

    let results: SearchResult[] = [];

    if (market === 'Crypto') {
      // For crypto, use a predefined list with search
      const cryptoAssets = [
        { symbol: 'BTC', name: 'Bitcoin', type: 'Cryptocurrency', exchange: 'Crypto', displaySymbol: 'BTC' },
        { symbol: 'ETH', name: 'Ethereum', type: 'Cryptocurrency', exchange: 'Crypto', displaySymbol: 'ETH' },
        { symbol: 'SOL', name: 'Solana', type: 'Cryptocurrency', exchange: 'Crypto', displaySymbol: 'SOL' },
        { symbol: 'XRP', name: 'Ripple', type: 'Cryptocurrency', exchange: 'Crypto', displaySymbol: 'XRP' },
        { symbol: 'ADA', name: 'Cardano', type: 'Cryptocurrency', exchange: 'Crypto', displaySymbol: 'ADA' },
        { symbol: 'DOGE', name: 'Dogecoin', type: 'Cryptocurrency', exchange: 'Crypto', displaySymbol: 'DOGE' },
        { symbol: 'DOT', name: 'Polkadot', type: 'Cryptocurrency', exchange: 'Crypto', displaySymbol: 'DOT' },
        { symbol: 'MATIC', name: 'Polygon', type: 'Cryptocurrency', exchange: 'Crypto', displaySymbol: 'MATIC' },
        { symbol: 'LINK', name: 'Chainlink', type: 'Cryptocurrency', exchange: 'Crypto', displaySymbol: 'LINK' },
        { symbol: 'AVAX', name: 'Avalanche', type: 'Cryptocurrency', exchange: 'Crypto', displaySymbol: 'AVAX' },
        { symbol: 'UNI', name: 'Uniswap', type: 'Cryptocurrency', exchange: 'Crypto', displaySymbol: 'UNI' },
        { symbol: 'ATOM', name: 'Cosmos', type: 'Cryptocurrency', exchange: 'Crypto', displaySymbol: 'ATOM' },
        { symbol: 'LTC', name: 'Litecoin', type: 'Cryptocurrency', exchange: 'Crypto', displaySymbol: 'LTC' },
        { symbol: 'BCH', name: 'Bitcoin Cash', type: 'Cryptocurrency', exchange: 'Crypto', displaySymbol: 'BCH' },
        { symbol: 'SHIB', name: 'Shiba Inu', type: 'Cryptocurrency', exchange: 'Crypto', displaySymbol: 'SHIB' },
      ];

      const lowerQuery = query.toLowerCase();
      results = cryptoAssets
        .filter(asset => 
          asset.symbol.toLowerCase().includes(lowerQuery) ||
          asset.name.toLowerCase().includes(lowerQuery)
        )
        .slice(0, limit);
    } else {
      // Use Finnhub symbol search for stocks
      const searchUrl = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${finnhubApiKey}`;
      
      console.log(`[SEARCH] Searching Finnhub for: ${query}`);
      
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        console.error(`[SEARCH] Finnhub error: ${response.status}`);
        throw new Error(`Finnhub API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.result && Array.isArray(data.result)) {
        // Filter based on market and type
        const exchangeFilters: Record<string, string[]> = {
          'US': ['NYSE', 'NASDAQ', 'AMEX', 'US'],
          'EU': ['LSE', 'XETRA', 'EURONEXT', 'SIX', 'EU'],
          'Asia': ['TSE', 'HKEX', 'SSE', 'SZSE', 'KRX', 'NSE', 'BSE', 'Asia'],
        };

        const allowedExchanges = exchangeFilters[market] || exchangeFilters['US'];
        
        results = data.result
          .filter((item: any) => {
            // Filter by exchange if market is specified
            const exchange = item.exchange || item.primary_exchange || '';
            const matchesExchange = market === 'US' 
              ? !exchange.includes('LSE') && !exchange.includes('XETRA') && !exchange.includes('TSE') && !exchange.includes('HK')
              : allowedExchanges.some(ex => exchange.includes(ex));
            
            // Filter out indices and unwanted types for general stock search
            const type = (item.type || '').toLowerCase();
            const isValidType = type === 'common stock' || type === 'adr' || type === 'etf' || type === 'equity' || type === '';
            
            return matchesExchange && isValidType;
          })
          .slice(0, limit)
          .map((item: any) => ({
            symbol: item.symbol || item.displaySymbol,
            name: item.description || item.name || item.symbol,
            type: item.type || 'Stock',
            exchange: item.exchange || item.primary_exchange || 'Unknown',
            displaySymbol: item.displaySymbol || item.symbol,
          }));
      }
    }

    console.log(`[SEARCH] Found ${results.length} results for "${query}" in ${market}`);

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[SEARCH] Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message, results: [] }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
