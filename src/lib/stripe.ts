// Stripe product and price configuration for OutputLens tiers
// YC-style tier differentiation: Free (US only) vs Paid (Global)

export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'trader';

export interface PlanConfig {
  name: string;
  price: number;
  priceId: string;
  productId: string;
  analysesLimit: number;
  portfolioAssetsLimit: number;
  apiCallsLimit: number;
  historyDays: number;
  monteCarloPathsLimit: number;
  globalMarkets: boolean;
  neuralDatabase: 'limited' | 'full' | 'auto';
  stochasticModels: 'basic' | 'full' | 'api';
  features: string[];
  highlighted?: boolean;
}

export const PLAN_CONFIG: Record<SubscriptionPlan, PlanConfig> = {
  free: {
    name: 'Free',
    price: 0,
    priceId: '',
    productId: '',
    analysesLimit: 5,
    portfolioAssetsLimit: 0,
    apiCallsLimit: 0,
    historyDays: 7,
    monteCarloPathsLimit: 5000,
    globalMarkets: false,
    neuralDatabase: 'limited',
    stochasticModels: 'basic',
    features: [
      '5 analyses per month',
      'US markets only',
      '5,000 Monte Carlo paths',
      'Basic GBM stochastic model',
      'Limited neural database',
      'Manual AI explanation trigger',
      '7-day history retention',
    ],
  },
  starter: {
    name: 'Starter',
    price: 12,
    priceId: 'price_1Ssy5t6fOimPgR7zJgd4EFI8',
    productId: 'prod_TqfQu2gGDuzYwB',
    analysesLimit: 30,
    portfolioAssetsLimit: 0,
    apiCallsLimit: 0,
    historyDays: 30,
    monteCarloPathsLimit: 10000,
    globalMarkets: true,
    neuralDatabase: 'full',
    stochasticModels: 'full',
    features: [
      '30 analyses per month',
      'Global markets (UK, EU, Crypto, Forex)',
      '10,000 Monte Carlo paths',
      'Full GBM + GARCH-like dynamics',
      'Full neural database',
      'Auto AI explanations',
      '30-day history retention',
    ],
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: 'price_1SsyBi6fOimPgR7z2E4ylccp',
    productId: 'prod_TqfWL1KQ91RU1B',
    analysesLimit: 100,
    portfolioAssetsLimit: 5,
    apiCallsLimit: 0,
    historyDays: Infinity,
    monteCarloPathsLimit: 10000,
    globalMarkets: true,
    neuralDatabase: 'auto',
    stochasticModels: 'full',
    features: [
      '100 analyses per month',
      'Global markets',
      '10,000 Monte Carlo paths',
      'Full stochastic suite',
      'Neural database + auto insights',
      'Portfolio analysis (5 assets)',
      'CSV/PDF exports',
      'Unlimited history',
    ],
    highlighted: true,
  },
  trader: {
    name: 'Trader',
    price: 79,
    priceId: 'price_1SsyBw6fOimPgR7zbOqcUQuo',
    productId: 'prod_TqfW4TNxviN7w5',
    analysesLimit: 500,
    portfolioAssetsLimit: 20,
    apiCallsLimit: 100,
    historyDays: Infinity,
    monteCarloPathsLimit: 10000,
    globalMarkets: true,
    neuralDatabase: 'auto',
    stochasticModels: 'api',
    features: [
      '500 analyses per month',
      'Global markets + priority data',
      '10,000 Monte Carlo paths',
      'Full stochastic suite + API',
      'Neural database + auto insights',
      'Portfolio analysis (20 assets)',
      'CSV/PDF exports + REST API (100/mo)',
      'Priority support',
    ],
  },
};

// Map product IDs to plans (for webhook/subscription checking)
export const PRODUCT_TO_PLAN: Record<string, SubscriptionPlan> = {
  'prod_TqfQu2gGDuzYwB': 'starter',
  'prod_TqfWL1KQ91RU1B': 'pro',
  'prod_TqfW4TNxviN7w5': 'trader',
};

// Helper to get plan from product ID
export function getPlanFromProductId(productId: string): SubscriptionPlan {
  return PRODUCT_TO_PLAN[productId] || 'free';
}

// Helper to check if a plan has access to a feature
export function planHasFeature(plan: SubscriptionPlan, feature: 'sentiment' | 'portfolio' | 'api' | 'exports' | 'alerts'): boolean {
  switch (feature) {
    case 'sentiment':
      return plan !== 'free';
    case 'portfolio':
      return plan === 'pro' || plan === 'trader';
    case 'api':
      return plan === 'trader';
    case 'exports':
      return plan === 'pro' || plan === 'trader';
    case 'alerts':
      return plan === 'trader';
    default:
      return false;
  }
}

// Get the limit for a specific plan
export function getPlanLimit(plan: SubscriptionPlan, type: 'analyses' | 'portfolio' | 'api' | 'history'): number {
  const config = PLAN_CONFIG[plan];
  switch (type) {
    case 'analyses':
      return config.analysesLimit;
    case 'portfolio':
      return config.portfolioAssetsLimit;
    case 'api':
      return config.apiCallsLimit;
    case 'history':
      return config.historyDays;
    default:
      return 0;
  }
}
