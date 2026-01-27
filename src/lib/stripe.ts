// Stripe product and price configuration for OutputLens tiers
// YC-style three-layer intelligence architecture: Layer 1 (Math/Physics) → Layer 2 (ML) → Layer 3 (AI)

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
  
  // Layer 1: Deterministic Math/Physics (CORE IP)
  monteCarloPathsLimit: number;
  stochasticModels: 'basic_gbm' | 'gbm_garch' | 'full_suite' | 'api';
  jumpDiffusion: boolean;
  regimeSwitching: boolean;
  
  // Layer 2: Statistical & ML Adaptation
  globalMarkets: boolean;
  marketsList: string[];
  neuralDatabase: 'limited' | 'full' | 'auto';
  regimeDetection: boolean;
  volatilityAdaptation: boolean;
  
  // Layer 3: AI Interpretation (Strictly Controlled)
  aiInterpretation: 'manual' | 'auto' | 'advanced';
  ragAccess: boolean;
  
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
    // Layer 1: Basic math
    monteCarloPathsLimit: 5000,
    stochasticModels: 'basic_gbm',
    jumpDiffusion: false,
    regimeSwitching: false,
    // Layer 2: Limited ML
    globalMarkets: false,
    marketsList: ['US'],
    neuralDatabase: 'limited',
    regimeDetection: false,
    volatilityAdaptation: false,
    // Layer 3: Manual AI
    aiInterpretation: 'manual',
    ragAccess: false,
    features: [
      'Layer 1: Basic GBM simulation',
      '5 analyses per month',
      'US markets only',
      '5,000 Monte Carlo paths',
      'Manual AI explanation trigger',
      '7-day history retention',
    ],
  },
  starter: {
    name: 'Starter',
    price: 12,
    priceId: 'price_1SuEvy6fOimPgR7zEMm58xaG',
    productId: 'prod_TrythZDLRcM1Df',
    analysesLimit: 30,
    portfolioAssetsLimit: 0,
    apiCallsLimit: 0,
    historyDays: 30,
    // Layer 1: Full stochastic suite
    monteCarloPathsLimit: 10000,
    stochasticModels: 'gbm_garch',
    jumpDiffusion: false,
    regimeSwitching: true,
    // Layer 2: Full ML features
    globalMarkets: true,
    marketsList: ['US', 'UK', 'EU', 'Crypto', 'Forex'],
    neuralDatabase: 'full',
    regimeDetection: true,
    volatilityAdaptation: true,
    // Layer 3: Auto AI
    aiInterpretation: 'auto',
    ragAccess: true,
    features: [
      'Layers 1-3: Full intelligence stack',
      '30 analyses per month',
      'Global markets (UK, EU, Crypto, Forex)',
      '10,000 Monte Carlo paths',
      'GBM + GARCH + regime switching',
      'Full neural database + RAG',
      'Auto AI explanations',
    ],
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: 'price_1SuFAb6fOimPgR7zOqOhB67x',
    productId: 'prod_Trz8F237n1udxv',
    analysesLimit: 100,
    portfolioAssetsLimit: 5,
    apiCallsLimit: 0,
    historyDays: Infinity,
    // Layer 1: Full suite + jump diffusion
    monteCarloPathsLimit: 10000,
    stochasticModels: 'full_suite',
    jumpDiffusion: true,
    regimeSwitching: true,
    // Layer 2: Auto neural insights
    globalMarkets: true,
    marketsList: ['US', 'UK', 'EU', 'Crypto', 'Forex'],
    neuralDatabase: 'auto',
    regimeDetection: true,
    volatilityAdaptation: true,
    // Layer 3: Advanced AI
    aiInterpretation: 'advanced',
    ragAccess: true,
    features: [
      'Layers 1-3: Advanced intelligence',
      '100 analyses per month',
      'Full stochastic suite + jump diffusion',
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
    priceId: 'price_1SuFBC6fOimPgR7zy8NOODxI',
    productId: 'prod_Trz9TGqW9escEk',
    analysesLimit: 500,
    portfolioAssetsLimit: 20,
    apiCallsLimit: 100,
    historyDays: Infinity,
    // Layer 1: Full suite + API
    monteCarloPathsLimit: 10000,
    stochasticModels: 'api',
    jumpDiffusion: true,
    regimeSwitching: true,
    // Layer 2: Full access + API
    globalMarkets: true,
    marketsList: ['US', 'UK', 'EU', 'Crypto', 'Forex'],
    neuralDatabase: 'auto',
    regimeDetection: true,
    volatilityAdaptation: true,
    // Layer 3: Advanced + priority
    aiInterpretation: 'advanced',
    ragAccess: true,
    features: [
      'Layers 1-3: Full + API access',
      '500 analyses per month',
      'Full stochastic suite + REST API',
      'Priority data & processing',
      'Portfolio analysis (20 assets)',
      'CSV/PDF exports + API (100/mo)',
      'Priority support',
    ],
  },
};

// Map product IDs to plans (for webhook/subscription checking)
export const PRODUCT_TO_PLAN: Record<string, SubscriptionPlan> = {
  'prod_TrythZDLRcM1Df': 'starter',
  'prod_Trz8F237n1udxv': 'pro',
  'prod_Trz9TGqW9escEk': 'trader',
};

// Helper to get plan from product ID
export function getPlanFromProductId(productId: string): SubscriptionPlan {
  return PRODUCT_TO_PLAN[productId] || 'free';
}

// Helper to check if a plan has access to a feature (three-layer architecture)
export type GatableFeature = 
  | 'sentiment' 
  | 'portfolio' 
  | 'api' 
  | 'exports' 
  | 'alerts'
  | 'neural_database'
  | 'regime_detection'
  | 'global_markets'
  | 'advanced_ai'
  | 'jump_diffusion';

export function planHasFeature(plan: SubscriptionPlan, feature: GatableFeature): boolean {
  const config = PLAN_CONFIG[plan];
  switch (feature) {
    case 'sentiment':
    case 'global_markets':
      return config.globalMarkets;
    case 'portfolio':
      return config.portfolioAssetsLimit > 0;
    case 'api':
      return config.apiCallsLimit > 0;
    case 'exports':
      return plan === 'pro' || plan === 'trader';
    case 'alerts':
      return plan === 'trader';
    case 'neural_database':
      return config.neuralDatabase !== 'limited';
    case 'regime_detection':
      return config.regimeDetection;
    case 'advanced_ai':
      return config.aiInterpretation === 'advanced';
    case 'jump_diffusion':
      return config.jumpDiffusion;
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
