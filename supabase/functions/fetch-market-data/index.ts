import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MarketDataRequest {
  symbol: string;
  provider: 'finnhub' | 'coingecko' | 'twelvedata';
  type: 'quote' | 'historical';
  market?: string;
  days?: number;
  tier?: 'free' | 'starter' | 'pro' | 'trader';
}

interface MarketDataResponse {
  price?: number;
  change?: number;
  changePercent?: number;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
  volume?: number;
  timestamp?: number;
  historicalPrices?: number[];
  volatility?: number;
  source: string;
  error?: string;
  cached?: boolean;
}

// Tier-based cache TTL in milliseconds
const CACHE_TTL_BY_TIER: Record<string, number> = {
  free: 15 * 60 * 1000,      // 15 minutes
  starter: 5 * 60 * 1000,    // 5 minutes
  pro: 2 * 60 * 1000,        // 2 minutes
  trader: 1 * 60 * 1000,     // 1 minute
};

const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes default

/**
 * Check cache for existing market data
 */
async function checkCache(
  supabase: any,
  symbol: string,
  market: string
): Promise<MarketDataResponse | null> {
  try {
    const { data, error } = await supabase
      .from('market_data_cache')
      .select('*')
      .eq('symbol', symbol.toUpperCase())
      .eq('market', market)
      .gte('expires_at', new Date().toISOString())
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const quoteData = data.quote_data as Record<string, unknown> || {};
    
    console.log(`[CACHE HIT] Found cached data for ${symbol} (expires: ${data.expires_at})`);
    
    return {
      price: quoteData.price as number,
      change: quoteData.change as number,
      changePercent: quoteData.changePercent as number,
      high: quoteData.high as number,
      low: quoteData.low as number,
      open: quoteData.open as number,
      previousClose: quoteData.previousClose as number,
      volume: quoteData.volume as number,
      timestamp: quoteData.timestamp as number,
      volatility: typeof data.volatility_30d === 'number' ? data.volatility_30d : undefined,
      historicalPrices: Array.isArray(data.historical_prices) ? data.historical_prices : undefined,
      source: (quoteData.source as string) || 'cache',
      cached: true,
    };
  } catch (err) {
    console.error('[CACHE] Error checking cache:', err);
    return null;
  }
}

/**
 * Save market data to cache
 */
async function saveToCache(
  supabase: any,
  symbol: string,
  market: string,
  provider: string,
  data: MarketDataResponse,
  ttlMs: number
): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + ttlMs).toISOString();
    
    await supabase
      .from('market_data_cache')
      .upsert({
        symbol: symbol.toUpperCase(),
        market: market,
        asset_type: provider === 'coingecko' ? 'crypto' : provider === 'twelvedata' ? 'forex' : 'stock',
        quote_data: {
          price: data.price,
          change: data.change,
          changePercent: data.changePercent,
          high: data.high,
          low: data.low,
          open: data.open,
          previousClose: data.previousClose,
          volume: data.volume,
          timestamp: data.timestamp,
          source: data.source,
        },
        volatility_30d: data.volatility,
        historical_prices: data.historicalPrices,
        fetched_at: new Date().toISOString(),
        expires_at: expiresAt,
      }, {
        onConflict: 'symbol,market',
        ignoreDuplicates: false,
      });

    console.log(`[CACHE] Saved data for ${symbol} (expires: ${expiresAt})`);
  } catch (err) {
    console.error('[CACHE] Error saving to cache:', err);
  }
}

/**
 * Fetch stock quote from Finnhub
 */
