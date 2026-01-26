import { Link } from 'react-router-dom';
import { Settings, Camera, ChevronRight, Crown, Sparkles, User, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileData } from '@/hooks/useProfile';
import { PlanData } from '@/hooks/usePlan';
import { cn } from '@/lib/utils';

interface AccountHeaderProps {
  profile: ProfileData | null;
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

export function AccountHeader({ profile, plan }: AccountHeaderProps) {
  const displayName = profile?.display_name || profile?.full_name || 'User';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const hasAvatar = !!profile?.avatar_url;

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-4">
          {/* Clickable Avatar with Camera Overlay */}
          <Link 
            to="/account" 
            className="relative group"
            title="Edit profile photo"
          >
            <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-background shadow-lg ring-2 ring-primary/10 transition-transform group-hover:scale-105">
              <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            {/* Camera overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-5 w-5 text-white" />
            </div>
            
            {/* Add photo hint if no avatar */}
            {!hasAvatar && (
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-primary-foreground shadow-md">
                <Camera className="h-3 w-3" />
              </div>
            )}
          </Link>

          {/* User Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                Welcome back, {displayName.split(' ')[0]}!
              </h2>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <PlanBadge plan={plan.plan} />
              {profile?.username && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">@{profile.username}</span>
                </>
              )}
            </div>

            {profile?.bio && (
              <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/account">
              <Settings className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Account</span>
            </Link>
          </Button>
          
          {plan.plan === 'free' && (
            <Button size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/pricing">
                Upgrade
                <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
