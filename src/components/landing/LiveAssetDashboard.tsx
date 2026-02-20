import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Activity,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMarketData, type LiveMarketData } from '@/hooks/useMarketData';
import { Market } from '@/types/trade';

interface AssetData {
  name: string;
  ticker: string;
  market: Market;
  riskScore: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  liveData?: LiveMarketData | null;
  isLoading?: boolean;
  error?: string | null;
}

const initialAssets: AssetData[] = [
  { name: 'Tesla, Inc.', ticker: 'TSLA', market: 'US', riskScore: 78, riskLevel: 'High' },
  { name: 'Apple Inc.', ticker: 'AAPL', market: 'US', riskScore: 23, riskLevel: 'Low' },
  { name: 'Amazon.com, Inc.', ticker: 'AMZN', market: 'US', riskScore: 45, riskLevel: 'Medium' },
  { name: 'NVIDIA Corporation', ticker: 'NVDA', market: 'US', riskScore: 35, riskLevel: 'Medium' },
  { name: 'Microsoft Corp.', ticker: 'MSFT', market: 'US', riskScore: 30, riskLevel: 'Low' },
  { name: 'Meta Platforms', ticker: 'META', market: 'US', riskScore: 50, riskLevel: 'Medium' },
  { name: 'Alphabet Inc.', ticker: 'GOOGL', market: 'US', riskScore: 28, riskLevel: 'Low' },
  { name: 'SPDR S&P 500 ETF', ticker: 'SPY', market: 'US', riskScore: 20, riskLevel: 'Low' },
  { name: 'Bitcoin', ticker: 'BTC', market: 'Crypto' as Market, riskScore: 85, riskLevel: 'High' },
];

function computeRiskLevel(changePercent: number | undefined): 'High' | 'Medium' | 'Low' {
  const abs = Math.abs(changePercent ?? 0);
  if (abs >= 2.5) return 'High';
  if (abs >= 1.0) return 'Medium';
  return 'Low';
}

function computeRiskScore(changePercent: number | undefined): number {
  return Math.min(95, Math.round(Math.abs(changePercent ?? 0) * 15 + 20));
}

const getRiskStyles = (level: 'High' | 'Medium' | 'Low') => {
  switch (level) {
    case 'High':   return { badge: 'bg-destructive/10 text-destructive border-destructive/20', bar: 'bg-destructive', dot: 'bg-destructive' };
    case 'Medium': return { badge: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', bar: 'bg-yellow-500', dot: 'bg-yellow-500' };
    case 'Low':    return { badge: 'bg-bullish/10 text-bullish border-bullish/20', bar: 'bg-bullish', dot: 'bg-bullish' };
  }
};

export function LiveAssetDashboard() {
  const [assets, setAssets] = useState<AssetData[]>(initialAssets);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { fetchMarketData } = useMarketData();
  const navigate = useNavigate();

  // FIXED: use initialAssets (stable ref) instead of assets in deps — breaks the infinite loop
  const fetchAllAssetData = useCallback(async () => {
    setIsRefreshing(true);
    const updatedAssets = await Promise.all(
      initialAssets.map(async (asset) => {
        try {
          const data = await fetchMarketData(asset.ticker, asset.market);
          return {
            ...asset,
            liveData: data,
            riskLevel: computeRiskLevel(data?.changePercent),
            riskScore: computeRiskScore(data?.changePercent),
            isLoading: false,
            error: null,
          };
        } catch {
          return { ...asset, liveData: null, isLoading: false, error: 'Failed to fetch' };
        }
      })
    );
    setAssets(updatedAssets);
    setLastUpdate(new Date());
    setIsRefreshing(false);
  }, [fetchMarketData]); // no 'assets' dep — stable

  useEffect(() => { fetchAllAssetData(); }, []);

  useEffect(() => {
    const interval = setInterval(fetchAllAssetData, 60000);
    return () => clearInterval(interval);
  }, [fetchAllAssetData]);

  const formatPrice = (price: number, market: Market) => {
    if (market === 'Crypto' as Market) {
      return price >= 1000
        ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : `$${price.toFixed(2)}`;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden shadow-lg">
      {/* Header — dark navy Bloomberg style */}
      <div className="flex items-center justify-between px-5 py-4" style={{ backgroundColor: 'hsl(var(--brand-navy, 214 60% 20%))' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-white/50 uppercase tracking-widest">Live</span>
          </div>
          <span className="text-white font-semibold text-sm">Asset Risk Dashboard</span>
          <Badge className="bg-white/10 text-white/70 border-white/20 text-[10px] font-mono">
            <Activity className="h-3 w-3 mr-1" />
            9 Assets
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-[10px] text-white/30 font-mono hidden sm:block">
              {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchAllAssetData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-white/20 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs font-mono"
          >
            <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-12 px-4 py-2 bg-muted/40 border-b border-border text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
        <div className="col-span-4">Asset</div>
        <div className="col-span-3 text-right">Price</div>
        <div className="col-span-3 text-right hidden sm:block">Change</div>
        <div className="col-span-1 text-center">Risk</div>
        <div className="col-span-1"></div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/60">
        {assets.map((asset) => {
          const styles = getRiskStyles(asset.riskLevel);
          const hasLiveData = !!(asset.liveData?.price);
          const priceChange = asset.liveData?.change ?? 0;
          const isPositive = priceChange >= 0;

          return (
            <div
              key={asset.ticker}
              onClick={() => navigate(`/workspace?asset=${asset.ticker}&market=${asset.market}`)}
              className="grid grid-cols-12 items-center px-4 py-3 cursor-pointer hover:bg-primary/5 transition-colors duration-100 group"
            >
              {/* Asset name + ticker */}
              <div className="col-span-4 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors font-mono flex-shrink-0">
                  {asset.ticker.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{asset.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{asset.ticker}</p>
                </div>
              </div>

              {/* Price */}
              <div className="col-span-3 text-right">
                {hasLiveData ? (
                  <span className="font-mono font-semibold text-sm">{formatPrice(asset.liveData!.price, asset.market)}</span>
                ) : asset.error ? (
                  <span className="flex items-center justify-end gap-1 text-muted-foreground text-xs">
                    <AlertCircle className="h-3 w-3" />N/A
                  </span>
                ) : (
                  <div className="flex justify-end"><div className="h-4 w-16 bg-muted animate-pulse rounded" /></div>
                )}
              </div>

              {/* Change */}
              <div className="col-span-3 text-right hidden sm:block">
                {hasLiveData && asset.liveData?.change !== undefined ? (
                  <span className={cn(
                    'flex items-center justify-end gap-1 font-mono text-xs',
                    isPositive ? 'text-bullish' : 'text-destructive'
                  )}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {formatChange(asset.liveData.change, asset.liveData.changePercent ?? 0)}
                  </span>
                ) : asset.error ? (
                  <span className="text-xs text-muted-foreground">—</span>
                ) : (
                  <div className="flex justify-end"><div className="h-4 w-20 bg-muted animate-pulse rounded" /></div>
                )}
              </div>

              {/* Risk badge */}
              <div className="col-span-1 flex justify-center">
                <Badge variant="outline" className={cn(styles.badge, 'font-mono text-[9px] px-1.5 py-0')}>
                  {asset.riskLevel}
                </Badge>
              </div>

              {/* Analyze arrow */}
              <div className="col-span-1 flex justify-end">
                <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 bg-muted/30 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Click any asset to run a full risk analysis. <span className="text-foreground font-medium">No signup required.</span>
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate('/workspace')}
          className="gap-1.5 text-xs h-7"
        >
          Run Analysis
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
