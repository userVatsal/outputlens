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
          <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground bg-muted/30">
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
            return (
              <Link
                key={a.id}
                to={`/workspace?asset=${a.symbol}`}
                className="grid grid-cols-12 px-4 py-3 text-sm hover:bg-muted/50 transition-colors items-center"
              >
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
                <div className="col-span-2 text-right font-mono text-bearish tabular-nums">
                  {(tail * 100).toFixed(1)}%
                </div>
                <div className={cn(
                  'col-span-3 text-right font-mono tabular-nums flex items-center justify-end gap-1',
                  delta > 0.02 ? 'text-bearish' : delta < -0.02 ? 'text-bullish' : 'text-muted-foreground'
                )}>
                  {delta > 0.02 ? <TrendingUp className="h-3 w-3" /> : delta < -0.02 ? <TrendingDown className="h-3 w-3" /> : null}
                  {delta > 0 ? '+' : ''}{(delta * 100).toFixed(1)}%
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}