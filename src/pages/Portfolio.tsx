import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, PieChart, History } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { PortfolioAnalyzer } from '@/components/PortfolioAnalyzer';
import { UsageIndicator } from '@/components/UsageIndicator';
import { PaywallModal } from '@/components/PaywallModal';
import { supabase } from '@/integrations/supabase/client';
import { useUsage } from '@/hooks/useUsage';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Portfolio() {
  const navigate = useNavigate();
  const { usage, loading: usageLoading, canAnalyze } = useUsage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <PieChart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground font-brand">Portfolio Analysis</h1>
                <p className="text-muted-foreground">
                  Analyze multiple assets with correlation matrix
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/analyze">Single Asset</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/history">
                  <History className="h-4 w-4 mr-2" />
                  History
                </Link>
              </Button>
            </div>
          </div>

          {/* Usage Indicator */}
          {!usageLoading && usage && (
            <div className="mb-6">
              <UsageIndicator usage={usage} />
            </div>
          )}

          {/* Portfolio Analyzer */}
          <div className="glass-card p-6">
            <PortfolioAnalyzer />
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-muted-foreground mt-8 max-w-sm mx-auto">
            Portfolio correlations are estimated. For production use, historical price data is recommended.
            Educational purposes only. Not financial advice.
          </p>
        </div>
      </div>

      {/* Paywall Modal */}
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </Layout>
  );
}
