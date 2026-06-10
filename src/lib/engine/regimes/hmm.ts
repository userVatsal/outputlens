// FILE LOCATION: src/lib/engine/regimes/hmm.ts
// ACTION: REPLACE ENTIRE FILE

export type MarketRegime = 'bull' | 'neutral' | 'bear' | 'stress';

export interface HMMParams {
  returns: number[];
  volatility?: number;
  lookback?: number;
}

export interface HMMResult {
  currentRegime: MarketRegime;
  regimeProbabilities: Record<MarketRegime, number>;
  confidence: number;
  signals: {
    trendStrength: number;
    volatilityState: 'low' | 'normal' | 'high' | 'extreme';
    momentum: number;
    recentDrawdown: number;
  };
  transitionMatrix: number[][];
  empiricalMatrix: boolean;
}

const PRIOR_MATRIX = [
  [0.85, 0.10, 0.04, 0.01],
  [0.15, 0.70, 0.12, 0.03],
  [0.05, 0.20, 0.70, 0.05],
  [0.02, 0.15, 0.33, 0.50],
];

const REGIME_ORDER: MarketRegime[] = ['bull', 'neutral', 'bear', 'stress'];
const REGIME_IDX: Record<MarketRegime, number> = { bull: 0, neutral: 1, bear: 2, stress: 3 };

function computeTransitionMatrix(seq: MarketRegime[]): { matrix: number[][]; empirical: boolean } {
  const counts = Array.from({ length: 4 }, () => Array(4).fill(0));
  for (let i = 0; i < seq.length - 1; i++) {
    counts[REGIME_IDX[seq[i]]][REGIME_IDX[seq[i + 1]]]++;
  }
  const total = counts.reduce((s, r) => s + r.reduce((a, b) => a + b, 0), 0);
  if (total < 30) return { matrix: PRIOR_MATRIX, empirical: false };
  const matrix = counts.map(row => {
    const sum = row.reduce((a, b) => a + b, 0);
    return sum === 0 ? [0.25, 0.25, 0.25, 0.25] : row.map(c => c / sum);
  });
  return { matrix, empirical: true };
}

function calculateTrendStrength(returns: number[]): number {
  if (returns.length === 0) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((acc, r) => acc + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return 0;
  return Math.max(-1, Math.min(1, mean / (stdDev + 0.01)));
}

function calculateMomentum(returns: number[]): number {
  if (returns.length < 5) return 0;
  const recent = returns.slice(-5);
  const older = returns.slice(-15, -5);
  if (older.length === 0) return 0;
  const recentMean = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderMean = older.reduce((a, b) => a + b, 0) / older.length;
  return Math.max(-1, Math.min(1, (recentMean - olderMean) * 10));
}

function classifyVolatility(returns: number[]): 'low' | 'normal' | 'high' | 'extreme' {
  if (returns.length === 0) return 'normal';
  const stdDev = Math.sqrt(returns.reduce((acc, r) => acc + r * r, 0) / returns.length);
  const annualizedVol = stdDev * Math.sqrt(252);
  if (annualizedVol < 12) return 'low';
  if (annualizedVol < 22) return 'normal';
  if (annualizedVol < 35) return 'high';
  return 'extreme';
}

function calculateMaxDrawdown(returns: number[]): number {
  if (returns.length === 0) return 0;
  let peak = 100, current = 100, maxDD = 0;
  for (const r of returns) {
    current = current * (1 + r / 100);
    if (current > peak) peak = current;
    const dd = (peak - current) / peak * 100;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD;
}

function classifyRegime(
  trendStrength: number,
  volatilityState: 'low' | 'normal' | 'high' | 'extreme',
  momentum: number,
  maxDrawdown: number
): { regime: MarketRegime; probabilities: Record<MarketRegime, number> } {
  const scores: Record<MarketRegime, number> = { bull: 0, neutral: 0, bear: 0, stress: 0 };

  if (trendStrength > 0.3) scores.bull += trendStrength * 2;
  else if (trendStrength < -0.3) scores.bear += Math.abs(trendStrength) * 2;
  else scores.neutral += 1;

  switch (volatilityState) {
    case 'low': scores.bull += 0.5; scores.neutral += 0.3; break;
    case 'normal': scores.neutral += 0.5; break;
    case 'high': scores.bear += 0.5; break;
    case 'extreme': scores.stress += 1.5; scores.bear += 0.5; break;
  }

  if (momentum > 0.2) scores.bull += momentum;
  else if (momentum < -0.2) scores.bear += Math.abs(momentum);

  if (maxDrawdown > 15) { scores.stress += 1; scores.bear += 0.5; }
  else if (maxDrawdown > 8) { scores.bear += 0.5; }

  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const probabilities: Record<MarketRegime, number> = {
    bull: scores.bull / total,
    neutral: scores.neutral / total,
    bear: scores.bear / total,
    stress: scores.stress / total
  };

  let maxProb = 0;
  let regime: MarketRegime = 'neutral';
  for (const [r, p] of Object.entries(probabilities)) {
    if (p > maxProb) { maxProb = p; regime = r as MarketRegime; }
  }

  return { regime, probabilities };
}

export function detectRegime(params: HMMParams): HMMResult {
  const { returns, lookback = 30 } = params;

  // Build rolling regime sequence for empirical transition matrix
  const winSize = Math.min(lookback, 20);
  const seq: MarketRegime[] = [];
  for (let i = winSize; i <= returns.length; i++) {
    const w = returns.slice(i - winSize, i);
    const { regime } = classifyRegime(
      calculateTrendStrength(w),
      classifyVolatility(w),
      calculateMomentum(w),
      calculateMaxDrawdown(w)
    );
    seq.push(regime);
  }

  const { matrix: transitionMatrix, empirical: empiricalMatrix } = computeTransitionMatrix(seq);

  // Classify current state
  const recent = returns.slice(-lookback);
  const trendStrength = calculateTrendStrength(recent);
  const volatilityState = classifyVolatility(recent);
  const momentum = calculateMomentum(recent);
  const recentDrawdown = calculateMaxDrawdown(recent);
  const { probabilities } = classifyRegime(trendStrength, volatilityState, momentum, recentDrawdown);

  // Blend with transition probability from last known regime
  if (seq.length > 0) {
    const last = REGIME_IDX[seq[seq.length - 1]];
    REGIME_ORDER.forEach((r, i) => { probabilities[r] += transitionMatrix[last][i] * 0.3; });
    const tot = Object.values(probabilities).reduce((a, b) => a + b, 0);
    REGIME_ORDER.forEach(r => { probabilities[r] /= tot; });
  }

  const sorted = [...REGIME_ORDER].sort((a, b) => probabilities[b] - probabilities[a]);
  const confidence = Math.min(1, (probabilities[sorted[0]] - probabilities[sorted[1]]) * 2);

  return {
    currentRegime: sorted[0],
    regimeProbabilities: probabilities,
    confidence,
    signals: { trendStrength, volatilityState, momentum, recentDrawdown },
    transitionMatrix,
    empiricalMatrix
  };
}

export function getRegimeDescription(regime: MarketRegime): string {
  switch (regime) {
    case 'bull': return 'Bullish conditions with positive momentum and lower volatility';
    case 'neutral': return 'Range-bound market with normal volatility levels';
    case 'bear': return 'Bearish conditions with negative momentum and elevated volatility';
    case 'stress': return 'Crisis conditions with extreme volatility and significant drawdowns';
    default: return 'Unknown market conditions';
  }
}