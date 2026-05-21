import { useEffect, useMemo } from 'react';
import { Activity, TrendingDown, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { useTrackedAssets } from '@/hooks/useTrackedAssets';
import { cn } from '@/lib/utils';

type RegimeState = 'BULL' | 'NEUTRAL' | 'CHOPPY' | 'CRISIS';

const regimeMeta: Record<RegimeState, { bg: string; ring: string; text: string; label: string; desc: string }> = {
  BULL: {
    bg: 'bg-bullish/10',
    ring: 'ring-bullish/30',
    text: 'text-bullish',
    label: 'BULL · LOW VOL',
    desc: 'Risk-on conditions. Most positions trending in line with thesis.',
  },
  NEUTRAL: {
    bg: 'bg-muted/30',
    ring: 'ring-border',
    text: 'text-foreground',
    label: 'NEUTRAL · MIXED',
    desc: 'No dominant regime. Cross-asset signals are mixed — selectivity wins.',
  },
  CHOPPY: {
    bg: 'bg-primary/10',
    ring: 'ring-primary/30',
    text: 'text-primary',
    label: 'CHOPPY · ELEVATED VOL',
    desc: 'Volatility expanding. Tail risk drifting higher across watchlist.',
  },
  CRISIS: {
    bg: 'bg-bearish/10',
    ring: 'ring-bearish/30',
    text: 'text-bearish',
    label: 'CRISIS · HIGH STRESS',
    desc: 'Multiple positions deteriorating fast. Rebalance defensively now.',
  },
};

export default function Regime() {
  const { trackedAssets, isLoading } = useTrackedAssets();

  useEffect(() => { document.title = 'Regime Monitor | OutputLens'; }, []);

  const { regime, deteriorating, stable, improving } = useMemo(() => {
    const active = trackedAssets.filter(a => a.status === 'active');
    const det = active.filter(a => (a.risk_delta ?? 0) > 0.05).length;
    const imp = active.filter(a => (a.risk_delta ?? 0) < -0.05).length;
    const stb = active.length - det - imp;
    let r: RegimeState = 'NEUTRAL';
    if (active.length === 0) r = 'NEUTRAL';
    else if (det / active.length > 0.5) r = 'CRISIS';
    else if (det / active.length > 0.25) r = 'CHOPPY';
    else if (imp / active.length > 0.5) r = 'BULL';
    return { regime: r, deteriorating: det, stable: stb, improving: imp };
  }, [trackedAssets]);

  const meta = regimeMeta[regime];
  const active = trackedAssets.filter(a => a.status === 'active');

  return (
    <AppShell>
      <div className="section-container py-6">
        <div className="max-w-5xl mx-auto space-y-6">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md flex items-center justify-center bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-semibold text-foreground">Regime Monitor</h1>
              <p className="text-sm text-muted-foreground">Cross-asset regime signal from your tracked positions</p>
            </div>
          </div>

          {/* Hero regime status */}
          <div className={cn('rounded-xl ring-1 p-8', meta.bg, meta.ring)}>
            <div className="flex items-center gap-2 mb-3">
              <span className={cn('w-2 h-2 rounded-full animate-pulse', regime === 'CRISIS' ? 'bg-bearish' : regime === 'BULL' ? 'bg-bullish' : 'bg-primary')} />
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Current regime</span>
            </div>
            <div className={cn('text-3xl md:text-4xl font-display font-bold mb-2', meta.text)}>
              {meta.label}
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">{meta.desc}</p>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Deteriorating</div>
                <div className="text-2xl font-mono tabular-nums text-bearish mt-1">{deteriorating}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Stable</div>
                <div className="text-2xl font-mono tabular-nums text-foreground mt-1">{stable}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Improving</div>
                <div className="text-2xl font-mono tabular-nums text-bullish mt-1">{improving}</div>
              </div>
            </div>
          </div>

          {/* Watchlist with divergence */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="font-display font-semibold text-foreground">Watchlist divergence</h2>
              <Link to="/tracked-assets" className="text-xs text-primary hover:underline flex items-center gap-1">
                Manage <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
            ) : active.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground mb-3">No assets tracked.</p>
                <Link to="/workspace" className="text-sm text-primary hover:underline">Run analysis →</Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {active.map(a => {
                  const delta = a.risk_delta ?? 0;
                  const moving = Math.abs(delta) > 0.05;
                  const dir = delta > 0 ? 'up' : 'down';
                  return (
                    <div key={a.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className="col-span-3 flex items-center gap-2">
                        {moving && (
                          <span className={cn(
                            'w-1.5 h-1.5 rounded-full animate-pulse',
                            dir === 'up' ? 'bg-bearish' : 'bg-bullish'
                          )} />
                        )}
                        <span className="font-mono font-semibold text-foreground">{a.symbol}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{a.direction}</span>
                      </div>
                      <div className="col-span-4 text-xs text-muted-foreground font-mono">
                        VaR {((a.current_var95 ?? a.var95_at_track ?? 0) * 100).toFixed(1)}%
                        <span className="mx-2 text-border">|</span>
                        Tail {((a.current_tail_risk ?? a.tail_risk_at_track ?? 0) * 100).toFixed(1)}%
                      </div>
                      <div className={cn(
                        'col-span-3 text-right font-mono text-sm tabular-nums flex items-center justify-end gap-1',
                        delta > 0.02 ? 'text-bearish' : delta < -0.02 ? 'text-bullish' : 'text-muted-foreground'
                      )}>
                        {dir === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {delta > 0 ? '+' : ''}{(delta * 100).toFixed(1)}%
                      </div>
                      <div className="col-span-2 text-right">
                        <Link to={`/workspace?asset=${a.symbol}`} className="text-xs text-primary hover:underline">
                          Re-analyze
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}