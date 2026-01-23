import { Scenario, TradeInput, ScenarioResult, TradeAnalysis, RiskLevel, Market, MARKETS } from '@/types/trade';

// Base scenarios that apply to all markets
const BASE_SCENARIOS: Scenario[] = [
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
    id: 'sideways',
    name: 'Sideways / No Momentum',
    description: 'Price consolidation with no clear direction. Low volume and indecision as the market waits for a catalyst or clearer signals.',
    priceChangeMin: -1,
    priceChangeMax: 1,
    riskLevel: 'Low',
  },
];

// Market-specific macro scenarios
const MACRO_SCENARIOS: Record<Market, Scenario> = {
  US: {
    id: 'macro-shock-us',
    name: 'Fed Policy Shock',
    description: 'Federal Reserve surprises with rate decision, hawkish/dovish pivot, or QT changes. Triggers rapid repricing across risk assets and dollar strength shifts.',
    priceChangeMin: -8,
    priceChangeMax: -3,
    riskLevel: 'High',
  },
  UK: {
    id: 'macro-shock-uk',
    name: 'BOE / Brexit Shock',
    description: 'Bank of England rate surprise, UK political instability, or trade policy changes. GBP volatility impacts FTSE components and multinational exposure.',
    priceChangeMin: -7,
    priceChangeMax: -2,
    riskLevel: 'High',
  },
  EU: {
    id: 'macro-shock-eu',
    name: 'ECB / Eurozone Shock',
    description: 'ECB policy shift, peripheral debt concerns, or political uncertainty in major economies. Euro moves affect export-heavy DAX and CAC constituents.',
    priceChangeMin: -7,
    priceChangeMax: -2,
    riskLevel: 'High',
  },
};

// Additional market-specific scenarios
const MARKET_SPECIFIC_SCENARIOS: Record<Market, Scenario[]> = {
  US: [
    {
      id: 'earnings-season-us',
      name: 'Earnings Season Volatility',
      description: 'Quarterly earnings reports drive individual stock moves. Tech-heavy sectors may see outsized reactions to guidance changes.',
      priceChangeMin: -4,
      priceChangeMax: 4,
      riskLevel: 'Medium',
    },
    {
      id: 'cpi-data-us',
      name: 'CPI / Jobs Data Release',
      description: 'Inflation or employment data surprises market expectations. May shift Fed policy outlook and impact rate-sensitive sectors.',
      priceChangeMin: -5,
      priceChangeMax: 3,
      riskLevel: 'High',
    },
  ],
  UK: [
    {
      id: 'ftse-sector-rotation',
      name: 'FTSE Sector Rotation',
      description: 'Shift between defensive (utilities, healthcare) and cyclical (mining, energy) sectors. Commodity prices heavily influence UK indices.',
      priceChangeMin: -3,
      priceChangeMax: 3,
      riskLevel: 'Medium',
    },
    {
      id: 'sterling-volatility',
      name: 'Sterling Volatility Event',
      description: 'GBP moves sharply on political news or data. Exporters benefit from weak pound while importers suffer.',
      priceChangeMin: -4,
      priceChangeMax: 2,
      riskLevel: 'Medium',
    },
  ],
  EU: [
    {
      id: 'eu-political-risk',
      name: 'Political / Election Risk',
      description: 'Elections in Germany, France, or Italy create uncertainty. Coalition negotiations or policy shifts impact market confidence.',
      priceChangeMin: -4,
      priceChangeMax: 2,
      riskLevel: 'Medium',
    },
    {
      id: 'energy-shock-eu',
      name: 'Energy Price Shock',
      description: 'Natural gas or oil price surge impacts industrial production costs. Energy-intensive sectors face margin compression.',
      priceChangeMin: -6,
      priceChangeMax: -1,
      riskLevel: 'High',
    },
  ],
};

export function getScenariosForMarket(market: Market): Scenario[] {
  return [
    ...BASE_SCENARIOS,
    MACRO_SCENARIOS[market],
    ...MARKET_SPECIFIC_SCENARIOS[market],
  ];
}

export function calculateScenarioResults(input: TradeInput): ScenarioResult[] {
  const { entryPrice, direction, market } = input;
  const scenarios = getScenariosForMarket(market);
  
  return scenarios.map((scenario) => {
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
