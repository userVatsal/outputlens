import { Link } from 'react-router-dom';
import { Settings, CreditCard, Sparkles, Zap, ChevronRight, BarChart3, FileDown, Brain, TrendingUp, Shield, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileData } from '@/hooks/useProfile';
import { UsageData } from '@/hooks/useUsage';
import { PlanData } from '@/hooks/usePlan';
import { cn } from '@/lib/utils';

interface DashboardHeroProps {
  profile: ProfileData | null;
  usage: UsageData | null;
  plan: PlanData;
}

const UPGRADE_FEATURES = [
  { icon: BarChart3, label: '10,000 paths' },
  { icon: Zap, label: 'Live market data' },
  { icon: Brain, label: 'Auto AI insights' },
  { icon: FileDown, label: 'PDF/CSV exports' },
];

const stats = [
  { icon: Shield, label: 'Risk Score', value: 'AI-Powered' },
  { icon: Activity, label: 'Simulations', value: '10,000+' },
  { icon: TrendingUp, label: 'Accuracy', value: '95% VaR' },
];

export function DashboardHero({ profile, usage, plan }: DashboardHeroProps) {
  const remainingAnalyses = usage 
    ? Math.max(usage.limit - usage.analysisCount, 0) 
    : 0;

  const isFreeUser = plan.plan === 'free';
  const firstName = profile?.display_name?.split(' ')[0] || profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-background to-background p-6 md:p-8 relative overflow-hidden">
      {/* Animated background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-primary/3 rounded-full blur-2xl transform -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative">
        {/* Headline & Sub-headline */}
        <div className="mb-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Welcome back, {firstName}!
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground font-display mb-3">
            Stop Guessing. Start{' '}
            <span className="text-primary relative">
              Winning
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 100 8" preserveAspectRatio="none">
                <path d="M0 7 Q50 0 100 7" stroke="currentColor" strokeWidth="2" fill="none" className="text-primary/40" />
              </svg>
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Quantify your downside before you trade. Get AI-powered risk analysis in seconds.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-semibold text-sm">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Usage & Actions Row */}
        <div 
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/50 animate-fade-in" 
          style={{ animationDelay: '200ms' }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">{remainingAnalyses}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Analyses Left</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
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
              <Button size="sm" asChild className="group">
                <Link to="/pricing">
                  <CreditCard className="h-4 w-4 mr-1.5" />
                  Upgrade
                  <ChevronRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Upgrade nudge for free users */}
        {isFreeUser && (
          <div 
            className="mt-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 animate-fade-in"
            style={{ animationDelay: '300ms' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/20 animate-pulse">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Unlock Full Power</p>
                  <div className="flex flex-wrap gap-3 mt-1">
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
              <Button size="sm" asChild className="whitespace-nowrap group">
                <Link to="/pricing">
                  See Plans
                  <ChevronRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
