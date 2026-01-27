/**
 * Regime-Switched GBM Module
 * 
 * Layer 1: Deterministic Math - CORE IP
 * 
 * Implements GBM with regime-dependent drift and volatility parameters.
 * Regimes: bull, neutral, bear, stress
 * 
 * Each regime has different μ (drift) and σ (volatility) parameters.
 */

import { GBMResult, runGBM } from './gbm';

export type MarketRegime = 'bull' | 'neutral' | 'bear' | 'stress';

export interface RegimeParams {
  drift: number;        // Annual drift (%)
  volatility: number;   // Annual volatility (%)
  probability: number;  // Probability of being in this regime
}

export interface RegimeGBMParams {
  currentPrice: number;
  currentRegime: MarketRegime;
  holdingPeriodDays: number;
  paths?: number;
  seed?: number;
  customRegimes?: Partial<Record<MarketRegime, RegimeParams>>;
}

export interface RegimeGBMResult extends GBMResult {
  regime: MarketRegime;
  regimeParams: RegimeParams;
  regimeAdjustedMetrics: {
    regimeDrift: number;
    regimeVol: number;
    regimeLabel: string;
  };
}

// Default regime parameters (empirically calibrated)
const DEFAULT_REGIME_PARAMS: Record<MarketRegime, RegimeParams> = {
  bull: {
    drift: 15,          // +15% annual drift in bull markets
    volatility: 14,     // Lower volatility
    probability: 0.30
  },
  neutral: {
    drift: 7,           // ~7% annual drift (market average)
    volatility: 18,     // Normal volatility
    probability: 0.45
  },
  bear: {
    drift: -10,         // Negative drift in bear markets
    volatility: 25,     // Higher volatility
    probability: 0.20
  },
  stress: {
    drift: -25,         // Severe negative drift
    volatility: 45,     // Very high volatility (crisis mode)
    probability: 0.05
  }
};

/**
 * Get regime parameters with optional custom overrides
 */
export function getRegimeParams(
  regime: MarketRegime,
  customRegimes?: Partial<Record<MarketRegime, RegimeParams>>
): RegimeParams {
  const defaults = DEFAULT_REGIME_PARAMS[regime];
  const custom = customRegimes?.[regime];
  
  if (custom) {
    return {
      drift: custom.drift ?? defaults.drift,
      volatility: custom.volatility ?? defaults.volatility,
      probability: custom.probability ?? defaults.probability
    };
  }
  
  return defaults;
}

/**
 * Human-readable regime label
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
 * Run Regime-Switched GBM simulation
 * 
 * LAYER 1: Deterministic math with regime-adjusted parameters
 * Uses detected regime to set drift and volatility
 */
export function runRegimeGBM(params: RegimeGBMParams): RegimeGBMResult {
  const {
    currentPrice,
    currentRegime,
    holdingPeriodDays,
    paths = 10000,
    seed,
    customRegimes
  } = params;

  const regimeParams = getRegimeParams(currentRegime, customRegimes);

  // Run GBM with regime-adjusted parameters
  const gbmResult = runGBM({
    currentPrice,
    volatility: regimeParams.volatility,
    holdingPeriodDays,
    drift: regimeParams.drift,
    paths,
    seed
  });

  return {
    ...gbmResult,
    regime: currentRegime,
    regimeParams,
    regimeAdjustedMetrics: {
      regimeDrift: regimeParams.drift,
      regimeVol: regimeParams.volatility,
      regimeLabel: getRegimeLabel(currentRegime)
    }
  };
}

/**
 * Run multi-regime weighted simulation
 * Runs simulation across all regimes and weights by probability
 */
export function runMultiRegimeGBM(params: {
  currentPrice: number;
  holdingPeriodDays: number;
  paths?: number;
  seed?: number;
  customRegimes?: Partial<Record<MarketRegime, RegimeParams>>;
}): {
  weightedMeanReturn: number;
  weightedVar95: number;
  regimeResults: Record<MarketRegime, RegimeGBMResult>;
} {
  const regimes: MarketRegime[] = ['bull', 'neutral', 'bear', 'stress'];
  const regimeResults: Record<MarketRegime, RegimeGBMResult> = {} as Record<MarketRegime, RegimeGBMResult>;
  
  let weightedMeanReturn = 0;
  let weightedVar95 = 0;
  
  for (const regime of regimes) {
    const result = runRegimeGBM({
      ...params,
      currentRegime: regime,
      seed: params.seed ? params.seed + regimes.indexOf(regime) : undefined
    });
    
    regimeResults[regime] = result;
    
    const regimeProb = result.regimeParams.probability;
    weightedMeanReturn += result.meanReturn * regimeProb;
    weightedVar95 += result.percentiles.p5 * regimeProb; // 5th percentile = 95% VaR
  }
  
  return {
    weightedMeanReturn,
    weightedVar95,
    regimeResults
  };
}
