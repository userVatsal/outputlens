import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Loader2, 
  PieChart, 
  History, 
  TrendingUp, 
  ArrowRight, 
  Shield, 
  Activity,
  Sparkles,
  BarChart3,
  Target,
  Zap,
  LineChart
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PortfolioAnalyzer } from '@/components/PortfolioAnalyzer';
import { UsageIndicator } from '@/components/UsageIndicator';
import { PaywallModal } from '@/components/PaywallModal';
import { supabase } from '@/integrations/supabase/client';
import { useUsage } from '@/hooks/useUsage';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Activity,
    title: 'Correlation Matrix',
    description: 'See how your assets move together and identify hidden risk concentrations.',
  },
  {
    icon: Shield,
    title: 'Combined VaR',
    description: 'Portfolio-level Value at Risk accounting for diversification benefits.',
  },
  {
    icon: Target,
    title: 'Risk Attribution',
    description: 'Understand which assets contribute most to overall portfolio risk.',
  },
];

const metrics = [
  { value: '10', label: 'Max Assets', sublabel: 'Per Analysis' },
  { value: '10K', label: 'Paths/Asset', sublabel: 'Monte Carlo' },
  { value: '95%', label: 'VaR Coverage', sublabel: 'Confidence' },
  { value: '<5s', label: 'Full Analysis', sublabel: 'All Assets' },
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
      {/* Hero Section */}
      <section className="hero-gradient py-12 lg:py-16 border-b border-border">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="px-3 py-1">
                    <PieChart className="h-3 w-3 mr-1" />
                    Portfolio Analysis
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 text-bullish border-bullish/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Pro Feature
                  </Badge>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-brand leading-tight">
                  Multi-Asset Risk{' '}
                  <span className="text-primary">Analysis</span>
                </h1>
                
                <p className="text-lg text-muted-foreground max-w-xl">
                  Analyze up to 10 assets with correlation matrix, combined VaR, and 
                  diversification metrics. See how your positions interact.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                <Button variant="outline" asChild className="gap-2">
                  <Link to="/analyze">
                    <LineChart className="h-4 w-4" />
                    Single Asset
                  </Link>
                </Button>
                <Button variant="outline" asChild className="gap-2">
                  <Link to="/history">
                    <History className="h-4 w-4" />
                    View History
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="py-6 bg-card border-b border-border">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-primary font-mono">
                    {metric.value}
                  </p>
                  <p className="text-xs font-medium text-foreground">{metric.label}</p>
                  <p className="text-xs text-muted-foreground">{metric.sublabel}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Usage Indicator */}
          {!usageLoading && usage && (
            <UsageIndicator usage={usage} />
          )}

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div 
                key={feature.title} 
                className="glass-card p-5 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-sm">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Portfolio Analyzer */}
          <div className="glass-card p-6 md:p-8">
            <PortfolioAnalyzer />
          </div>

          {/* Cross-sell to Single Asset */}
          <div className="glass-card p-6 bg-muted/30 border-dashed">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Analyzing a single trade?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get detailed scenario analysis with AI explanations for individual positions.
                  </p>
                </div>
              </div>
              <Button asChild className="shrink-0">
                <Link to="/analyze">
                  Single Asset Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Paywall Modal */}
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </AppShell>
  );
}
