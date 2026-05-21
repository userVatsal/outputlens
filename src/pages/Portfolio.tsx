import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, PieChart, Activity, Shield, Target, ArrowRight, TrendingUp, Layers } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PortfolioAnalyzer } from '@/components/PortfolioAnalyzer';
import { UsageIndicator } from '@/components/UsageIndicator';
import { PaywallModal } from '@/components/PaywallModal';
import { supabase } from '@/integrations/supabase/client';
import { useUsage } from '@/hooks/useUsage';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Activity, title: 'Correlation matrix', description: 'Spot hidden concentrations across positions.' },
  { icon: Shield, title: 'Combined VaR', description: 'Portfolio-level Value-at-Risk with diversification.' },
  { icon: Target, title: 'Risk attribution', description: 'Pinpoint positions driving tail exposure.' },
];

export default function Portfolio() {
  const navigate = useNavigate();
  const { usage, loading: usageLoading, canAnalyze } = useUsage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  // SEO: Set page-specific document title
  useEffect(() => {
    document.title = 'Portfolio Analysis - Multi-Asset Risk Assessment | OutputLens';
  }, []);

  useEffect(() => {
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
                <PieChart className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                  Portfolio Analysis
                </h1>
                <p className="text-sm text-muted-foreground">
                  Multi-asset risk with correlation, combined VaR, and attribution.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-bullish/20 bg-bullish/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-bullish">
                <Layers className="h-3 w-3" /> PRO
              </span>
              <Button asChild size="sm" variant="outline">
                <Link to="/workspace">
                  Single asset <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>

          {!usageLoading && usage && <UsageIndicator usage={usage} />}

          {/* Feature strip */}
          <div className="grid gap-3 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/40"
              >
                <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <feature.icon className="h-4 w-4" />
                </div>
                <h3 className="mb-1 font-display text-sm font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Positions builder */}
          <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h2 className="font-display text-base font-semibold text-foreground">
                  Build your portfolio
                </h2>
                <p className="text-xs text-muted-foreground">
                  Add positions inline, set weights, and run a combined simulation.
                </p>
              </div>
              <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">
                Step 01
              </span>
            </div>
            <PortfolioAnalyzer />
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border bg-elevated/40 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Analysing a single position?</p>
                <p className="text-xs text-muted-foreground">
                  Open the workspace for full single-asset analysis.
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/workspace">
                Workspace <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </AppShell>
  );
}
