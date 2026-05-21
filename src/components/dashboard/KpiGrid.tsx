import { Shield, TrendingDown, Gauge, Flame } from 'lucide-react';
import { TrackedAsset } from '@/hooks/useTrackedAssets';
import { cn } from '@/lib/utils';

interface Props {
  assets: TrackedAsset[];
  streak: number;
}

function KpiCard({
  label, value, sublabel, icon: Icon, tone = 'neutral',
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'neutral' | 'good' | 'warn' | 'bad';
}) {
  const toneCls = {
    neutral: 'border-border bg-card',
    good: 'border-bullish/30 bg-bullish/5',
    warn: 'border-primary/30 bg-primary/5',
    bad: 'border-bearish/30 bg-bearish/5',
  }[tone];

  const iconCls = {
    neutral: 'text-muted-foreground',
    good: 'text-bullish',
    warn: 'text-primary',
    bad: 'text-bearish',
  }[tone];

  return (
    <div className={cn('rounded-lg border p-4 transition-colors', toneCls)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <Icon className={cn('h-4 w-4', iconCls)} />
      </div>
      <div className="text-2xl font-mono font-semibold text-foreground tabular-nums">
        {value}
      </div>
      {sublabel && (
        <div className="text-xs text-muted-foreground mt-1 font-mono">{sublabel}</div>
      )}
    </div>
  );
}

export function KpiGrid({ assets, streak }: Props) {
  const active = assets.filter(a => a.status === 'active');
  const avgVar = active.length
    ? active.reduce((s, a) => s + (a.current_var95 ?? a.var95_at_track ?? 0), 0) / active.length
    : 0;
  const avgTail = active.length
    ? active.reduce((s, a) => s + (a.current_tail_risk ?? a.tail_risk_at_track ?? 0), 0) / active.length
    : 0;
  const deteriorating = active.filter(a => (a.risk_delta ?? 0) > 0.05).length;

  const varTone: 'good' | 'warn' | 'bad' = avgVar > 0.15 ? 'bad' : avgVar > 0.08 ? 'warn' : 'good';
  const tailTone: 'good' | 'warn' | 'bad' = avgTail > 0.2 ? 'bad' : avgTail > 0.1 ? 'warn' : 'good';
  const regimeTone: 'good' | 'warn' | 'bad' = deteriorating > 2 ? 'bad' : deteriorating > 0 ? 'warn' : 'good';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard
        label="Portfolio VaR (95%)"
        value={active.length ? `${(avgVar * 100).toFixed(1)}%` : '—'}
        sublabel="Avg across positions"
        icon={Shield}
        tone={active.length ? varTone : 'neutral'}
      />
      <KpiCard
        label="Expected Shortfall"
        value={active.length ? `${(avgTail * 100).toFixed(1)}%` : '—'}
        sublabel="Tail-risk magnitude"
        icon={TrendingDown}
        tone={active.length ? tailTone : 'neutral'}
      />
      <KpiCard
        label="Regime Stress"
        value={`${deteriorating}/${active.length || 0}`}
        sublabel="Deteriorating positions"
        icon={Gauge}
        tone={active.length ? regimeTone : 'neutral'}
      />
      <KpiCard
        label="Analysis Streak"
        value={`${streak}d`}
        sublabel={streak >= 7 ? 'On fire 🔥' : streak > 0 ? 'Keep it going' : 'Start today'}
        icon={Flame}
        tone={streak >= 7 ? 'good' : 'neutral'}
      />
    </div>
  );
}