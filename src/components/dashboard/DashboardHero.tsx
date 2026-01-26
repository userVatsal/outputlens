import { Link } from 'react-router-dom';
import { Settings, CreditCard, Crown, Sparkles, Zap, User, ChevronRight, BarChart3, FileDown, Brain } from 'lucide-react';
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

const UPGRADE_FEATURES = [
  { icon: BarChart3, label: '30+ analyses/mo' },
  { icon: Zap, label: 'Live market data' },
  { icon: Brain, label: 'AI sentiment' },
  { icon: FileDown, label: 'PDF/CSV exports' },
];

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

  const isFreeUser = plan.plan === 'free';

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
          {isFreeUser && (
            <Button size="sm" asChild>
              <Link to="/pricing">
                <CreditCard className="h-4 w-4 mr-1.5" />
                Upgrade
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Upgrade nudge for free users */}
      {isFreeUser && (
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Upgrade to unlock:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {UPGRADE_FEATURES.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <span 
                        key={feature.label}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                      >
                        <Icon className="h-3 w-3 text-primary" />
                        {feature.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
            <Button size="sm" variant="outline" asChild className="whitespace-nowrap">
              <Link to="/pricing">
                See Plans
                <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
