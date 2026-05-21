import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, PieChart, Activity, Shield, Target, ArrowRight, TrendingUp } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PortfolioAnalyzer } from '@/components/PortfolioAnalyzer';
import { UsageIndicator } from '@/components/UsageIndicator';
import { PaywallModal } from '@/components/PaywallModal';
import { supabase } from '@/integrations/supabase/client';
import { useUsage } from '@/hooks/useUsage';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Activity, title: 'Correlation Matrix', description: 'See how your assets move together and find hidden concentrations.' },
  { icon: Shield, title: 'Combined VaR', description: 'Portfolio Value at Risk with diversification benefits.' },
  { icon: Target, title: 'Risk Attribution', description: 'Identify the positions driving most of your tail exposure.' },
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
      <div className="section-container py-6">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md flex items-center justify-center bg-primary/10">
                <PieChart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-semibold text-foreground">Portfolio Analysis</h1>
                <p className="text-sm text-muted-foreground">Multi-asset risk with correlation, combined VaR, and attribution</p>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded bg-bullish/10 text-bullish border border-bullish/20">
              PRO
            </span>
          </div>
          
          {!usageLoading && usage && (
            <UsageIndicator usage={usage} />
          )}

          <div className="grid md:grid-cols-3 gap-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-lg border border-border bg-card p-4">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary mb-2">
                  <feature.icon className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-sm font-display">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="glass-card p-6 md:p-8">
            <PortfolioAnalyzer />
          </div>

          <div className="rounded-lg border border-dashed border-border p-4 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Analysing a single position?</p>
                <p className="text-xs text-muted-foreground">Open the workspace for full single-asset analysis.</p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/workspace">Workspace <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
        </div>
      </div>

      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </AppShell>
  );
}
