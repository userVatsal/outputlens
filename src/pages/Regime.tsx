import { useEffect, useMemo } from 'react';
import { Activity, TrendingDown, TrendingUp, ArrowRight, Bell, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { useTrackedAssets } from '@/hooks/useTrackedAssets';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePlan } from '@/hooks/usePlan';
import { UpgradePrompt } from '@/components/FeatureGate';

type RegimeState = 'BULL' | 'NEUTRAL' | 'CHOPPY' | 'CRISIS';

const regimeMeta: Record<
  RegimeState,
  { tone: string; ring: string; dot: string; text: string; label: string; desc: string; duration: string }
> = {
  BULL: {
    tone: 'bg-bullish/10',
    ring: 'border-bullish/30',
    dot: 'bg-bullish',
    text: 'text-bullish',
    label: '● LOW VOLATILITY',
    desc: 'Risk-on conditions. Most positions trending in line with thesis.',
    duration: 'Duration est. 14–60 days',
  },
  NEUTRAL: {
    tone: 'bg-muted/30',
    ring: 'border-border',
    dot: 'bg-foreground/60',
    text: 'text-foreground',
    label: '● NEUTRAL · MIXED',
    desc: 'No dominant regime. Cross-asset signals are mixed — selectivity wins.',
    duration: 'Duration est. 5–21 days',
  },
  CHOPPY: {
    tone: 'bg-[hsl(38_92%_52%/0.10)]',
    ring: 'border-[hsl(38_92%_52%/0.35)]',
    dot: 'bg-[hsl(38_92%_52%)]',
    text: 'text-[hsl(38_92%_62%)]',
    label: '● HIGH VOLATILITY',
    desc: 'Volatility expanding. Tail risk drifting higher across watchlist.',
    duration: 'Duration est. 8–34 days',
  },
  CRISIS: {
    tone: 'bg-bearish/10',
    ring: 'border-bearish/30',
    dot: 'bg-bearish',
    text: 'text-bearish',
    label: '● HIGH STRESS',
    desc: 'Multiple positions deteriorating fast. Rebalance defensively now.',
    duration: 'Duration est. 3–14 days',
  },
};

export default function Regime() {
  const { trackedAssets, isLoading } = useTrackedAssets();
  const { plan, isLoading: planLoading } = usePlan();

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
  const total = Math.max(active.length, 1);
  const confidence = Math.min(99, Math.round(50 + (Math.max(deteriorating, improving) / total) * 50 * 10) / 10);
  const since = new Date(Date.now() - 1000 * 60 * 60 * Math.max(3, deteriorating * 2 + 4))
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!planLoading && plan === 'free') {
    return (
      <AppShell>
        <div className="section-container py-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md flex items-center justify-center bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-semibold text-foreground">Regime Monitor</h1>
                <p className="text-sm text-muted-foreground">Available on the Starter plan and above</p>
              </div>
            </div>
            <UpgradePrompt feature="sentiment" />
          </div>
        </div>
      </AppShell>
    );
  }

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
          <div className={cn('rounded-xl border p-6 sm:p-8', meta.tone, meta.ring)}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full animate-pulse', meta.dot)} />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Current regime
                  </span>
                </div>
                <div className={cn('font-display text-2xl sm:text-3xl font-bold tracking-tight', meta.text)}>
                  {meta.label}
                </div>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{meta.desc}</p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-muted-foreground">
                  <span>
                    Confidence{' '}
                    <span className="tabular-nums text-foreground">{confidence.toFixed(1)}%</span>
                  </span>
                  <span>
                    Active since <span className="tabular-nums text-foreground">{since}</span>
                  </span>
                  <span className="text-foreground/80">{meta.duration}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                <Button variant="outline" size="sm" asChild className="min-h-[44px]">
                  <Link to="/alerts">
                    <Bell className="mr-2 h-4 w-4" />
                    Set alert
                  </Link>
                </Button>
                <Button size="sm" asChild className="min-h-[44px]">
                  <Link to="/workspace">
                    <Play className="mr-2 h-4 w-4" />
                    Run simulation
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border/50 pt-5">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Deteriorating
                </div>
                <div className="mt-1 font-mono text-2xl tabular-nums text-bearish">{deteriorating}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Stable
                </div>
                <div className="mt-1 font-mono text-2xl tabular-nums text-foreground">{stable}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Improving
                </div>
                <div className="mt-1 font-mono text-2xl tabular-nums text-bullish">{improving}</div>
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