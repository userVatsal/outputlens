/**
 * Drawdown Analysis Module
 * 
 * Layer 1: Deterministic Math - CORE IP
 * 
 * Calculates maximum drawdown and drawdown distribution from simulation paths.
 */

export interface DrawdownResult {
  maxDrawdown: number;           // Maximum drawdown across all paths (%)
  avgMaxDrawdown: number;        // Average of max drawdowns per path (%)
  medianMaxDrawdown: number;     // Median max drawdown
  drawdownPercentiles: {
    p50: number;   // Median
    p75: number;   // 75th percentile
    p90: number;   // 90th percentile
    p95: number;   // 95th percentile
    p99: number;   // 99th percentile (worst 1%)
  };
  recoveryProbability: number;   // Probability of recovering from max DD
}

/**
 * Calculate max drawdown for a single price path
 */
function calculatePathMaxDrawdown(prices: number[]): number {
  if (prices.length < 2) return 0;
  
  let peak = prices[0];
  let maxDD = 0;
  
  for (const price of prices) {
    if (price > peak) {
      peak = price;
    }
    const dd = (peak - price) / peak * 100;
    if (dd > maxDD) {
      maxDD = dd;
    }
  }
  
  return maxDD;
}

/**
 * Generate full price paths from returns for drawdown analysis
 */
function generatePricePaths(
  initialPrice: number,
  returns: number[],
  holdingDays: number,
  paths: number
): number[][] {
  // This is a simplified version - in reality we'd need the full path
  // For now, assume linear interpolation
  const pricePaths: number[][] = [];
  
  for (let p = 0; p < paths; p++) {
    const finalReturn = returns[p] / 100;
    const dailyReturn = Math.pow(1 + finalReturn, 1 / holdingDays) - 1;
    
    const path: number[] = [initialPrice];
    let price = initialPrice;
    
    for (let d = 0; d < holdingDays; d++) {
      // Add some randomness to path (simplified)
      const noise = (Math.random() - 0.5) * 0.02;
      price = price * (1 + dailyReturn + noise);
      path.push(price);
    }
    
    // Ensure final price matches return
    path[path.length - 1] = initialPrice * (1 + finalReturn);
    pricePaths.push(path);
  }
  
  return pricePaths;
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
 * Calculate drawdown statistics from simulation results
 */
export function calculateDrawdownStats(
  initialPrice: number,
  returns: number[],
  holdingDays: number
): DrawdownResult {
  const pathCount = returns.length;
  
  // Generate price paths
  const pricePaths = generatePricePaths(initialPrice, returns, holdingDays, Math.min(pathCount, 1000));
  
  // Calculate max drawdown for each path
  const maxDrawdowns = pricePaths.map(path => calculatePathMaxDrawdown(path));
  
  // Sort for percentiles
  const sortedDD = [...maxDrawdowns].sort((a, b) => a - b);
  
  // Statistics
  const avgMaxDD = maxDrawdowns.reduce((sum, dd) => sum + dd, 0) / maxDrawdowns.length;
  const overallMaxDD = Math.max(...maxDrawdowns);
  const medianMaxDD = percentile(sortedDD, 50);
  
  // Recovery probability: % of paths that ended positive despite drawdown
  const recoveredPaths = returns.filter((r, i) => 
    r > 0 && maxDrawdowns[i] > 5
  ).length;
  const recoveryProb = pathCount > 0 ? recoveredPaths / pathCount : 0;
  
  return {
    maxDrawdown: overallMaxDD,
    avgMaxDrawdown: avgMaxDD,
    medianMaxDrawdown: medianMaxDD,
    drawdownPercentiles: {
      p50: percentile(sortedDD, 50),
      p75: percentile(sortedDD, 75),
      p90: percentile(sortedDD, 90),
      p95: percentile(sortedDD, 95),
      p99: percentile(sortedDD, 99)
    },
    recoveryProbability: recoveryProb
  };
}

/**
 * Simplified drawdown estimate from VaR
 * For quick estimation without full path simulation
 */
export function estimateMaxDrawdown(var95: number, holdingDays: number): number {
  // Empirical relationship: max DD ≈ VaR * sqrt(T) * factor
  const factor = 1.5; // Conservative multiplier
  return var95 * Math.sqrt(holdingDays / 5) * factor;
}

/**
 * Format drawdown for display
 */
export function formatDrawdown(dd: number): string {
  return `-${dd.toFixed(2)}%`;
}
