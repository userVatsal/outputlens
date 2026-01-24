export type TradeDirection = 'long' | 'short';
export type TimeHorizon = '1-3 days' | '3-7 days' | '7-30 days';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type Market = 'US' | 'UK' | 'EU';
export type ScenarioCategory = 'base' | 'upside' | 'downside' | 'tail';

export interface MarketInfo {
  id: Market;
  name: string;
  currency: string;
  currencySymbol: string;
  tradingHours: string;
  timezone: string;
  centralBank: string;
  baseVolatility: number; // Annualized volatility proxy (%)
}

export const MARKETS: Record<Market, MarketInfo> = {
  US: {
    id: 'US',
    name: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    tradingHours: '9:30 AM – 4:00 PM',
    timezone: 'EST',
    centralBank: 'Federal Reserve (Fed)',
    baseVolatility: 18, // ~18% annualized for S&P 500
  },
  UK: {
    id: 'UK',
    name: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    tradingHours: '8:00 AM – 4:30 PM',
    timezone: 'GMT',
    centralBank: 'Bank of England (BOE)',
    baseVolatility: 16, // ~16% annualized for FTSE
  },
  EU: {
    id: 'EU',
    name: 'Europe',
    currency: 'EUR',
    currencySymbol: '€',
    tradingHours: '9:00 AM – 5:30 PM',
    timezone: 'CET',
    centralBank: 'European Central Bank (ECB)',
    baseVolatility: 17, // ~17% annualized for Euro Stoxx
  },
};

export interface TradeInput {
  asset: string;
  direction: TradeDirection;
  entryPrice: number;
  tradeDate: Date;
  timeHorizon: TimeHorizon;
  market: Market;
}

// Quantitative metrics computed from user input
export interface QuantMetrics {
  nominalExposure: number;        // Entry price (represents position size = 1)
  volatilityProxy: number;        // Estimated daily volatility (%)
  maxExpectedMove: number;        // Expected price range based on horizon
  riskScore: number;              // 1-10 scale
  riskLabel: RiskLevel;
  holdingPeriodDays: number;      // Parsed from time horizon
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  category: ScenarioCategory;
  priceChangeMin: number; // percentage
  priceChangeMax: number; // percentage
  probability: string;    // Qualitative probability label
  riskLevel: RiskLevel;
}

export interface ScenarioResult {
  scenario: Scenario;
  priceRangeMin: number;
  priceRangeMax: number;
  returnMin: number; // percentage
  returnMax: number; // percentage
  dollarPnLMin: number;
  dollarPnLMax: number;
}

export interface StructuredScenarios {
  base: ScenarioResult[];
  upside: ScenarioResult[];
  downside: ScenarioResult[];
  tail: ScenarioResult[];
}

export interface TradeAnalysis {
  input: TradeInput;
  quantMetrics: QuantMetrics;
  scenarios: StructuredScenarios;
  allResults: ScenarioResult[];
  bestCase: ScenarioResult;
  worstCase: ScenarioResult;
  overallRisk: RiskLevel;
}
