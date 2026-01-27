/**
 * Hidden Markov Model (HMM) Regime Detection
 * 
 * Layer 2: Statistical Adaptation - ML Classification
 * 
 * Detects market regimes (bull/neutral/bear/stress) based on
 * price history and volatility patterns. NO PREDICTION - classification only.
 * 
 * This is a simplified HMM using volatility and return characteristics
 * to classify the current market state.
 */

export type MarketRegime = 'bull' | 'neutral' | 'bear' | 'stress';

export interface HMMParams {
  returns: number[];           // Historical daily returns (%)
  volatility?: number;         // Current volatility (if known)
  lookback?: number;           // Days to consider (default: 30)
}

export interface HMMResult {
  currentRegime: MarketRegime;
  regimeProbabilities: Record<MarketRegime, number>;
  confidence: number;          // 0-1 confidence in classification
  signals: {
    trendStrength: number;     // -1 to +1
    volatilityState: 'low' | 'normal' | 'high' | 'extreme';
    momentum: number;          // -1 to +1
    recentDrawdown: number;    // Max drawdown in lookback period (%)
  };
  transitionMatrix: number[][]; // Empirical regime transition probabilities
}

// Empirical regime transition matrix (rows: from, cols: to)
// Order: [bull, neutral, bear, stress]
const TRANSITION_MATRIX = [
  [0.85, 0.10, 0.04, 0.01],  // From bull
  [0.15, 0.70, 0.12, 0.03],  // From neutral
  [0.05, 0.20, 0.70, 0.05],  // From bear
  [0.02, 0.15, 0.33, 0.50],  // From stress
];

/**
 * Calculate trend strength from returns
 */
function calculateTrendStrength(returns: number[]): number {
  if (returns.length === 0) return 0;
  
  const sum = returns.reduce((acc, r) => acc + r, 0);
  const mean = sum / returns.length;
  const stdDev = Math.sqrt(
    returns.reduce((acc, r) => acc + Math.pow(r - mean, 2), 0) / returns.length
  );
  
  // Normalize trend strength to -1 to +1
  if (stdDev === 0) return 0;
  return Math.max(-1, Math.min(1, mean / (stdDev + 0.01)));
}

/**
 * Calculate momentum indicator
 */
function calculateMomentum(returns: number[]): number {
  if (returns.length < 5) return 0;
  
  // Compare recent vs older returns
  const recentPeriod = returns.slice(-5);
  const olderPeriod = returns.slice(-15, -5);
  
  if (olderPeriod.length === 0) return 0;
  
  const recentMean = recentPeriod.reduce((a, b) => a + b, 0) / recentPeriod.length;
  const olderMean = olderPeriod.reduce((a, b) => a + b, 0) / olderPeriod.length;
  
  // Normalize to -1 to +1
  const momentum = (recentMean - olderMean) * 10;
  return Math.max(-1, Math.min(1, momentum));
}

/**
 * Calculate volatility state from returns
 */
function classifyVolatility(returns: number[]): 'low' | 'normal' | 'high' | 'extreme' {
  if (returns.length === 0) return 'normal';
  
  const stdDev = Math.sqrt(
    returns.reduce((acc, r) => acc + r * r, 0) / returns.length
  );
  
  // Annualize
  const annualizedVol = stdDev * Math.sqrt(252);
  
  if (annualizedVol < 12) return 'low';
  if (annualizedVol < 22) return 'normal';
  if (annualizedVol < 35) return 'high';
  return 'extreme';
}

/**
 * Calculate max drawdown in period
 */
function calculateMaxDrawdown(returns: number[]): number {
  if (returns.length === 0) return 0;
  
  let peak = 100;
  let maxDD = 0;
  let current = 100;
  
  for (const r of returns) {
    current = current * (1 + r / 100);
    if (current > peak) peak = current;
    const dd = (peak - current) / peak * 100;
    if (dd > maxDD) maxDD = dd;
  }
  
  return maxDD;
}

