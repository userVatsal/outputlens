import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Crown, User } from 'lucide-react';
import { ProfileData } from '@/hooks/useProfile';
import { UsageData } from '@/hooks/useUsage';
import { PlanData } from '@/hooks/usePlan';

interface DashboardHeroProps {
  profile: ProfileData | null;
  usage: UsageData | null;
  plan: PlanData;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function PlanBadge({ plan }: { plan: string }) {
  if (plan === 'free') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
      <User className="h-3 w-3" /> Free
    </span>
  );
  if (plan === 'pro') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
      <Crown className="h-3 w-3" /> Pro
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
      <Zap className="h-3 w-3" /> {plan}
    </span>
  );
}

export function DashboardHero({ profile, usage, plan }: DashboardHeroProps) {
  const firstName = profile?.display_name?.split(' ')[0] || profile?.full_name?.split(' ')[0] || 'there';
  const remaining = usage ? Math.max(usage.limit - usage.analysisCount, 0) : null;
  const isFreeUser = plan.plan === 'free';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold font-display text-foreground">
              {getGreeting()}, {firstName}
            </h1>
            <PlanBadge plan={plan.plan} />
          </div>
          <p className="text-sm text-muted-foreground">
            {remaining !== null
              ? `${remaining} of ${usage?.limit} analyses remaining this month`
              : 'Your risk intelligence dashboard'}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {isFreeUser && (
          <Link
            to="/pricing"
            className="text-sm font-medium text-primary hover:underline hidden sm:block"
          >
            Upgrade plan
          </Link>
        )}
        <Link
          to="/workspace"
          className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold text-white transition-all hover:opacity-90 group"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          Run Analysis
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
