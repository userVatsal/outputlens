/**
 * Neural Database - Embeddings Module
 * 
 * Layer 2: Statistical Adaptation
 * 
 * Defines embedding schema for volatility regimes, return distributions,
 * and market states. These embeddings enable similarity search for
 * historical context retrieval.
 * 
 * CRITICAL: This module does NOT predict. It retrieves historical context.
 */

import { MarketRegime } from '../engine/regimes/hmm';

export interface RegimeEmbedding {
  // Distribution characteristics
  meanReturn: number;          // Mean return in period (%)
  volatility: number;          // Annualized volatility (%)
  skewness: number;            // Distribution skew
  kurtosis: number;            // Excess kurtosis (fat tails)
  
  // Risk metrics
  maxDrawdown: number;         // Max drawdown in period (%)
  var95: number;               // 95% VaR (%)
  
  // Regime classification
  regimeLabel: MarketRegime;
  correlationScore: number;    // Correlation with market (0-1)
  
  // Metadata
  assetClass: string;          // 'equity', 'crypto', 'forex', 'index'
  timeframe: string;           // '1d', '1w', '1m'
  timestamp: number;           // When this embedding was created
}

/**
 * Embedding vector dimensions (8 dimensions)
 * 
 * This is the core vector format for similarity search:
 * [meanReturn, volatility, skewness, kurtosis, maxDrawdown, var95, regimeCode, correlationScore]
 */
export const EMBEDDING_DIMENSIONS = 8;

/**
 * Convert regime label to numeric code for embedding
 */
function regimeToCode(regime: MarketRegime): number {
  switch (regime) {
    case 'bull': return 0.75;
    case 'neutral': return 0.5;
    case 'bear': return 0.25;
    case 'stress': return 0;
    default: return 0.5;
  }
}

/**
 * Normalize value to 0-1 range
 */
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Create embedding vector from regime data
 * 
 * Returns normalized vector suitable for cosine similarity
 */
export function createEmbeddingVector(data: RegimeEmbedding): number[] {
  // Normalization ranges based on typical market values
  return [
    normalize(data.meanReturn, -50, 50),           // Mean return: -50% to +50%
    normalize(data.volatility, 5, 80),             // Volatility: 5% to 80%
    normalize(data.skewness, -2, 2),               // Skewness: -2 to +2
    normalize(data.kurtosis, -1, 10),              // Kurtosis: -1 to 10
    normalize(data.maxDrawdown, 0, 50),            // Max DD: 0% to 50%
    normalize(data.var95, 0, 30),                  // VaR: 0% to 30%
    regimeToCode(data.regimeLabel),                // Regime: 0-1
    data.correlationScore                           // Correlation: already 0-1
  ];
}

/**
 * Create embedding from simulation results
 */
export function createEmbeddingFromSimulation(
  simulation: {
    meanReturn: number;
    stdDev: number;
    skewness: number;
    kurtosis: number;
    percentiles: { p5: number };
  },
  maxDrawdown: number,
  regime: MarketRegime,
  assetClass: string = 'equity'
): RegimeEmbedding {
  return {
    meanReturn: simulation.meanReturn,
    volatility: simulation.stdDev * Math.sqrt(252), // Annualize if daily
    skewness: simulation.skewness,
    kurtosis: simulation.kurtosis,
    maxDrawdown,
    var95: -simulation.percentiles.p5, // 5th percentile as positive loss
    regimeLabel: regime,
    correlationScore: 0.7, // Default market correlation
    assetClass,
    timeframe: '1d',
    timestamp: Date.now()
  };
}

/**
 * Validate embedding vector
 */
export function validateEmbedding(vector: number[]): boolean {
  if (vector.length !== EMBEDDING_DIMENSIONS) return false;
  return vector.every(v => typeof v === 'number' && !isNaN(v) && v >= 0 && v <= 1);
}

/**
 * Get embedding vector description (for debugging/logging)
 */
export function describeEmbedding(vector: number[]): string {
  const labels = [
    'meanReturn', 'volatility', 'skewness', 'kurtosis',
    'maxDrawdown', 'var95', 'regime', 'correlation'
  ];
  
  return vector.map((v, i) => `${labels[i]}: ${v.toFixed(3)}`).join(', ');
}
