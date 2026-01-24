import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { classifyAsset, getCoinGeckoId, formatFinnhubSymbol, type AssetClassification } from '@/lib/assetClassifier';
import { Market } from '@/types/trade';

export interface LiveMarketData {
  price: number;
  change?: number;
  changePercent?: number;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
  volume?: number;
  volatility?: number;
  timestamp: number;
  source: string;
  classification: AssetClassification;
}

interface UseMarketDataReturn {
  fetchMarketData: (symbol: string, market: Market) => Promise<LiveMarketData | null>;
  isLoading: boolean;
  error: string | null;
}

export function useMarketData(): UseMarketDataReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = useCallback(async (
    symbol: string,
    market: Market
  ): Promise<LiveMarketData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Classify the asset to determine provider
      const classification = classifyAsset(symbol, market);
      
      // Prepare the symbol for the specific provider
      let apiSymbol = classification.normalizedSymbol;
      
      if (classification.provider === 'coingecko') {
        apiSymbol = getCoinGeckoId(symbol);
      } else if (classification.provider === 'finnhub') {
        apiSymbol = formatFinnhubSymbol(symbol, market);
      }

      console.log(`Fetching market data for ${symbol} via ${classification.provider} (${apiSymbol})`);

      // Call the edge function
      const { data, error: fnError } = await supabase.functions.invoke('fetch-market-data', {
        body: {
          symbol: apiSymbol,
          provider: classification.provider,
          type: 'quote',
          market
        }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to fetch market data');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const marketData: LiveMarketData = {
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        high: data.high,
        low: data.low,
        open: data.open,
        previousClose: data.previousClose,
        volume: data.volume,
        volatility: data.volatility,
        timestamp: data.timestamp || Date.now(),
        source: data.source,
        classification
      };

      console.log('Received market data:', marketData);
      return marketData;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch market data';
      console.error('Market data error:', message);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    fetchMarketData,
    isLoading,
    error
  };
}
