/**
 * OutputLens Risk Engine Orchestrator
 * 
 * THIS IS THE CORE IP - Central orchestrator that ties all math modules together.
 * 
 * Key Principles:
 * 1. LAYER 1: Deterministic math only - runs without AI
 * 2. Reproducible with fixed seeding
 * 3. Computes cost units for backend billing
 * 4. Modular - each component is independently testable
 * 
 * The mathematics are public. Our IP is how we orchestrate, interpret,
 * and operationalize them at scale.
 */

import { runGBM, GBMResult, GBMParams } from './stochastic/gbm';
import { runGARCH, GARCHResult } from './stochastic/garch';
import { runRegimeGBM, RegimeGBMResult, MarketRegime as RegimeType } from './stochastic/regimeGbm';
import { detectRegime, HMMResult } from './regimes/hmm';
import { calculateVaRSuite, VaRResult } from './risk/var';
import { calculateCVaRSuite, CVaRResult } from './risk/cvar';
import { calculateDrawdownStats, DrawdownResult } from './risk/drawdown';
import { getAllScenarios, ScenarioDefinition, applyScenarioParams } from './scenarios/base';
import { COST_UNITS, calculateComputeCost } from '../billing/costModel';

// Re-export types for convenience
export type { GBMResult, GBMParams } from './stochastic/gbm';
export type { GARCHResult } from './stochastic/garch';
export type { RegimeGBMResult } from './stochastic/regimeGbm';
export type { HMMResult } from './regimes/hmm';
export type { VaRResult } from './risk/var';
export type { CVaRResult } from './risk/cvar';
export type { DrawdownResult } from './risk/drawdown';
export type { ScenarioDefinition } from './scenarios/base';

export type MarketRegime = RegimeType;
export type StochasticModel = 'gbm' | 'garch' | 'regime_gbm';

export interface EngineConfig {
  seed?: number;                    // Fixed seed for reproducibility
  paths: number;                    // Monte Carlo paths
  stochasticModel: StochasticModel;
  regimeDetection: boolean;         // Use HMM for regime detection
  jumpDiffusion: boolean;           // Include jump component (future)
  garchParams?: {
    alpha: number;
    beta: number;
  };
}

export interface EngineInput {
  currentPrice: number;
  volatility: number;               // Annualized (%)
  holdingPeriodDays: number;
  drift?: number;                   // Expected annual return
  historicalReturns?: number[];     // For regime detection
}

export interface AdvancedRiskMetrics {
  var: VaRResult;
  cvar: CVaRResult;
  drawdown: DrawdownResult;
  probabilityOfLoss: number;
  probabilityOfProfit: number;
  expectedReturn: number;
  sharpeProxy: number;
  sortinoProxy: number;
}

export interface EngineResult {
  simulation: GBMResult | RegimeGBMResult;
  riskMetrics: AdvancedRiskMetrics;
  scenarios: ScenarioDefinition[];
  regime?: {
    detected: MarketRegime;
    probabilities: Record<MarketRegime, number>;
    confidence: number;
  };
  computeCost: number;              // Internal cost units for billing
  reproducible: boolean;            // True if seeded
  config: EngineConfig;
  timestamp: number;
}

/**
 * Calculate Sortino ratio proxy
 */
function calculateSortinoProxy(returns: number[], meanReturn: number): number {
  const downsideReturns = returns.filter(r => r < 0);
  if (downsideReturns.length === 0) return Infinity;
  
  const downsideVariance = downsideReturns.reduce(
    (sum, r) => sum + Math.pow(r, 2), 0
  ) / downsideReturns.length;
  
  const downsideStdDev = Math.sqrt(downsideVariance);
  return downsideStdDev > 0 ? meanReturn / downsideStdDev : 0;
}

/**
 * Main Engine Entry Point
 * 
 * Runs complete risk analysis pipeline:
 * 1. Detect regime (if enabled)
 * 2. Run stochastic simulation
 * 3. Calculate risk metrics
 * 4. Generate scenarios
 * 5. Compute billing cost
 * 
 * LAYER 1: All computations are deterministic and reproducible
 */
