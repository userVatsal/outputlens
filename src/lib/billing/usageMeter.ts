/**
 * Usage Meter
 * 
 * Layer 3: Monetization Infrastructure
 * 
 * Real-time tracking of compute usage per user.
 * Tracks cost units, not feature counts.
 */

import { supabase } from '@/integrations/supabase/client';
import { COST_UNITS, CostOperation, calculateComputeCost } from './costModel';
import { EngineConfig } from '../engine';

export interface UsageRecord {
  userId: string;
  monthYear: string;
  costUsed: number;
  analysisCount: number;
  operationBreakdown: Record<string, number>;
}

/**
 * Get current month-year string
 */
function getCurrentMonthYear(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Record usage for a specific operation
 */
export async function meterUsage(
  userId: string,
  operation: CostOperation,
  quantity: number = 1
): Promise<void> {
  const cost = COST_UNITS[operation] * quantity;
  const monthYear = getCurrentMonthYear();
  
  try {
    // Get current usage record
    const { data: existing } = await supabase
      .from('usage_tracking')
      .select('analysis_count, api_call_count')
      .eq('user_id', userId)
      .eq('month_year', monthYear)
      .maybeSingle();
    
    if (existing) {
      // Update existing record
      await supabase
        .from('usage_tracking')
        .update({
          api_call_count: (existing.api_call_count || 0) + Math.ceil(cost),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('month_year', monthYear);
    } else {
      // Create new record
      await supabase
        .from('usage_tracking')
        .insert({
          user_id: userId,
          month_year: monthYear,
          analysis_count: 0,
          api_call_count: Math.ceil(cost)
        });
    }
  } catch (error) {
    console.error('Error metering usage:', error);
  }
}

/**
 * Record a full analysis usage
 */
export async function meterAnalysis(
  userId: string,
  config: EngineConfig,
  includeNeuralQuery: boolean = false,
  includeAIExplanation: boolean = false
): Promise<number> {
  const cost = calculateComputeCost(config);
  let totalCost = cost;
  
  if (includeNeuralQuery) {
    totalCost += COST_UNITS.neural_query;
  }
  if (includeAIExplanation) {
    totalCost += COST_UNITS.ai_explanation;
  }
  
  const monthYear = getCurrentMonthYear();
  
  try {
    // Get current usage record
    const { data: existing } = await supabase
      .from('usage_tracking')
      .select('analysis_count, api_call_count')
      .eq('user_id', userId)
      .eq('month_year', monthYear)
      .maybeSingle();
    
    if (existing) {
      // Update existing record
      await supabase
        .from('usage_tracking')
        .update({
          analysis_count: (existing.analysis_count || 0) + 1,
          api_call_count: (existing.api_call_count || 0) + Math.ceil(totalCost),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('month_year', monthYear);
    } else {
      // Create new record
      await supabase
        .from('usage_tracking')
        .insert({
          user_id: userId,
          month_year: monthYear,
          analysis_count: 1,
          api_call_count: Math.ceil(totalCost)
        });
    }
  } catch (error) {
    console.error('Error metering analysis:', error);
  }
  
  return totalCost;
}

/**
 * Get current usage for a user
 */
export async function getCurrentUsage(userId: string): Promise<{
  costUsed: number;
  analysisCount: number;
  monthYear: string;
}> {
  const monthYear = getCurrentMonthYear();
  
  try {
    const { data } = await supabase
      .from('usage_tracking')
      .select('analysis_count, api_call_count')
      .eq('user_id', userId)
      .eq('month_year', monthYear)
      .maybeSingle();
    
    return {
      costUsed: data?.api_call_count || 0,
      analysisCount: data?.analysis_count || 0,
      monthYear
    };
  } catch (error) {
    console.error('Error getting usage:', error);
    return { costUsed: 0, analysisCount: 0, monthYear };
  }
}

/**
 * Estimate remaining analyses for a user
 */
export async function estimateRemainingAnalyses(
  userId: string,
  costBudget: number,
  avgCostPerAnalysis: number = 15
): Promise<number> {
  const { costUsed } = await getCurrentUsage(userId);
  const remaining = costBudget - costUsed;
  
  return Math.max(0, Math.floor(remaining / avgCostPerAnalysis));
}
