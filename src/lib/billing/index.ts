/**
 * Billing Module Index
 * 
 * Re-exports all billing functionality
 */

export {
  COST_UNITS,
  calculateComputeCost,
  calculateFullAnalysisCost,
  calculatePortfolioCost,
  getCostBreakdown,
  type CostOperation
} from './costModel';

export {
  meterUsage,
  meterAnalysis,
  getCurrentUsage,
  estimateRemainingAnalyses
} from './usageMeter';

export {
  PLAN_COST_BUDGETS,
  checkCostBudget,
  validateEngineConfig,
  canAccessNeuralDB,
  canAccessAIExplanation,
  getAILevel,
  getFeatureAccess,
  getBudgetPercentage
} from './enforcement';
