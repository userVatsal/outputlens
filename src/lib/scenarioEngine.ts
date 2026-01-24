/**
 * Dynamic Scenario Engine
 * 
 * Uses Monte Carlo simulation to generate probabilistic scenarios
 * based on live volatility data instead of hardcoded ranges.
 */

import { TradeDirection, TimeHorizon, Market, ScenarioCategory, RiskLevel } from '@/types/trade';

export interface SimulationParams {
  currentPrice: number;
  volatility: number;       // Annualized volatility (%)
  holdingPeriodDays: number;
  drift?: number;           // Expected annual return (default 0)
  simulations?: number;     // Number of paths (default 10000)
}

export interface SimulationResult {
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
}

export interface DynamicScenario {
  id: string;
  name: string;
  description: string;
  category: ScenarioCategory;
  priceRangeMin: number;
  priceRangeMax: number;
  returnRangeMin: number;
  returnRangeMax: number;
  probability: number;
  probabilityLabel: string;
  riskLevel: RiskLevel;
  triggerFactors?: string[];
}

export interface DynamicScenarioSet {
  base: DynamicScenario[];
  upside: DynamicScenario[];
  downside: DynamicScenario[];
  tail: DynamicScenario[];
}

/**
 * Parse time horizon string to number of days
 */
export function parseHorizonToDays(horizon: TimeHorizon): number {
  switch (horizon) {
    case '1-3 days': return 2;
    case '3-7 days': return 5;
    case '7-30 days': return 15;
    default: return 7;
  }
}

/**
 * Generate normally distributed random number using Box-Muller transform
 */
function randomNormal(): number {
  const u1 = Math.random();
  const u2 = Math.random();
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
  return (m4 / Math.pow(stdDev, 4)) - 3; // Excess kurtosis
}

/**
 * Run Monte Carlo simulation with Geometric Brownian Motion
 */
export function runMonteCarloSimulation(params: SimulationParams): SimulationResult {
  const {
    currentPrice,
    volatility,
    holdingPeriodDays,
    drift = 0,
    simulations = 10000
  } = params;

  // Convert annual parameters to daily
  const dailyDrift = drift / 252;
  const dailyVol = volatility / 100 / Math.sqrt(252);
  
  const finalPrices: number[] = [];
  const returns: number[] = [];

  // Run simulation paths
  for (let i = 0; i < simulations; i++) {
    let price = currentPrice;
    
    // Simulate each day
    for (let day = 0; day < holdingPeriodDays; day++) {
      const shock = randomNormal();
      // GBM: S(t+1) = S(t) * exp((μ - σ²/2)dt + σ√dt * Z)
      const dt = 1; // 1 day
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
    paths: simulations,
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
    }
  };
}

/**
 * Map probability to human-readable label
 */
function probabilityToLabel(probability: number): string {
  if (probability >= 0.5) return 'Most Likely';
  if (probability >= 0.3) return 'Likely';
  if (probability >= 0.15) return 'Possible';
  if (probability >= 0.05) return 'Unlikely';
  return 'Rare';
}

/**
 * Calculate risk level based on potential loss
 */
function calculateRiskLevel(returnMin: number, returnMax: number): RiskLevel {
  const worstReturn = Math.min(returnMin, returnMax);
  if (worstReturn < -10) return 'High';
  if (worstReturn < -5) return 'Medium';
  return 'Low';
}

/**
 * Adjust probabilities based on user confidence level
 * Higher confidence narrows base case, lower widens tails
 */
function adjustForConfidence(
  probability: number, 
  category: ScenarioCategory, 
  confidence: number
): number {
  // confidence is 1-10, normalize to -1 to +1
  const adjustment = (confidence - 5) / 5;
  
  if (category === 'base') {
    // High confidence increases base case probability
    return Math.min(0.8, probability * (1 + adjustment * 0.3));
  } else if (category === 'tail') {
    // High confidence decreases tail probability
    return Math.max(0.01, probability * (1 - adjustment * 0.5));
  } else {
    // Upside/downside adjust moderately
    return probability * (1 - adjustment * 0.2);
  }
}

/**
 * Generate dynamic scenarios from simulation results
 */
