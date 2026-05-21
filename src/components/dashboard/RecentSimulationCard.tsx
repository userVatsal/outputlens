import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Recent {
  id: string;
  asset: string;
  direction: string;
  created_at: string;
  results: any;
}

export function RecentSimulationCard() {
  const [recent, setRecent] = useState<Recent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('analysis_history')
        .select('id, asset, direction, created_at, results')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setRecent(data as any);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="glass-card p-6 h-48 animate-pulse" />;
  }

  if (!recent) {
    return (
      <div className="glass-card p-6 flex flex-col justify-center items-start gap-3">
        <h3 className="font-display font-semibold text-foreground">No simulations yet</h3>
        <p className="text-sm text-muted-foreground">
          Run your first probabilistic analysis to see results here.
        </p>
        <Link to="/workspace" className="text-sm text-primary hover:underline flex items-center gap-1">
          Open Workspace <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  const r = recent.results || {};
  const winProb = r.riskMetrics?.winProbability ?? r.winProbability ?? null;
  const var95 = r.riskMetrics?.var95 ?? null;
  const ago = Math.round((Date.now() - new Date(recent.created_at).getTime()) / 60000);
  const fresh = ago < 60 ? `${ago}m ago` : ago < 1440 ? `${Math.round(ago / 60)}h ago` : `${Math.round(ago / 1440)}d ago`;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Last simulation
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h3 className="font-mono font-semibold text-lg text-foreground">{recent.asset}</h3>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {recent.direction}
            </span>
          </div>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" /> {fresh}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
            Win Probability
          </div>
          <div className="font-mono text-xl tabular-nums text-foreground">
            {winProb != null ? `${(winProb * 100).toFixed(1)}%` : '—'}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
            VaR 95%
          </div>
          <div className="font-mono text-xl tabular-nums text-bearish">
            {var95 != null ? `${(var95 * 100).toFixed(1)}%` : '—'}
          </div>
        </div>
      </div>

      <Link
        to={`/results?history=${recent.id}`}
        className="text-sm text-primary hover:underline flex items-center gap-1"
      >
        View full distribution <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}