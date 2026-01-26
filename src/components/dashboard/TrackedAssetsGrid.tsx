import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3, 
  Bookmark,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrackedAsset } from '@/hooks/useTrackedAssets';
import { cn } from '@/lib/utils';

interface TrackedAssetsGridProps {
  assets: TrackedAsset[];
  isLoading: boolean;
}

function TrendIndicator({ delta }: { delta: number | null }) {
  if (delta === null || delta === 0) {
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
  
  if (delta > 0) {
    return <TrendingUp className="h-4 w-4 text-destructive" />;
  }
  
  return <TrendingDown className="h-4 w-4 text-bullish" />;
}

function AssetCard({ asset }: { asset: TrackedAsset }) {
  const riskChange = asset.risk_delta;
  const riskColor = riskChange === null || riskChange === 0 
    ? 'text-muted-foreground' 
    : riskChange > 0 
      ? 'text-destructive' 
      : 'text-bullish';

  return (
    <Link
      to={`/workspace?asset=${asset.symbol}&market=${asset.market}`}
      className="block p-3 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-muted/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="font-mono font-semibold text-foreground">{asset.symbol}</span>
          <Badge 
            variant="outline" 
            className={cn(
              "ml-2 text-[10px] px-1.5",
              asset.direction === 'long' 
                ? 'text-bullish border-bullish/30' 
                : 'text-bearish border-bearish/30'
            )}
          >
            {asset.direction.toUpperCase()}
          </Badge>
        </div>
        <TrendIndicator delta={riskChange} />
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <div className="text-muted-foreground">Entry</div>
        <div className="text-right font-mono">${asset.entry_price.toFixed(2)}</div>
        
        <div className="text-muted-foreground">Risk Score</div>
        <div className="text-right font-medium">
          {asset.current_risk_score?.toFixed(1) ?? '—'}/10
        </div>
        
        {riskChange !== null && riskChange !== 0 && (
          <>
            <div className="text-muted-foreground">Risk Delta</div>
            <div className={cn("text-right font-medium", riskColor)}>
              {riskChange > 0 ? '+' : ''}{riskChange.toFixed(1)}
            </div>
          </>
        )}
      </div>
      
      <div className="flex items-center justify-end mt-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        Analyze Now
        <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
      </div>
    </Link>
  );
}

export function TrackedAssetsGrid({ assets, isLoading }: TrackedAssetsGridProps) {
  const activeAssets = assets.filter(a => a.status === 'active').slice(0, 6);
  const hasMore = assets.filter(a => a.status === 'active').length > 6;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-primary" />
          Monitored Assets
          {activeAssets.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {activeAssets.length} active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : activeAssets.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No assets tracked yet</p>
            <p className="text-xs mb-4">Monitor positions from your analysis results</p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/workspace">
                <BarChart3 className="h-4 w-4 mr-1.5" />
                Run Analysis
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeAssets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
            
            {hasMore && (
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link to="/tracked-assets">
                  View All Tracked Assets
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
