/**
 * Expected Shortfall (CVaR) Module
 * 
 * Layer 1: Deterministic Math - CORE IP
 * 
 * Calculates Expected Shortfall (Conditional VaR) - the average loss
 * in the worst X% of scenarios. More conservative than VaR.
 */

export interface CVaRResult {
  cvar90: number;     // Average loss in worst 10%
  cvar95: number;     // Average loss in worst 5%
  cvar99: number;     // Average loss in worst 1%
  var95: number;      // For comparison with CVaR
  excessOverVaR: number; // How much worse CVaR is vs VaR
  tailRatio: number;  // CVaR/VaR ratio (fat tail indicator)
}

/**
 * Calculate Expected Shortfall (CVaR)
 * 
 * @param returns - Array of simulated returns (%)
 * @param confidence - Confidence level (0.90, 0.95, 0.99)
 * @returns CVaR as positive number representing average tail loss (%)
 */
export function calculateCVaR(returns: number[], confidence: number = 0.95): number {
  if (returns.length === 0) return 0;
  
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const cutoffIndex = Math.floor((1 - confidence) * sortedReturns.length);
  
  // Average of all returns worse than VaR
  const tailReturns = sortedReturns.slice(0, Math.max(1, cutoffIndex));
  const avgTailLoss = tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length;
  
  // Return as positive number (loss magnitude)
  return -Math.min(0, avgTailLoss);
}

/**
 * Calculate full CVaR suite with analysis
 */
export function calculateCVaRSuite(returns: number[]): CVaRResult {
  const sortedReturns = [...returns].sort((a, b) => a - b);
  
  const cvar90 = calculateCVaR(returns, 0.90);
  const cvar95 = calculateCVaR(returns, 0.95);
  const cvar99 = calculateCVaR(returns, 0.99);
  
  // Calculate VaR for comparison
  const var95Index = Math.floor(0.05 * sortedReturns.length);
  const var95 = -Math.min(0, sortedReturns[var95Index] || 0);
  
  // Excess loss: how much worse is CVaR than VaR
  const excessOverVaR = cvar95 - var95;
  
  // Tail ratio: higher means fatter tails
  const tailRatio = var95 > 0 ? cvar95 / var95 : 1;
  
  return {
    cvar90,
    cvar95,
    cvar99,
    var95,
    excessOverVaR,
    tailRatio
  };
}

/**
 * Tail risk severity classification
 */
export function classifyTailRisk(tailRatio: number): {
  severity: 'low' | 'moderate' | 'elevated' | 'high';
  description: string;
} {
  if (tailRatio < 1.2) {
    return {
      severity: 'low',
      description: 'Tail losses are similar to VaR threshold - relatively thin tails'
    };
  } else if (tailRatio < 1.5) {
    return {
      severity: 'moderate',
      description: 'Some excess tail risk beyond VaR - normal market conditions'
    };
  } else if (tailRatio < 2.0) {
    return {
      severity: 'elevated',
      description: 'Significant tail risk - losses in bad scenarios exceed VaR substantially'
    };
  } else {
    return {
      severity: 'high',
      description: 'Fat tails detected - extreme scenarios could cause severe losses'
    };
  }
}

/**
 * Format CVaR for display
 */
export function formatCVaR(cvarValue: number): string {
  return `${cvarValue.toFixed(2)}%`;
}
