import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useUsage } from '@/hooks/useUsage';
import { usePlan } from '@/hooks/usePlan';
import { useTrackedAssets } from '@/hooks/useTrackedAssets';
import {
  AccountCard,
  AlertsPanel,
  TrackedAssetsGrid,
  RecentReports,
  MarketIntelligence,
  WorkspaceCTA,
  AgeVerificationBanner,
  OnboardingGuide,
} from '@/components/dashboard';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showAgeVerification, setShowAgeVerification] = useState(true);
  const [hasAnalysisHistory, setHasAnalysisHistory] = useState<boolean | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  
  const { profile, loading: profileLoading } = useProfile();
  const { usage, loading: usageLoading } = useUsage();
  const planData = usePlan();
  const { trackedAssets, alerts, isLoading: assetsLoading, dismissAlert, markAlertRead } = useTrackedAssets();

  // SEO
  useEffect(() => {
    document.title = 'Dashboard | OutputLens - Risk & Scenario Intelligence';
  }, []);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }
      setIsAuthenticated(true);
      
      // Check if user has any analysis history
      const { count, error } = await supabase
        .from('analysis_history')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.user.id);
      
      if (!error) {
        setHasAnalysisHistory((count || 0) > 0);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Show loading while checking auth
  if (isAuthenticated === null || profileLoading || usageLoading || planData.isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const needsAgeVerification = !profile?.date_of_birth && showAgeVerification;
  const shouldShowOnboarding = hasAnalysisHistory === false && showOnboarding;

  return (
    <Layout>
      <div className="section-container py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground font-brand">
              Risk Intelligence Dashboard
            </h1>
            <p className="text-muted-foreground">
              Your centralized command center for risk & scenario intelligence
            </p>
          </div>

          {/* Onboarding Guide for new users */}
          {shouldShowOnboarding && (
            <OnboardingGuide 
              profileName={profile?.full_name}
              onDismiss={() => setShowOnboarding(false)}
            />
          )}

          {/* Age Verification Banner */}
          {needsAgeVerification && (
            <div className="mb-6">
              <AgeVerificationBanner onDismiss={() => setShowAgeVerification(false)} />
            </div>
          )}

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Account & Alerts */}
            <div className="space-y-6">
              <AccountCard 
                profile={profile} 
                usage={usage} 
                plan={planData} 
              />
              <AlertsPanel 
                alerts={alerts} 
                onDismiss={dismissAlert} 
                onMarkRead={markAlertRead} 
              />
            </div>

            {/* Middle Column - Tracked Assets & History */}
            <div className="space-y-6">
              <TrackedAssetsGrid 
                assets={trackedAssets} 
                isLoading={assetsLoading} 
              />
              <RecentReports />
            </div>

            {/* Right Column - Market Intel & CTA */}
            <div className="space-y-6">
              <WorkspaceCTA />
              <MarketIntelligence />
            </div>
          </div>

          {/* Footer Disclaimer */}
          <div className="mt-12 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center max-w-3xl mx-auto">
              OutputLens provides risk analysis and scenario modeling for informational purposes only. 
              It does not provide financial advice, predictions, or trading signals. 
              Past scenarios do not guarantee future results.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
