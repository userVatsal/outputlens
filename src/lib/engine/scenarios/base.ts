/**
 * Scenario Parameter Transformers - Base Module
 * 
 * Layer 1: Deterministic Math - CORE IP
 * 
 * Scenario engine modifies model PARAMETERS, not outputs.
 * This is a key IP differentiator - we transform inputs to the
 * stochastic engine rather than post-hoc adjusting results.
 */

export type ScenarioType = 
  | 'base'
  | 'vol_spike'
  | 'rate_shock'
  | 'liquidity_crisis'
  | 'tail_stress'
  | 'momentum_shift'
  | 'correlation_break';

export interface ScenarioParams {
  volatilityMultiplier: number;    // 1.0 = no change
  driftAdjustment: number;         // Additive adjustment to drift (%)
  tailFatteningFactor: number;     // 1.0 = normal, >1 = fatter tails
  correlationShock: number;        // 0 = no change, 1 = max correlation
  jumpIntensity: number;           // 0 = no jumps, higher = more jumps
  description: string;
}

export interface ScenarioDefinition {
  id: ScenarioType;
  name: string;
  description: string;
  params: ScenarioParams;
  probability: number;             // Subjective probability of this scenario
}

/**
 * Base scenario - no parameter modifications
 */
export const BASE_SCENARIO: ScenarioDefinition = {
  id: 'base',
  name: 'Base Case',
  description: 'Normal market conditions with current volatility and no regime change',
  params: {
    volatilityMultiplier: 1.0,
    driftAdjustment: 0,
    tailFatteningFactor: 1.0,
    correlationShock: 0,
    jumpIntensity: 0,
    description: 'No parameter adjustments'
  },
  probability: 0.50
};

/**
 * Apply scenario parameters to base model inputs
 */
export function applyScenarioParams(
  baseVolatility: number,
  baseDrift: number,
  scenario: ScenarioParams
): { volatility: number; drift: number } {
  return {
    volatility: baseVolatility * scenario.volatilityMultiplier,
    drift: baseDrift + scenario.driftAdjustment
  };
}

/**
 * Get all predefined scenarios
 */
export function getAllScenarios(): ScenarioDefinition[] {
  return [
    BASE_SCENARIO,
    {
      id: 'vol_spike',
      name: 'Volatility Spike',
      description: 'Sudden increase in market volatility due to uncertainty',
      params: {
        volatilityMultiplier: 1.5,
        driftAdjustment: -2,
        tailFatteningFactor: 1.3,
        correlationShock: 0.2,
        jumpIntensity: 0.1,
        description: '50% higher volatility, negative drift adjustment'
      },
      probability: 0.15
    },
    {
      id: 'rate_shock',
      name: 'Rate Shock',
      description: 'Central bank policy surprise affecting risk assets',
      params: {
        volatilityMultiplier: 1.3,
        driftAdjustment: -5,
        tailFatteningFactor: 1.2,
        correlationShock: 0.4,
        jumpIntensity: 0.15,
        description: 'Moderate vol increase with significant drift impact'
      },
      probability: 0.10
    },
    {
      id: 'liquidity_crisis',
      name: 'Liquidity Crisis',
      description: 'Market stress with reduced liquidity and forced selling',
      params: {
        volatilityMultiplier: 2.0,
        driftAdjustment: -10,
        tailFatteningFactor: 1.8,
        correlationShock: 0.7,
        jumpIntensity: 0.3,
        description: 'Doubled volatility, severe drift, fat tails'
      },
      probability: 0.05
    },
    {
      id: 'tail_stress',
      name: 'Tail Event Stress',
      description: 'Black swan scenario with extreme market dislocation',
      params: {
        volatilityMultiplier: 2.5,
        driftAdjustment: -20,
        tailFatteningFactor: 2.5,
        correlationShock: 0.9,
        jumpIntensity: 0.5,
        description: 'Extreme conditions - tail risk materialization'
      },
      probability: 0.02
    },
    {
      id: 'momentum_shift',
      name: 'Momentum Regime Shift',
      description: 'Trend reversal with momentum unwinding',
      params: {
        volatilityMultiplier: 1.4,
        driftAdjustment: -8,
        tailFatteningFactor: 1.4,
        correlationShock: 0.3,
        jumpIntensity: 0.2,
        description: 'Elevated vol with negative momentum'
      },
      probability: 0.12
    },
    {
      id: 'correlation_break',
      name: 'Correlation Breakdown',
      description: 'Historical correlations fail, diversification breaks down',
      params: {
        volatilityMultiplier: 1.6,
        driftAdjustment: -6,
        tailFatteningFactor: 1.5,
        correlationShock: 0.8,
        jumpIntensity: 0.25,
        description: 'High correlation shock - everything moves together'
      },
      probability: 0.06
    }
  ];
}

/**
 * Get scenario by ID
 */
export function getScenario(id: ScenarioType): ScenarioDefinition | undefined {
  return getAllScenarios().find(s => s.id === id);
}
