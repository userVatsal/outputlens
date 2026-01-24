import { 
  Scenario, 
  TradeInput, 
  ScenarioResult, 
  TradeAnalysis, 
  RiskLevel, 
  Market, 
  MARKETS,
  StructuredScenarios,
  ScenarioCategory
} from '@/types/trade';
import { computeQuantMetrics } from './quantAnalysis';

// ==========================================
// STRUCTURED SCENARIOS BY CATEGORY
// ==========================================

// Base Case: Most likely outcome given current conditions
const BASE_SCENARIOS: Scenario[] = [
  {
    id: 'base-neutral',
    name: 'Range-Bound Trading',
    description: 'Price consolidates within a normal range. No major catalysts or surprises. Market continues its recent pattern with modest fluctuations.',
    category: 'base',
    priceChangeMin: -1.5,
    priceChangeMax: 1.5,
    probability: 'Most Likely',
    riskLevel: 'Low',
  },
  {
    id: 'base-drift',
    name: 'Trend Continuation',
    description: 'Current market momentum persists. Existing trend continues at a measured pace without significant acceleration or reversal.',
    category: 'base',
    priceChangeMin: 0,
    priceChangeMax: 3,
    probability: 'Likely',
    riskLevel: 'Low',
  },
];

// Upside Scenarios: Favorable outcomes for long positions
const UPSIDE_SCENARIOS: Scenario[] = [
  {
    id: 'upside-bullish',
    name: 'Bullish Breakout',
    description: 'Strong buying pressure emerges. Positive catalyst or sentiment shift drives prices higher. Resistance levels are tested or broken.',
    category: 'upside',
    priceChangeMin: 3,
    priceChangeMax: 6,
    probability: 'Possible',
    riskLevel: 'Low',
  },
  {
    id: 'upside-strong',
    name: 'Strong Rally',
    description: 'Exceptional positive momentum. Multiple bullish factors align—strong earnings, positive macro data, or sector rotation into the asset.',
    category: 'upside',
    priceChangeMin: 5,
    priceChangeMax: 10,
    probability: 'Less Likely',
    riskLevel: 'Medium',
  },
];

// Downside Scenarios: Adverse outcomes for long positions
const DOWNSIDE_SCENARIOS: Scenario[] = [
  {
    id: 'downside-pullback',
    name: 'Profit-Taking Pullback',
    description: 'Normal correction as investors lock in gains. Technical retracement without fundamental deterioration. Support levels tested.',
    category: 'downside',
    priceChangeMin: -4,
    priceChangeMax: -1.5,
    probability: 'Possible',
    riskLevel: 'Medium',
  },
  {
    id: 'downside-correction',
    name: 'Market Correction',
    description: 'Broader market weakness or sector-specific concerns trigger selling. Prices decline but within historical correction ranges.',
    category: 'downside',
    priceChangeMin: -8,
    priceChangeMax: -4,
    probability: 'Less Likely',
    riskLevel: 'High',
  },
];

// Tail Risk Scenarios: Low probability, high impact events
const getTailScenarios = (market: Market): Scenario[] => {
  const marketInfo = MARKETS[market];
  
  const baseTail: Scenario = {
    id: 'tail-crash',
    name: 'Market Stress Event',
    description: 'Unexpected shock triggers rapid de-risking. Flash crash, geopolitical event, or systemic concern causes sharp, sudden price movement.',
    category: 'tail',
    priceChangeMin: -15,
    priceChangeMax: -8,
    probability: 'Unlikely',
    riskLevel: 'High',
  };

  // Market-specific tail scenarios
  const marketTails: Record<Market, Scenario> = {
    US: {
      id: 'tail-fed',
      name: 'Fed Policy Shock',
      description: `${marketInfo.centralBank} delivers unexpected policy decision. Rate surprise or emergency action triggers volatility across risk assets.`,
      category: 'tail',
      priceChangeMin: -12,
      priceChangeMax: -5,
      probability: 'Unlikely',
      riskLevel: 'High',
    },
    UK: {
      id: 'tail-boe',
      name: 'UK Political/Monetary Shock',
      description: `${marketInfo.centralBank} or political instability causes sterling crisis. FTSE constituents with international exposure see divergent moves.`,
      category: 'tail',
      priceChangeMin: -10,
      priceChangeMax: -4,
      probability: 'Unlikely',
      riskLevel: 'High',
    },
    EU: {
      id: 'tail-ecb',
      name: 'Eurozone Stress',
      description: `${marketInfo.centralBank} policy surprise or peripheral debt concerns resurface. Energy dependency creates additional vulnerability.`,
      category: 'tail',
      priceChangeMin: -11,
      priceChangeMax: -5,
      probability: 'Unlikely',
      riskLevel: 'High',
    },
  };

  return [baseTail, marketTails[market]];
};

