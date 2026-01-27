/**
 * Value at Risk (VaR) Module
 * 
 * Layer 1: Deterministic Math - CORE IP
 * 
 * Calculates Value at Risk at various confidence levels.
 * VaR represents the maximum expected loss at a given percentile.
 */

export interface VaRResult {
  var90: number;     // 90% VaR (10th percentile loss)
  var95: number;     // 95% VaR (5th percentile loss)
  var99: number;     // 99% VaR (1st percentile loss)
  confidence: number; // Which VaR is being highlighted
  interpretation: string;
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
 * Calculate Value at Risk from return distribution
 * 
 * @param returns - Array of simulated returns (%)
 * @param confidence - Confidence level (0.90, 0.95, 0.99)
 * @returns VaR as positive number representing potential loss (%)
 */
export function calculateVaR(returns: number[], confidence: number = 0.95): number {
  if (returns.length === 0) return 0;
  
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const percentileValue = (1 - confidence) * 100;
  const varValue = percentile(sortedReturns, percentileValue);
  
  // Return as positive number (loss magnitude)
  return -Math.min(0, varValue);
}

/**
 * Calculate full VaR suite
 */
export function calculateVaRSuite(returns: number[]): VaRResult {
  const var90 = calculateVaR(returns, 0.90);
  const var95 = calculateVaR(returns, 0.95);
  const var99 = calculateVaR(returns, 0.99);
  
  // Generate interpretation
  let interpretation = '';
  if (var95 < 3) {
    interpretation = 'Low tail risk. 95% of outcomes stay within normal bounds.';
  } else if (var95 < 7) {
    interpretation = 'Moderate tail risk. Position sizing should account for potential drawdowns.';
  } else if (var95 < 15) {
    interpretation = 'Elevated tail risk. Consider hedging or reducing position size.';
  } else {
    interpretation = 'High tail risk. Significant loss potential exists in adverse scenarios.';
  }
  
  return {
    var90,
    var95,
    var99,
    confidence: 0.95,
    interpretation
  };
}

/**
 * Calculate parametric VaR (assuming normal distribution)
 * Used as cross-check against Monte Carlo VaR
 */
export function calculateParametricVaR(
  mean: number,
  stdDev: number,
  confidence: number = 0.95
): number {
  // Z-scores for common confidence levels
  const zScores: Record<number, number> = {
    0.90: 1.282,
    0.95: 1.645,
    0.99: 2.326
  };
  
  const z = zScores[confidence] || 1.645;
  
  // VaR = -(mean - z * stdDev)
  return Math.max(0, -(mean - z * stdDev));
}

/**
 * Format VaR for display
 */
export function formatVaR(varValue: number, prefix: string = ''): string {
  return `${prefix}${varValue.toFixed(2)}%`;
}
