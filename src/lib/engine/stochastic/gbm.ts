
// FILE LOCATION: src/lib/engine/stochastic/gbm.ts
// ACTION: REPLACE ENTIRE FILE

import { SeededRandom, randomNormal } from '../utils/random';

export interface GBMParams {
  currentPrice: number;
  volatility: number;
  holdingPeriodDays: number;
  drift?: number;
  paths?: number;
  seed?: number;
}

export interface GBMResult {
  paths: number;
  finalPrices: number[];
  returns: number[];
  meanReturn: number;
  medianReturn: number;
  stdDev: number;
  skewness: number;
  kurtosis: number;
  percentiles: {
    p1: number;
    p5: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  };
  reproducible: boolean;
  seed?: number;
}

function percentile(sortedArray: number[], p: number): number {
  const index = (p / 100) * (sortedArray.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  if (lower === upper) return sortedArray[lower];
  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}

function calculateSkewness(values: number[], mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  const n = values.length;
  const m3 = values.reduce((sum, val) => sum + Math.pow(val - mean, 3), 0) / n;
  return m3 / Math.pow(stdDev, 3);
}

function calculateKurtosis(values: number[], mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  const n = values.length;
  const m4 = values.reduce((sum, val) => sum + Math.pow(val - mean, 4), 0) / n;
  return (m4 / Math.pow(stdDev, 4)) - 3;
}

export function runGBM(params: GBMParams): GBMResult {
  const {
    currentPrice,
    volatility,
    holdingPeriodDays,
    drift = 0,
    paths = 10000,
    seed
  } = params;

  const rng = seed !== undefined ? new SeededRandom(seed) : undefined;
  const dailyDrift = drift / 252;
  const dailyVol = volatility / 100 / Math.sqrt(252);

  const finalPrices: number[] = [];
  const returns: number[] = [];

  for (let i = 0; i < paths; i++) {
    let price = currentPrice;
    for (let day = 0; day < holdingPeriodDays; day++) {
      const shock = randomNormal(rng);
      price = price * Math.exp(
        (dailyDrift - 0.5 * dailyVol * dailyVol) +
        dailyVol * shock
      );
    }
    finalPrices.push(price);
    returns.push(((price - currentPrice) / currentPrice) * 100);
  }

  const sortedReturns = [...returns].sort((a, b) => a - b);
  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const medianReturn = percentile(sortedReturns, 50);
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  const skewness = calculateSkewness(returns, meanReturn, stdDev);
  const kurtosis = calculateKurtosis(returns, meanReturn, stdDev);

  return {
    paths,
    finalPrices,
    returns,
    meanReturn,
    medianReturn,
    stdDev,
    skewness,
    kurtosis,
    percentiles: {
      p1: percentile(sortedReturns, 1),
      p5: percentile(sortedReturns, 5),
      p10: percentile(sortedReturns, 10),
      p25: percentile(sortedReturns, 25),
      p50: medianReturn,
      p75: percentile(sortedReturns, 75),
      p90: percentile(sortedReturns, 90),
      p95: percentile(sortedReturns, 95),
      p99: percentile(sortedReturns, 99),
    },
    reproducible: seed !== undefined,
    seed
  };
}