export type TradeDirection = 'long' | 'short';
export type TimeHorizon = '1-3 days' | '3-7 days' | '7-30 days';
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface TradeInput {
  asset: string;
  direction: TradeDirection;
  entryPrice: number;
  timeHorizon: TimeHorizon;
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
