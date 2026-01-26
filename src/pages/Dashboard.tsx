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
  AccountHeader,
  DashboardHero,
  AlertsPanel,
  TrackedAssetsGrid,
  RecentReports,
  MarketIntelligence,
  WorkspaceCTA,
  AgeVerificationBanner,
  OnboardingGuide,
  WhySection,
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
      
      // Check if onboarding is completed
      const { data: profileData } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', session.user.id)
        .single();
      
      if (!profileData?.onboarding_completed) {
        navigate('/onboarding');
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
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Account Header - Top of Dashboard */}
          <AccountHeader profile={profile} plan={planData} />

          {/* Onboarding Guide for new users */}
          {shouldShowOnboarding && (
            <OnboardingGuide 
              profileName={profile?.full_name}
              onDismiss={() => setShowOnboarding(false)}
            />
          )}

          {/* Age Verification Banner */}
          {needsAgeVerification && (
            <AgeVerificationBanner onDismiss={() => setShowAgeVerification(false)} />
          )}

          {/* Hero Section - Full Width */}
          <DashboardHero 
            profile={profile} 
            usage={usage} 
            plan={planData} 
          />

          {/* Workspace CTA - Full Width, Prominent */}
          <WorkspaceCTA />

          {/* 2-Column Grid: Alerts + Tracked Assets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AlertsPanel 
              alerts={alerts} 
              onDismiss={dismissAlert} 
              onMarkRead={markAlertRead} 
            />
            <TrackedAssetsGrid 
              assets={trackedAssets} 
              isLoading={assetsLoading} 
            />
          </div>

          {/* 2-Column Grid: Reports + Market Intelligence */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentReports />
            <MarketIntelligence />
          </div>

          {/* Why OutputLens Exists - Full Width */}
          <WhySection />

          {/* Footer Disclaimer */}
          <div className="pt-6 border-t border-border">
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
