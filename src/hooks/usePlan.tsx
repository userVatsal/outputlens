import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionPlan, PLAN_CONFIG, planHasFeature, getPlanLimit } from '@/lib/stripe';

export interface PlanData {
  plan: SubscriptionPlan;
  subscribed: boolean;
  subscriptionEnd: string | null;
  isLoading: boolean;
}

export function usePlan() {
  const { session, userId, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery({
    queryKey: ['subscription', userId],
    enabled: !authLoading,
    // Cache for 5 minutes; refetch on auth changes via queryKey invalidation
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async (): Promise<PlanData> => {
      if (!session) {
        return { plan: 'free', subscribed: false, subscriptionEnd: null, isLoading: false };
      }
      const { data, error: fnError } = await supabase.functions.invoke('check-subscription');
      if (fnError) throw fnError;
      return {
        plan: data?.plan || 'free',
        subscribed: data?.subscribed || false,
        subscriptionEnd: data?.subscription_end || null,
        isLoading: false,
      };
    },
  });

  const planData: PlanData = data ?? {
    plan: 'free',
    subscribed: false,
    subscriptionEnd: null,
    isLoading: isLoading || authLoading,
  };

  const checkSubscription = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['subscription', userId] });
  }, [queryClient, userId]);

  const createCheckoutSession = async (priceId: string) => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });

      if (fnError) throw fnError;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
      return data;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      throw err;
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('customer-portal');

      if (fnError) throw fnError;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
      return data;
    } catch (err) {
      console.error('Error opening customer portal:', err);
      throw err;
    }
  };

  // Feature access helpers
  const canAccessSentiment = planHasFeature(planData.plan, 'sentiment');
  const canAccessPortfolio = planHasFeature(planData.plan, 'portfolio');
  const canAccessApi = planHasFeature(planData.plan, 'api');
  const canExport = planHasFeature(planData.plan, 'exports');
  const canReceiveAlerts = planHasFeature(planData.plan, 'alerts');

  // Limits
  const analysesLimit = getPlanLimit(planData.plan, 'analyses');
  const portfolioAssetsLimit = getPlanLimit(planData.plan, 'portfolio');
  const apiCallsLimit = getPlanLimit(planData.plan, 'api');
  const historyDays = getPlanLimit(planData.plan, 'history');

  // Plan config
  const planConfig = PLAN_CONFIG[planData.plan];

  return {
    ...planData,
    isLoading: isLoading || authLoading,
    error: error instanceof Error ? error.message : null,
    planConfig,
    checkSubscription,
    createCheckoutSession,
    openCustomerPortal,
    // Feature access
    canAccessSentiment,
    canAccessPortfolio,
    canAccessApi,
    canExport,
    canReceiveAlerts,
    // Limits
    analysesLimit,
    portfolioAssetsLimit,
    apiCallsLimit,
    historyDays,
  };
}
