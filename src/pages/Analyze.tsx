import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { History, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { TradeInputForm } from '@/components/TradeInputForm';
import { UsageIndicator } from '@/components/UsageIndicator';
import { PaywallModal } from '@/components/PaywallModal';
import { WelcomeCard, OnboardingTooltips } from '@/components/OnboardingTooltips';
import { supabase } from '@/integrations/supabase/client';
import { useTrade } from '@/hooks/useTrade';
import { useUsage } from '@/hooks/useUsage';
import { useProfile } from '@/hooks/useProfile';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Analyze() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { submitTrade, isLoading: tradeLoading } = useTrade();
  const { usage, loading: usageLoading, canAnalyze, incrementUsage } = useUsage();
  const { profile, loading: profileLoading } = useProfile();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  
  // Onboarding state
  const assetFromUrl = searchParams.get('asset');
  const [showWelcome, setShowWelcome] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  // SEO: Set page-specific document title
  useEffect(() => {
    document.title = 'Analyze Trade - Monte Carlo Risk Simulation | OutputLens';
  }, []);

  useEffect(() => {
    // Check auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session) {
          navigate('/auth');
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/auth');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Determine if we should show welcome/onboarding
  useEffect(() => {
    if (!profileLoading && profile && !loading) {
      // Show welcome if coming from demo with asset OR if first time
      const isFirstTime = !profile.onboarding_completed;
      const hasAssetParam = !!assetFromUrl;
      
      if ((isFirstTime || hasAssetParam) && !welcomeDismissed) {
        setShowWelcome(true);
      }
      
      // Show onboarding tooltips for truly first-time users
      if (isFirstTime && !showWelcome) {
        setShowOnboarding(true);
      }
    }
  }, [profile, profileLoading, loading, assetFromUrl, welcomeDismissed]);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    // Mark onboarding as complete in profile
    if (profile) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user?.id);
    }
  };

  const handleWelcomeDismiss = () => {
    setWelcomeDismissed(true);
    setShowWelcome(false);
  };

  const handleSubmitTrade = async (input: Parameters<typeof submitTrade>[0]) => {
    if (!canAnalyze) {
      setShowPaywall(true);
      return;
    }

    // Increment usage before submitting
    await incrementUsage();
    await submitTrade(input);
    navigate('/results');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="section-container py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analyze Trade</h1>
              <p className="text-muted-foreground">
                Enter your trade details for scenario analysis
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/history">
                <History className="h-4 w-4 mr-2" />
                History
              </Link>
            </Button>
          </div>

          {/* Welcome Card for new users or those coming from demo */}
          {showWelcome && !welcomeDismissed && (
            <WelcomeCard 
              assetFromUrl={assetFromUrl} 
              onDismiss={handleWelcomeDismiss} 
            />
          )}

          {/* Usage Indicator */}
          {!usageLoading && usage && (
            <div className="mb-6">
              <UsageIndicator usage={usage} />
            </div>
          )}

          {/* Form Card */}
          <div className="glass-card p-6">
            <TradeInputForm onSubmit={handleSubmitTrade} isLoading={tradeLoading} />
          </div>

        </div>
      </div>

      {/* Paywall Modal */}
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />

      {/* Onboarding Tooltips */}
      <OnboardingTooltips 
        isVisible={showOnboarding} 
        onComplete={handleOnboardingComplete} 
      />
    </Layout>
  );
}
