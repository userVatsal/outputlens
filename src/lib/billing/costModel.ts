/**
 * Compute-Based Cost Model
 * 
 * Layer 3: Monetization Infrastructure
 * 
 * Defines internal cost units per operation. Revenue comes from COMPUTE,
 * not UI features. This is infrastructure pricing.
 * 
 * Each operation has a cost in "compute units". Plans map to monthly
 * cost budgets, not feature counts.
 */

import { EngineConfig, StochasticModel } from '../engine';

/**
 * Cost units per operation type
 * 
 * These are internal units - not exposed to users.
 * 1 compute unit ≈ $0.0001 in actual cloud cost
 */
export const COST_UNITS = {
  // Layer 1: Stochastic operations
  gbm_path: 0.001,              // Per Monte Carlo path
  garch_volatility: 0.5,        // Per GARCH run
  regime_switching: 0.3,        // Per regime-switched GBM run
  jump_diffusion: 0.5,          // Per jump diffusion component
  
  // Layer 1: Risk calculations
  var_calculation: 0.1,         // Per VaR metric
  cvar_calculation: 0.1,        // Per CVaR metric
  drawdown_calculation: 0.15,   // Per drawdown analysis
  
  // Layer 2: ML operations
  hmm_regime: 1.0,              // Per HMM regime detection
  neural_query: 2.0,            // Per neural DB similarity search
  
  // Layer 3: AI operations
  ai_explanation: 1.0,          // Per LLM explanation call
  
  // Portfolio operations
  portfolio_correlation: 0.5,   // Per correlation matrix
  portfolio_optimization: 1.5,  // Per optimization run
  
  // API overhead
  api_call_overhead: 0.05,      // Fixed overhead per API call
} as const;

export type CostOperation = keyof typeof COST_UNITS;

/**
 * Calculate compute cost for an engine configuration
 */
export function calculateComputeCost(config: EngineConfig): number {
  let cost = 0;
  
  // Base path cost
  cost += config.paths * COST_UNITS.gbm_path;
  
  // Stochastic model costs
  switch (config.stochasticModel) {
    case 'garch':
      cost += COST_UNITS.garch_volatility;
      break;
    case 'regime_gbm':
      cost += COST_UNITS.regime_switching;
      break;
  }
  
  // Regime detection cost
  if (config.regimeDetection) {
    cost += COST_UNITS.hmm_regime;
  }
  
  // Jump diffusion cost
  if (config.jumpDiffusion) {
    cost += COST_UNITS.jump_diffusion;
  }
  
  // Risk metrics (always included)
  cost += COST_UNITS.var_calculation * 3;  // 90%, 95%, 99%
  cost += COST_UNITS.cvar_calculation;
  cost += COST_UNITS.drawdown_calculation;
  
  // API overhead
  cost += COST_UNITS.api_call_overhead;
  
  return cost;
}

/**
 * Calculate cost for a full analysis with AI
 */
export function calculateFullAnalysisCost(
  config: EngineConfig,
  includeNeuralQuery: boolean = true,
  includeAIExplanation: boolean = true
): number {
  let cost = calculateComputeCost(config);
  
  if (includeNeuralQuery) {
    cost += COST_UNITS.neural_query;
  }
  
  if (includeAIExplanation) {
    cost += COST_UNITS.ai_explanation;
  }
  
  return cost;
}

/**
 * Calculate cost for portfolio analysis
 */
export function calculatePortfolioCost(
  assetCount: number,
  config: EngineConfig,
  includeOptimization: boolean = false
): number {
  // Per-asset analysis cost
  let cost = calculateComputeCost(config) * assetCount;
  
  // Correlation matrix cost (scales with asset count squared)
  cost += COST_UNITS.portfolio_correlation * Math.pow(assetCount, 1.5);
  
  // Optimization cost
  if (includeOptimization) {
    cost += COST_UNITS.portfolio_optimization;
  }
  
  return cost;
}

/**
 * Get cost breakdown for display/debugging
 */
export function getCostBreakdown(config: EngineConfig): Record<string, number> {
  const breakdown: Record<string, number> = {};
  
  breakdown['Monte Carlo Paths'] = config.paths * COST_UNITS.gbm_path;
  
  if (config.stochasticModel === 'garch') {
    breakdown['GARCH Volatility'] = COST_UNITS.garch_volatility;
  }
  if (config.stochasticModel === 'regime_gbm') {
    breakdown['Regime Switching'] = COST_UNITS.regime_switching;
  }
  if (config.regimeDetection) {
    breakdown['HMM Detection'] = COST_UNITS.hmm_regime;
  }
  if (config.jumpDiffusion) {
    breakdown['Jump Diffusion'] = COST_UNITS.jump_diffusion;
  }
  
  breakdown['Risk Metrics'] = 
    COST_UNITS.var_calculation * 3 + 
    COST_UNITS.cvar_calculation + 
    COST_UNITS.drawdown_calculation;
  
  breakdown['API Overhead'] = COST_UNITS.api_call_overhead;
  
  return breakdown;
}
