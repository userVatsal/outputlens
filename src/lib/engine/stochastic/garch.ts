/**
 * GARCH-like Volatility Module
 * 
 * Layer 1: Deterministic Math - CORE IP
 * 
 * Implements GARCH(1,1) volatility dynamics for stochastic volatility modeling.
 * Returns volatility paths - NOT prices. Pure math, no AI.
 * 
 * GARCH(1,1): σ²(t+1) = ω + α·ε²(t) + β·σ²(t)
 * where ε(t) = return shock at time t
 */

export interface GARCHParams {
  currentVolatility: number;   // Current annualized volatility (%)
  alpha: number;               // ARCH term weight (reaction to shocks) - typical: 0.05-0.15
  beta: number;                // GARCH term weight (persistence) - typical: 0.80-0.95
  omega?: number;              // Unconditional variance (auto-calculated if not provided)
  holdingPeriodDays: number;
  paths?: number;
  seed?: number;
}

export interface GARCHResult {
  volatilityPaths: number[][];     // [path][day] - daily volatility values (%)
  finalVolatilities: number[];     // Final volatility at end of each path
  meanFinalVolatility: number;
  volatilityOfVolatility: number;  // Vol of vol
  maxVolSpike: number;             // Maximum vol observed across all paths
  reproducible: boolean;
}

// Seeded random number generator
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

function randomNormal(rng?: SeededRandom): number {
  const u1 = rng ? rng.next() : Math.random();
  const u2 = rng ? rng.next() : Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Run GARCH volatility simulation
 * 
 * LAYER 1: Pure deterministic math
 * Returns volatility paths, not price predictions
 */
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

  // Convert annual volatility to daily variance
  const dailyVol = currentVolatility / 100 / Math.sqrt(252);
  const dailyVariance = dailyVol * dailyVol;

  // Calculate omega (unconditional variance) if not provided
  // Long-run variance: ω / (1 - α - β)
  const omega = params.omega ?? dailyVariance * (1 - alpha - beta);

  const volatilityPaths: number[][] = [];
  const finalVolatilities: number[] = [];

  // Run simulation paths
  for (let p = 0; p < paths; p++) {
    const volPath: number[] = [];
    let sigma2 = dailyVariance; // Current variance
    
    for (let day = 0; day < holdingPeriodDays; day++) {
      // Store annualized volatility (%)
      const annualizedVol = Math.sqrt(sigma2 * 252) * 100;
      volPath.push(annualizedVol);
      
      // Generate return shock
      const z = randomNormal(rng);
      const epsilon = Math.sqrt(sigma2) * z;
      
      // GARCH(1,1) update
      sigma2 = omega + alpha * epsilon * epsilon + beta * sigma2;
      
      // Ensure non-negative variance
      sigma2 = Math.max(sigma2, 1e-10);
    }
    
    volatilityPaths.push(volPath);
    finalVolatilities.push(volPath[volPath.length - 1]);
  }

  // Calculate statistics
  const meanFinalVol = finalVolatilities.reduce((sum, v) => sum + v, 0) / finalVolatilities.length;
  const volVariance = finalVolatilities.reduce((sum, v) => sum + Math.pow(v - meanFinalVol, 2), 0) / finalVolatilities.length;
  const volOfVol = Math.sqrt(volVariance);
  
  // Find max volatility spike across all paths
  let maxVolSpike = 0;
  for (const path of volatilityPaths) {
    for (const vol of path) {
      if (vol > maxVolSpike) maxVolSpike = vol;
    }
  }

  return {
    volatilityPaths,
    finalVolatilities,
    meanFinalVolatility: meanFinalVol,
    volatilityOfVolatility: volOfVol,
    maxVolSpike,
    reproducible: seed !== undefined
  };
}

/**
 * Integrate GARCH volatility with GBM
 * Returns adjusted volatility for each day of simulation
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
    paths: 1,
    seed
  });
  
  return result.volatilityPaths[0];
}
