/**
 * Neural Database - Similarity Search Module
 * 
 * Layer 2: Statistical Adaptation
 * 
 * Implements cosine similarity and k-NN search for finding
 * historically similar volatility regimes.
 * 
 * CRITICAL: Returns historical analogs for CONTEXT only.
 * Never predicts. Never generates trading signals.
 */

import { RegimeEmbedding, createEmbeddingVector, EMBEDDING_DIMENSIONS } from './embeddings';
import { MarketRegime } from '../engine/regimes/hmm';

export interface SimilarityResult {
  embedding: RegimeEmbedding;
  similarity: number;            // 0-1 cosine similarity
  historicalDate: string;
  outcomeAfter: {
    days: number;
    actualReturn: number;        // What actually happened (%)
    worstDrawdown: number;       // Max drawdown after (%)
  };
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  
  return dotProduct / denominator;
}

/**
 * Calculate Euclidean distance between two vectors
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity;
  
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  
  return Math.sqrt(sum);
}

// Historical regime embeddings (pre-computed from market data)
// In production, this would come from Supabase/vector DB
const HISTORICAL_EMBEDDINGS: Array<{
  embedding: RegimeEmbedding;
  date: string;
  outcome: { days: number; actualReturn: number; worstDrawdown: number };
}> = [
  {
    embedding: {
      meanReturn: 2.5, volatility: 15, skewness: -0.3, kurtosis: 1.2,
      maxDrawdown: 5, var95: 3, regimeLabel: 'bull' as MarketRegime,
      correlationScore: 0.75, assetClass: 'equity', timeframe: '1d', timestamp: 0
    },
    date: '2021-Q2',
    outcome: { days: 30, actualReturn: 4.2, worstDrawdown: 3.1 }
  },
  {
    embedding: {
      meanReturn: -1.5, volatility: 28, skewness: -0.8, kurtosis: 3.5,
      maxDrawdown: 15, var95: 8, regimeLabel: 'bear' as MarketRegime,
      correlationScore: 0.85, assetClass: 'equity', timeframe: '1d', timestamp: 0
    },
    date: '2022-Q2',
    outcome: { days: 30, actualReturn: -6.5, worstDrawdown: 12.3 }
  },
  {
    embedding: {
      meanReturn: 0.5, volatility: 18, skewness: -0.1, kurtosis: 0.8,
      maxDrawdown: 7, var95: 4, regimeLabel: 'neutral' as MarketRegime,
      correlationScore: 0.70, assetClass: 'equity', timeframe: '1d', timestamp: 0
    },
    date: '2023-Q3',
    outcome: { days: 30, actualReturn: 1.8, worstDrawdown: 4.5 }
  },
  {
    embedding: {
      meanReturn: -8.5, volatility: 55, skewness: -1.5, kurtosis: 8.2,
      maxDrawdown: 35, var95: 18, regimeLabel: 'stress' as MarketRegime,
      correlationScore: 0.95, assetClass: 'equity', timeframe: '1d', timestamp: 0
    },
    date: '2020-Q1',
    outcome: { days: 30, actualReturn: 15.2, worstDrawdown: 32.1 }
  },
  {
    embedding: {
      meanReturn: 3.8, volatility: 12, skewness: 0.2, kurtosis: 0.5,
      maxDrawdown: 3, var95: 2, regimeLabel: 'bull' as MarketRegime,
      correlationScore: 0.65, assetClass: 'equity', timeframe: '1d', timestamp: 0
    },
    date: '2019-Q4',
    outcome: { days: 30, actualReturn: 3.5, worstDrawdown: 2.8 }
  },
  {
    embedding: {
      meanReturn: -3.2, volatility: 32, skewness: -1.0, kurtosis: 4.1,
      maxDrawdown: 18, var95: 10, regimeLabel: 'bear' as MarketRegime,
      correlationScore: 0.88, assetClass: 'equity', timeframe: '1d', timestamp: 0
    },
    date: '2018-Q4',
    outcome: { days: 30, actualReturn: 8.5, worstDrawdown: 9.2 }
  }
];

/**
 * Find k most similar historical regimes
 * 
 * LAYER 2: Retrieves historical context for interpretation
 * NEVER predicts - only returns what happened in similar conditions
 */
export function findSimilarRegimes(
  currentEmbedding: number[],
  k: number = 5
): SimilarityResult[] {
  if (currentEmbedding.length !== EMBEDDING_DIMENSIONS) {
    console.warn('Invalid embedding dimensions');
    return [];
  }
  
  // Calculate similarity with all historical embeddings
  const similarities = HISTORICAL_EMBEDDINGS.map(item => {
    const historicalVector = createEmbeddingVector(item.embedding);
    const similarity = cosineSimilarity(currentEmbedding, historicalVector);
    
    return {
      embedding: item.embedding,
      similarity,
      historicalDate: item.date,
      outcomeAfter: item.outcome
    };
  });
  
  // Sort by similarity (descending) and take top k
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k);
}

/**
 * Get similarity threshold description
 */
export function describeSimilarity(similarity: number): string {
  if (similarity >= 0.95) return 'Very high similarity - nearly identical conditions';
  if (similarity >= 0.85) return 'High similarity - comparable market conditions';
  if (similarity >= 0.70) return 'Moderate similarity - some parallels exist';
  if (similarity >= 0.50) return 'Low similarity - limited historical parallel';
  return 'Minimal similarity - current conditions are unusual';
}

/**
 * Calculate weighted average outcome from similar regimes
 * Weights by similarity score
 */
export function getWeightedHistoricalOutcome(results: SimilarityResult[]): {
  expectedReturn: number;
  expectedDrawdown: number;
  confidence: number;
} {
  if (results.length === 0) {
    return { expectedReturn: 0, expectedDrawdown: 0, confidence: 0 };
  }
  
  let weightSum = 0;
  let returnSum = 0;
  let ddSum = 0;
  
  for (const r of results) {
    const weight = r.similarity;
    weightSum += weight;
    returnSum += r.outcomeAfter.actualReturn * weight;
    ddSum += r.outcomeAfter.worstDrawdown * weight;
  }
  
  const avgSimilarity = results.reduce((s, r) => s + r.similarity, 0) / results.length;
  
  return {
    expectedReturn: weightSum > 0 ? returnSum / weightSum : 0,
    expectedDrawdown: weightSum > 0 ? ddSum / weightSum : 0,
    confidence: avgSimilarity
  };
}