async function fetchFinnhubQuote(symbol: string, apiKey: string): Promise<MarketDataResponse> {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const text = await response.text();
    console.error('Finnhub error:', text);
    throw new Error(`Finnhub API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.c === 0 && data.h === 0 && data.l === 0) {
    throw new Error('Symbol not found or market closed');
  }
  
  return {
    price: data.c,
    change: data.d,
    changePercent: data.dp,
    high: data.h,
    low: data.l,
    open: data.o,
    previousClose: data.pc,
    timestamp: data.t * 1000,
    source: 'finnhub'
  };
}

/**
 * Fetch historical candles from Finnhub for volatility calculation
 */
async function fetchFinnhubHistorical(symbol: string, apiKey: string, days: number = 30): Promise<number[]> {
  const now = Math.floor(Date.now() / 1000);
  const from = now - (days * 24 * 60 * 60);
  
  const url = `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${from}&to=${now}&token=${apiKey}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`Finnhub historical API returned ${response.status} - may require paid plan`);
      return [];
    }
    
    const data = await response.json();
    
    if (data.s === 'no_data' || !data.c) {
      return [];
    }
    
    return data.c;
  } catch (error) {
    console.warn('Finnhub historical data not available:', error);
    return [];
  }
}

/**
 * Fetch crypto data from CoinGecko
 */
async function fetchCoinGeckoQuote(coinId: string): Promise<MarketDataResponse> {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data[coinId]) {
    throw new Error('Cryptocurrency not found');
  }
  
  const coin = data[coinId];
  
  return {
    price: coin.usd,
    changePercent: coin.usd_24h_change,
    volume: coin.usd_24h_vol,
    timestamp: Date.now(),
    source: 'coingecko'
  };
}

/**
 * Fetch crypto historical data from CoinGecko
 */
