import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useUsage } from '@/hooks/useUsage';
import { usePlan } from '@/hooks/usePlan';
import { useTrackedAssets } from '@/hooks/useTrackedAssets';
import { useAdminRole } from '@/hooks/useAdminRole';
import {
  AccountHeader,
  AdminPanel,
  DashboardHero,
  AlertsPanel,
  TrackedAssetsGrid,
  RecentReports,
  LatestArticles,
  AgeVerificationBanner,
  OnboardingGuide,
  WhySection,
  WorkspacePreview,
  QuickActions,
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
  const { isAdmin, loading: adminLoading } = useAdminRole();

  // SEO
  useEffect(() => {
    document.title = 'Home | OutputLens - Risk & Scenario Intelligence';
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
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Account Header - Top of Dashboard */}
          <div className="animate-fade-in">
            <AccountHeader profile={profile} plan={planData} />
          </div>

          {/* Admin Analytics Panel - Only visible for admins */}
          {isAdmin && (
            <div className="animate-fade-in" style={{ animationDelay: '50ms' }}>
              <AdminPanel />
            </div>
          )}

          {/* Onboarding Guide for new users */}
          {shouldShowOnboarding && (
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <OnboardingGuide 
                profileName={profile?.full_name}
                onDismiss={() => setShowOnboarding(false)}
              />
            </div>
          )}

          {/* Age Verification Banner */}
          {needsAgeVerification && (
            <div className="animate-fade-in">
              <AgeVerificationBanner onDismiss={() => setShowAgeVerification(false)} />
            </div>
          )}

          {/* Hero Section - Full Width with animation */}
          <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
            <DashboardHero 
              profile={profile} 
              usage={usage} 
              plan={planData} 
            />
          </div>

          {/* Quick Actions - Fast navigation */}
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h2 className="text-lg font-semibold font-display text-foreground mb-4">Quick Actions</h2>
            <QuickActions />
          </div>

          {/* Workspace Preview - Full Width, Prominent with animation */}
          <div className="animate-fade-in" style={{ animationDelay: '250ms' }}>
            <WorkspacePreview />
          </div>

          {/* 2-Column Grid: Alerts + Tracked Assets */}
          <div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" 
            style={{ animationDelay: '300ms' }}
          >
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

          {/* 2-Column Grid: Reports + Latest Articles */}
          <div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" 
            style={{ animationDelay: '350ms' }}
          >
            <RecentReports />
            <LatestArticles />
          </div>

          {/* Why OutputLens Exists - Full Width */}
          <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
            <WhySection />
          </div>

        </div>
      </div>
    </Layout>
  );
}
