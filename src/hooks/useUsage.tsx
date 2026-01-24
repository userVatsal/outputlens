import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UsageData {
  analysisCount: number;
  limit: number;
  tier: 'free' | 'pro';
  monthYear: string;
}

interface Profile {
  subscription_tier: string;
}

interface UsageTracking {
  analysis_count: number;
}

const FREE_LIMIT = 10;

export function useUsage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const getCurrentMonthYear = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const fetchUsage = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const userId = session.user.id;
    const monthYear = getCurrentMonthYear();

    try {
      // Get profile for subscription tier
      const { data: profile } = await supabase
        .from('profiles' as never)
        .select('subscription_tier')
        .eq('user_id', userId)
        .maybeSingle() as { data: Profile | null; error: unknown };

      const tier = (profile?.subscription_tier as 'free' | 'pro') || 'free';

      // Get or create usage tracking
      let { data: usageData } = await supabase
        .from('usage_tracking' as never)
        .select('analysis_count')
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
          } as never)
          .select('analysis_count')
          .single() as { data: UsageTracking | null; error: unknown };
        usageData = newUsage;
      }

      setUsage({
        analysisCount: usageData?.analysis_count || 0,
        limit: tier === 'pro' ? Infinity : FREE_LIMIT,
        tier,
        monthYear,
      });
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const incrementUsage = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const userId = session.user.id;
    const monthYear = getCurrentMonthYear();

    try {
      // Increment the count
      const { data } = await supabase
        .from('usage_tracking' as never)
        .update({ analysis_count: (usage?.analysisCount || 0) + 1 } as never)
        .eq('user_id', userId)
        .eq('month_year', monthYear)
        .select('analysis_count')
        .single() as { data: UsageTracking | null; error: unknown };

      if (data && usage) {
        setUsage({
          ...usage,
          analysisCount: data.analysis_count,
        });
      }
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  }, [usage]);

  const canAnalyze = usage ? (usage.tier === 'pro' || usage.analysisCount < usage.limit) : false;

  return {
    usage,
    loading,
    canAnalyze,
    incrementUsage,
    refetch: fetchUsage,
  };
}
