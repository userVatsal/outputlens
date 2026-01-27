/**
 * Neural Database - Context Query Module
 * 
 * Layer 2: Statistical Adaptation
 * 
 * High-level query interface for retrieving neural context.
 * Combines embedding creation and similarity search.
 * 
 * CRITICAL: Returns CONTEXT for Layer 3 AI interpretation.
 * Never predicts. Never gives trading signals.
 */

import { 
  RegimeEmbedding, 
  createEmbeddingVector,
  createEmbeddingFromSimulation 
} from './embeddings';
import { 
  findSimilarRegimes, 
  SimilarityResult,
  describeSimilarity,
  getWeightedHistoricalOutcome 
} from './similarity';
import { MarketRegime } from '../engine/regimes/hmm';

export interface NeuralContext {
  // Similar historical regimes
  similarRegimes: SimilarityResult[];
  topMatch: SimilarityResult | null;
  
  // Summary statistics
  regimeLabel: string;
  averageSimilarity: number;
  confidenceScore: number;           // How confident are we in historical parallels
  
  // Historical outcomes (for context, NOT prediction)
  historicalContext: {
    weightedExpectedReturn: number;
    weightedExpectedDrawdown: number;
    returnRange: { min: number; max: number };
    drawdownRange: { min: number; max: number };
  };
  
  // Human-readable statement for Layer 3
  contextStatement: string;
}

/**
 * Query neural database for historical context
 * 
 * LAYER 2: Statistical context retrieval
 * Output is used by Layer 3 for interpretation, NOT prediction
 */
export function queryNeuralContext(
  simulation: {
    meanReturn: number;
    stdDev: number;
    skewness: number;
    kurtosis: number;
    percentiles: { p5: number };
  },
  maxDrawdown: number,
  currentRegime: MarketRegime,
  assetClass: string = 'equity',
  k: number = 5
): NeuralContext {
  // Create embedding from current simulation
  const embedding = createEmbeddingFromSimulation(
    simulation,
    maxDrawdown,
    currentRegime,
    assetClass
  );
  
  const vector = createEmbeddingVector(embedding);
  
  // Find similar historical regimes
  const similarRegimes = findSimilarRegimes(vector, k);
  const topMatch = similarRegimes.length > 0 ? similarRegimes[0] : null;
  
  // Calculate summary statistics
  const avgSimilarity = similarRegimes.length > 0
    ? similarRegimes.reduce((sum, r) => sum + r.similarity, 0) / similarRegimes.length
    : 0;
  
  // Get weighted historical outcomes
  const weighted = getWeightedHistoricalOutcome(similarRegimes);
  
  // Calculate ranges
  const returns = similarRegimes.map(r => r.outcomeAfter.actualReturn);
  const drawdowns = similarRegimes.map(r => r.outcomeAfter.worstDrawdown);
  
  const returnRange = returns.length > 0 
    ? { min: Math.min(...returns), max: Math.max(...returns) }
    : { min: 0, max: 0 };
  
  const drawdownRange = drawdowns.length > 0
    ? { min: Math.min(...drawdowns), max: Math.max(...drawdowns) }
    : { min: 0, max: 0 };
  
  // Generate context statement for Layer 3
  const contextStatement = generateContextStatement(
    currentRegime,
    similarRegimes,
    weighted
  );
  
  return {
    similarRegimes,
    topMatch,
    regimeLabel: getRegimeLabel(currentRegime),
    averageSimilarity: avgSimilarity,
    confidenceScore: weighted.confidence,
    historicalContext: {
      weightedExpectedReturn: weighted.expectedReturn,
      weightedExpectedDrawdown: weighted.expectedDrawdown,
      returnRange,
      drawdownRange
    },
    contextStatement
  };
}

/**
 * Get human-readable regime label
 */
function getRegimeLabel(regime: MarketRegime): string {
  switch (regime) {
    case 'bull': return 'Bullish Continuation';
    case 'neutral': return 'Base Regime';
    case 'bear': return 'Bearish Scenario';
    case 'stress': return 'Crisis / Stress';
    default: return 'Unknown';
  }
}

/**
 * Generate context statement for AI interpretation
 * 
 * CRITICAL: This is CONTEXT, not prediction
 */
function generateContextStatement(
  regime: MarketRegime,
  similarRegimes: SimilarityResult[],
  weighted: { expectedReturn: number; expectedDrawdown: number; confidence: number }
): string {
  if (similarRegimes.length === 0) {
    return 'No similar historical regimes found. Current conditions are relatively unusual in the historical dataset.';
  }
  
  const topMatch = similarRegimes[0];
  const similarity = describeSimilarity(topMatch.similarity);
  
  const periods = similarRegimes.map(r => r.historicalDate).join(', ');
  
  // Construct factual context (no predictions)
  let statement = `Current ${getRegimeLabel(regime)} regime shows ${similarity.toLowerCase()}. `;
  statement += `Similar conditions observed: ${periods}. `;
  
  // Historical range (factual, not predictive)
  const returns = similarRegimes.map(r => r.outcomeAfter.actualReturn);
  const minReturn = Math.min(...returns).toFixed(1);
  const maxReturn = Math.max(...returns).toFixed(1);
  
  statement += `In those periods, 30-day outcomes ranged from ${minReturn}% to ${maxReturn}%. `;
  
  // Caveat
  statement += 'Historical patterns provide context but do not predict future outcomes.';
  
  return statement;
}

/**
 * Quick context query without full neural search
 * Returns basic regime context for fast responses
 */
export function getQuickContext(regime: MarketRegime): string {
  switch (regime) {
    case 'bull':
      return 'Bullish conditions typically persist with lower volatility and positive drift. Historical bull phases average 12-18 months.';
    case 'neutral':
      return 'Range-bound conditions with normal volatility. Historical neutral phases are common (45% of time) and can persist or transition.';
    case 'bear':
      return 'Bearish conditions with elevated volatility. Historical bear phases average 6-12 months. Tail risks are elevated.';
    case 'stress':
      return 'Crisis conditions are rare but impactful. Historical stress phases average 2-6 months. Extreme tail events possible.';
    default:
      return 'Market conditions are within normal parameters.';
  }
}

// Re-export types for convenience
export type { SimilarityResult } from './similarity';
export type { RegimeEmbedding } from './embeddings';