async function fetchCoinGeckoHistorical(coinId: string, days: number = 30): Promise<number[]> {
  const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinId)}/market_chart?vs_currency=usd&days=${days}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`CoinGecko historical API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.prices || data.prices.length === 0) {
    return [];
  }
  
  return data.prices.map((p: [number, number]) => p[1]);
}

/**
 * Fetch forex data from Twelve Data
 */
async function fetchTwelveDataQuote(symbol: string, apiKey: string): Promise<MarketDataResponse> {
  const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Twelve Data API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.status === 'error' || data.code) {
    throw new Error(data.message || 'Forex data not available');
  }
  
  return {
    price: parseFloat(data.close),
    change: parseFloat(data.change),
    changePercent: parseFloat(data.percent_change),
    high: parseFloat(data.high),
    low: parseFloat(data.low),
    open: parseFloat(data.open),
    previousClose: parseFloat(data.previous_close),
    volume: parseInt(data.volume) || undefined,
    timestamp: Date.now(),
    source: 'twelvedata'
  };
}

/**
 * Fetch forex historical data from Twelve Data
 */
async function fetchTwelveDataHistorical(symbol: string, apiKey: string, days: number = 30): Promise<number[]> {
  const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=1day&outputsize=${days}&apikey=${apiKey}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Twelve Data historical API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.status === 'error' || !data.values) {
    return [];
  }
  
  return data.values.map((v: { close: string }) => parseFloat(v.close)).reverse();
}

/**
 * Calculate historical volatility from price series
 */
function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) {
    return 0;
  }
  
  const logReturns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > 0 && prices[i - 1] > 0) {
      logReturns.push(Math.log(prices[i] / prices[i - 1]));
    }
  }
  
  if (logReturns.length === 0) {
    return 0;
  }
  
  const mean = logReturns.reduce((sum, r) => sum + r, 0) / logReturns.length;
  const variance = logReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / logReturns.length;
  const dailyVol = Math.sqrt(variance);
  const tradingDays = 252;
  const annualizedVol = dailyVol * Math.sqrt(tradingDays);
  
  return annualizedVol * 100;
}

/**
 * Log metrics for platform monitoring
 */
async function logMetric(
  supabase: any,
  metricName: string,
  metricValue: number,
  dimensions: Record<string, unknown>
): Promise<void> {
  try {
    await supabase
      .from('platform_metrics')
      .insert({
        metric_type: 'edge_function',
        metric_name: metricName,
        metric_value: metricValue,
        dimensions: dimensions,
      });
  } catch (err) {
    console.error('[METRICS] Error logging metric:', err);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  // Initialize Supabase client for caching
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { symbol, provider, type, market = 'US', days = 30, tier = 'free' }: MarketDataRequest = await req.json();

    if (!symbol || !provider) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: symbol, provider' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[FETCH] Fetching ${type} data for ${symbol} from ${provider} (tier: ${tier})`);

    // CACHE-FIRST PATTERN: Check cache before making external API calls
    if (type === 'quote') {
      const cached = await checkCache(supabase, symbol, market);
      if (cached) {
        const latency = Date.now() - startTime;
        // Log cache hit metric
        logMetric(supabase, 'fetch_market_data_latency', latency, { 
          provider, symbol, cache_hit: true, tier 
        });
        
        return new Response(
          JSON.stringify(cached),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    let result: MarketDataResponse;

    switch (provider) {
      case 'finnhub': {
        const apiKey = Deno.env.get('FINNHUB_API_KEY');
        if (!apiKey) {
          throw new Error('FINNHUB_API_KEY not configured');
        }
        
        if (type === 'historical') {
          const prices = await fetchFinnhubHistorical(symbol, apiKey, days);
          const volatility = calculateVolatility(prices);
          result = { historicalPrices: prices, volatility, source: 'finnhub' };
        } else {
          result = await fetchFinnhubQuote(symbol, apiKey);
          try {
            const prices = await fetchFinnhubHistorical(symbol, apiKey, 30);
            result.volatility = calculateVolatility(prices);
            result.historicalPrices = prices;
          } catch (e) {
            console.warn('Could not fetch historical data for volatility:', e);
          }
        }
        break;
      }

      case 'coingecko': {
        if (type === 'historical') {
          const prices = await fetchCoinGeckoHistorical(symbol, days);
          const volatility = calculateVolatility(prices);
          result = { historicalPrices: prices, volatility, source: 'coingecko' };
        } else {
          result = await fetchCoinGeckoQuote(symbol);
          try {
            const prices = await fetchCoinGeckoHistorical(symbol, 30);
            result.volatility = calculateVolatility(prices);
            result.historicalPrices = prices;
          } catch (e) {
            console.warn('Could not fetch historical data for volatility:', e);
          }
        }
        break;
      }

      case 'twelvedata': {
        const apiKey = Deno.env.get('TWELVE_DATA_API_KEY');
        if (!apiKey) {
          throw new Error('TWELVE_DATA_API_KEY not configured');
        }
        
        if (type === 'historical') {
          const prices = await fetchTwelveDataHistorical(symbol, apiKey, days);
          const volatility = calculateVolatility(prices);
          result = { historicalPrices: prices, volatility, source: 'twelvedata' };
        } else {
          result = await fetchTwelveDataQuote(symbol, apiKey);
          try {
            const prices = await fetchTwelveDataHistorical(symbol, apiKey, 30);
            result.volatility = calculateVolatility(prices);
            result.historicalPrices = prices;
          } catch (e) {
            console.warn('Could not fetch historical data for volatility:', e);
          }
        }
        break;
      }

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    // Save to cache with tier-based TTL
    const cacheTtl = CACHE_TTL_BY_TIER[tier] || DEFAULT_CACHE_TTL;
    saveToCache(supabase, symbol, market, provider, result, cacheTtl);

    const latency = Date.now() - startTime;
    console.log(`[FETCH] Successfully fetched data in ${latency}ms:`, result);
    
    // Log cache miss metric
    logMetric(supabase, 'fetch_market_data_latency', latency, { 
      provider, symbol, cache_hit: false, tier 
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const latency = Date.now() - startTime;
    console.error('Error fetching market data:', error);
    
    // Log error metric
    logMetric(supabase, 'fetch_market_data_error', 1, { 
      error: error instanceof Error ? error.message : 'Unknown error',
      latency 
    });
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch market data',
        source: 'error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
