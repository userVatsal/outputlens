// FILE LOCATION: src/lib/engine/index.ts
// ACTION: REPLACE ENTIRE FILE

import { runGBM, GBMResult, GBMParams } from './stochastic/gbm';
import { runGARCH } from './stochastic/garch';
import { runRegimeGBM, RegimeGBMResult, MarketRegime as RegimeType } from './stochastic/regimeGbm';
import { detectRegime, HMMResult } from './regimes/hmm';
import { calculateVaRSuite, VaRResult } from './risk/var';
import { calculateCVaRSuite, CVaRResult } from './risk/cvar';
import { calculateDrawdownStats, DrawdownResult } from './risk/drawdown';
import { getAllScenarios, ScenarioDefinition } from './scenarios/base';
import { calculateComputeCost } from '../billing/costModel';
import { SeededRandom, randomNormal } from './utils/random';

export type { GBMResult, GBMParams } from './stochastic/gbm';
export type { RegimeGBMResult } from './stochastic/regimeGbm';
export type { HMMResult } from './regimes/hmm';
export type { VaRResult } from './risk/var';
export type { CVaRResult } from './risk/cvar';
export type { DrawdownResult } from './risk/drawdown';
export type { ScenarioDefinition } from './scenarios/base';

export type MarketRegime = RegimeType;
export type StochasticModel = 'gbm' | 'garch' | 'regime_gbm';

export interface EngineConfig {
  seed?: number;
  paths: number;
  stochasticModel: StochasticModel;
  regimeDetection: boolean;
  jumpDiffusion: boolean;
  garchParams?: { alpha: number; beta: number };
}

export interface EngineInput {
  currentPrice: number;
  volatility: number;
  holdingPeriodDays: number;
  drift?: number;
  historicalReturns?: number[];
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
    empiricalMatrix: boolean;
  };
  computeCost: number;
  reproducible: boolean;
  config: EngineConfig;
  timestamp: number;
}

function calculateSortinoProxy(returns: number[], meanReturn: number): number {
  const downsideReturns = returns.filter(r => r < 0);
  if (downsideReturns.length === 0) return Infinity;
  const downsideVariance = downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / downsideReturns.length;
  const downsideStdDev = Math.sqrt(downsideVariance);
  return downsideStdDev > 0 ? meanReturn / downsideStdDev : 0;
}

