import { TradeInput, QuantMetrics, RiskLevel, MARKETS } from '@/types/trade';

/**
 * Computes quantitative metrics from user trade input.
 * These metrics provide a foundation for scenario analysis.
 * 
 * @param input - Trade input from user
 * @param liveVolatility - Optional live volatility from market data API (annualized %)
 */
export function computeQuantMetrics(input: TradeInput, liveVolatility?: number): QuantMetrics {
  const marketInfo = MARKETS[input.market];
  
  // Parse holding period from time horizon
  const holdingPeriodDays = parseHoldingPeriod(input.timeHorizon);
  
  // Use live volatility if available, otherwise fall back to market baseline
  const annualizedVol = liveVolatility ?? marketInfo.baseVolatility;
  
  // Calculate daily volatility from annualized (assuming 252 trading days)
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
    usedLiveData: liveVolatility !== undefined,
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
  // Base risk from volatility (scale: volatility of 2% = score 3, 5% = score 6)
  // Using a more balanced scaling factor
  let score = volatility * 1.2;
  
  // Holding period adjustment (longer = more exposure to events)
  if (holdingDays > 15) score += 1.5;
  else if (holdingDays > 7) score += 0.75;
  else if (holdingDays > 3) score += 0.25;
  
  // Short positions slightly higher risk (unlimited loss potential conceptually)
  if (direction === 'short') score += 0.5;
  
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
