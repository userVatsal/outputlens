import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { MARKETS, Market, TradeDirection } from '@/types/trade';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface RecentAnalysis {
  id: string;
  asset: string;
  market: Market;
  direction: TradeDirection;
  entry_price: number;
  created_at: string;
}

export function RecentReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<RecentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('analysis_history' as never)
        .select('id, asset, market, direction, entry_price, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5) as { data: RecentAnalysis[] | null };

      if (data) {
        setReports(data);
      }
      setLoading(false);
    };

    fetchReports();
  }, []);

  const handleViewReport = (id: string) => {
    navigate(`/results?history=${id}`);
  };

  const handleRerun = (asset: string, market: Market) => {
    navigate(`/workspace?asset=${asset}&market=${market}`);
  };

  return (
    <div className="rounded-xl bg-surface border border-border/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13px] font-semibold text-foreground">
          Historical Reports
          {reports.length > 0 && (
            <span className="ml-2 text-[10px] font-mono text-muted-foreground bg-elevated border border-border/40 rounded px-1.5 py-0.5">
              {reports.length}
            </span>
          )}
        </h2>
        {reports.length > 0 && (
          <Link to="/history" className="text-[12px] text-primary hover:underline inline-flex items-center gap-1 font-medium">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[13px] font-medium text-muted-foreground">No analysis history</p>
          <p className="text-[11px] text-muted-foreground/70 mb-4">Run your first analysis to build your history.</p>
          <Button size="sm" asChild>
            <Link to="/workspace">
              <BarChart3 className="h-4 w-4 mr-1.5" />
              Run Analysis
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {reports.map((report) => {
            const marketInfo = MARKETS[report.market];
            const date = new Date(report.created_at);

            return (
              <div
                key={report.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-elevated/40 transition-colors group cursor-pointer"
                onClick={() => handleViewReport(report.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    report.direction === 'long' ? 'bg-bullish/10' : 'bg-bearish/10'
                  )}>
                    {report.direction === 'long' ? (
                      <TrendingUp className="h-4 w-4 text-bullish" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-bearish" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-[13px] text-foreground">
                        {report.asset}
                      </span>
                      <span className={cn(
                        'text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border',
                        report.direction === 'long'
                          ? 'text-bullish border-bullish/30 bg-bullish/5'
                          : 'text-bearish border-bearish/30 bg-bearish/5'
                      )}>
                        {report.direction}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono tabular-nums mt-0.5">
                      {format(date, 'MMM d, yyyy')} · {marketInfo.currencySymbol}{report.entry_price.toLocaleString()}
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRerun(report.asset, report.market);
                  }}
                  title="Re-run analysis"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
