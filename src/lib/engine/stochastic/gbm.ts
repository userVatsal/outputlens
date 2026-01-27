/**
 * Geometric Brownian Motion (GBM) Module
 * 
 * Layer 1: Deterministic Math - CORE IP
 * 
 * This module implements GBM simulation with optional fixed seeding
 * for reproducibility. It runs independently of AI services.
 * 
 * GBM equation: S(t+1) = S(t) * exp((μ - σ²/2)dt + σ√dt * Z)
 * where Z ~ N(0,1)
 */

export interface GBMParams {
  currentPrice: number;
  volatility: number;       // Annualized volatility (%)
  holdingPeriodDays: number;
  drift?: number;           // Expected annual return (default 0)
  paths?: number;           // Number of simulation paths (default 10000)
  seed?: number;            // Fixed seed for reproducibility
}

export interface GBMResult {
  paths: number;
  finalPrices: number[];
  returns: number[];        // Percentage returns
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

// Seeded random number generator (Mulberry32)
class SeededRandom {
  private state: number;
  
  constructor(seed: number) {
    this.state = seed;
  }
  
  next(): number {
    let t = this.state += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

/**
 * Generate normally distributed random number using Box-Muller transform
 */
function randomNormal(rng?: SeededRandom): number {
  const u1 = rng ? rng.next() : Math.random();
  const u2 = rng ? rng.next() : Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Calculate percentile from sorted array
 */
function percentile(sortedArray: number[], p: number): number {
  const index = (p / 100) * (sortedArray.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  if (lower === upper) return sortedArray[lower];
  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}

/**
 * Calculate skewness of a distribution
 */
function calculateSkewness(values: number[], mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  const n = values.length;
  const m3 = values.reduce((sum, val) => sum + Math.pow(val - mean, 3), 0) / n;
  return m3 / Math.pow(stdDev, 3);
}

/**
 * Calculate excess kurtosis (normal distribution = 0)
 */
function calculateKurtosis(values: number[], mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  const n = values.length;
  const m4 = values.reduce((sum, val) => sum + Math.pow(val - mean, 4), 0) / n;
  return (m4 / Math.pow(stdDev, 4)) - 3;
}

/**
 * Run GBM Monte Carlo simulation
 * 
 * LAYER 1: Pure deterministic math
 * - No AI calls
 * - Optional fixed seed for reproducibility
 * - Returns full distribution + percentiles
 */
export function runGBM(params: GBMParams): GBMResult {
  const {
    currentPrice,
    volatility,
    holdingPeriodDays,
    drift = 0,
    paths = 10000,
    seed
  } = params;

  // Initialize seeded RNG if seed provided
  const rng = seed !== undefined ? new SeededRandom(seed) : undefined;

  // Convert annual parameters to daily
  const dailyDrift = drift / 252;
  const dailyVol = volatility / 100 / Math.sqrt(252);
  
  const finalPrices: number[] = [];
  const returns: number[] = [];

  // Run simulation paths
  for (let i = 0; i < paths; i++) {
    let price = currentPrice;
    
    // Simulate each day using GBM
    for (let day = 0; day < holdingPeriodDays; day++) {
      const shock = randomNormal(rng);
      const dt = 1; // 1 day
      // GBM: S(t+1) = S(t) * exp((μ - σ²/2)dt + σ√dt * Z)
      price = price * Math.exp(
        (dailyDrift - 0.5 * dailyVol * dailyVol) * dt + 
        dailyVol * Math.sqrt(dt) * shock
      );
    }
    
    finalPrices.push(price);
    returns.push(((price - currentPrice) / currentPrice) * 100);
  }

  // Sort returns for percentile calculations
  const sortedReturns = [...returns].sort((a, b) => a - b);
  
  // Calculate statistics
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
