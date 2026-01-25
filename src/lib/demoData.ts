/**
 * Pre-computed demo analysis data for showcasing the platform
 * without requiring user signup
 */

import { EnhancedTradeAnalysis } from '@/types/analysis';
import { RiskLevel, TimeHorizon } from '@/types/trade';

export const DEMO_ANALYSIS: EnhancedTradeAnalysis = {
  input: {
    asset: 'AAPL',
    market: 'US',
    direction: 'long',
    entryPrice: 185.50,
    tradeDate: new Date(),
    timeHorizon: '3-7 days' as TimeHorizon,
    confidence: 6,
    assumptions: 'Strong Q4 expected with iPhone sales momentum',
  },
  marketData: {
    price: 185.50,
    change: 2.35,
    changePercent: 1.28,
    high: 186.20,
    low: 183.10,
    open: 183.50,
    previousClose: 183.15,
    volume: 52340000,
    volatility: 24.5,
    atr14: 3.42,
    source: 'Finnhub',
    timestamp: Date.now(),
    dataQuality: 'live',
  },
  riskMetrics: {
    volatilityProxy: 3.9,
    maxExpectedMove: 7.8,
    riskScore: 4,
    riskLabel: 'Medium' as RiskLevel,
    valueAtRisk95: 4.2,
    valueAtRisk99: 6.8,
    expectedShortfall: 5.6,
    expectedReturn: 1.8,
    medianReturn: 1.5,
    probabilityOfLoss: 0.38,
    probabilityOfProfit: 0.62,
    sharpeProxy: 0.68,
    sortinoProxy: 0.92,
    skewness: -0.12,
    kurtosis: 3.8,
    usedLiveData: true,
    simulationPaths: 10000,
  },
  scenarios: {
    base: [
      {
        id: 'base-normal',
        name: 'Base Case',
        description: 'Most likely outcome based on current market conditions',
        category: 'base',
        priceRangeMin: 181.79,
        priceRangeMax: 189.21,
        returnRangeMin: -2.0,
        returnRangeMax: 2.0,
        probability: 50,
        probabilityLabel: 'Most Likely',
        riskLevel: 'Low' as RiskLevel,
        triggerFactors: ['Normal market conditions', 'No major catalysts'],
      },
    ],
    upside: [
      {
        id: 'upside-moderate',
        name: 'Moderate Upside',
        description: 'Bullish momentum with positive catalysts',
        category: 'upside',
        priceRangeMin: 189.21,
        priceRangeMax: 196.63,
        returnRangeMin: 2.0,
        returnRangeMax: 6.0,
        probability: 18,
        probabilityLabel: 'Possible',
        riskLevel: 'Low' as RiskLevel,
        triggerFactors: ['Positive earnings surprise', 'Sector rotation into tech'],
      },
      {
        id: 'upside-strong',
        name: 'Strong Rally',
        description: 'Significant bullish breakout',
        category: 'upside',
        priceRangeMin: 196.63,
        priceRangeMax: 204.05,
        returnRangeMin: 6.0,
        returnRangeMax: 10.0,
        probability: 6,
        probabilityLabel: 'Unlikely',
        riskLevel: 'Medium' as RiskLevel,
        triggerFactors: ['Major product announcement', 'Analyst upgrades'],
      },
    ],
    downside: [
      {
        id: 'downside-moderate',
        name: 'Moderate Pullback',
        description: 'Short-term weakness with support nearby',
        category: 'downside',
        priceRangeMin: 174.37,
        priceRangeMax: 181.79,
        returnRangeMin: -6.0,
        returnRangeMax: -2.0,
        probability: 18,
        probabilityLabel: 'Possible',
        riskLevel: 'Medium' as RiskLevel,
        triggerFactors: ['Profit taking', 'Sector weakness'],
      },
      {
        id: 'downside-significant',
        name: 'Significant Drop',
        description: 'Notable decline requiring attention',
        category: 'downside',
        priceRangeMin: 166.95,
        priceRangeMax: 174.37,
        returnRangeMin: -10.0,
        returnRangeMax: -6.0,
        probability: 6,
        probabilityLabel: 'Unlikely',
        riskLevel: 'High' as RiskLevel,
        triggerFactors: ['Earnings miss', 'Macro headwinds'],
      },
    ],
    tail: [
      {
        id: 'tail-crash',
        name: 'Black Swan Event',
        description: 'Extreme market stress scenario',
        category: 'tail',
        priceRangeMin: 148.40,
        priceRangeMax: 166.95,
        returnRangeMin: -20.0,
        returnRangeMax: -10.0,
        probability: 2,
        probabilityLabel: 'Rare',
        riskLevel: 'High' as RiskLevel,
        triggerFactors: ['Market crash', 'Systemic risk event', 'Regulatory action'],
      },
    ],
  },
  simulation: {
    paths: 10000,
    meanReturn: 1.8,
    medianReturn: 1.5,
    stdDev: 3.9,
    skewness: -0.12,
    kurtosis: 3.8,
  },
  bestCase: {
    scenario: {
      id: 'upside-strong',
      name: 'Strong Rally',
      description: 'Significant bullish breakout',
      category: 'upside',
      priceRangeMin: 196.63,
      priceRangeMax: 204.05,
      returnRangeMin: 6.0,
      returnRangeMax: 10.0,
      probability: 6,
      probabilityLabel: 'Unlikely',
      riskLevel: 'Medium' as RiskLevel,
      triggerFactors: ['Major product announcement', 'Analyst upgrades'],
    },
    returnMax: 10.0,
  },
  worstCase: {
    scenario: {
      id: 'tail-crash',
      name: 'Black Swan Event',
      description: 'Extreme market stress scenario',
      category: 'tail',
      priceRangeMin: 148.40,
      priceRangeMax: 166.95,
      returnRangeMin: -20.0,
      returnRangeMax: -10.0,
      probability: 2,
      probabilityLabel: 'Rare',
      riskLevel: 'High' as RiskLevel,
      triggerFactors: ['Market crash', 'Systemic risk event'],
    },
    returnMin: -20.0,
  },
  overallRisk: 'Medium' as RiskLevel,
  explanation: `## Trade Summary

Your AAPL long position has a **62% probability of profit** over the next week, with an expected return of +1.8%.

### Key Risk Metrics

- **95% Value at Risk (VaR)**: You have a 5% chance of losing more than 4.2%
- **Expected Shortfall**: If things go wrong, expect an average loss of 5.6%
- **Risk/Reward Ratio**: 2.1:1 — favorable risk-adjusted setup

### Scenario Breakdown

The Monte Carlo simulation ran 10,000 paths using live volatility data:

- **Base Case (50%)**: Price stays between $181.79 - $189.21
- **Upside (24%)**: Could rally to $196+ on positive catalysts
- **Downside (24%)**: Pullback to $174 support possible
- **Tail Risk (2%)**: Black swan could push below $167

### Recommendation

This trade shows a **moderate risk profile** with slightly positive skew. The 2.1:1 risk/reward suggests the setup is favorable, but position sizing should account for the 4.2% VaR threshold.

*Analysis powered by 10,000-path Monte Carlo simulation with live Finnhub market data.*`,
  analyzedAt: Date.now(),
  dataSourcesUsed: ['Finnhub', 'Monte Carlo Engine'],
};

export const DEMO_ASSETS = [
  { symbol: 'AAPL', name: 'Apple Inc.', market: 'US' },
  { symbol: 'TSLA', name: 'Tesla Inc.', market: 'US' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', market: 'US' },
  { symbol: 'SPY', name: 'S&P 500 ETF', market: 'US' },
] as const;
