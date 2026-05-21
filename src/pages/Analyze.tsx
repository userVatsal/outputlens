import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { History, Loader2, Activity, Zap, Sparkles } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
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
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="section-container py-6 lg:py-10">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                  Run Simulation
                </h1>
                <p className="text-sm text-muted-foreground">
                  Configure your trade and run a Monte Carlo scenario forecast.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full border border-bullish/20 bg-bullish/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-bullish sm:inline-flex">
                <Zap className="h-3 w-3" /> Live engine
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/history">
                  <History className="mr-2 h-4 w-4" />
                  History
                </Link>
              </Button>
            </div>
          </div>

          {showWelcome && !welcomeDismissed && (
            <WelcomeCard assetFromUrl={assetFromUrl} onDismiss={handleWelcomeDismiss} />
          )}

          {!usageLoading && usage && <UsageIndicator usage={usage} />}

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Config card */}
            <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between border-b border-border/60 pb-4">
                <div>
                  <h2 className="font-display text-base font-semibold text-foreground">
                    Trade configuration
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Market, direction, entry, position size, and horizon.
                  </p>
                </div>
                <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">
                  Step 01
                </span>
              </div>
              <TradeInputForm onSubmit={handleSubmitTrade} isLoading={tradeLoading} />
            </div>

            {/* Side info */}
            <aside className="space-y-4">
              <div className="rounded-xl border border-border bg-elevated p-5">
                <div className="mb-3 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  What you'll get
                </div>
                <ul className="space-y-3 text-sm text-foreground/90">
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    <span>Full return distribution with P5–P95 fan chart.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    <span>Value-at-Risk, expected shortfall, and tail probabilities.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    <span>Scenario regimes: base, bull, bear, and stress.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    <span>AI-readable risk interpretation and next-step actions.</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border border-dashed border-border bg-surface/50 p-4 text-xs text-muted-foreground">
                Simulations run with 10,000 Monte Carlo paths by default — calibrated to current
                market volatility and your selected horizon.
              </div>
            </aside>
          </div>
        </div>
      </div>

      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
      <OnboardingTooltips isVisible={showOnboarding} onComplete={handleOnboardingComplete} />
    </AppShell>
  );
}
