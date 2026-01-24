import { TradeInput, QuantMetrics, RiskLevel, MARKETS } from '@/types/trade';

/**
 * Computes quantitative metrics from user trade input.
 * These metrics provide a foundation for scenario analysis.
 */
export function computeQuantMetrics(input: TradeInput): QuantMetrics {
  const marketInfo = MARKETS[input.market];
  
  // Parse holding period from time horizon
  const holdingPeriodDays = parseHoldingPeriod(input.timeHorizon);
  
  // Calculate daily volatility from annualized (assuming 252 trading days)
  const annualizedVol = marketInfo.baseVolatility;
  const dailyVolatility = annualizedVol / Math.sqrt(252);
  
  // Volatility proxy adjusted for holding period (sqrt of time rule)
  const volatilityProxy = dailyVolatility * Math.sqrt(holdingPeriodDays);
  
  // Max expected move (2 standard deviations covers ~95% of normal moves)
  const maxExpectedMove = volatilityProxy * 2;
  
  // Risk score calculation (1-10 scale)
  // Factors: volatility, holding period, direction bias
  const riskScore = calculateRiskScore(volatilityProxy, holdingPeriodDays, input.direction);
  const riskLabel = riskScoreToLabel(riskScore);
  
  return {
    nominalExposure: input.entryPrice,
    volatilityProxy: Math.round(volatilityProxy * 100) / 100,
    maxExpectedMove: Math.round(maxExpectedMove * 100) / 100,
    riskScore,
    riskLabel,
    holdingPeriodDays,
  };
}

function parseHoldingPeriod(timeHorizon: string): number {
  switch (timeHorizon) {
    case '1-3 days':
      return 2; // midpoint
    case '3-7 days':
      return 5;
    case '7-30 days':
      return 15;
    default:
      return 5;
  }
}

function calculateRiskScore(volatility: number, holdingDays: number, direction: string): number {
  // Base risk from volatility (higher vol = higher risk)
  let score = Math.min(volatility * 1.5, 5);
  
  // Holding period adjustment (longer = more exposure to events)
  if (holdingDays > 10) score += 2;
  else if (holdingDays > 5) score += 1;
  
  // Short positions slightly higher risk (unlimited loss potential conceptually)
  if (direction === 'short') score += 1;
  
  // Clamp to 1-10
  return Math.max(1, Math.min(10, Math.round(score)));
}

function riskScoreToLabel(score: number): RiskLevel {
  if (score <= 3) return 'Low';
  if (score <= 6) return 'Medium';
  return 'High';
}

/**
 * Format volatility for display
 */
export function formatVolatility(vol: number): string {
  return `±${vol.toFixed(1)}%`;
}

/**
 * Format exposure for display with currency
 */
export function formatExposure(exposure: number, currencySymbol: string): string {
  return `${currencySymbol}${exposure.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
