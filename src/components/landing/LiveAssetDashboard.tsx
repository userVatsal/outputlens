import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  RefreshCw,
  Activity,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
];

const getRiskLevelStyles = (level: 'High' | 'Medium' | 'Low') => {
  switch (level) {
    case 'High':
      return {
        badge: 'bg-destructive/10 text-destructive border-destructive/20',
        bar: 'bg-destructive',
      };
    case 'Medium':
      return {
        badge: 'bg-warning/10 text-warning border-warning/20',
        bar: 'bg-warning',
      };
    case 'Low':
      return {
        badge: 'bg-bullish/10 text-bullish border-bullish/20',
        bar: 'bg-bullish',
      };
  }
};

export function LiveAssetDashboard() {
  const [assets, setAssets] = useState<AssetData[]>(initialAssets);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { fetchMarketData } = useMarketData();

  const fetchAllAssetData = useCallback(async () => {
    setIsRefreshing(true);
    
    const updatedAssets = await Promise.all(
      assets.map(async (asset) => {
        try {
          const data = await fetchMarketData(asset.ticker, asset.market);
          return {
            ...asset,
            liveData: data,
            isLoading: false,
            error: null,
          };
        } catch (err) {
          return {
            ...asset,
            liveData: null,
            isLoading: false,
            error: 'Failed to fetch',
          };
        }
      })
    );

    setAssets(updatedAssets);
    setLastUpdate(new Date());
    setIsRefreshing(false);
  }, [assets, fetchMarketData]);

  // Initial fetch on mount
  useEffect(() => {
    fetchAllAssetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchAllAssetData, 60000);
    return () => clearInterval(interval);
  }, [fetchAllAssetData]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  return (
    <Card className="border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center relative">
                <BarChart3 className="h-5 w-5 text-primary" />
                {/* Live indicator pulse */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bullish opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-bullish" />
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  Asset Risk Dashboard
                  <Badge variant="outline" className="text-xs bg-bullish/10 text-bullish border-bullish/20">
                    <Activity className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Real-time prices and AI-powered risk analysis
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {lastUpdate && (
                <span className="text-xs text-muted-foreground hidden sm:block">
                  Updated {lastUpdate.toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAllAssetData}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Asset</TableHead>
              <TableHead className="text-right font-semibold">Price</TableHead>
              <TableHead className="text-right font-semibold hidden sm:table-cell">Change</TableHead>
              <TableHead className="text-center font-semibold">Risk</TableHead>
              <TableHead className="text-right font-semibold w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset, index) => {
              const styles = getRiskLevelStyles(asset.riskLevel);
              const hasLiveData = asset.liveData && asset.liveData.price;
              const priceChange = asset.liveData?.change ?? 0;
              const isPositive = priceChange >= 0;

              return (
                <TableRow 
                  key={asset.ticker} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors duration-200 group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {asset.ticker.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{asset.ticker}</p>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    {hasLiveData ? (
                      <div className="font-mono">
                        <p className="font-semibold">{formatPrice(asset.liveData!.price)}</p>
                      </div>
                    ) : asset.error ? (
                      <div className="flex items-center justify-end gap-1 text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        <span className="text-xs">N/A</span>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell className="text-right hidden sm:table-cell">
                    {hasLiveData && asset.liveData?.change !== undefined ? (
                      <div className={cn(
                        'flex items-center justify-end gap-1 font-mono text-sm',
                        isPositive ? 'text-bullish' : 'text-destructive'
                      )}>
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>
                          {formatChange(asset.liveData.change, asset.liveData.changePercent ?? 0)}
                        </span>
                      </div>
                    ) : asset.error ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <div className="flex justify-end">
                        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-12 h-2 rounded-full bg-muted overflow-hidden hidden sm:block">
                        <div 
                          className={cn('h-full rounded-full transition-all duration-1000', styles.bar)}
                          style={{ 
                            width: `${asset.riskScore}%`,
                            animationDelay: `${index * 100}ms`
                          }}
                        />
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(styles.badge, 'font-medium text-xs')}
                      >
                        {asset.riskLevel}
                      </Badge>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary inline-block" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Footer CTA */}
        <div className="p-4 bg-muted/30 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Get detailed analysis for any asset
            </p>
            <Button asChild size="sm" variant="outline">
              <Link to="/auth?mode=signup">
                Try Free Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
