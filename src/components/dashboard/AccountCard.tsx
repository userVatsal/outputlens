import { Link } from 'react-router-dom';
import { User, Settings, CreditCard, Crown, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileData } from '@/hooks/useProfile';
import { UsageData } from '@/hooks/useUsage';
import { PlanData } from '@/hooks/usePlan';
import { cn } from '@/lib/utils';

interface AccountCardProps {
  profile: ProfileData | null;
  usage: UsageData | null;
  plan: PlanData;
}

function PlanBadge({ plan }: { plan: string }) {
  const badges = {
    free: { label: 'Free', icon: User, className: 'bg-muted text-muted-foreground' },
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

export function AccountCard({ profile, usage, plan }: AccountCardProps) {
  const displayName = profile?.display_name || profile?.full_name || 'User';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const usagePercent = usage 
    ? Math.min((usage.analysisCount / usage.limit) * 100, 100) 
    : 0;
  
  const remainingAnalyses = usage 
    ? Math.max(usage.limit - usage.analysisCount, 0) 
    : 0;

  return (
    <Card className="overflow-hidden">
      <div className="h-16 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
      <CardContent className="-mt-8 pt-0">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-4 border-background shadow-md">
            <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="text-lg font-semibold bg-muted">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 pt-8">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-semibold text-lg text-foreground">{displayName}</h2>
              <PlanBadge plan={plan.plan} />
            </div>
            
            {profile?.username && (
              <p className="text-sm text-muted-foreground mb-3">@{profile.username}</p>
            )}
          </div>
        </div>

        {/* Usage Meter */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Analyses This Month</span>
            <span className="font-medium">
              {usage?.analysisCount || 0} / {usage?.limit || 0}
            </span>
          </div>
          <Progress value={usagePercent} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {remainingAnalyses} analyses remaining
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link to="/account">
              <Settings className="h-4 w-4 mr-1.5" />
              Settings
            </Link>
          </Button>
          {plan.plan === 'free' && (
            <Button size="sm" asChild className="flex-1">
              <Link to="/pricing">
                <CreditCard className="h-4 w-4 mr-1.5" />
                Upgrade
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
