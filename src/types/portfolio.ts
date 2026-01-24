/**
 * Portfolio Batch Analysis Types
 */

import { Market, TradeDirection, TimeHorizon } from './trade';
import { AdvancedRiskMetrics } from '@/lib/riskMetrics';
import { DynamicScenario } from '@/lib/scenarioEngine';

// Re-export for convenience
export type { AdvancedRiskMetrics, DynamicScenario };

// Single asset in portfolio
export interface PortfolioAsset {
  symbol: string;
  market: Market;
  direction: TradeDirection;
  weight: number; // 0-100 percentage
  entryPrice?: number;
}

// Batch analysis input
export interface BatchAnalysisInput {
  assets: PortfolioAsset[];
  timeHorizon: TimeHorizon;
  confidence?: number;
  assumptions?: string;
}

// Individual asset analysis result
export interface AssetAnalysisResult {
  symbol: string;
  market: Market;
  direction: TradeDirection;
  weight: number;
  
  // Price data
  currentPrice: number;
  entryPrice: number;
  
  // Risk metrics
  riskMetrics: AdvancedRiskMetrics;
  
  // Scenarios
  scenarios: {
    base: DynamicScenario[];
    upside: DynamicScenario[];
    downside: DynamicScenario[];
    tail: DynamicScenario[];
  };
  
  // Simulation summary
  simulation: {
    paths: number;
    meanReturn: number;
    medianReturn: number;
    stdDev: number;
  };
  
  // Sentiment if available
  sentiment?: {
    score: number;
    direction: 'bullish' | 'bearish' | 'neutral';
    sourceCount: number;
  };
}

// Correlation matrix between assets
export interface CorrelationMatrix {
  assets: string[];
  matrix: number[][];
}

// Portfolio-level risk metrics
export interface PortfolioRiskMetrics {
  // Combined VaR
  portfolioVaR95: number;
  portfolioVaR99: number;
  
  // Expected shortfall
  portfolioExpectedShortfall: number;
  
  // Diversification
  diversificationRatio: number;
  diversificationBenefit: number; // % reduction in risk from diversification
  
  // Concentration
  herfindahlIndex: number;
  topConcentration: number; // % in top 3 assets
  
  // Risk contribution
  riskContribution: { symbol: string; contribution: number }[];
  
  // Overall metrics
  expectedReturn: number;
  portfolioVolatility: number;
  sharpeRatio: number;
  maxDrawdownEstimate: number;
  
  // Probability metrics
  probabilityOfLoss: number;
  probabilityOfProfit: number;
}

// Full batch analysis result
export interface BatchAnalysisResult {
  // Individual results
  assets: AssetAnalysisResult[];
  
  // Portfolio level
  portfolio: {
    totalValue: number;
    weightedReturn: number;
    riskMetrics: PortfolioRiskMetrics;
    correlationMatrix: CorrelationMatrix;
  };
  
  // Best/Worst across all
  bestAsset: { symbol: string; expectedReturn: number };
  worstAsset: { symbol: string; expectedReturn: number };
  
  // Metadata
  analyzedAt: number;
  simulationPaths: number;
  dataSourcesUsed: string[];
}

// Default portfolio templates
export const PORTFOLIO_TEMPLATES = {
  balanced: [
    { symbol: 'SPY', market: 'US' as Market, direction: 'long' as TradeDirection, weight: 40 },
    { symbol: 'TLT', market: 'US' as Market, direction: 'long' as TradeDirection, weight: 30 },
    { symbol: 'GLD', market: 'US' as Market, direction: 'long' as TradeDirection, weight: 15 },
    { symbol: 'BTC', market: 'US' as Market, direction: 'long' as TradeDirection, weight: 15 },
  ],
  aggressive: [
    { symbol: 'QQQ', market: 'US' as Market, direction: 'long' as TradeDirection, weight: 35 },
    { symbol: 'ARKK', market: 'US' as Market, direction: 'long' as TradeDirection, weight: 20 },
    { symbol: 'BTC', market: 'US' as Market, direction: 'long' as TradeDirection, weight: 25 },
    { symbol: 'ETH', market: 'US' as Market, direction: 'long' as TradeDirection, weight: 20 },
  ],
  conservative: [
    { symbol: 'SPY', market: 'US' as Market, direction: 'long' as TradeDirection, weight: 30 },
    { symbol: 'BND', market: 'US' as Market, direction: 'long' as TradeDirection, weight: 40 },
    { symbol: 'GLD', market: 'US' as Market, direction: 'long' as TradeDirection, weight: 20 },
    { symbol: 'USDX', market: 'US' as Market, direction: 'long' as TradeDirection, weight: 10 },
  ],
};
