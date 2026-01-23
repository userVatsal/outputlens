export type TradeDirection = 'long' | 'short';
export type TimeHorizon = '1-3 days' | '3-7 days' | '7-30 days';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type Market = 'US' | 'UK' | 'EU';

export interface MarketInfo {
  id: Market;
  name: string;
  currency: string;
  currencySymbol: string;
  tradingHours: string;
  timezone: string;
  centralBank: string;
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
  },
  UK: {
    id: 'UK',
    name: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    tradingHours: '8:00 AM – 4:30 PM',
    timezone: 'GMT',
    centralBank: 'Bank of England (BOE)',
  },
  EU: {
    id: 'EU',
    name: 'Europe',
    currency: 'EUR',
    currencySymbol: '€',
    tradingHours: '9:00 AM – 5:30 PM',
    timezone: 'CET',
    centralBank: 'European Central Bank (ECB)',
  },
};

export interface TradeInput {
  asset: string;
  direction: TradeDirection;
  entryPrice: number;
  timeHorizon: TimeHorizon;
  market: Market;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  priceChangeMin: number; // percentage
  priceChangeMax: number; // percentage
  riskLevel: RiskLevel;
}

export interface ScenarioResult {
  scenario: Scenario;
  priceRangeMin: number;
  priceRangeMax: number;
  returnMin: number; // percentage
  returnMax: number; // percentage;
}

export interface TradeAnalysis {
  input: TradeInput;
  results: ScenarioResult[];
  bestCase: ScenarioResult;
  worstCase: ScenarioResult;
  overallRisk: RiskLevel;
}
