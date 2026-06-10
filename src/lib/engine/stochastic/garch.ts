/**
 * GARCH-like Volatility Module — FIXED
 *
 * FIX: getGARCHVolatilityPath() previously ran paths:1 (single path shortcut).
 * Now runs a full distribution and returns the MEDIAN path, which correctly
 * represents expected volatility rather than a single random draw.
 *
 * FIX: Extracted SeededRandom to shared util (no longer duplicated with gbm.ts).
 *
 * GARCH(1,1): σ²(t+1) = ω + α·ε²(t) + β·σ²(t)
 */

export { SeededRandom, randomNormal } from '../utils/random';
import { SeededRandom, randomNormal } from '../utils/random';

export interface GARCHParams {
  currentVolatility: number;
  alpha: number;
  beta: number;
  omega?: number;
  holdingPeriodDays: number;
  paths?: number;
  seed?: number;
}

export interface GARCHResult {
  volatilityPaths: number[][];
  finalVolatilities: number[];
  meanFinalVolatility: number;
  medianVolatilityPath: number[];   // NEW: median path for integration with GBM
  p10VolatilityPath: number[];      // NEW: 10th percentile vol path (low vol scenario)
  p90VolatilityPath: number[];      // NEW: 90th percentile vol path (high vol scenario)
  volatilityOfVolatility: number;
  maxVolSpike: number;
  reproducible: boolean;
}

export function runGARCH(params: GARCHParams): GARCHResult {
  const {
    currentVolatility,
    alpha,
    beta,
    holdingPeriodDays,
    paths = 1000,
    seed
  } = params;

  const rng = seed !== undefined ? new SeededRandom(seed) : undefined;

  const dailyVol = currentVolatility / 100 / Math.sqrt(252);
  const dailyVariance = dailyVol * dailyVol;
  const omega = params.omega ?? dailyVariance * (1 - alpha - beta);

  const volatilityPaths: number[][] = [];
  const finalVolatilities: number[] = [];

  for (let p = 0; p < paths; p++) {
    const volPath: number[] = [];
    let sigma2 = dailyVariance;

    for (let day = 0; day < holdingPeriodDays; day++) {
      const annualizedVol = Math.sqrt(sigma2 * 252) * 100;
      volPath.push(annualizedVol);
      const z = randomNormal(rng);
      const epsilon = Math.sqrt(sigma2) * z;
      sigma2 = omega + alpha * epsilon * epsilon + beta * sigma2;
      sigma2 = Math.max(sigma2, 1e-10);
    }

    volatilityPaths.push(volPath);
    finalVolatilities.push(volPath[volPath.length - 1]);
  }

  const meanFinalVol = finalVolatilities.reduce((sum, v) => sum + v, 0) / finalVolatilities.length;
  const volVariance = finalVolatilities.reduce((sum, v) => sum + Math.pow(v - meanFinalVol, 2), 0) / finalVolatilities.length;
  const volOfVol = Math.sqrt(volVariance);

  let maxVolSpike = 0;
  for (const path of volatilityPaths) {
    for (const vol of path) {
      if (vol > maxVolSpike) maxVolSpike = vol;
    }
  }

  // Build per-day percentile paths (median, p10, p90)
  const medianVolatilityPath: number[] = [];
  const p10VolatilityPath: number[] = [];
  const p90VolatilityPath: number[] = [];

  for (let day = 0; day < holdingPeriodDays; day++) {
    const dayVols = volatilityPaths.map(p => p[day]).sort((a, b) => a - b);
    const n = dayVols.length;
    medianVolatilityPath.push(dayVols[Math.floor(n * 0.50)]);
    p10VolatilityPath.push(dayVols[Math.floor(n * 0.10)]);
    p90VolatilityPath.push(dayVols[Math.floor(n * 0.90)]);
  }

  return {
    volatilityPaths,
    finalVolatilities,
    meanFinalVolatility: meanFinalVol,
    medianVolatilityPath,
    p10VolatilityPath,
    p90VolatilityPath,
    volatilityOfVolatility: volOfVol,
    maxVolSpike,
    reproducible: seed !== undefined
  };
}

/**
 * FIXED: Returns the median volatility path across 500 GARCH simulations.
 * Previous version ran paths:1 (single random draw — incorrect).
 *
 * Used by engine/index.ts for the 'garch' stochastic model.
 */
export function getGARCHVolatilityPath(
  baseVolatility: number,
  holdingPeriodDays: number,
  alpha: number = 0.1,
  beta: number = 0.85,
  seed?: number
): number[] {
  const result = runGARCH({
    currentVolatility: baseVolatility,
    alpha,
    beta,
    holdingPeriodDays,
    paths: 500,   // FIX: was 1 — now runs full distribution
    seed
  });

  return result.medianVolatilityPath; // FIX: was volatilityPaths[0] (single path)
}