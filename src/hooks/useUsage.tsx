import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionPlan, PLAN_CONFIG } from '@/lib/stripe';
import { useAuth } from '@/contexts/AuthContext';

export interface UsageData {
  analysisCount: number;
  portfolioAnalysisCount: number;
  apiCallCount: number;
  limit: number;
  plan: SubscriptionPlan;
  monthYear: string;
}

interface Profile {
  subscription_plan: string;
}

interface UsageTracking {
  analysis_count: number;
  portfolio_analysis_count: number;
  api_call_count: number;
}

export function useUsage() {
  const { userId, loading: authLoading } = useAuth();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const getCurrentMonthYear = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const fetchUsage = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const monthYear = getCurrentMonthYear();

    try {
      // Get profile for subscription plan
      const { data: profile } = await supabase
        .from('profiles' as never)
        .select('subscription_plan')
        .eq('user_id', userId)
        .maybeSingle() as { data: Profile | null; error: unknown };

      const plan = (profile?.subscription_plan as SubscriptionPlan) || 'free';
      const planConfig = PLAN_CONFIG[plan];

      // Get or create usage tracking
      let { data: usageData } = await supabase
        .from('usage_tracking' as never)
        .select('analysis_count, portfolio_analysis_count, api_call_count')
        .eq('user_id', userId)
        .eq('month_year', monthYear)
        .maybeSingle() as { data: UsageTracking | null; error: unknown };

      if (!usageData) {
        // Create new usage record for this month
        const { data: newUsage } = await supabase
          .from('usage_tracking' as never)
          .insert({
            user_id: userId,
            month_year: monthYear,
            analysis_count: 0,
            portfolio_analysis_count: 0,
            api_call_count: 0,
          } as never)
          .select('analysis_count, portfolio_analysis_count, api_call_count')
          .single() as { data: UsageTracking | null; error: unknown };
        usageData = newUsage;
      }

      setUsage({
        analysisCount: usageData?.analysis_count || 0,
        portfolioAnalysisCount: usageData?.portfolio_analysis_count || 0,
        apiCallCount: usageData?.api_call_count || 0,
        limit: planConfig.analysesLimit,
        plan,
        monthYear,
      });
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (authLoading) return;
    fetchUsage();
  }, [fetchUsage, authLoading]);

  const incrementUsage = useCallback(async (type: 'analysis' | 'portfolio' | 'api' = 'analysis') => {
    if (!userId) return;

    const monthYear = getCurrentMonthYear();

    try {
      const updateField = type === 'portfolio' 
        ? 'portfolio_analysis_count' 
        : type === 'api' 
          ? 'api_call_count' 
          : 'analysis_count';
      
      const currentValue = type === 'portfolio'
        ? usage?.portfolioAnalysisCount || 0
        : type === 'api'
          ? usage?.apiCallCount || 0
          : usage?.analysisCount || 0;

      const { data } = await supabase
        .from('usage_tracking' as never)
        .update({ [updateField]: currentValue + 1 } as never)
        .eq('user_id', userId)
        .eq('month_year', monthYear)
        .select('analysis_count, portfolio_analysis_count, api_call_count')
        .single() as { data: UsageTracking | null; error: unknown };

      if (data && usage) {
        setUsage({
          ...usage,
          analysisCount: data.analysis_count,
          portfolioAnalysisCount: data.portfolio_analysis_count,
          apiCallCount: data.api_call_count,
        });
      }
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  }, [usage, userId]);

  const canAnalyze = usage ? usage.analysisCount < usage.limit : false;
  const canPortfolioAnalyze = usage 
    ? usage.portfolioAnalysisCount < PLAN_CONFIG[usage.plan].portfolioAssetsLimit 
    : false;

  return {
    usage,
    loading,
    canAnalyze,
    canPortfolioAnalyze,
    incrementUsage,
    refetch: fetchUsage,
  };
}
