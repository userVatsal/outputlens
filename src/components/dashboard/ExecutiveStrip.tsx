import { Flame, TrendingUp, Zap, Activity } from 'lucide-react';
import { useStreak } from '@/hooks/useStreak';
import { useMarketStatus } from '@/hooks/useMarketStatus';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Props {
  profile: { full_name?: string | null } | null;
  usage: { used: number; limit: number } | null;
  plan: { tier: string };
}

export function ExecutiveStrip({ profile, usage, plan }: Props) {
  const { streak } = useStreak();
  const market = useMarketStatus();
  const first = (profile?.full_name || 'Analyst').split(' ')[0];
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const used = usage?.used ?? 0;
  const limit = usage?.limit ?? 0;
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const nearLimit = pct >= 80;

  return (
    <div className="glass-card p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-display font-semibold text-foreground">
            {greet}, {first}
          </h1>
          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            {plan.tier}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${market.isOpen ? 'bg-bullish animate-pulse' : 'bg-muted-foreground/50'}`} />
            NYSE {market.status}
          </span>
          {streak > 0 && (
            <span className="flex items-center gap-1 text-foreground">
              <Flame className="h-3.5 w-3.5 text-bearish" />
              {streak}-day streak
            </span>
          )}
          <span className="flex items-center gap-1">
            <Activity className="h-3.5 w-3.5" />
            {used}/{limit} analyses
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {nearLimit && (
          <Button variant="outline" size="sm" asChild>
            <Link to="/pricing">
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Upgrade
            </Link>
          </Button>
        )}
        <Button asChild size="sm" className="bg-primary text-primary-foreground">
          <Link to="/workspace">
            <TrendingUp className="h-4 w-4 mr-1.5" />
            New Simulation
          </Link>
        </Button>
      </div>
    </div>
  );
}