import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionPlan, PLAN_CONFIG, planHasFeature, getPlanLimit } from '@/lib/stripe';

export interface PlanData {
  plan: SubscriptionPlan;
  subscribed: boolean;
  subscriptionEnd: string | null;
  isLoading: boolean;
}

export function usePlan() {
  const [planData, setPlanData] = useState<PlanData>({
    plan: 'free',
    subscribed: false,
    subscriptionEnd: null,
    isLoading: true,
  });
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setPlanData({
          plan: 'free',
          subscribed: false,
          subscriptionEnd: null,
          isLoading: false,
        });
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke('check-subscription');
      
      if (fnError) {
        console.error('Error checking subscription:', fnError);
        setError(fnError.message);
        setPlanData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      setPlanData({
        plan: data.plan || 'free',
        subscribed: data.subscribed || false,
        subscriptionEnd: data.subscription_end || null,
        isLoading: false,
      });
    } catch (err) {
      console.error('Error in checkSubscription:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPlanData(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    checkSubscription();

    // Refresh subscription status every minute
    const interval = setInterval(checkSubscription, 60000);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkSubscription();
    });

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [checkSubscription]);

  const createCheckoutSession = async (priceId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must sign up or log in to pay.');
      }

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
    error,
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