/**
 * Classify regime based on signals
 */
function classifyRegime(
  trendStrength: number,
  volatilityState: 'low' | 'normal' | 'high' | 'extreme',
  momentum: number,
  maxDrawdown: number
): { regime: MarketRegime; probabilities: Record<MarketRegime, number> } {
  // Score each regime
  const scores: Record<MarketRegime, number> = {
    bull: 0,
    neutral: 0,
    bear: 0,
    stress: 0
  };
  
  // Trend component
  if (trendStrength > 0.3) {
    scores.bull += trendStrength * 2;
  } else if (trendStrength < -0.3) {
    scores.bear += Math.abs(trendStrength) * 2;
  } else {
    scores.neutral += 1;
  }
  
  // Volatility component
  switch (volatilityState) {
    case 'low':
      scores.bull += 0.5;
      scores.neutral += 0.3;
      break;
    case 'normal':
      scores.neutral += 0.5;
      break;
    case 'high':
      scores.bear += 0.5;
      break;
    case 'extreme':
      scores.stress += 1.5;
      scores.bear += 0.5;
      break;
  }
  
  // Momentum component
  if (momentum > 0.2) {
    scores.bull += momentum;
  } else if (momentum < -0.2) {
    scores.bear += Math.abs(momentum);
  }
  
  // Drawdown component
  if (maxDrawdown > 15) {
    scores.stress += 1;
    scores.bear += 0.5;
  } else if (maxDrawdown > 8) {
    scores.bear += 0.5;
  }
  
  // Normalize to probabilities
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const probabilities: Record<MarketRegime, number> = {
    bull: scores.bull / total,
    neutral: scores.neutral / total,
    bear: scores.bear / total,
    stress: scores.stress / total
  };
  
  // Find max probability regime
  let maxProb = 0;
  let regime: MarketRegime = 'neutral';
  for (const [r, p] of Object.entries(probabilities)) {
    if (p > maxProb) {
      maxProb = p;
      regime = r as MarketRegime;
    }
  }
  
  return { regime, probabilities };
}

/**
 * Detect current market regime using HMM-inspired analysis
 * 
 * LAYER 2: ML-based classification
 * NO PREDICTION - only classifies current state
 */
export function detectRegime(params: HMMParams): HMMResult {
  const { returns, lookback = 30 } = params;
  
  // Use lookback period
  const recentReturns = returns.slice(-lookback);
  
  // Calculate signals
  const trendStrength = calculateTrendStrength(recentReturns);
  const volatilityState = classifyVolatility(recentReturns);
  const momentum = calculateMomentum(recentReturns);
  const recentDrawdown = calculateMaxDrawdown(recentReturns);
  
  // Classify regime
  const { regime, probabilities } = classifyRegime(
    trendStrength,
    volatilityState,
    momentum,
    recentDrawdown
  );
  
  // Calculate confidence (how dominant is the top regime)
  const sortedProbs = Object.values(probabilities).sort((a, b) => b - a);
  const confidence = sortedProbs.length > 1 
    ? sortedProbs[0] - sortedProbs[1]
    : sortedProbs[0];
  
  return {
    currentRegime: regime,
    regimeProbabilities: probabilities,
    confidence,
    signals: {
      trendStrength,
      volatilityState,
      momentum,
      recentDrawdown
    },
    transitionMatrix: TRANSITION_MATRIX
  };
}

/**
 * Get regime description for display
 */
export function getRegimeDescription(regime: MarketRegime): string {
  switch (regime) {
    case 'bull':
      return 'Bullish conditions with positive momentum and lower volatility';
    case 'neutral':
      return 'Range-bound market with normal volatility levels';
    case 'bear':
      return 'Bearish conditions with negative momentum and elevated volatility';
    case 'stress':
      return 'Crisis conditions with extreme volatility and significant drawdowns';
    default:
      return 'Unknown market conditions';
  }
}
