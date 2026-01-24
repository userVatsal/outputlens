/**
 * AI Agent System Types
 * 
 * Types for the qualitative→quantitative data pipeline
 */

import { Market, TradeDirection, TimeHorizon, RiskLevel } from './trade';

// =============================================
// Qualitative Signal Types
// =============================================

export type SourceType = 'news' | 'social' | 'video' | 'research' | 'forum' | 'analyst';

export interface QualitativeSignal {
  id: string;
  asset: string | null;
  asset_type: string | null;
  source_type: SourceType;
  source_name: string;
  source_url: string | null;
  title: string | null;
  content: string;
  content_hash: string;
  language: string;
  author: string | null;
  published_at: string | null;
  fetched_at: string;
  processed: boolean;
  processing_error: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

// =============================================
// Sentiment Score Types
// =============================================

export interface SentimentEntity {
  name: string;
  type: 'company' | 'person' | 'sector' | 'event' | 'macro';
}

export interface SentimentScore {
  id: string;
  signal_id: string;
  asset: string;
  sentiment_score: number;      // -1 to +1
  confidence: number;           // 0 to 1
  expected_impact: number | null;
  impact_timeframe: string | null;
  entities: SentimentEntity[];
  keywords: string[];
  reasoning: string | null;
  model_used: string;
  processed_at: string;
  created_at: string;
}

// =============================================
// Aggregated Insights Types
// =============================================

export interface SourceBreakdown {
  news: number;
  social: number;
  video: number;
  research: number;
  forum: number;
  analyst: number;
}

export interface TopSignal {
  sentiment: number;
  confidence: number;
  reasoning: string;
}

export interface AggregatedInsight {
  id: string;
  asset: string;
  market: Market;
  window_start: string;
  window_end: string;
  
  // Sentiment metrics
  avg_sentiment: number | null;
  weighted_sentiment: number | null;
  sentiment_stddev: number | null;
  bullish_count: number;
  bearish_count: number;
  neutral_count: number;
  total_signals: number;
  
  // Quantitative adjustments
  volatility_adjustment: number;
  probability_shift: number;
  tail_risk_multiplier: number;
  expected_move_adjustment: number;
  
  // Quality metrics
  data_quality_score: number | null;
  source_diversity_score: number | null;
  conflict_detected: boolean;
  
  // Details
  source_breakdown: SourceBreakdown;
  top_signals: TopSignal[];
  
  computed_at: string;
  expires_at: string;
  created_at: string;
}

// =============================================
// Agent Pipeline Types
// =============================================

export type AgentType = 'ingestion' | 'nlp' | 'aggregation' | 'seo';
export type AgentStatus = 'running' | 'completed' | 'failed' | 'cancelled';

export interface AgentRun {
  id: string;
  agent_name: string;
  agent_type: AgentType;
  status: AgentStatus;
  started_at: string;
  completed_at: string | null;
  items_processed: number;
  items_failed: number;
  error_message: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

// =============================================
// API Response Types
// =============================================

export interface SentimentInsightsResponse {
  sentimentScore: number;
  probabilityUp: number;
  probabilityDown: number;
  expectedMove: number;
  tailRiskAdjustment: number;
  volatilityAdjustment: number;
  sourceCount: number;
  conflictDetected: boolean;
  dataQuality: number;
}

export interface EnhancedAnalysisResponse {
  asset: string;
  market: Market;
  direction: TradeDirection;
  entryPrice: number;
  timeHorizon: TimeHorizon;
  userConfidence: number;
  
  marketData: {
    price: number;
    volatility: number;
    adjustedVolatility: number;
    change?: number;
    changePercent?: number;
    source: string;
  } | null;

  sentimentInsights: {
    score: number;
    direction: 'bullish' | 'bearish' | 'neutral';
    sourceCount: number;
    dataQuality: number;
    conflictDetected: boolean;
    adjustments: {
      volatility: number;
      tailRisk: number;
      expectedMove: number;
    };
  } | null;

  simulation: {
    paths: number;
    meanReturn: number;
    medianReturn: number;
    stdDev: number;
    skewness: number;
    kurtosis: number;
  };

  riskMetrics: {
    volatilityProxy: number;
    maxExpectedMove: number;
    riskScore: number;
    riskLabel: RiskLevel;
    valueAtRisk95: number;
    valueAtRisk99: number;
    expectedShortfall: number;
    expectedReturn: number;
    medianReturn: number;
    probabilityOfLoss: number;
    probabilityOfProfit: number;
    sharpeProxy: number;
    skewness: number;
    kurtosis: number;
    usedLiveData: boolean;
    simulationPaths: number;
    sentimentAdjusted: boolean;
  };

  scenarios: {
    base: DynamicScenarioResponse[];
    upside: DynamicScenarioResponse[];
    downside: DynamicScenarioResponse[];
    tail: DynamicScenarioResponse[];
  };

  bestCase: DynamicScenarioResponse;
  worstCase: DynamicScenarioResponse;

  analyzedAt: string;
  dataSourcesUsed: string[];
}

export interface DynamicScenarioResponse {
  id: string;
  name: string;
  category: 'base' | 'upside' | 'downside' | 'tail';
  priceRangeMin: number;
  priceRangeMax: number;
  returnRangeMin: number;
  returnRangeMax: number;
  probability: number;
  probabilityLabel: string;
  riskLevel: RiskLevel;
}

// =============================================
// Pipeline Request Types
// =============================================

export interface IngestNewsRequest {
  assets?: string[];
  category?: string;
  limit?: number;
}

export interface ProcessSentimentRequest {
  limit?: number;
  asset?: string;
}

export interface AggregateInsightsRequest {
  asset: string;
  market?: Market;
  windowHours?: number;
}

export interface PipelineRequest {
  assets?: string[];
  stages?: ('ingest' | 'sentiment' | 'aggregate')[];
  newsLimit?: number;
  sentimentLimit?: number;
}

export interface PipelineResponse {
  success: boolean;
  stages: string[];
  results: {
    newsIngested: number;
    sentimentProcessed: number;
    assetsAggregated: number;
  };
  errors?: string[];
  timestamp: string;
}