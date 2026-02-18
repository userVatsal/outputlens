import { Link } from 'react-router-dom';
import { Settings, Crown, User, Zap, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileData } from '@/hooks/useProfile';
import { PlanData } from '@/hooks/usePlan';
import { cn } from '@/lib/utils';

interface AccountHeaderProps {
  profile: ProfileData | null;
  plan: PlanData;
}

function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, { label: string; icon: typeof User; className: string }> = {
    free: { label: 'Free', icon: User, className: 'bg-muted text-muted-foreground' },
    starter: { label: 'Starter', icon: Zap, className: 'bg-primary/10 text-primary' },
    pro: { label: 'Pro', icon: Crown, className: 'bg-primary/10 text-primary' },
    trader: { label: 'Trader', icon: Zap, className: 'bg-primary/10 text-primary' },
  };
  const b = map[plan] || map.free;
  const Icon = b.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold', b.className)}>
      <Icon className="h-3 w-3" />{b.label}
    </span>
  );
}

export function AccountHeader({ profile, plan }: AccountHeaderProps) {
  const displayName = profile?.display_name || profile?.full_name || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="flex items-center gap-3">
        <Link to="/account" className="relative group">
          <Avatar className="h-10 w-10 border border-border ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
            <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{displayName}</span>
            <PlanBadge plan={plan.plan} />
          </div>
          {profile?.username && (
            <span className="text-xs text-muted-foreground">@{profile.username}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/account" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors">
          <Settings className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Settings</span>
        </Link>
        {plan.plan === 'free' && (
          <Link to="/pricing" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-semibold text-white transition-all hover:opacity-90 hidden sm:inline-flex"
            style={{ backgroundColor: 'hsl(var(--primary))' }}>
            Upgrade <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
