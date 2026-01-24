/**
 * Hook for accessing sentiment data from the AI agent pipeline
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  SentimentInsightsResponse, 
  AggregatedInsight, 
  AgentRun,
  PipelineResponse 
} from '@/types/agent';

interface UseSentimentReturn {
  // Data
  insights: SentimentInsightsResponse | null;
  recentSignals: AggregatedInsight[];
  agentRuns: AgentRun[];
  
  // Actions
  fetchInsights: (asset: string, market?: string) => Promise<SentimentInsightsResponse | null>;
  runPipeline: (assets?: string[]) => Promise<PipelineResponse | null>;
  
  // State
  isLoading: boolean;
  error: string | null;
}

export function useSentiment(): UseSentimentReturn {
  const [insights, setInsights] = useState<SentimentInsightsResponse | null>(null);
  const [recentSignals, setRecentSignals] = useState<AggregatedInsight[]>([]);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch aggregated sentiment insights for an asset
   */
  const fetchInsights = useCallback(async (
    asset: string,
    market: string = 'US'
  ): Promise<SentimentInsightsResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // First, check if we have cached insights
      const { data: cachedInsight } = await supabase
        .from('aggregated_insights')
        .select('*')
        .eq('asset', asset.toUpperCase())
        .eq('market', market)
        .gte('expires_at', new Date().toISOString())
        .order('computed_at', { ascending: false })
        .limit(1)
        .single();

      if (cachedInsight) {
        const insights: SentimentInsightsResponse = {
          sentimentScore: cachedInsight.weighted_sentiment || 0,
          probabilityUp: 0.5 + (cachedInsight.probability_shift || 0) / 2,
          probabilityDown: 0.5 - (cachedInsight.probability_shift || 0) / 2,
          expectedMove: cachedInsight.expected_move_adjustment || 0,
          tailRiskAdjustment: cachedInsight.tail_risk_multiplier || 1,
          volatilityAdjustment: cachedInsight.volatility_adjustment || 1,
          sourceCount: cachedInsight.total_signals || 0,
          conflictDetected: cachedInsight.conflict_detected || false,
          dataQuality: cachedInsight.data_quality_score || 0
        };
        setInsights(insights);
        return insights;
      }

      // No cached data, try to aggregate fresh
      const { data, error: fnError } = await supabase.functions.invoke('aggregate-insights', {
        body: { asset, market, windowHours: 24 }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data) {
        setInsights(data);
        return data;
      }

      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch insights';
      setError(message);
      console.error('Sentiment fetch error:', message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Run the full agent pipeline (news → social → youtube → sentiment → aggregate)
   */
  const runPipeline = useCallback(async (
    assets?: string[]
  ): Promise<PipelineResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('run-agent-pipeline', {
        body: { 
          assets: assets || [],
          stages: ['ingest-news', 'ingest-social', 'ingest-youtube', 'sentiment', 'aggregate'],
          newsLimit: 50,
          sentimentLimit: 30
        }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      console.log('Pipeline completed:', data);
      return data as PipelineResponse;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to run pipeline';
      setError(message);
      console.error('Pipeline error:', message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    insights,
    recentSignals,
    agentRuns,
    fetchInsights,
    runPipeline,
    isLoading,
    error
  };
}

/**
 * Get sentiment label from score
 */
export function getSentimentLabel(score: number): 'bullish' | 'bearish' | 'neutral' {
  if (score > 0.1) return 'bullish';
  if (score < -0.1) return 'bearish';
  return 'neutral';
}

/**
 * Get sentiment color class
 */
export function getSentimentColor(score: number): string {
  if (score > 0.3) return 'text-bullish';
  if (score > 0.1) return 'text-bullish/70';
  if (score < -0.3) return 'text-bearish';
  if (score < -0.1) return 'text-bearish/70';
  return 'text-muted-foreground';
}

/**
 * Format sentiment score for display
 */
export function formatSentiment(score: number): string {
  const sign = score > 0 ? '+' : '';
  return `${sign}${(score * 100).toFixed(0)}%`;
}