export function runRiskEngine(input: EngineInput, config: EngineConfig): EngineResult {
  const startTime = Date.now();

  // Step 1: Regime detection
  let regimeResult: HMMResult | undefined;
  let detectedRegime: MarketRegime = 'neutral';

  if (config.regimeDetection && input.historicalReturns && input.historicalReturns.length > 10) {
    regimeResult = detectRegime({ returns: input.historicalReturns, lookback: 30 });
    detectedRegime = regimeResult.currentRegime;
  }

  // Step 2: Stochastic simulation
  let simulation: GBMResult | RegimeGBMResult;

  switch (config.stochasticModel) {
    case 'regime_gbm':
      simulation = runRegimeGBM({
        currentPrice: input.currentPrice,
        currentRegime: detectedRegime,
        holdingPeriodDays: input.holdingPeriodDays,
        paths: config.paths,
        seed: config.seed,
      });
      break;

    case 'garch': {
      // FIXED: proper time-varying GARCH volatility per simulation path
      // Old code was: volatility * 1.1 (not GARCH at all)
      const alpha = config.garchParams?.alpha ?? 0.1;
      const beta = config.garchParams?.beta ?? 0.85;
      const garchRes = runGARCH({
        currentVolatility: input.volatility,
        alpha,
        beta,
        holdingPeriodDays: input.holdingPeriodDays,
        paths: config.paths,
        seed: config.seed,
      });
      const rng = config.seed !== undefined ? new SeededRandom(config.seed + 999999) : undefined;
      const dailyDrift = (input.drift ?? 0) / 252;
      const finalPrices: number[] = [];
      const garchReturns: number[] = [];

      for (let p = 0; p < config.paths; p++) {
        let price = input.currentPrice;
        const volPath = garchRes.volatilityPaths[p];
        for (let d = 0; d < input.holdingPeriodDays; d++) {
          const dv = (volPath[d] / 100) / Math.sqrt(252);
          price *= Math.exp((dailyDrift - 0.5 * dv * dv) + dv * randomNormal(rng));
        }
        finalPrices.push(price);
        garchReturns.push(((price - input.currentPrice) / input.currentPrice) * 100);
      }

      const sorted = [...garchReturns].sort((a, b) => a - b);
      const mean = garchReturns.reduce((s, r) => s + r, 0) / garchReturns.length;
      const variance = garchReturns.reduce((s, r) => s + (r - mean) ** 2, 0) / garchReturns.length;
      const pct = (p: number) => {
        const i = (p / 100) * (sorted.length - 1);
        const lo = Math.floor(i), hi = Math.ceil(i);
        return lo === hi ? sorted[lo] : sorted[lo] * (1 - (i - lo)) + sorted[hi] * (i - lo);
      };

      simulation = {
        paths: config.paths,
        finalPrices,
        returns: garchReturns,
        meanReturn: mean,
        medianReturn: pct(50),
        stdDev: Math.sqrt(variance),
        skewness: 0,
        kurtosis: 0,
        percentiles: {
          p1: pct(1), p5: pct(5), p10: pct(10), p25: pct(25), p50: pct(50),
          p75: pct(75), p90: pct(90), p95: pct(95), p99: pct(99)
        },
        reproducible: config.seed !== undefined,
        seed: config.seed,
      };
      break;
    }

    case 'gbm':
    default:
      simulation = runGBM({
        currentPrice: input.currentPrice,
        volatility: input.volatility,
        holdingPeriodDays: input.holdingPeriodDays,
        drift: input.drift,
        paths: config.paths,
        seed: config.seed,
      });
  }

  // Step 3: Risk metrics
  const varResult = calculateVaRSuite(simulation.returns);
  const cvarResult = calculateCVaRSuite(simulation.returns);
  const drawdownResult = calculateDrawdownStats(input.currentPrice, simulation.returns, input.holdingPeriodDays);

  const lossPaths = simulation.returns.filter(r => r < 0).length;
  const probabilityOfLoss = lossPaths / simulation.returns.length;
  const probabilityOfProfit = 1 - probabilityOfLoss;
  const sharpeProxy = simulation.stdDev > 0 ? simulation.meanReturn / simulation.stdDev : 0;
  const sortinoProxy = calculateSortinoProxy(simulation.returns, simulation.meanReturn);

  const riskMetrics: AdvancedRiskMetrics = {
    var: varResult,
    cvar: cvarResult,
    drawdown: drawdownResult,
    probabilityOfLoss,
    probabilityOfProfit,
    expectedReturn: simulation.meanReturn,
    sharpeProxy,
    sortinoProxy,
  };

  const scenarios = getAllScenarios();
  const computeCost = calculateComputeCost(config);

  return {
    simulation,
    riskMetrics,
    scenarios,
    regime: regimeResult ? {
      detected: detectedRegime,
      probabilities: regimeResult.regimeProbabilities,
      confidence: regimeResult.confidence,
      empiricalMatrix: regimeResult.empiricalMatrix,
    } : undefined,
    computeCost,
    reproducible: config.seed !== undefined,
    config,
    timestamp: startTime,
  };
}

export function getEngineConfigForTier(tier: 'free' | 'starter' | 'pro' | 'trader'): EngineConfig {
  switch (tier) {
    case 'free':    return { paths: 5000,  stochasticModel: 'gbm',        regimeDetection: false, jumpDiffusion: false };
    case 'starter': return { paths: 10000, stochasticModel: 'garch',      regimeDetection: true,  jumpDiffusion: false };
    case 'pro':     return { paths: 10000, stochasticModel: 'regime_gbm', regimeDetection: true,  jumpDiffusion: true  };
    case 'trader':  return { paths: 10000, stochasticModel: 'regime_gbm', regimeDetection: true,  jumpDiffusion: true  };
    default:        return { paths: 5000,  stochasticModel: 'gbm',        regimeDetection: false, jumpDiffusion: false };
  }
}

export function validateEngineAccess(
  requestedConfig: EngineConfig,
  tier: 'free' | 'starter' | 'pro' | 'trader'
): { valid: boolean; reason?: string } {
  const allowed = getEngineConfigForTier(tier);
  if (requestedConfig.paths > allowed.paths)
    return { valid: false, reason: `Path limit exceeded. ${tier} tier allows ${allowed.paths} paths.` };
  if (requestedConfig.regimeDetection && !allowed.regimeDetection)
    return { valid: false, reason: 'Regime detection requires Starter tier or higher.' };
  if (requestedConfig.stochasticModel === 'regime_gbm' && allowed.stochasticModel === 'gbm')
    return { valid: false, reason: 'Regime-switched GBM requires Pro tier or higher.' };
  if (requestedConfig.stochasticModel === 'garch' && tier === 'free')
    return { valid: false, reason: 'GARCH model requires Starter tier or higher.' };
  return { valid: true };
}