import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/BrandLogo';
import { supabase } from '@/integrations/supabase/client';
import { MARKETS, Market, TradeDirection } from '@/types/trade';

interface DecisionHistoryItem {
  id: string;
  asset: string;
  market: Market;
  direction: TradeDirection;
  entry_price: number;
  time_horizon: string;
  created_at: string;
  results: {
    riskMetrics?: {
      valueAtRisk95?: number;
      probabilityOfProfit?: number;
    };
  };
}

export default function Decisions() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<DecisionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Your Decisions | OutputLens';
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data } = await supabase
        .from('analysis_history' as never)
        .select('id, asset, market, direction, entry_price, time_horizon, created_at, results')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50) as { data: DecisionHistoryItem[] | null };

      if (data) {
        setHistory(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
      <header className="border-b border-border">
        <div className="section-container py-4 flex items-center justify-between">
          <Link to="/">
            <BrandLogo size="md" />
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      <main className="section-container py-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Your Decisions</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Past risk analyses before trades
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground mb-4">
              No decisions yet
            </p>
            <Button asChild>
              <Link to="/">Analyze a trade</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => {
              const marketInfo = MARKETS[item.market];
              const date = new Date(item.created_at);
              const var95 = item.results?.riskMetrics?.valueAtRisk95;
              const probProfit = item.results?.riskMetrics?.probabilityOfProfit;

              return (
                <div
                  key={item.id}
                  className="glass-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-medium text-foreground">
                          {item.asset}
                        </span>
                        <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">
                          {item.direction === 'long' ? 'BUY' : 'SELL'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {marketInfo.currencySymbol}{item.entry_price.toLocaleString()} • {item.time_horizon}
                      </div>
                    </div>
                    <div className="text-right">
                      {var95 && (
                        <div className="font-mono text-sm" style={{ color: 'hsl(var(--risk))' }}>
                          -{Math.abs(var95).toFixed(1)}% VaR
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {date.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
