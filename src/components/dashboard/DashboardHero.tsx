import { Link } from 'react-router-dom';
import { Settings, CreditCard, Sparkles, Zap, ChevronRight, BarChart3, FileDown, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileData } from '@/hooks/useProfile';
import { UsageData } from '@/hooks/useUsage';
import { PlanData } from '@/hooks/usePlan';

interface DashboardHeroProps {
  profile: ProfileData | null;
  usage: UsageData | null;
  plan: PlanData;
}

const UPGRADE_FEATURES = [
  { icon: BarChart3, label: '30+ analyses/mo' },
  { icon: Zap, label: 'Live market data' },
  { icon: Brain, label: 'AI sentiment' },
  { icon: FileDown, label: 'PDF/CSV exports' },
];

export function DashboardHero({ profile, usage, plan }: DashboardHeroProps) {
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

      {/* Usage & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground text-lg">{remainingAnalyses}</span> Analyses Remaining This Month
          </span>
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
