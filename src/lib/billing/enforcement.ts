/**
 * Backend Enforcement
 * 
 * Layer 3: Monetization Infrastructure
 * 
 * Enforces plan limits at the BACKEND level.
 * UI reflects backend enforcement, doesn't define it.
 */

import { SubscriptionPlan, PLAN_CONFIG } from '../stripe';
import { getCurrentUsage } from './usageMeter';
import { calculateComputeCost, COST_UNITS } from './costModel';
import { EngineConfig } from '../engine';

/**
 * Plan cost budgets (in compute units)
 * 
 * These map plans to monthly compute budgets.
 * Higher budget = more analyses/operations.
 */
export const PLAN_COST_BUDGETS: Record<SubscriptionPlan, number> = {
  free: 100,        // ~5-7 basic analyses
  starter: 600,     // ~30-40 full analyses
  pro: 2500,        // ~100-150 full analyses + portfolio
  trader: 15000,    // ~500+ analyses + API access
};

/**
 * Check if user can perform requested operation
 */
export async function checkCostBudget(
  userId: string,
  requestedCost: number,
  plan: SubscriptionPlan
): Promise<{ allowed: boolean; remaining: number; reason?: string }> {
  const budget = PLAN_COST_BUDGETS[plan];
  const { costUsed } = await getCurrentUsage(userId);
  
  const remaining = budget - costUsed;
  
  if (requestedCost > remaining) {
    return {
      allowed: false,
      remaining,
      reason: `Compute budget exceeded. ${remaining.toFixed(1)} units remaining this month. Upgrade for more capacity.`
    };
  }
  
  return { allowed: true, remaining: remaining - requestedCost };
}

/**
 * Validate engine configuration against plan limits
 */
export function validateEngineConfig(
  config: EngineConfig,
  plan: SubscriptionPlan
): { valid: boolean; adjustedConfig?: EngineConfig; reason?: string } {
  const planConfig = PLAN_CONFIG[plan];
  
  // Check path limits
  const maxPaths = plan === 'free' ? 5000 : 10000;
  if (config.paths > maxPaths) {
    return {
      valid: false,
      adjustedConfig: { ...config, paths: maxPaths },
      reason: `Path limit: ${plan} tier allows max ${maxPaths.toLocaleString()} paths.`
    };
  }
  
  // Check regime detection access
  if (config.regimeDetection && plan === 'free') {
    return {
      valid: false,
      adjustedConfig: { ...config, regimeDetection: false },
      reason: 'Regime detection requires Starter tier or higher.'
    };
  }
  
  // Check stochastic model access
  if (config.stochasticModel === 'regime_gbm' && (plan === 'free' || plan === 'starter')) {
    return {
      valid: false,
      adjustedConfig: { ...config, stochasticModel: 'gbm' },
      reason: 'Regime-switched GBM requires Pro tier or higher.'
    };
  }
  
  if (config.stochasticModel === 'garch' && plan === 'free') {
    return {
      valid: false,
      adjustedConfig: { ...config, stochasticModel: 'gbm' },
      reason: 'GARCH volatility requires Starter tier or higher.'
    };
  }
  
  return { valid: true };
}

/**
 * Check if user can access neural database
 */
export function canAccessNeuralDB(plan: SubscriptionPlan): boolean {
  return plan !== 'free';
}

/**
 * Check if user can access AI explanation
 */
export function canAccessAIExplanation(plan: SubscriptionPlan): boolean {
  // Free tier gets manual/basic AI, paid gets auto/advanced
  return true; // AI available to all, quality varies by tier
}

/**
 * Get AI explanation level for plan
 */
export function getAILevel(plan: SubscriptionPlan): 'manual' | 'auto' | 'advanced' {
  switch (plan) {
    case 'free': return 'manual';
    case 'starter': return 'auto';
    case 'pro':
    case 'trader': return 'advanced';
    default: return 'manual';
  }
}

/**
 * Get feature access summary for plan
 */
export function getFeatureAccess(plan: SubscriptionPlan): {
  layer1: { models: string[]; maxPaths: number };
  layer2: { neuralDB: boolean; regimeDetection: boolean };
  layer3: { aiLevel: 'manual' | 'auto' | 'advanced' };
  markets: string[];
} {
  const config = PLAN_CONFIG[plan];
  
  return {
    layer1: {
      models: plan === 'free' 
        ? ['Basic GBM'] 
        : plan === 'starter' 
          ? ['GBM', 'GARCH'] 
          : ['GBM', 'GARCH', 'Regime-Switched GBM', 'Jump Diffusion'],
      maxPaths: plan === 'free' ? 5000 : 10000
    },
    layer2: {
      neuralDB: canAccessNeuralDB(plan),
      regimeDetection: plan !== 'free'
    },
    layer3: {
      aiLevel: getAILevel(plan)
    },
    markets: config.globalMarkets ? config.marketsList : ['US']
  };
}

/**
 * Calculate remaining budget as percentage
 */
export async function getBudgetPercentage(
  userId: string,
  plan: SubscriptionPlan
): Promise<number> {
  const budget = PLAN_COST_BUDGETS[plan];
  const { costUsed } = await getCurrentUsage(userId);
  
  const remaining = Math.max(0, budget - costUsed);
  return (remaining / budget) * 100;
}
