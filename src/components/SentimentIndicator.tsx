import { useState, useEffect } from 'react';
import { Brain, AlertTriangle, TrendingUp, TrendingDown, Minus, Newspaper, MessageSquare, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface SentimentIndicatorProps {
  asset: string;
  market?: string;
}

interface AggregatedInsight {
  weighted_sentiment: number;
  avg_sentiment: number;
  sentiment_stddev: number;
  bullish_count: number;
  bearish_count: number;
  neutral_count: number;
  total_signals: number;
  conflict_detected: boolean;
  data_quality_score: number;
  source_breakdown: Record<string, number>;
  top_signals: Array<{
    title: string;
    sentiment: number;
    source: string;
    reasoning?: string;
  }>;
  volatility_adjustment: number;
  probability_shift: number;
  tail_risk_multiplier: number;
  computed_at: string;
}

function getSentimentLabel(score: number): { label: string; color: string; icon: React.ReactNode } {
  if (score >= 0.3) return { label: 'Bullish', color: 'text-bullish', icon: <TrendingUp className="h-4 w-4" /> };
  if (score <= -0.3) return { label: 'Bearish', color: 'text-bearish', icon: <TrendingDown className="h-4 w-4" /> };
  return { label: 'Neutral', color: 'text-muted-foreground', icon: <Minus className="h-4 w-4" /> };
}

function getSourceIcon(sourceType: string) {
  switch (sourceType.toLowerCase()) {
    case 'news':
    case 'finnhub':
      return <Newspaper className="h-3 w-3" />;
    case 'social':
    case 'reddit':
    case 'twitter':
      return <MessageSquare className="h-3 w-3" />;
    case 'research':
    case 'report':
      return <FileText className="h-3 w-3" />;
    default:
      return <Brain className="h-3 w-3" />;
  }
}

export function SentimentIndicator({ asset, market = 'US' }: SentimentIndicatorProps) {
  const [data, setData] = useState<AggregatedInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSentiment() {
      if (!asset) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data: insights, error: fetchError } = await supabase
          .from('aggregated_insights')
          .select('*')
          .eq('asset', asset.toUpperCase())
          .eq('market', market)
          .gte('expires_at', new Date().toISOString())
          .order('computed_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (fetchError) throw fetchError;
        
        if (insights) {
          setData({
            weighted_sentiment: insights.weighted_sentiment || 0,
            avg_sentiment: insights.avg_sentiment || 0,
            sentiment_stddev: insights.sentiment_stddev || 0,
            bullish_count: insights.bullish_count || 0,
            bearish_count: insights.bearish_count || 0,
            neutral_count: insights.neutral_count || 0,
            total_signals: insights.total_signals || 0,
            conflict_detected: insights.conflict_detected || false,
            data_quality_score: insights.data_quality_score || 0,
            source_breakdown: (insights.source_breakdown as Record<string, number>) || {},
            top_signals: (insights.top_signals as any[]) || [],
            volatility_adjustment: insights.volatility_adjustment || 1,
            probability_shift: insights.probability_shift || 0,
            tail_risk_multiplier: insights.tail_risk_multiplier || 1,
            computed_at: insights.computed_at
          });
        }
      } catch (err) {
        console.error('Failed to fetch sentiment:', err);
        setError('Could not load sentiment data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSentiment();
  }, [asset, market]);

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data || data.total_signals === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Market Sentiment</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No sentiment data available for {asset.toUpperCase()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Sentiment analysis requires recent news signals
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sentiment = getSentimentLabel(data.weighted_sentiment);
  const sentimentPercent = ((data.weighted_sentiment + 1) / 2) * 100; // Convert -1..1 to 0..100
  const timeSinceCompute = data.computed_at 
    ? Math.round((Date.now() - new Date(data.computed_at).getTime()) / 60000)
    : null;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Market Sentiment</CardTitle>
          </div>
          {data.conflict_detected && (
            <Badge variant="outline" className="bg-caution/10 text-caution border-caution/30 text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Mixed Signals
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          AI-analyzed from {data.total_signals} signals
          {timeSinceCompute !== null && ` • Updated ${timeSinceCompute}m ago`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sentiment Gauge */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overall Sentiment</span>
            <span className={`flex items-center gap-1.5 font-medium ${sentiment.color}`}>
              {sentiment.icon}
              {sentiment.label}
              <span className="font-mono text-xs">
                ({data.weighted_sentiment >= 0 ? '+' : ''}{data.weighted_sentiment.toFixed(2)})
              </span>
            </span>
          </div>
          <div className="relative h-2 rounded-full bg-muted overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
              style={{ 
                width: `${sentimentPercent}%`,
                background: data.weighted_sentiment >= 0.3 
                  ? 'hsl(var(--bullish))' 
                  : data.weighted_sentiment <= -0.3 
                    ? 'hsl(var(--bearish))' 
                    : 'hsl(var(--muted-foreground))'
              }}
            />
            {/* Center marker */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-foreground/30 -translate-x-1/2" />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Bearish</span>
            <span>Neutral</span>
            <span>Bullish</span>
          </div>
        </div>

        {/* Signal Breakdown */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-bullish/10">
            <div className="text-lg font-semibold text-bullish">{data.bullish_count}</div>
            <div className="text-xs text-muted-foreground">Bullish</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-semibold text-foreground">{data.neutral_count}</div>
            <div className="text-xs text-muted-foreground">Neutral</div>
          </div>
          <div className="p-2 rounded-lg bg-bearish/10">
            <div className="text-lg font-semibold text-bearish">{data.bearish_count}</div>
            <div className="text-xs text-muted-foreground">Bearish</div>
          </div>
        </div>

        {/* Source Breakdown */}
        {Object.keys(data.source_breakdown).length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Sources</span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(data.source_breakdown).map(([source, count]) => (
                <Badge 
                  key={source} 
                  variant="secondary" 
                  className="text-xs flex items-center gap-1"
                >
                  {getSourceIcon(source)}
                  {source}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Top Signals Preview */}
        {data.top_signals && data.top_signals.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Top Signals</span>
            <div className="space-y-1.5">
              {data.top_signals.slice(0, 3).map((signal, idx) => {
                const signalSentiment = getSentimentLabel(signal.sentiment);
                return (
                  <div 
                    key={idx} 
                    className="p-2 rounded-lg bg-muted/30 border border-border/30 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-foreground line-clamp-1 flex-1">
                        {signal.title}
                      </span>
                      <span className={`flex items-center gap-0.5 shrink-0 ${signalSentiment.color}`}>
                        {signalSentiment.icon}
                      </span>
                    </div>
                    <span className="text-muted-foreground/60">{signal.source}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Data Quality */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-border/30">
          <span className="text-muted-foreground">Data Quality</span>
          <div className="flex items-center gap-2">
            <Progress value={data.data_quality_score * 100} className="w-16 h-1.5" />
            <span className="font-mono text-muted-foreground">
              {(data.data_quality_score * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
