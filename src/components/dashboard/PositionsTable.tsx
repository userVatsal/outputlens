import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TrackedAsset } from '@/hooks/useTrackedAssets';
import { cn } from '@/lib/utils';

interface Props {
  assets: TrackedAsset[];
}

function riskBucket(tail: number): { label: 'LOW' | 'MED' | 'HIGH'; tone: string } {
  if (tail > 0.2) return { label: 'HIGH', tone: 'text-bearish bg-bearish/10 border-bearish/20' };
  if (tail > 0.1) return { label: 'MED', tone: 'text-caution bg-caution/10 border-caution/20' };
  return { label: 'LOW', tone: 'text-bullish bg-bullish/10 border-bullish/20' };
}

export function PositionsTable({ assets }: Props) {
  const sorted = [...assets]
    .filter(a => a.status === 'active')
    .sort((a, b) => (b.current_tail_risk ?? 0) - (a.current_tail_risk ?? 0))
    .slice(0, 8);

  return (
    <div className="rounded-xl bg-surface border border-border/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13px] font-semibold text-foreground">Tracked Positions</h2>
        <Link to="/tracked-assets" className="text-[12px] text-primary hover:underline inline-flex items-center gap-1 font-medium">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-[13px] text-muted-foreground mb-3">No positions tracked yet</p>
          <Link to="/workspace" className="text-[13px] text-primary hover:underline font-medium">
            Run your first analysis →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full">
            <thead>
              <tr className="text-[11px] uppercase text-muted-foreground tracking-[0.08em] font-medium border-b border-border/40">
                <th className="text-left font-medium pb-2 px-2">Asset</th>
                <th className="text-left font-medium pb-2 px-2 hidden sm:table-cell">Market</th>
                <th className="text-right font-medium pb-2 px-2">Entry</th>
                <th className="text-center font-medium pb-2 px-2">Risk Score</th>
                <th className="text-right font-medium pb-2 px-2">Change</th>
                <th className="text-right font-medium pb-2 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(a => {
                const delta = a.risk_delta ?? 0;
                const tail = a.current_tail_risk ?? a.tail_risk_at_track ?? 0;
                const risk = riskBucket(tail);
                return (
                  <tr
                    key={a.id}
                    className="h-12 hover:bg-elevated/30 transition-colors border-b border-border/20 last:border-0"
                  >
                    <td className="px-2">
                      <div className="font-mono font-medium text-[14px] text-foreground">{a.symbol}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{a.direction}</div>
                    </td>
                    <td className="px-2 hidden sm:table-cell">
                      <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-elevated border border-border/40 rounded px-1.5 py-0.5">
                        {a.market}
                      </span>
                    </td>
                    <td className="px-2 text-right font-mono text-[13px] text-foreground tabular-nums">
                      ${a.entry_price.toFixed(2)}
                    </td>
                    <td className="px-2 text-center">
                      <span className={cn(
                        'inline-block text-[10px] font-mono font-semibold uppercase tracking-wider border rounded-md px-1.5 py-0.5',
                        risk.tone
                      )}>
                        {risk.label}
                      </span>
                    </td>
                    <td className={cn(
                      'px-2 text-right font-mono text-[13px] tabular-nums',
                      delta > 0.02 ? 'text-bearish' : delta < -0.02 ? 'text-bullish' : 'text-muted-foreground'
                    )}>
                      <span className="inline-flex items-center gap-1 justify-end">
                        {delta > 0.02 ? <TrendingUp className="h-3 w-3" /> : delta < -0.02 ? <TrendingDown className="h-3 w-3" /> : null}
                        {delta > 0 ? '+' : ''}{(delta * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-2 text-right">
                      <Link
                        to={`/workspace?asset=${a.symbol}`}
                        className="text-primary text-[12px] hover:underline font-medium"
                      >
                        Analyse
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}