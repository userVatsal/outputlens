import { Scenario, TradeInput, ScenarioResult, TradeAnalysis, RiskLevel } from '@/types/trade';

export const SCENARIOS: Scenario[] = [
  {
    id: 'bullish-continuation',
    name: 'Bullish Continuation',
    description: 'Strong momentum continues. Market confidence remains high with buyers in control and positive sentiment driving prices upward.',
    priceChangeMin: 2,
    priceChangeMax: 6,
    riskLevel: 'Low',
  },
  {
    id: 'mild-pullback',
    name: 'Mild Pullback',
    description: 'Profit-taking or minor consolidation. Normal market behavior where recent gains are partially retraced before potential continuation.',
    priceChangeMin: -3,
    priceChangeMax: -1,
    riskLevel: 'Medium',
  },
  {
    id: 'high-volatility',
    name: 'High Volatility / Uncertainty',
    description: 'Erratic price swings in both directions. Market participants are uncertain, leading to wide intraday ranges and unpredictable moves.',
    priceChangeMin: -5,
    priceChangeMax: 5,
    riskLevel: 'High',
  },
  {
    id: 'macro-shock',
    name: 'Macro Shock',
    description: 'External catalyst like rate decisions, CPI data, or geopolitical events. Can trigger risk-off sentiment and rapid de-leveraging.',
    priceChangeMin: -8,
    priceChangeMax: -3,
    riskLevel: 'High',
  },
  {
    id: 'sideways',
    name: 'Sideways / No Momentum',
    description: 'Price consolidation with no clear direction. Low volume and indecision as the market waits for a catalyst or clearer signals.',
    priceChangeMin: -1,
    priceChangeMax: 1,
    riskLevel: 'Low',
  },
];

export function calculateScenarioResults(input: TradeInput): ScenarioResult[] {
  const { entryPrice, direction } = input;
  
  return SCENARIOS.map((scenario) => {
    // Calculate price range
    const priceRangeMin = entryPrice * (1 + scenario.priceChangeMin / 100);
    const priceRangeMax = entryPrice * (1 + scenario.priceChangeMax / 100);
    
    // Calculate returns based on direction
    let returnMin: number;
    let returnMax: number;
    
    if (direction === 'long') {
      // Long: profit when price goes up
      returnMin = scenario.priceChangeMin;
      returnMax = scenario.priceChangeMax;
    } else {
      // Short: profit when price goes down (invert the returns)
      returnMin = -scenario.priceChangeMax;
      returnMax = -scenario.priceChangeMin;
    }
    
    return {
      scenario,
      priceRangeMin,
      priceRangeMax,
      returnMin,
      returnMax,
    };
  });
}

export function analyzeTradeRisk(results: ScenarioResult[]): {
  bestCase: ScenarioResult;
  worstCase: ScenarioResult;
  overallRisk: RiskLevel;
} {
  // Find best and worst cases based on max return
  const sortedByReturn = [...results].sort((a, b) => b.returnMax - a.returnMax);
  const bestCase = sortedByReturn[0];
  const worstCase = sortedByReturn[sortedByReturn.length - 1];
  
  // Calculate overall risk
  const highRiskCount = results.filter(r => r.scenario.riskLevel === 'High').length;
  const negativeReturnCount = results.filter(r => r.returnMax < 0).length;
  
  let overallRisk: RiskLevel;
  if (highRiskCount >= 2 || negativeReturnCount >= 3) {
    overallRisk = 'High';
  } else if (highRiskCount >= 1 || negativeReturnCount >= 2) {
    overallRisk = 'Medium';
  } else {
    overallRisk = 'Low';
  }
  
  return { bestCase, worstCase, overallRisk };
}

export function createTradeAnalysis(input: TradeInput): TradeAnalysis {
  const results = calculateScenarioResults(input);
  const { bestCase, worstCase, overallRisk } = analyzeTradeRisk(results);
  
  return {
    input,
    results,
    bestCase,
    worstCase,
    overallRisk,
  };
}
