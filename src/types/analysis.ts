/**
 * Enhanced Analysis Types for Dynamic Scenario Engine
 */

import { 
  TradeInput, 
  Market, 
  TradeDirection, 
  TimeHorizon,
  RiskLevel,
  ScenarioCategory 
} from './trade';
import { DynamicScenario, DynamicScenarioSet, SimulationResult } from '@/lib/scenarioEngine';
import { AdvancedRiskMetrics } from '@/lib/riskMetrics';

/**
 * Enhanced trade input with confidence, assumptions, and precise timing
 */
export interface EnhancedTradeInput extends TradeInput {
  confidence?: number;        // 1-10 scale, default 5
  assumptions?: string;       // Free-text qualitative notes
  assetName?: string;         // Human-readable company name
  entryDateTime?: Date;       // Precise entry timestamp (includes time)
  exitDateTime?: Date;        // Precise exit timestamp (includes time)
}

/**
 * Market data from live APIs with quality indicators
 */
export interface EnhancedMarketData {
  price: number;
  change?: number;
  changePercent?: number;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
  volume?: number;
  
  // Calculated metrics
  volatility: number;         // Annualized volatility (%)
  atr14?: number;             // 14-day Average True Range
  
  // Sentiment (optional)
  sentimentScore?: number;    // -1 to +1
  newsHeadlines?: string[];
  
  // Data quality
  source: string;
  timestamp: number;
  dataQuality: 'live' | 'delayed' | 'cached' | 'fallback';
  cacheAge?: number;          // Seconds since fetch
}

/**
 * Complete enhanced analysis output
 */
export interface EnhancedTradeAnalysis {
  // Input
  input: EnhancedTradeInput;
  
  // Market data used
  marketData: EnhancedMarketData;
  
  // Advanced risk metrics
  riskMetrics: AdvancedRiskMetrics;
  
  // Dynamic scenarios from simulation
  scenarios: DynamicScenarioSet;
  
  // Simulation summary
  simulation: {
    paths: number;
    meanReturn: number;
    medianReturn: number;
    stdDev: number;
    skewness: number;
    kurtosis: number;
  };
  
  // Best/worst case summary
  bestCase: {
    scenario: DynamicScenario;
    returnMax: number;
  };
  worstCase: {
    scenario: DynamicScenario;
    returnMin: number;
  };
  
  // Overall assessment
  overallRisk: RiskLevel;
  
  // AI explanation (optional, loaded async)
  explanation?: string;
  
  // Metadata
  analyzedAt: number;
  dataSourcesUsed: string[];
}

/**
 * Flattened scenario result for table display
 */
export interface FlatScenarioResult {
  scenario: DynamicScenario;
  priceRangeMin: number;
  priceRangeMax: number;
  returnMin: number;
  returnMax: number;
  dollarPnLMin: number;
  dollarPnLMax: number;
}

/**
 * Analysis history record
 */
export interface AnalysisHistoryRecord {
  id: string;
  user_id: string;
  asset: string;
  market: Market;
  direction: TradeDirection;
  entry_price: number;
  time_horizon: TimeHorizon;
  user_confidence?: number;
  user_assumptions?: string;
  results: EnhancedTradeAnalysis;
  live_volatility?: number;
  data_sources?: string[];
  simulation_stats?: {
    paths: number;
    meanReturn: number;
    kurtosis: number;
  };
  created_at: string;
}

/**
 * Batch analysis request
 */
export interface BatchAnalysisRequest {
  assets: Array<{
    symbol: string;
    market: Market;
    direction: TradeDirection;
    entryPrice?: number;
  }>;
  commonParams: {
    timeHorizon: TimeHorizon;
    confidence?: number;
  };
}

/**
 * Batch analysis response
 */
export interface BatchAnalysisResponse {
  results: Array<{
    asset: string;
    analysis: EnhancedTradeAnalysis | null;
    error?: string;
  }>;
  portfolio?: {
    diversificationScore: number;
    combinedVaR: number;
    correlationWarnings: string[];
  };
}