// ==========================================
// SCENARIO COMPUTATION
// ==========================================

export function getAllScenariosForMarket(market: Market): Scenario[] {
  return [
    ...BASE_SCENARIOS,
    ...UPSIDE_SCENARIOS,
    ...DOWNSIDE_SCENARIOS,
    ...getTailScenarios(market),
  ];
}

export function calculateScenarioResults(input: TradeInput): ScenarioResult[] {
  const { entryPrice, direction, market } = input;
  const scenarios = getAllScenariosForMarket(market);
  const marketInfo = MARKETS[market];
  
  return scenarios.map((scenario) => {
    // Calculate price range
    const priceRangeMin = entryPrice * (1 + scenario.priceChangeMin / 100);
    const priceRangeMax = entryPrice * (1 + scenario.priceChangeMax / 100);
    
    // Calculate returns based on direction
    let returnMin: number;
    let returnMax: number;
    
    if (direction === 'long') {
      returnMin = scenario.priceChangeMin;
      returnMax = scenario.priceChangeMax;
    } else {
      // Short: profit when price goes down (invert the returns)
      returnMin = -scenario.priceChangeMax;
      returnMax = -scenario.priceChangeMin;
    }

    // Dollar P&L (assuming 1 unit position)
    const dollarPnLMin = entryPrice * (returnMin / 100);
    const dollarPnLMax = entryPrice * (returnMax / 100);
    
    return {
      scenario,
      priceRangeMin,
      priceRangeMax,
      returnMin,
      returnMax,
      dollarPnLMin,
      dollarPnLMax,
    };
  });
}

function groupByCategory(results: ScenarioResult[]): StructuredScenarios {
  return {
    base: results.filter(r => r.scenario.category === 'base'),
    upside: results.filter(r => r.scenario.category === 'upside'),
    downside: results.filter(r => r.scenario.category === 'downside'),
    tail: results.filter(r => r.scenario.category === 'tail'),
  };
}

export function analyzeTradeRisk(results: ScenarioResult[]): {
  bestCase: ScenarioResult;
  worstCase: ScenarioResult;
  overallRisk: RiskLevel;
} {
  const sortedByReturn = [...results].sort((a, b) => b.returnMax - a.returnMax);
  const bestCase = sortedByReturn[0];
  const worstCase = sortedByReturn[sortedByReturn.length - 1];
  
  // Calculate overall risk based on scenario distribution
  const highRiskCount = results.filter(r => r.scenario.riskLevel === 'High').length;
  const negativeReturnCount = results.filter(r => r.returnMax < 0).length;
  const tailScenarios = results.filter(r => r.scenario.category === 'tail');
  const worstTailReturn = Math.min(...tailScenarios.map(t => t.returnMin));
  
  let overallRisk: RiskLevel;
  if (highRiskCount >= 3 || worstTailReturn < -12) {
    overallRisk = 'High';
  } else if (highRiskCount >= 2 || negativeReturnCount >= 3) {
    overallRisk = 'Medium';
  } else {
    overallRisk = 'Low';
  }
  
  return { bestCase, worstCase, overallRisk };
}

// ==========================================
// MAIN ANALYSIS FUNCTION
// ==========================================

export function createTradeAnalysis(input: TradeInput): TradeAnalysis {
  // Step 1: Compute quantitative metrics
  const quantMetrics = computeQuantMetrics(input);
  
  // Step 2: Calculate all scenario results
  const allResults = calculateScenarioResults(input);
  
  // Step 3: Structure scenarios by category
  const scenarios = groupByCategory(allResults);
  
  // Step 4: Determine best/worst case and overall risk
  const { bestCase, worstCase, overallRisk } = analyzeTradeRisk(allResults);
  
  return {
    input,
    quantMetrics,
    scenarios,
    allResults,
    bestCase,
    worstCase,
    overallRisk,
  };
}
