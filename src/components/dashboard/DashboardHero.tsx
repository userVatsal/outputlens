import { Link } from 'react-router-dom';
import { Settings, CreditCard, Crown, Sparkles, Zap, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ProfileData } from '@/hooks/useProfile';
import { UsageData } from '@/hooks/useUsage';
import { PlanData } from '@/hooks/usePlan';
import { cn } from '@/lib/utils';

interface DashboardHeroProps {
  profile: ProfileData | null;
  usage: UsageData | null;
  plan: PlanData;
}

function PlanBadge({ plan }: { plan: string }) {
  const badges = {
    free: { label: 'Free Plan', icon: User, className: 'bg-muted text-muted-foreground' },
    basic: { label: 'Basic', icon: Zap, className: 'bg-blue-500/10 text-blue-500' },
    pro: { label: 'Pro', icon: Crown, className: 'bg-primary/10 text-primary' },
    enterprise: { label: 'Enterprise', icon: Sparkles, className: 'bg-amber-500/10 text-amber-600' },
  };
  
  const badge = badges[plan as keyof typeof badges] || badges.free;
  const Icon = badge.icon;
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
      badge.className
    )}>
      <Icon className="h-3.5 w-3.5" />
      {badge.label}
    </span>
  );
}

export function DashboardHero({ profile, usage, plan }: DashboardHeroProps) {
  const displayName = profile?.display_name || profile?.full_name || 'User';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const remainingAnalyses = usage 
    ? Math.max(usage.limit - usage.analysisCount, 0) 
    : 0;

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-background to-background p-6 md:p-8">
      {/* Headline & Sub-headline */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-brand mb-2">
          AI-Powered Risk & Scenario Intelligence
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Quantify downside before you trade. Monitor assets, simulate outcomes, and anticipate market shocks—all in one workspace.
        </p>
      </div>

      {/* User Status Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
            <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="text-sm font-semibold bg-muted">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground">{displayName}</span>
            <span className="text-muted-foreground">|</span>
            <PlanBadge plan={plan.plan} />
            <span className="text-muted-foreground">–</span>
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{remainingAnalyses}</span> Analyses Remaining
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/account">
              <Settings className="h-4 w-4 mr-1.5" />
              Settings
            </Link>
          </Button>
          {plan.plan === 'free' && (
            <Button size="sm" asChild>
              <Link to="/pricing">
                <CreditCard className="h-4 w-4 mr-1.5" />
                Upgrade
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
