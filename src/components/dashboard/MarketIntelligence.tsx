import { useState, useEffect } from 'react';
import { 
  Newspaper, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface AggregatedInsight {
  id: string;
  asset: string;
  market: string;
  weighted_sentiment: number | null;
  avg_sentiment: number | null;
  total_signals: number | null;
  bullish_count: number | null;
  bearish_count: number | null;
  computed_at: string;
  top_signals: Array<{ title?: string; source_name?: string; sentiment_score?: number }> | null;
}

function SentimentBadge({ sentiment }: { sentiment: number | null }) {
  if (sentiment === null) {
    return <Badge variant="outline" className="text-muted-foreground">No data</Badge>;
  }
  
  const isBullish = sentiment > 0.1;
  const isBearish = sentiment < -0.1;
  
  return (
    <Badge 
      variant="outline"
      className={cn(
        isBullish && 'text-bullish border-bullish/30 bg-bullish/10',
        isBearish && 'text-bearish border-bearish/30 bg-bearish/10',
        !isBullish && !isBearish && 'text-muted-foreground'
      )}
    >
      {isBullish ? (
        <TrendingUp className="h-3 w-3 mr-1" />
      ) : isBearish ? (
        <TrendingDown className="h-3 w-3 mr-1" />
      ) : (
        <Minus className="h-3 w-3 mr-1" />
      )}
      {isBullish ? 'Bullish' : isBearish ? 'Bearish' : 'Neutral'}
    </Badge>
  );
}

export function MarketIntelligence() {
  const [insights, setInsights] = useState<AggregatedInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = async () => {
    try {
      const { data } = await supabase
        .from('aggregated_insights' as never)
        .select('id, asset, market, weighted_sentiment, avg_sentiment, total_signals, bullish_count, bearish_count, computed_at, top_signals')
        .order('computed_at', { ascending: false })
        .limit(5) as { data: AggregatedInsight[] | null };

      if (data) {
        setInsights(data);
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInsights();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-primary" />
            Market Intelligence
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No market intelligence available</p>
            <p className="text-xs">Sentiment data will appear as signals are processed</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => {
              const topSignal = insight.top_signals?.[0];
              
              return (
                <div
                  key={insight.id}
                  className="p-3 rounded-lg border border-border bg-muted/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-mono font-semibold text-foreground">
                        {insight.asset}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {insight.market}
                      </span>
                    </div>
                    <SentimentBadge sentiment={insight.weighted_sentiment} />
                  </div>
                  
                  {topSignal?.title && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {topSignal.title}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>{insight.total_signals || 0} signals</span>
                      {insight.bullish_count !== null && insight.bearish_count !== null && (
                        <span>
                          <span className="text-bullish">{insight.bullish_count}↑</span>
                          {' / '}
                          <span className="text-bearish">{insight.bearish_count}↓</span>
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(new Date(insight.computed_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
