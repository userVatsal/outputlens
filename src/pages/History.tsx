import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Loader2, BarChart3 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { MARKETS, Market, TradeDirection } from '@/types/trade';

interface AnalysisHistoryItem {
  id: string;
  asset: string;
  market: Market;
  direction: TradeDirection;
  entry_price: number;
  time_horizon: string;
  created_at: string;
}

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('analysis_history' as never)
        .select('id, asset, market, direction, entry_price, time_horizon, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50) as { data: AnalysisHistoryItem[] | null; error: unknown };

      if (data) {
        setHistory(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [navigate]);

  return (
    <Layout>
      <div className="section-container py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/analyze">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analysis History</h1>
              <p className="text-muted-foreground">Your recent trade analyses</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : history.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">No analyses yet</h2>
              <p className="text-muted-foreground mb-6">
                Start analyzing trades to build your history
              </p>
              <Button asChild>
                <Link to="/analyze">Analyze Your First Trade</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                const marketInfo = MARKETS[item.market];
                const date = new Date(item.created_at);
                
                return (
                  <div
                    key={item.id}
                    className="glass-card p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          item.direction === 'long' ? 'bg-bullish/10' : 'bg-bearish/10'
                        }`}>
                          {item.direction === 'long' ? (
                            <TrendingUp className="h-5 w-5 text-bullish" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-bearish" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-foreground">
                              {item.asset}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              item.direction === 'long' 
                                ? 'bg-bullish/10 text-bullish' 
                                : 'bg-bearish/10 text-bearish'
                            }`}>
                              {item.direction.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{marketInfo.name}</span>
                            <span>•</span>
                            <span>{marketInfo.currencySymbol}{item.entry_price.toLocaleString()}</span>
                            <span>•</span>
                            <span>{item.time_horizon}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{date.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