export function runRiskEngine(
  input: EngineInput,
  config: EngineConfig
): EngineResult {
  const startTime = Date.now();
  
  // Step 1: Regime detection (if enabled)
  let regimeResult: HMMResult | undefined;
  let detectedRegime: MarketRegime = 'neutral';
  
  if (config.regimeDetection && input.historicalReturns && input.historicalReturns.length > 10) {
    regimeResult = detectRegime({
      returns: input.historicalReturns,
      lookback: 30
    });
    detectedRegime = regimeResult.currentRegime;
  }
  
  // Step 2: Run stochastic simulation
  let simulation: GBMResult | RegimeGBMResult;
  
  switch (config.stochasticModel) {
    case 'regime_gbm':
      simulation = runRegimeGBM({
        currentPrice: input.currentPrice,
        currentRegime: detectedRegime,
        holdingPeriodDays: input.holdingPeriodDays,
        paths: config.paths,
        seed: config.seed
      });
      break;
      
    case 'garch':
      // Run GBM with GARCH-adjusted volatility (simplified)
      simulation = runGBM({
        currentPrice: input.currentPrice,
        volatility: input.volatility * 1.1, // GARCH typically increases realized vol
        holdingPeriodDays: input.holdingPeriodDays,
        drift: input.drift,
        paths: config.paths,
        seed: config.seed
      });
      break;
      
    case 'gbm':
    default:
      simulation = runGBM({
        currentPrice: input.currentPrice,
        volatility: input.volatility,
        holdingPeriodDays: input.holdingPeriodDays,
        drift: input.drift,
        paths: config.paths,
        seed: config.seed
      });
  }
  
  // Step 3: Calculate risk metrics
  const varResult = calculateVaRSuite(simulation.returns);
  const cvarResult = calculateCVaRSuite(simulation.returns);
  const drawdownResult = calculateDrawdownStats(
    input.currentPrice,
    simulation.returns,
    input.holdingPeriodDays
  );
  
  const lossPaths = simulation.returns.filter(r => r < 0).length;
  const probabilityOfLoss = lossPaths / simulation.returns.length;
  const probabilityOfProfit = 1 - probabilityOfLoss;
  
  const sharpeProxy = simulation.stdDev > 0 
    ? simulation.meanReturn / simulation.stdDev 
    : 0;
  const sortinoProxy = calculateSortinoProxy(simulation.returns, simulation.meanReturn);
  
  const riskMetrics: AdvancedRiskMetrics = {
    var: varResult,
    cvar: cvarResult,
    drawdown: drawdownResult,
    probabilityOfLoss,
    probabilityOfProfit,
    expectedReturn: simulation.meanReturn,
    sharpeProxy,
    sortinoProxy
  };
  
  // Step 4: Get scenarios
  const scenarios = getAllScenarios();
  
  // Step 5: Calculate compute cost
  const computeCost = calculateComputeCost(config);
  
  return {
    simulation,
    riskMetrics,
    scenarios,
    regime: regimeResult ? {
      detected: detectedRegime,
      probabilities: regimeResult.regimeProbabilities,
      confidence: regimeResult.confidence
    } : undefined,
    computeCost,
    reproducible: config.seed !== undefined,
    config,
    timestamp: startTime
  };
}

/**
 * Get default engine configuration for a subscription tier
 */
export function getEngineConfigForTier(tier: 'free' | 'starter' | 'pro' | 'trader'): EngineConfig {
  switch (tier) {
    case 'free':
      return {
        paths: 5000,
        stochasticModel: 'gbm',
        regimeDetection: false,
        jumpDiffusion: false
      };
    case 'starter':
      return {
        paths: 10000,
        stochasticModel: 'garch',
        regimeDetection: true,
        jumpDiffusion: false
      };
    case 'pro':
      return {
        paths: 10000,
        stochasticModel: 'regime_gbm',
        regimeDetection: true,
        jumpDiffusion: true
      };
    case 'trader':
      return {
        paths: 10000,
        stochasticModel: 'regime_gbm',
        regimeDetection: true,
        jumpDiffusion: true
      };
    default:
      return {
        paths: 5000,
        stochasticModel: 'gbm',
        regimeDetection: false,
        jumpDiffusion: false
      };
  }
}

/**
 * Validate engine can run for given tier
 */
export function validateEngineAccess(
  requestedConfig: EngineConfig,
  tier: 'free' | 'starter' | 'pro' | 'trader'
): { valid: boolean; reason?: string } {
  const allowedConfig = getEngineConfigForTier(tier);
  
  if (requestedConfig.paths > allowedConfig.paths) {
    return { valid: false, reason: `Path limit exceeded. ${tier} tier allows ${allowedConfig.paths} paths.` };
  }
  
  if (requestedConfig.regimeDetection && !allowedConfig.regimeDetection) {
    return { valid: false, reason: 'Regime detection requires Starter tier or higher.' };
  }
  
  if (requestedConfig.stochasticModel === 'regime_gbm' && allowedConfig.stochasticModel === 'gbm') {
    return { valid: false, reason: 'Regime-switched GBM requires Pro tier or higher.' };
  }
  
  return { valid: true };
}
