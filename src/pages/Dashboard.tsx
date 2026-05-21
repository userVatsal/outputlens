import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useUsage } from '@/hooks/useUsage';
import { usePlan } from '@/hooks/usePlan';
import { useTrackedAssets } from '@/hooks/useTrackedAssets';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useStreak } from '@/hooks/useStreak';
import {
  AdminPanel,
  AlertsPanel,
  RecentReports,
  AgeVerificationBanner,
  OnboardingGuide,
} from '@/components/dashboard';
import { AgentDrawer } from '@/components/agent/AgentDrawer';
import { ExecutiveStrip } from '@/components/dashboard/ExecutiveStrip';
import { KpiGrid } from '@/components/dashboard/KpiGrid';
import { PositionsTable } from '@/components/dashboard/PositionsTable';
import { RecentSimulationCard } from '@/components/dashboard/RecentSimulationCard';

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
  const { streak } = useStreak();

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
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  const needsAgeVerification = !profile?.date_of_birth && showAgeVerification;
  const shouldShowOnboarding = hasAnalysisHistory === false && showOnboarding;

  return (
    <AppShell>
      <div className="section-container py-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Zone 1: Executive greeting strip */}
          <div className="animate-fade-in">
            <ExecutiveStrip
              profile={profile}
              used={usage?.analysisCount ?? 0}
              limit={usage?.limit ?? 0}
              planLabel={planData.plan}
            />
          </div>

          {needsAgeVerification && (
            <div className="animate-fade-in">
              <AgeVerificationBanner onDismiss={() => setShowAgeVerification(false)} />
            </div>
          )}

          {shouldShowOnboarding && (
            <div className="animate-fade-in" style={{ animationDelay: '50ms' }}>
              <OnboardingGuide
                profileName={profile?.full_name}
                onDismiss={() => setShowOnboarding(false)}
              />
            </div>
          )}

          {/* Zone 2: KPI grid */}
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <KpiGrid assets={trackedAssets} streak={streak} />
          </div>

          {/* Zone 3: Recent simulation + Alerts (2-col) */}
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in"
            style={{ animationDelay: '150ms' }}
          >
            <div className="lg:col-span-2">
              <RecentSimulationCard />
            </div>
            <div>
              <AlertsPanel
                alerts={alerts}
                onDismiss={dismissAlert}
                onMarkRead={markAlertRead}
              />
            </div>
          </div>

          {/* Zone 4: Positions table */}
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <PositionsTable assets={trackedAssets} />
          </div>

          {/* Zone 5: Recent reports */}
          <div className="animate-fade-in" style={{ animationDelay: '250ms' }}>
            <RecentReports />
          </div>

          {isAdmin && (
            <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <AdminPanel />
            </div>
          )}

        </div>
      </div>
      <AgentDrawer />
    </AppShell>
  );
}
