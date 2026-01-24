import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MarketDataRequest {
  symbol: string;
  provider: 'finnhub' | 'coingecko' | 'twelvedata';
  type: 'quote' | 'historical';
  market?: string;
  days?: number; // For historical data
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
  
  // Finnhub returns c=0 for invalid symbols
  if (data.c === 0 && data.h === 0 && data.l === 0) {
    throw new Error('Symbol not found or market closed');
  }
  
  return {
    price: data.c, // Current price
    change: data.d, // Change
    changePercent: data.dp, // Change percent
    high: data.h, // High
    low: data.l, // Low
    open: data.o, // Open
    previousClose: data.pc, // Previous close
    timestamp: data.t * 1000, // Convert to ms
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
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Finnhub historical API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.s === 'no_data' || !data.c) {
    return [];
  }
  
  return data.c; // Close prices
}

/**
 * Fetch crypto data from CoinGecko (free, no API key required for basic endpoints)
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
  
  // Extract closing prices (prices array contains [timestamp, price] pairs)
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
  
  // Extract closing prices (values are in reverse chronological order)
  return data.values.map((v: { close: string }) => parseFloat(v.close)).reverse();
}

/**
 * Calculate historical volatility from price series
 * Returns annualized volatility as a percentage
 */
function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) {
    return 0;
  }
  
  // Calculate log returns
  const logReturns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > 0 && prices[i - 1] > 0) {
      logReturns.push(Math.log(prices[i] / prices[i - 1]));
    }
  }
  
  if (logReturns.length === 0) {
    return 0;
  }
  
  // Calculate mean
  const mean = logReturns.reduce((sum, r) => sum + r, 0) / logReturns.length;
  
  // Calculate variance
  const variance = logReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / logReturns.length;
  
  // Daily volatility (standard deviation)
  const dailyVol = Math.sqrt(variance);
  
  // Annualize (assuming 252 trading days for stocks/forex, 365 for crypto)
  const tradingDays = 252;
  const annualizedVol = dailyVol * Math.sqrt(tradingDays);
  
  // Convert to percentage
  return annualizedVol * 100;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, provider, type, market, days = 30 }: MarketDataRequest = await req.json();

    if (!symbol || !provider) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: symbol, provider' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching ${type} data for ${symbol} from ${provider}`);

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
          // Also fetch historical for volatility
          try {
            const prices = await fetchFinnhubHistorical(symbol, apiKey, 30);
            result.volatility = calculateVolatility(prices);
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
          // Also fetch historical for volatility
          try {
            const prices = await fetchCoinGeckoHistorical(symbol, 30);
            result.volatility = calculateVolatility(prices);
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
          // Also fetch historical for volatility
          try {
            const prices = await fetchTwelveDataHistorical(symbol, apiKey, 30);
            result.volatility = calculateVolatility(prices);
          } catch (e) {
            console.warn('Could not fetch historical data for volatility:', e);
          }
        }
        break;
      }

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    console.log(`Successfully fetched data:`, result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching market data:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch market data',
        source: 'error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
