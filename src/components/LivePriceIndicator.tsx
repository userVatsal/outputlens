import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Loader2, Wifi, WifiOff, RefreshCw, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  onUsePrice,
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

  // Don't show anything if no symbol entered
  if (!symbol || symbol.trim().length < 1) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50 animate-pulse">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Fetching live price...</span>
      </div>
    );
  }

  // Error state - check for paid tier requirement
  if (error && !priceData) {
    const isPaidRequired = checkPaidTierError(error);
    const isNonUSMarket = market !== 'US';
    
    // Show premium data message for paid tier errors or non-US markets
    if (isPaidRequired || isNonUSMarket) {
      return (
        <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-amber-500/20 shrink-0">
              <DollarSign className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-1">
                Premium Data Required
              </p>
              <p className="text-xs text-muted-foreground">
                Live pricing for {market} market symbols requires a premium data subscription. 
                Enter your entry price manually in the form below.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    // Generic error for US market failures
    return (
      <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
        <div className="flex items-center gap-2 flex-1">
          <WifiOff className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground">
            Price unavailable for {symbol.toUpperCase()}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          className="h-7 px-2 shrink-0"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  // Success state with price data
  if (priceData) {
    const isPositive = (priceData.changePercent || 0) >= 0;
    const formattedPrice = priceData.price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: priceData.price < 1 ? 6 : 2
    });
    const formattedChange = priceData.change 
      ? `${isPositive ? '+' : ''}${priceData.change.toFixed(2)}`
      : null;
    const formattedChangePercent = priceData.changePercent
      ? `${isPositive ? '+' : ''}${priceData.changePercent.toFixed(2)}%`
      : null;

    const timeSinceUpdate = Math.round((Date.now() - priceData.timestamp) / 1000);
    const timeLabel = timeSinceUpdate < 60 
      ? `${timeSinceUpdate}s ago` 
      : timeSinceUpdate < 3600 
        ? `${Math.round(timeSinceUpdate / 60)}m ago`
        : 'Delayed';

    return (
      <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Price and change */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-semibold text-foreground">
                {currencySymbol}{formattedPrice}
              </span>
              {formattedChange && formattedChangePercent && (
                <span className={`flex items-center gap-1 text-sm font-medium ${
                  isPositive ? 'text-bullish' : 'text-bearish'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {formattedChange} ({formattedChangePercent})
                </span>
              )}
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Wifi className="h-3 w-3 text-bullish" />
              {timeLabel}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              className="h-7 w-7 p-0"
              disabled={isLoading}
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Use price button */}
        {onUsePrice && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUsePrice}
            className="w-full text-xs h-8"
          >
            Use {currencySymbol}{formattedPrice} as entry price
          </Button>
        )}

        {/* Additional data row */}
        {(priceData.high || priceData.low || priceData.volatility) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1 border-t border-border/30">
            {priceData.high && priceData.low && (
              <span>
                Day Range: {currencySymbol}{priceData.low.toFixed(2)} – {currencySymbol}{priceData.high.toFixed(2)}
              </span>
            )}
            {priceData.volatility && (
              <span>
                Volatility: {priceData.volatility.toFixed(1)}%
              </span>
            )}
            <span className="text-muted-foreground/60">
              via {priceData.source}
            </span>
          </div>
        )}
      </div>
    );
  }

  return null;
}
