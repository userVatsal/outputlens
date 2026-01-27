/**
 * Volatility Spike Scenario Module
 * 
 * Layer 1: Deterministic Math - CORE IP
 * 
 * Transforms volatility parameters to simulate vol spike events.
 * Modifies parameters, not outputs.
 */

export type VolSpikeSeverity = 'mild' | 'moderate' | 'severe' | 'extreme';

export interface VolSpikeParams {
  multiplier: number;
  driftAdjustment: number;
  tailFatteningFactor: number;
  description: string;
}

const VOL_SPIKE_CONFIGS: Record<VolSpikeSeverity, VolSpikeParams> = {
  mild: {
    multiplier: 1.25,
    driftAdjustment: -1,
    tailFatteningFactor: 1.1,
    description: 'Mild vol expansion - typical intraday spike'
  },
  moderate: {
    multiplier: 1.5,
    driftAdjustment: -3,
    tailFatteningFactor: 1.3,
    description: 'Moderate vol spike - news-driven uncertainty'
  },
  severe: {
    multiplier: 2.0,
    driftAdjustment: -8,
    tailFatteningFactor: 1.6,
    description: 'Severe vol spike - market stress event'
  },
  extreme: {
    multiplier: 3.0,
    driftAdjustment: -15,
    tailFatteningFactor: 2.0,
    description: 'Extreme vol spike - crisis-level volatility'
  }
};

/**
 * Apply volatility spike transformation
 * 
 * @param baseVolatility - Current annualized volatility (%)
 * @param severity - Spike severity level
 * @returns Adjusted volatility (%)
 */
export function applyVolatilitySpike(
  baseVolatility: number,
  severity: VolSpikeSeverity
): number {
  const config = VOL_SPIKE_CONFIGS[severity];
  return baseVolatility * config.multiplier;
}

/**
 * Get full vol spike configuration
 */
export function getVolSpikeConfig(severity: VolSpikeSeverity): VolSpikeParams {
  return VOL_SPIKE_CONFIGS[severity];
}

/**
 * Apply complete vol spike scenario to model parameters
 */
export function applyVolSpikeScenario(
  baseVolatility: number,
  baseDrift: number,
  severity: VolSpikeSeverity
): { volatility: number; drift: number; tailFactor: number } {
  const config = VOL_SPIKE_CONFIGS[severity];
  
  return {
    volatility: baseVolatility * config.multiplier,
    drift: baseDrift + config.driftAdjustment,
    tailFactor: config.tailFatteningFactor
  };
}

/**
 * Estimate probability of vol spike by severity
 * Based on historical VIX spike frequency
 */
export function getVolSpikeProbability(severity: VolSpikeSeverity): number {
  switch (severity) {
    case 'mild': return 0.20;      // ~20% of trading days
    case 'moderate': return 0.08;   // ~8% of trading days
    case 'severe': return 0.03;     // ~3% of trading days
    case 'extreme': return 0.005;   // ~0.5% of trading days
    default: return 0.10;
  }
}

/**
 * Get VIX-equivalent level for severity
 */
export function getVixEquivalent(severity: VolSpikeSeverity): { min: number; max: number } {
  switch (severity) {
    case 'mild': return { min: 18, max: 22 };
    case 'moderate': return { min: 22, max: 30 };
    case 'severe': return { min: 30, max: 45 };
    case 'extreme': return { min: 45, max: 80 };
    default: return { min: 15, max: 18 };
  }
}
