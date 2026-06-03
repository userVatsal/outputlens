import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

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
    return <div className="rounded-xl bg-surface border border-border/50 p-5 h-48 animate-pulse" />;
  }

  if (!recent) {
    return (
      <div className="rounded-xl bg-surface border border-border/50 p-5">
        <div className="text-[13px] font-semibold text-foreground mb-2">Latest Simulation</div>
        <p className="text-sm text-muted-foreground mb-4">
          No simulations yet. Run your first probabilistic analysis to see results here.
        </p>
        <Link to="/workspace" className="text-[13px] text-primary hover:underline inline-flex items-center gap-1 font-medium">
          Run your first simulation <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  const r = recent.results || {};
  const winProb = r.riskMetrics?.winProbability ?? r.winProbability ?? null;
  const var95 = r.riskMetrics?.var95 ?? null;
  const expectedReturn = r.riskMetrics?.expectedReturn ?? r.expectedReturn ?? r.riskMetrics?.meanReturn ?? null;
  const ago = Math.round((Date.now() - new Date(recent.created_at).getTime()) / 60000);
  const fresh = ago < 60 ? `${ago}m ago` : ago < 1440 ? `${Math.round(ago / 60)}h ago` : `${Math.round(ago / 1440)}d ago`;

  const Metric = ({ label, value, tone }: { label: string; value: string; tone?: 'bearish' | 'bullish' | 'foreground' }) => (
    <div>
      <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground mb-1.5">{label}</div>
      <div className={cn(
        'font-mono font-semibold text-[20px] tabular-nums leading-none',
        tone === 'bearish' && 'text-bearish',
        tone === 'bullish' && 'text-bullish',
        (!tone || tone === 'foreground') && 'text-foreground',
      )}>
        {value}
      </div>
    </div>
  );

  return (
    <div className="rounded-xl bg-surface border border-border/50 p-5">
      <div className="flex items-center gap-2 mb-5">
        <h3 className="text-[13px] font-semibold text-foreground">Latest Simulation</h3>
        <span className="font-mono text-primary text-[13px] ml-auto">{recent.asset}</span>
        <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
          <Clock className="h-3 w-3" /> {fresh}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <Metric label="VaR 95%" value={var95 != null ? `${(var95 * 100).toFixed(1)}%` : '—'} tone="bearish" />
        <Metric label="Win Probability" value={winProb != null ? `${(winProb * 100).toFixed(1)}%` : '—'} />
        <Metric
          label="Expected Return"
          value={expectedReturn != null ? `${expectedReturn > 0 ? '+' : ''}${(expectedReturn * 100).toFixed(1)}%` : '—'}
          tone={expectedReturn != null && expectedReturn >= 0 ? 'bullish' : expectedReturn != null ? 'bearish' : 'foreground'}
        />
      </div>

      <Link
        to={`/results?history=${recent.id}`}
        className="text-[13px] text-primary hover:underline inline-flex items-center gap-1 font-medium"
      >
        View full distribution <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}