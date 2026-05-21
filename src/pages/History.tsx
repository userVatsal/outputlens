import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Loader2, BarChart3, ChevronRight, Eye } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
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

  // SEO: Set page-specific document title
  useEffect(() => {
    document.title = 'Historical Risk & Scenario Reports | OutputLens';
  }, []);

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

  const handleViewAnalysis = (historyId: string) => {
    navigate(`/results?history=${historyId}`);
  };

  return (
    <AppShell>
      <div className="section-container py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/workspace">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-brand">Historical Risk & Scenario Reports</h1>
              <p className="text-muted-foreground">Click any analysis to view the full risk report</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : history.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">No risk reports yet</h2>
              <p className="text-muted-foreground mb-6">
                Perform your first risk analysis to build your history
              </p>
              <Button asChild>
                <Link to="/workspace">Perform Risk Analysis</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                const marketInfo = MARKETS[item.market];
                const date = new Date(item.created_at);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleViewAnalysis(item.id)}
                    className="w-full glass-card p-4 hover:border-primary/40 hover:bg-muted/30 transition-all duration-200 cursor-pointer text-left group"
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
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{date.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="h-4 w-4" />
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
