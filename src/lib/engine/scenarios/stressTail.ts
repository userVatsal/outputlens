/**
 * Stress Tail Scenario Module
 * 
 * Layer 1: Deterministic Math - CORE IP
 * 
 * Transforms distribution parameters to simulate black swan / tail events.
 * Fattens tails of the return distribution.
 */

export type StressLevel = 'mild' | 'moderate' | 'severe' | 'crisis';

export interface StressTailParams {
  kurtosisMultiplier: number;      // How much to fatten tails
  negativeSkewShift: number;       // Shift distribution left
  extremeEventProbability: number; // Probability of extreme jump
  extremeEventMagnitude: number;   // Size of extreme jump (std devs)
  description: string;
}

const STRESS_CONFIGS: Record<StressLevel, StressTailParams> = {
  mild: {
    kurtosisMultiplier: 1.3,
    negativeSkewShift: -0.2,
    extremeEventProbability: 0.02,
    extremeEventMagnitude: 3,
    description: 'Slightly fatter tails than normal'
  },
  moderate: {
    kurtosisMultiplier: 1.8,
    negativeSkewShift: -0.5,
    extremeEventProbability: 0.05,
    extremeEventMagnitude: 4,
    description: 'Noticeably fat tails with left skew'
  },
  severe: {
    kurtosisMultiplier: 2.5,
    negativeSkewShift: -0.8,
    extremeEventProbability: 0.10,
    extremeEventMagnitude: 5,
    description: 'Very fat tails - tail events more likely'
  },
  crisis: {
    kurtosisMultiplier: 4.0,
    negativeSkewShift: -1.2,
    extremeEventProbability: 0.15,
    extremeEventMagnitude: 6,
    description: 'Extreme tail risk - crisis conditions'
  }
};

/**
 * Apply tail fattening transformation
 * 
 * @param baseKurtosis - Current excess kurtosis
 * @param stressLevel - Stress severity
 * @returns Adjusted kurtosis
 */
export function applyTailFattening(
  baseKurtosis: number,
  stressLevel: StressLevel
): number {
  const config = STRESS_CONFIGS[stressLevel];
  // Ensure kurtosis is at least 0 (normal)
  const adjustedBase = Math.max(0, baseKurtosis);
  return adjustedBase * config.kurtosisMultiplier;
}

/**
 * Get stress tail configuration
 */
export function getStressConfig(stressLevel: StressLevel): StressTailParams {
  return STRESS_CONFIGS[stressLevel];
}

/**
 * Apply jump diffusion parameters for tail stress
 */
export function getJumpDiffusionParams(stressLevel: StressLevel): {
  jumpIntensity: number;  // Lambda - expected jumps per year
  jumpMeanReturn: number; // Average jump size (%)
  jumpVolatility: number; // Jump size volatility (%)
} {
  switch (stressLevel) {
    case 'mild':
      return { jumpIntensity: 2, jumpMeanReturn: -3, jumpVolatility: 5 };
    case 'moderate':
      return { jumpIntensity: 4, jumpMeanReturn: -5, jumpVolatility: 8 };
    case 'severe':
      return { jumpIntensity: 8, jumpMeanReturn: -8, jumpVolatility: 12 };
    case 'crisis':
      return { jumpIntensity: 15, jumpMeanReturn: -15, jumpVolatility: 20 };
    default:
      return { jumpIntensity: 1, jumpMeanReturn: -2, jumpVolatility: 3 };
  }
}

/**
 * Calculate tail loss probability given stress level
 * Returns probability of loss beyond X standard deviations
 */
export function calculateTailLossProbability(
  stressLevel: StressLevel,
  stdDevsFromMean: number = 3
): number {
  // Under normal distribution, P(Z < -3) ≈ 0.13%
  // Fat tails increase this probability
  const normalProb = 0.0013;
  const config = STRESS_CONFIGS[stressLevel];
  
  // Approximate tail probability inflation based on kurtosis
  const inflationFactor = Math.pow(config.kurtosisMultiplier, 1.5);
  
  return Math.min(0.20, normalProb * inflationFactor);
}

/**
 * Get historical analogs for stress level
 */
export function getHistoricalAnalogs(stressLevel: StressLevel): string[] {
  switch (stressLevel) {
    case 'mild':
      return ['Routine market corrections', 'Earnings miss reactions', 'Sector rotations'];
    case 'moderate':
      return ['Flash crashes', 'Geopolitical tensions', 'Fed policy surprises'];
    case 'severe':
      return ['2018 Q4 selloff', '2022 bear market', 'Regional banking stress'];
    case 'crisis':
      return ['2008 Financial Crisis', '2020 COVID crash', 'Black Monday 1987'];
    default:
      return ['Normal market conditions'];
  }
}
