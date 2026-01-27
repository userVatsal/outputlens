import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  ChevronRight,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Historical Risk Reports
          {reports.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {reports.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No analysis history</p>
            <p className="text-xs mb-4">Run your first analysis to build your history.</p>
            <Button size="sm" asChild>
              <Link to="/workspace">
                <BarChart3 className="h-4 w-4 mr-1.5" />
                Run Analysis
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((report) => {
              const marketInfo = MARKETS[report.market];
              const date = new Date(report.created_at);
              
              return (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/30 transition-all group cursor-pointer"
                  onClick={() => handleViewReport(report.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      report.direction === 'long' ? 'bg-bullish/10' : 'bg-bearish/10'
                    )}>
                      {report.direction === 'long' ? (
                        <TrendingUp className="h-4 w-4 text-bullish" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-bearish" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-foreground">
                          {report.asset}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] px-1.5",
                            report.direction === 'long' 
                              ? 'text-bullish border-bullish/30' 
                              : 'text-bearish border-bearish/30'
                          )}
                        >
                          {report.direction.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{format(date, 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span>{marketInfo.currencySymbol}{report.entry_price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRerun(report.asset, report.market);
                      }}
                      title="Re-run Risk Analysis"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              );
            })}
            
            <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
              <Link to="/history">
                View Full History
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
