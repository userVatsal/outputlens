/**
 * Advanced Risk Metrics Calculator
 * 
 * Calculates VaR, Expected Shortfall, Sharpe proxy, and other
 * risk metrics from Monte Carlo simulation results.
 */

import { SimulationResult } from './scenarioEngine';
import { TradeDirection, RiskLevel } from '@/types/trade';

export interface AdvancedRiskMetrics {
  // Core metrics
  volatilityProxy: number;      // Daily volatility scaled to holding period (%)
  maxExpectedMove: number;      // 2-sigma expected price range (%)
  riskScore: number;            // 1-10 scale
  riskLabel: RiskLevel;
  
  // VaR metrics
  valueAtRisk95: number;        // 95% VaR (%)
  valueAtRisk99: number;        // 99% VaR (%)
  expectedShortfall: number;    // CVaR - average loss beyond 95% VaR (%)
  
  // Return metrics
  expectedReturn: number;       // Mean simulated return (%)
  medianReturn: number;         // Median simulated return (%)
  probabilityOfLoss: number;    // % of paths with negative return
  probabilityOfProfit: number;  // % of paths with positive return
  
  // Risk-adjusted metrics
  sharpeProxy: number;          // Return / volatility ratio
  sortinoProxy: number;         // Return / downside deviation
  
  // Distribution characteristics
  skewness: number;             // Distribution skew (-ve = left tail)
  kurtosis: number;             // Tail thickness (>0 = fat tails)
  
  // Data quality
  usedLiveData: boolean;
  simulationPaths: number;
}

/**
 * Calculate Value at Risk at given confidence level
 * VaR represents the maximum expected loss at the given percentile
 */
function calculateVaR(sortedReturns: number[], confidence: number): number {
  // For 95% VaR, we look at the 5th percentile (worst 5%)
  const index = Math.floor((1 - confidence) * sortedReturns.length);
  return sortedReturns[Math.max(0, index)];
}

/**
 * Calculate Expected Shortfall (CVaR)
 * Average of all returns worse than VaR
 */
function calculateExpectedShortfall(sortedReturns: number[], confidence: number): number {
  const varIndex = Math.floor((1 - confidence) * sortedReturns.length);
  const tailReturns = sortedReturns.slice(0, Math.max(1, varIndex));
  return tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length;
}

/**
 * Calculate downside deviation (only negative returns)
 */
function calculateDownsideDeviation(returns: number[], threshold: number = 0): number {
  const downsideReturns = returns.filter(r => r < threshold);
  if (downsideReturns.length === 0) return 0;
  
  const sumSquares = downsideReturns.reduce(
    (sum, r) => sum + Math.pow(r - threshold, 2), 
    0
  );
  return Math.sqrt(sumSquares / downsideReturns.length);
}

/**
 * Calculate risk score on 1-10 scale
 */
function calculateRiskScore(
  volatility: number,
  holdingDays: number,
  direction: TradeDirection,
  kurtosis: number
): number {
  // Base score from volatility
  let score = Math.min(10, volatility / 5);
  
  // Adjust for holding period (longer = higher risk)
  score *= Math.sqrt(holdingDays / 7);
  
  // Short positions are inherently riskier
  if (direction === 'short') {
    score *= 1.2;
  }
  
  // Fat tails increase risk
  if (kurtosis > 1) {
    score *= 1 + (kurtosis * 0.1);
  }
  
  return Math.max(1, Math.min(10, Math.round(score)));
}

/**
 * Map risk score to label
 */
function scoreToLabel(score: number): RiskLevel {
  if (score <= 3) return 'Low';
  if (score <= 6) return 'Medium';
  return 'High';
}

/**
 * Calculate all advanced risk metrics from simulation
 */
export function calculateAdvancedRiskMetrics(
  simulation: SimulationResult,
  volatility: number,
  holdingDays: number,
  direction: TradeDirection,
  usedLiveData: boolean
): AdvancedRiskMetrics {
  const { returns, meanReturn, medianReturn, stdDev, skewness, kurtosis } = simulation;
  
  // Sort returns for percentile calculations
  const sortedReturns = [...returns].sort((a, b) => a - b);
  
  // For short positions, we invert the perspective
  const adjustedReturns = direction === 'long' ? sortedReturns : sortedReturns.map(r => -r);
  const adjustedMean = direction === 'long' ? meanReturn : -meanReturn;
  const adjustedMedian = direction === 'long' ? medianReturn : -medianReturn;
  
  // Calculate VaR (as positive number representing potential loss)
  const var95 = -calculateVaR(adjustedReturns, 0.95);
  const var99 = -calculateVaR(adjustedReturns, 0.99);
  const expectedShortfall = -calculateExpectedShortfall(adjustedReturns, 0.95);
  
  // Probability calculations
  const lossPaths = adjustedReturns.filter(r => r < 0).length;
  const probabilityOfLoss = lossPaths / returns.length;
  const probabilityOfProfit = 1 - probabilityOfLoss;
  
  // Downside deviation for Sortino
  const downsideStdDev = calculateDownsideDeviation(adjustedReturns);
  
  // Risk-adjusted metrics
  const sharpeProxy = stdDev > 0 ? adjustedMean / stdDev : 0;
  const sortinoProxy = downsideStdDev > 0 ? adjustedMean / downsideStdDev : 0;
  
  // Risk score
  const riskScore = calculateRiskScore(volatility, holdingDays, direction, kurtosis);
  
  // Max expected move (2-sigma)
  const maxExpectedMove = 2 * stdDev;
  
  return {
    volatilityProxy: stdDev,
    maxExpectedMove,
    riskScore,
    riskLabel: scoreToLabel(riskScore),
    
    valueAtRisk95: var95,
    valueAtRisk99: var99,
    expectedShortfall,
    
    expectedReturn: adjustedMean,
    medianReturn: adjustedMedian,
    probabilityOfLoss,
    probabilityOfProfit,
    
    sharpeProxy,
    sortinoProxy,
    
    skewness,
    kurtosis,
    
    usedLiveData,
    simulationPaths: simulation.paths
  };
}

/**
 * Format risk metrics for display
 */
export function formatRiskMetric(value: number, type: 'percent' | 'ratio' | 'score'): string {
  switch (type) {
    case 'percent':
      const sign = value >= 0 ? '+' : '';
      return `${sign}${value.toFixed(2)}%`;
    case 'ratio':
      return value.toFixed(2);
    case 'score':
      return `${Math.round(value)}/10`;
    default:
      return value.toString();
  }
}

/**
 * Generate risk summary text
 */
export function generateRiskSummary(metrics: AdvancedRiskMetrics): string {
  const parts: string[] = [];
  
  // Win/loss probability
  const winPct = (metrics.probabilityOfProfit * 100).toFixed(0);
  parts.push(`${winPct}% chance of profit`);
  
  // VaR
  parts.push(`95% VaR: ${metrics.valueAtRisk95.toFixed(1)}% loss`);
  
  // Expected return
  const expSign = metrics.expectedReturn >= 0 ? '+' : '';
  parts.push(`Expected: ${expSign}${metrics.expectedReturn.toFixed(1)}%`);
  
  // Fat tails warning
  if (metrics.kurtosis > 2) {
    parts.push('⚠️ Fat tails detected');
  }
  
  return parts.join(' • ');
}
