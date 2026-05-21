import { ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TrackedAsset } from '@/hooks/useTrackedAssets';
import { cn } from '@/lib/utils';

interface Props {
  assets: TrackedAsset[];
}

export function PositionsTable({ assets }: Props) {
  const sorted = [...assets]
    .filter(a => a.status === 'active')
    .sort((a, b) => (b.current_tail_risk ?? 0) - (a.current_tail_risk ?? 0))
    .slice(0, 8);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="font-display font-semibold text-foreground">Tracked Positions</h2>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            sorted by tail risk
          </span>
        </div>
        <Link to="/tracked-assets" className="text-xs text-primary hover:underline flex items-center gap-1">
          Manage <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">No positions tracked yet</p>
          <Link to="/workspace" className="text-sm text-primary hover:underline">
            Run your first analysis →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-12 px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground bg-muted/30">
            <div className="col-span-3">Asset</div>
            <div className="col-span-2 text-right">Entry</div>
            <div className="col-span-2 text-right">VaR 95%</div>
            <div className="col-span-2 text-right">Tail</div>
            <div className="col-span-3 text-right">Δ vs track</div>
          </div>
          {sorted.map(a => {
            const delta = a.risk_delta ?? 0;
            const var95 = a.current_var95 ?? a.var95_at_track ?? 0;
            const tail = a.current_tail_risk ?? a.tail_risk_at_track ?? 0;
            const tailPct = Math.min(100, Math.max(0, tail * 100 * 2)); // 0-100 risk bar
            const tailColor = tailPct < 30 ? 'hsl(var(--bullish))' : tailPct < 60 ? 'hsl(var(--caution))' : 'hsl(var(--bearish))';
            return (
              <Link
                key={a.id}
                to={`/workspace?asset=${a.symbol}`}
                className="block hover:bg-muted/40 transition-colors"
              >
                {/* Desktop row */}
                <div className="hidden md:grid grid-cols-12 px-4 py-3 text-sm items-center">
                  <div className="col-span-3">
                    <div className="font-mono font-semibold text-foreground">{a.symbol}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">{a.direction}</div>
                  </div>
                  <div className="col-span-2 text-right font-mono text-foreground tabular-nums">
                    ${a.entry_price.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right font-mono text-foreground tabular-nums">
                    {(var95 * 100).toFixed(1)}%
                  </div>
                  <div className="col-span-2 text-right font-mono text-bearish tabular-nums flex items-center justify-end gap-2">
                    <div className="hidden lg:block h-1 w-12 rounded-full bg-border overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${tailPct}%`, background: tailColor }} />
                    </div>
                    {(tail * 100).toFixed(1)}%
                  </div>
                  <div className={cn(
                    'col-span-3 text-right font-mono tabular-nums flex items-center justify-end gap-1',
                    delta > 0.02 ? 'text-bearish' : delta < -0.02 ? 'text-bullish' : 'text-muted-foreground'
                  )}>
                    {delta > 0.02 ? <TrendingUp className="h-3 w-3" /> : delta < -0.02 ? <TrendingDown className="h-3 w-3" /> : null}
                    {delta > 0 ? '+' : ''}{(delta * 100).toFixed(1)}%
                  </div>
                </div>
                {/* Mobile card */}
                <div className="md:hidden p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono font-semibold text-foreground text-base">{a.symbol}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">{a.direction} · Entry ${a.entry_price.toFixed(2)}</div>
                    </div>
                    <div className={cn(
                      'font-mono text-xs tabular-nums flex items-center gap-1',
                      delta > 0.02 ? 'text-bearish' : delta < -0.02 ? 'text-bullish' : 'text-muted-foreground'
                    )}>
                      {delta > 0.02 ? <TrendingUp className="h-3 w-3" /> : delta < -0.02 ? <TrendingDown className="h-3 w-3" /> : null}
                      Δ {delta > 0 ? '+' : ''}{(delta * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground uppercase text-[10px]">VaR </span>
                      <span className="font-mono text-foreground tabular-nums">{(var95 * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground uppercase text-[10px]">Tail </span>
                      <span className="font-mono text-bearish tabular-nums">{(tail * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-1 w-full rounded-full bg-border overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${tailPct}%`, background: tailColor }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}