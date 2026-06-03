import { cn } from '@/lib/utils';
import { JournalStats as Stats } from '@/hooks/useJournal';

function fmtPct(v: number) {
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}%`;
}
function fmtUsd(v: number) {
  const sign = v < 0 ? '-' : '';
  return `${sign}$${Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function Cell({ label, value, tone }: { label: string; value: string; tone?: 'bullish' | 'bearish' | 'caution' | 'foreground' }) {
  const color = tone === 'bullish' ? 'text-bullish'
    : tone === 'bearish' ? 'text-bearish'
    : tone === 'caution' ? 'text-caution'
    : 'text-foreground';
  return (
    <div>
      <div className="text-[10px] uppercase font-mono text-muted-foreground tracking-[0.1em]">{label}</div>
      <div className={cn('font-mono font-bold text-[24px] tabular-nums mt-1', color)}>{value}</div>
    </div>
  );
}

export function JournalStats({ stats }: { stats: Stats }) {
  const winRatePct = stats.winRate * 100;
  const modelAccPct = stats.modelAccuracy * 100;
  const winRateTone = winRatePct > 50 ? 'bullish' : winRatePct === 0 ? 'foreground' : 'bearish';
  const modelTone = modelAccPct > 75 ? 'bullish' : modelAccPct >= 50 ? 'caution' : 'bearish';

  const insight = stats.totalTrades === 0
    ? { text: 'Keep logging to see model calibration.', tone: 'muted' }
    : modelAccPct > 75
      ? { text: 'Your risk model is conservative. OutputLens tends to overestimate downside.', tone: 'bullish' }
      : modelAccPct < 50
        ? { text: 'Your positions are exceeding predicted risk bounds. Consider reducing size.', tone: 'bearish' }
        : { text: 'Risk model tracking within expected bands.', tone: 'muted' };

  return (
    <div className="bg-surface border border-border/50 rounded-2xl p-6 lg:sticky lg:top-6">
      <h2 className="text-[13px] font-semibold text-foreground">Performance vs Model</h2>
      <p className="text-[11px] text-muted-foreground mt-1">{stats.totalTrades} closed trades</p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-5 mt-5">
        <Cell label="Win Rate" value={`${winRatePct.toFixed(0)}%`} tone={winRateTone} />
        <Cell label="Model Acc." value={`${modelAccPct.toFixed(0)}%`} tone={modelTone} />
        <Cell label="Avg Win" value={fmtPct(stats.avgWin)} tone="bullish" />
        <Cell label="Avg Loss" value={fmtPct(stats.avgLoss)} tone="bearish" />
        <Cell label="Expectancy" value={fmtPct(stats.expectancy)} tone={stats.expectancy >= 0 ? 'bullish' : 'bearish'} />
        <Cell label="Total P&L" value={fmtUsd(stats.totalPnL)} tone={stats.totalPnL >= 0 ? 'bullish' : 'bearish'} />
      </div>

      <p className={cn(
        'mt-5 text-[12px]',
        insight.tone === 'bullish' && 'text-bullish',
        insight.tone === 'bearish' && 'text-bearish',
        insight.tone === 'muted' && 'text-muted-foreground',
      )}>
        {insight.text}
      </p>

      <div className="mt-5">
        <div className="h-3 w-full rounded-full overflow-hidden flex bg-elevated">
          <div className="bg-bullish h-full" style={{ width: `${winRatePct}%` }} />
          <div className="bg-bearish h-full flex-1" />
        </div>
        <p className="font-mono text-[11px] text-muted-foreground mt-2">
          {stats.wins} wins · {stats.losses} losses
        </p>
      </div>
    </div>
  );
}