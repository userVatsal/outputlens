import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SimulationResult } from '@/lib/scenarioEngine';

export type ScenarioKind = 'bull' | 'base' | 'bear';

export interface ScenarioColumnData {
  kind: ScenarioKind;
  driftLabel: string;
  volLabel: string;
  result: SimulationResult;
  winProb: number;       // %
  var95: number;         // %
  expReturn: number;     // %
  positionSize: number | null;
  asset: string;
}

function tone(kind: ScenarioKind) {
  if (kind === 'bull') return { name: 'BULL CASE', icon: '🐂', text: 'text-bullish', border: 'border-bullish/25', bg: 'bg-bullish/8', soft: 'text-bullish/60' };
  if (kind === 'bear') return { name: 'BEAR CASE', icon: '🐻', text: 'text-bearish', border: 'border-bearish/25', bg: 'bg-bearish/8', soft: 'text-bearish/60' };
  return { name: 'BASE CASE', icon: '◇', text: 'text-primary', border: 'border-primary/25', bg: 'bg-primary/8', soft: 'text-primary/60' };
}

function fmtPct(v: number) { const s = v > 0 ? '+' : ''; return `${s}${v.toFixed(1)}%`; }
function colored(v: number) { return v >= 0 ? 'text-bullish' : 'text-bearish'; }

export function ScenarioColumn({ data }: { data: ScenarioColumnData }) {
  const t = tone(data.kind);
  const { result } = data;
  const skewLabel = result.skewness > 0.5
    ? { text: 'Right-skewed — more upside tail', tone: 'text-bullish' }
    : result.skewness < -0.5
      ? { text: 'Left-skewed — more downside tail', tone: 'text-bearish' }
      : { text: 'Roughly symmetric distribution', tone: 'text-muted-foreground' };
  const kurtLabel = result.kurtosis > 1
    ? { text: 'Fat tails — extreme moves likely', tone: 'text-caution' }
    : null;

  const rows = [
    { label: 'P95 upside', value: result.percentiles.p95 },
    { label: 'P75', value: result.percentiles.p75 },
    { label: 'P25', value: result.percentiles.p25 },
    { label: 'P5 downside', value: result.percentiles.p5 },
  ];

  const best = data.positionSize ? data.positionSize * (result.percentiles.p95 / 100) : null;
  const worst = data.positionSize ? data.positionSize * (result.percentiles.p5 / 100) : null;

  return (
    <div>
      <div className={cn('flex items-center justify-between px-5 py-3 rounded-t-xl border border-b-0', t.bg, t.border)}>
        <div className={cn('font-mono font-bold text-[12px] uppercase tracking-[0.1em] flex items-center gap-2', t.text)}>
          <span>{t.icon}</span> {t.name}
        </div>
        <div className={cn('text-[10px] font-mono', t.soft)}>{data.driftLabel} · {data.volLabel}</div>
      </div>

      <div className="bg-surface border border-border/50 rounded-b-2xl p-5">
        {/* Top metrics */}
        <div className="grid grid-cols-3 gap-3 pb-4 mb-4 border-b border-border/30">
          <div>
            <div className="text-[10px] uppercase font-mono text-muted-foreground tracking-[0.08em]">Win Prob</div>
            <div className={cn('font-mono font-bold text-[24px] tabular-nums mt-1', data.winProb >= 50 ? 'text-bullish' : 'text-bearish')}>
              {data.winProb.toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono text-muted-foreground tracking-[0.08em]">VaR 95%</div>
            <div className="font-mono font-bold text-[24px] tabular-nums mt-1 text-bearish">{data.var95.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono text-muted-foreground tracking-[0.08em]">Exp Return</div>
            <div className={cn('font-mono font-bold text-[24px] tabular-nums mt-1', colored(data.expReturn))}>{fmtPct(data.expReturn)}</div>
          </div>
        </div>

        {/* Distribution shape */}
        <div className="space-y-1 mb-4">
          <p className={cn('font-mono text-[12px]', skewLabel.tone)}>{skewLabel.text}</p>
          {kurtLabel && <p className={cn('font-mono text-[12px]', kurtLabel.tone)}>{kurtLabel.text}</p>}
        </div>

        {/* Percentile table */}
        <div className="rounded-lg overflow-hidden border border-border/30">
          {rows.map((r, i) => (
            <div
              key={r.label}
              className={cn(
                'flex items-center justify-between px-3 py-2',
                i % 2 === 1 && 'bg-elevated/30'
              )}
            >
              <span className="font-mono text-[10px] uppercase text-muted-foreground tracking-[0.06em]">{r.label}</span>
              <span className={cn('font-mono font-semibold text-[14px] tabular-nums', colored(r.value))}>{fmtPct(r.value)}</span>
            </div>
          ))}
        </div>

        {data.positionSize && (
          <div className="mt-4 space-y-1">
            <div className="text-[10px] uppercase font-mono text-muted-foreground tracking-[0.06em]">At ${data.positionSize.toLocaleString()}:</div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-muted-foreground">Best (P95)</span>
              <span className="font-mono font-semibold text-[15px] text-bullish">+${Math.abs(best!).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-muted-foreground">Worst (P5)</span>
              <span className="font-mono font-semibold text-[15px] text-bearish">-${Math.abs(worst!).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        )}

        <Link
          to={`/workspace?asset=${data.asset}`}
          className="mt-4 inline-flex items-center justify-center w-full border border-primary/30 text-primary text-[13px] font-semibold rounded-xl px-4 h-[38px] hover:bg-primary/8 transition-colors"
        >
          Run Full Analysis
        </Link>
      </div>
    </div>
  );
}