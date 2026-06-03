import { useState, useEffect, useCallback } from 'react';
import { useMarketData, LiveMarketData } from '@/hooks/useMarketData';
import { Market } from '@/types/trade';

// Check if error indicates paid tier is required
const checkPaidTierError = (errorMsg: string): boolean => {
  const lowerError = errorMsg.toLowerCase();
  return lowerError.includes('paid_tier_required') || 
         lowerError.includes('grow plan') || 
         lowerError.includes('grow (grow plan)') ||
         lowerError.includes('upgrade') ||
         lowerError.includes('premium') ||
         lowerError.includes('consider upgrading');
};

interface LivePriceIndicatorProps {
  symbol: string;
  market: Market;
  currencySymbol: string;
  onUsePrice?: (price: number) => void;
  debounceMs?: number;
}

export function LivePriceIndicator({
  symbol,
  market,
  currencySymbol,
  debounceMs = 500
}: LivePriceIndicatorProps) {
  const { fetchMarketData, isLoading, error } = useMarketData();
  const [priceData, setPriceData] = useState<LiveMarketData | null>(null);
  const [lastFetchedSymbol, setLastFetchedSymbol] = useState<string>('');

  // Debounced fetch when symbol changes
  useEffect(() => {
    if (!symbol || symbol.trim().length < 1) {
      setPriceData(null);
      return;
    }

    const normalizedSymbol = symbol.toUpperCase().trim();
    
    // Don't refetch if symbol hasn't changed
    if (normalizedSymbol === lastFetchedSymbol) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      const data = await fetchMarketData(normalizedSymbol, market);
      if (data) {
        setPriceData(data);
        setLastFetchedSymbol(normalizedSymbol);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [symbol, market, debounceMs, fetchMarketData, lastFetchedSymbol]);

  // Clear data when market changes
  useEffect(() => {
    setPriceData(null);
    setLastFetchedSymbol('');
  }, [market]);

  const handleRefresh = useCallback(async () => {
    if (!symbol) return;
    const normalizedSymbol = symbol.toUpperCase().trim();
    const data = await fetchMarketData(normalizedSymbol, market);
    if (data) {
      setPriceData(data);
      setLastFetchedSymbol(normalizedSymbol);
    }
  }, [symbol, market, fetchMarketData]);

  const handleUsePrice = () => {
    if (priceData?.price && onUsePrice) {
      onUsePrice(priceData.price);
    }
  };

  if (!symbol || symbol.trim().length < 1) {
    return null;
  }

  // Loading skeleton row
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 bg-elevated/60 border border-border/40 rounded-xl px-4 py-3">
        <div className="h-3 w-24 rounded bg-elevated animate-pulse" />
        <div className="h-5 w-32 rounded bg-elevated animate-pulse" />
        <div className="h-5 w-20 rounded bg-elevated animate-pulse ml-auto" />
      </div>
    );
  }

  if ((error && !priceData) || (priceData && priceData.price == null)) {
    return (
      <div className="bg-elevated/60 border border-border/40 rounded-xl px-4 py-3 text-[12px] italic text-muted-foreground">
        Enter price manually ↓
      </div>
    );
  }

  if (priceData && typeof priceData.price === 'number') {
    const isPositive = (priceData.changePercent ?? 0) >= 0;
    const formattedPrice = priceData.price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: priceData.price < 1 ? 6 : 2,
    });
    const change = priceData.change ?? 0;
    const changePct = priceData.changePercent ?? 0;
    const source = (priceData.source || 'live').toUpperCase();

    return (
      <div className="bg-elevated/60 border border-border/40 rounded-xl px-4 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] text-muted-foreground">Live price</span>
          <span className="font-mono text-[13px] text-foreground font-semibold">{symbol.toUpperCase()}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-mono font-bold text-[22px] text-foreground tabular-nums">
            {currencySymbol}{formattedPrice}
          </span>
        </div>
        <div
          className={`ml-auto flex items-center gap-1 rounded-lg border px-2 py-1 font-mono text-[12px] font-semibold ${
            isPositive
              ? 'bg-bullish/8 border-bullish/20 text-bullish'
              : 'bg-bearish/8 border-bearish/20 text-bearish'
          }`}
        >
          <span>{isPositive ? '▲' : '▼'}</span>
          <span>{Math.abs(change).toFixed(2)}</span>
          <span className="opacity-80">({changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%)</span>
        </div>
        <span className="font-mono text-[9px] text-muted-foreground/60 uppercase tracking-widest">
          LIVE · {source}
        </span>
      </div>
    );
  }

  return null;
}