export function generateDynamicScenarios(
  simulation: SimulationResult,
  entryPrice: number,
  direction: TradeDirection,
  market: Market,
  confidence: number = 5
): DynamicScenarioSet {
  const { percentiles } = simulation;
  const isLong = direction === 'long';
  
  // For shorts, returns are inverted
  const adjustReturn = (r: number) => isLong ? r : -r;
  const adjustPrice = (r: number) => entryPrice * (1 + r / 100);

  const scenarios: DynamicScenarioSet = {
    base: [],
    upside: [],
    downside: [],
    tail: []
  };

  // Base Case: 25th to 75th percentile (50% of outcomes)
  const baseProb = adjustForConfidence(0.50, 'base', confidence);
  scenarios.base.push({
    id: 'base-range',
    name: 'Range-Bound Trading',
    description: `Price oscillates within expected volatility band based on ${simulation.paths.toLocaleString()} simulated paths`,
    category: 'base',
    priceRangeMin: adjustPrice(percentiles.p25),
    priceRangeMax: adjustPrice(percentiles.p75),
    returnRangeMin: adjustReturn(percentiles.p25),
    returnRangeMax: adjustReturn(percentiles.p75),
    probability: baseProb,
    probabilityLabel: probabilityToLabel(baseProb),
    riskLevel: calculateRiskLevel(adjustReturn(percentiles.p25), adjustReturn(percentiles.p75)),
    triggerFactors: ['Normal market conditions', 'No major catalysts', 'Typical volatility']
  });

  // Upside Scenarios
  // Moderate upside: 75th to 90th percentile (15% probability)
  const moderateUpsideProb = adjustForConfidence(0.15, 'upside', confidence);
  scenarios.upside.push({
    id: 'upside-moderate',
    name: isLong ? 'Bullish Breakout' : 'Short Squeeze Risk',
    description: isLong 
      ? 'Price breaks above resistance with positive momentum'
      : 'Adverse price movement against short position',
    category: 'upside',
    priceRangeMin: adjustPrice(percentiles.p75),
    priceRangeMax: adjustPrice(percentiles.p90),
    returnRangeMin: adjustReturn(percentiles.p75),
    returnRangeMax: adjustReturn(percentiles.p90),
    probability: moderateUpsideProb,
    probabilityLabel: probabilityToLabel(moderateUpsideProb),
    riskLevel: isLong ? 'Low' : 'Medium',
    triggerFactors: isLong 
      ? ['Positive earnings', 'Sector rotation', 'Technical breakout']
      : ['Short covering', 'Unexpected good news', 'Low float dynamics']
  });

  // Strong upside: 90th to 99th percentile (9% probability)
  const strongUpsideProb = adjustForConfidence(0.09, 'upside', confidence);
  scenarios.upside.push({
    id: 'upside-strong',
    name: isLong ? 'Strong Rally' : 'Major Squeeze',
    description: isLong
      ? 'Sustained upward momentum with multiple positive catalysts'
      : 'Significant adverse price movement requiring position management',
    category: 'upside',
    priceRangeMin: adjustPrice(percentiles.p90),
    priceRangeMax: adjustPrice(percentiles.p99),
    returnRangeMin: adjustReturn(percentiles.p90),
    returnRangeMax: adjustReturn(percentiles.p99),
    probability: strongUpsideProb,
    probabilityLabel: probabilityToLabel(strongUpsideProb),
    riskLevel: isLong ? 'Low' : 'High',
    triggerFactors: isLong
      ? ['Major positive catalyst', 'Institutional buying', 'Index inclusion']
      : ['Gamma squeeze', 'Forced covering', 'Fundamental shift']
  });

  // Downside Scenarios
  // Moderate downside: 10th to 25th percentile (15% probability)
  const moderateDownsideProb = adjustForConfidence(0.15, 'downside', confidence);
  scenarios.downside.push({
    id: 'downside-moderate',
    name: isLong ? 'Pullback' : 'Profitable Decline',
    description: isLong
      ? 'Price retraces on profit-taking or mild negative sentiment'
      : 'Price declines as thesis plays out',
    category: 'downside',
    priceRangeMin: adjustPrice(percentiles.p10),
    priceRangeMax: adjustPrice(percentiles.p25),
    returnRangeMin: adjustReturn(percentiles.p10),
    returnRangeMax: adjustReturn(percentiles.p25),
    probability: moderateDownsideProb,
    probabilityLabel: probabilityToLabel(moderateDownsideProb),
    riskLevel: isLong ? 'Medium' : 'Low',
    triggerFactors: isLong
      ? ['Profit taking', 'Sector weakness', 'Minor disappointment']
      : ['Thesis confirmation', 'Negative sentiment', 'Technical breakdown']
  });

  // Significant downside: 1st to 10th percentile (9% probability)
  const significantDownsideProb = adjustForConfidence(0.09, 'downside', confidence);
  scenarios.downside.push({
    id: 'downside-significant',
    name: isLong ? 'Correction' : 'Strong Profitable Move',
    description: isLong
      ? 'Sharp decline on negative catalyst or market stress'
      : 'Significant price drop generating substantial gains',
    category: 'downside',
    priceRangeMin: adjustPrice(percentiles.p1),
    priceRangeMax: adjustPrice(percentiles.p10),
    returnRangeMin: adjustReturn(percentiles.p1),
    returnRangeMax: adjustReturn(percentiles.p10),
    probability: significantDownsideProb,
    probabilityLabel: probabilityToLabel(significantDownsideProb),
    riskLevel: isLong ? 'High' : 'Low',
    triggerFactors: isLong
      ? ['Earnings miss', 'Guidance cut', 'Macro shock']
      : ['Negative catalyst', 'Panic selling', 'Thesis validation']
  });

  // Tail Events (beyond 99th or below 1st percentile)
  const tailProb = adjustForConfidence(0.02, 'tail', confidence);
  
  // Positive tail
  scenarios.tail.push({
    id: 'tail-positive',
    name: isLong ? 'Euphoric Rally' : 'Tail Risk (Short)',
    description: isLong
      ? 'Extreme positive move beyond typical distribution - rare but possible'
      : 'Extreme adverse move requiring immediate risk management',
    category: 'tail',
    priceRangeMin: adjustPrice(percentiles.p99),
    priceRangeMax: adjustPrice(percentiles.p99 * 1.5),
    returnRangeMin: adjustReturn(percentiles.p99),
    returnRangeMax: adjustReturn(percentiles.p99 * 1.5),
    probability: tailProb / 2,
    probabilityLabel: 'Rare',
    riskLevel: isLong ? 'Low' : 'High',
    triggerFactors: ['Black swan event', 'Regulatory change', 'M&A activity']
  });

  // Negative tail
  scenarios.tail.push({
    id: 'tail-negative',
    name: isLong ? 'Flash Crash / Crisis' : 'Windfall Profit',
    description: isLong
      ? 'Extreme negative event - market crash, company crisis, or systemic risk'
      : 'Extreme favorable move generating exceptional returns',
    category: 'tail',
    priceRangeMin: adjustPrice(percentiles.p1 * 0.5),
    priceRangeMax: adjustPrice(percentiles.p1),
    returnRangeMin: adjustReturn(percentiles.p1 * 0.5),
    returnRangeMax: adjustReturn(percentiles.p1),
    probability: tailProb / 2,
    probabilityLabel: 'Rare',
    riskLevel: isLong ? 'High' : 'Low',
    triggerFactors: ['Market crash', 'Company fraud', 'Geopolitical crisis', 'Bankruptcy risk']
  });

  return scenarios;
}

/**
 * Main entry point: Run full scenario analysis
 */
export function runScenarioAnalysis(params: {
  entryPrice: number;
  volatility: number;
  timeHorizon: TimeHorizon;
  direction: TradeDirection;
  market: Market;
  confidence?: number;
  simulations?: number;
}): {
  simulation: SimulationResult;
  scenarios: DynamicScenarioSet;
} {
  const holdingPeriodDays = parseHorizonToDays(params.timeHorizon);
  
  const simulation = runMonteCarloSimulation({
    currentPrice: params.entryPrice,
    volatility: params.volatility,
    holdingPeriodDays,
    simulations: params.simulations || 10000
  });

  const scenarios = generateDynamicScenarios(
    simulation,
    params.entryPrice,
    params.direction,
    params.market,
    params.confidence || 5
  );

  return { simulation, scenarios };
}
