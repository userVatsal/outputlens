import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';
import { EnhancedTradeAnalysis } from '@/types/analysis';

interface Props {
  analysis: EnhancedTradeAnalysis;
}

const BUCKETS = [
  { key: 'upside',   label: 'Upside',   color: 'hsl(var(--bullish))',    icon: TrendingUp },
  { key: 'base',     label: 'Base',     color: 'hsl(var(--primary))',    icon: Activity },
  { key: 'downside', label: 'Downside', color: 'hsl(var(--caution))',    icon: TrendingDown },
  { key: 'tail',     label: 'Tail',     color: 'hsl(var(--destructive))',icon: AlertTriangle },
] as const;

export function ScenarioProbabilityDonut({ analysis }: Props) {
  const { data, total } = useMemo(() => {
    const sum = (arr: { probability: number }[]) =>
      arr.reduce((acc, s) => acc + (s.probability > 1 ? s.probability : s.probability * 100), 0);

    const raw = BUCKETS.map(b => ({
      name: b.label,
      value: sum((analysis.scenarios as any)[b.key] ?? []),
      color: b.color,
      key: b.key,
    }));
    const total = raw.reduce((acc, r) => acc + r.value, 0) || 1;
    return { data: raw.map(r => ({ ...r, pct: (r.value / total) * 100 })), total };
  }, [analysis.scenarios]);

  const dominant = [...data].sort((a, b) => b.value - a.value)[0];

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="rounded-md border border-border bg-popover/95 px-3 py-1.5 text-xs shadow-lg">
        <div className="flex items-center gap-2 font-mono">
          <span className="h-2 w-2 rounded-sm" style={{ background: d.color }} />
          <span className="text-muted-foreground">{d.name}</span>
          <span className="text-foreground tabular-nums">{d.pct.toFixed(1)}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden animate-fade-in">
      <div className="border-b border-border px-5 py-3">
        <h3 className="font-display text-sm font-semibold text-foreground">Scenario probabilities</h3>
        <p className="text-[11px] text-muted-foreground">Distribution of forecast outcomes by regime.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 p-5">
        <div className="relative h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={56}
                outerRadius={86}
                paddingAngle={2}
                stroke="hsl(var(--background))"
                strokeWidth={2}
                startAngle={90}
                endAngle={-270}
                isAnimationActive
                animationDuration={900}
                animationEasing="ease-out"
              >
                {data.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Dominant</div>
            <div className="font-display text-base font-semibold" style={{ color: dominant.color }}>
              {dominant.name}
            </div>
            <div className="font-mono text-xs tabular-nums text-muted-foreground">
              {dominant.pct.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 self-center">
          {data.map(d => {
            const Bucket = BUCKETS.find(b => b.key === d.key)!;
            const Icon = Bucket.icon;
            return (
              <div
                key={d.key}
                className="group rounded-md border border-border bg-elevated px-3 py-2 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  <Icon className="h-3 w-3" style={{ color: d.color }} />
                  {d.name}
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <span className="font-mono text-base font-semibold tabular-nums text-foreground">
                    {d.pct.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1.5 h-1 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${d.pct}%`, background: d.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}