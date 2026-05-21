import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, TrendingUp, TrendingDown, Loader2, BarChart3, Star, Filter, Clock } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { MARKETS, Market, TradeDirection } from '@/types/trade';
import { cn } from '@/lib/utils';

interface AnalysisHistoryItem {
  id: string;
  asset: string;
  market: Market;
  direction: TradeDirection;
  entry_price: number;
  time_horizon: string;
  created_at: string;
  results?: any;
}

type DirFilter = 'all' | 'long' | 'short';
const PIN_KEY = 'ol_pinned_history';

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dirFilter, setDirFilter] = useState<DirFilter>('all');
  const [assetFilter, setAssetFilter] = useState<string>('all');
  const [pinned, setPinned] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(PIN_KEY) || '[]')); }
    catch { return new Set(); }
  });

  const togglePin = (id: string) => {
    setPinned(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem(PIN_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  // SEO: Set page-specific document title
  useEffect(() => {
    document.title = 'Analysis History | OutputLens';
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
        .select('id, asset, market, direction, entry_price, time_horizon, created_at, results')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(100) as { data: AnalysisHistoryItem[] | null; error: unknown };

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

  // Stats
  const stats = useMemo(() => {
    const total = history.length;
    const longs = history.filter(h => h.direction === 'long').length;
    const shorts = total - longs;
    const last7 = history.filter(h => Date.now() - new Date(h.created_at).getTime() < 7 * 86400000).length;
    const uniqueAssets = new Set(history.map(h => h.asset)).size;
    return { total, longs, shorts, last7, uniqueAssets };
  }, [history]);

  const assets = useMemo(() => Array.from(new Set(history.map(h => h.asset))).sort(), [history]);

  const filtered = useMemo(() => {
    let list = history;
    if (dirFilter !== 'all') list = list.filter(h => h.direction === dirFilter);
    if (assetFilter !== 'all') list = list.filter(h => h.asset === assetFilter);
    // Pinned first
    return [...list].sort((a, b) => {
      const pa = pinned.has(a.id) ? 1 : 0;
      const pb = pinned.has(b.id) ? 1 : 0;
      if (pa !== pb) return pb - pa;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [history, dirFilter, assetFilter, pinned]);

  return (
    <AppShell>
      <div className="section-container py-6">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md flex items-center justify-center bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-semibold text-foreground">Analysis History</h1>
                <p className="text-sm text-muted-foreground">Your complete simulation archive — pinned first</p>
              </div>
            </div>
          </div>

          {/* Animated stats strip */}
          {!loading && history.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-fade-in">
              {[
                { label: 'Total runs', value: stats.total },
                { label: 'Last 7 days', value: stats.last7 },
                { label: 'Assets', value: stats.uniqueAssets },
                { label: 'Long', value: stats.longs, tone: 'bullish' as const },
                { label: 'Short', value: stats.shorts, tone: 'bearish' as const },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-border bg-card p-3 animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {s.label}
                  </div>
                  <div className={cn(
                    'text-2xl font-mono font-semibold tabular-nums mt-1',
                    s.tone === 'bullish' && 'text-bullish',
                    s.tone === 'bearish' && 'text-bearish',
                    !s.tone && 'text-foreground',
                  )}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          {!loading && history.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              {(['all', 'long', 'short'] as DirFilter[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDirFilter(d)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider border transition-colors',
                    dirFilter === d
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  )}
                >
                  {d}
                </button>
              ))}
              <span className="text-border mx-1">|</span>
              <select
                value={assetFilter}
                onChange={e => setAssetFilter(e.target.value)}
                className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider border border-border bg-background text-foreground"
              >
                <option value="all">All assets</option>
                {assets.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          )}

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map(item => {
                const marketInfo = MARKETS[item.market];
                const date = new Date(item.created_at);
                const isPinned = pinned.has(item.id);
                const win = item.results?.riskMetrics?.winProbability ?? item.results?.riskMetrics?.probabilityOfProfit;
                const var95 = item.results?.riskMetrics?.var95 ?? item.results?.riskMetrics?.valueAtRisk95;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'rounded-lg border bg-card p-4 hover:border-primary/40 transition-all group relative',
                      isPinned && 'border-primary/40 ring-1 ring-primary/20',
                      !isPinned && 'border-border'
                    )}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePin(item.id); }}
                      className="absolute top-3 right-3 opacity-60 hover:opacity-100"
                      aria-label={isPinned ? 'Unpin' : 'Pin'}
                    >
                      <Star className={cn('h-4 w-4', isPinned ? 'fill-primary text-primary' : 'text-muted-foreground')} />
                    </button>

                    <button onClick={() => handleViewAnalysis(item.id)} className="w-full text-left">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                          'p-2 rounded-lg',
                          item.direction === 'long' ? 'bg-bullish/10' : 'bg-bearish/10'
                        )}>
                          {item.direction === 'long'
                            ? <TrendingUp className="h-4 w-4 text-bullish" />
                            : <TrendingDown className="h-4 w-4 text-bearish" />
                          }
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-foreground">{item.asset}</span>
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              {item.direction}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {marketInfo.currencySymbol}{item.entry_price.toLocaleString()} · {item.time_horizon}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Win Prob</div>
                          <div className="font-mono text-sm text-foreground tabular-nums">
                            {win != null ? `${(win * 100).toFixed(1)}%` : '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">VaR 95%</div>
                          <div className="font-mono text-sm text-bearish tabular-nums">
                            {var95 != null ? `${(var95 * 100).toFixed(1)}%` : '—'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-3 font-mono">
                        <Calendar className="h-3 w-3" />
                        {date.toLocaleDateString()}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
