import { Shield, TrendingDown, Gauge, Flame } from 'lucide-react';
import { TrackedAsset } from '@/hooks/useTrackedAssets';
import { cn } from '@/lib/utils';

interface Props {
  assets: TrackedAsset[];
  streak: number;
}

function KpiCard({
  label, value, delta, icon: Icon, delay = 0,
}: {
  label: string;
  value: string;
  delta?: { value: number; suffix?: string } | null;
  icon: React.ComponentType<{ className?: string }>;
  delay?: number;
}) {
  const isPositive = delta && delta.value > 0;
  const isNegative = delta && delta.value < 0;

  return (
    <div
      className="card-quant rounded-xl bg-surface border border-border/50 p-5 animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="h-4 w-4" />
      </div>
      <div className="font-mono font-bold text-[28px] text-foreground tabular-nums mt-4 leading-none animate-count-flash">
        {value}
      </div>
      <div className="text-[12px] text-muted-foreground uppercase tracking-[0.08em] mt-1">
        {label}
      </div>
      {delta && (
        <div className={cn(
          'text-[12px] font-medium mt-2 font-mono tabular-nums',
          isPositive && 'text-bullish',
          isNegative && 'text-bearish',
          !isPositive && !isNegative && 'text-muted-foreground'
        )}>
          {isPositive ? '↑ ' : isNegative ? '↓ ' : ''}
          {Math.abs(delta.value).toFixed(1)}{delta.suffix ?? '%'}
        </div>
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
  const avgDelta = active.length
    ? active.reduce((s, a) => s + (a.risk_delta ?? 0), 0) / active.length
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard
        label="Portfolio VaR (95%)"
        value={active.length ? `${(avgVar * 100).toFixed(1)}%` : '—'}
        delta={active.length ? { value: avgDelta * 100 } : null}
        icon={Shield}
        delay={0}
      />
      <KpiCard
        label="Expected Shortfall"
        value={active.length ? `${(avgTail * 100).toFixed(1)}%` : '—'}
        icon={TrendingDown}
        delay={60}
      />
      <KpiCard
        label="Regime Stress"
        value={`${deteriorating}/${active.length || 0}`}
        icon={Gauge}
        delay={120}
      />
      <KpiCard
        label="Analysis Streak"
        value={`${streak}d`}
        icon={Flame}
        delay={180}
      />
    </div>
  );
}