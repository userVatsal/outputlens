import { useStreak } from '@/hooks/useStreak';

interface Props {
  profile: { full_name?: string | null } | null;
  used: number;
  limit: number;
  planLabel: string;
}

function daysLeftInBillingPeriod() {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 px-6 first:pl-0 last:pr-0 min-w-0">
      <div className="text-[11px] uppercase text-muted-foreground tracking-[0.08em] mb-1.5">
        {label}
      </div>
      {children}
    </div>
  );
}

export function ExecutiveStrip({ profile: _profile, used, limit, planLabel }: Props) {
  const { streak } = useStreak();
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const daysLeft = daysLeftInBillingPeriod();

  return (
    <div className="bg-surface border border-border/50 rounded-xl px-6 py-4 flex items-center gap-0 divide-x divide-border/40">
      <Cell label="Plan">
        <span className="inline-block text-primary bg-primary/10 border border-primary/20 rounded-md px-2 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wider">
          {planLabel}
        </span>
      </Cell>

      <Cell label="Analyses this month">
        <div className="font-mono font-semibold text-[20px] tabular-nums leading-none">
          <span className="text-foreground">{used}</span>
          <span className="text-muted-foreground"> / {limit || '∞'}</span>
        </div>
        <div className="mt-2 h-1 rounded-full bg-elevated overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </Cell>

      <Cell label="Billing period">
        <div className="font-mono font-semibold text-[20px] text-foreground tabular-nums leading-none">
          {daysLeft}
          <span className="text-muted-foreground text-[13px] font-normal ml-1">days left</span>
        </div>
      </Cell>

      <Cell label="Streak">
        <div className="font-mono font-semibold text-[20px] text-foreground tabular-nums leading-none">
          {streak}
          <span className="text-muted-foreground text-[13px] font-normal ml-1">
            {streak === 1 ? 'day' : 'days'}
          </span>
        </div>
      </Cell>
    </div>
  );
}