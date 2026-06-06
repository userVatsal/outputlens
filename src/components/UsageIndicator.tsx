import { forwardRef } from 'react';
import { Sparkles, TrendingUp, Zap, FileDown, Brain } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { UsageData } from '@/hooks/useUsage';
import { PLAN_CONFIG } from '@/lib/stripe';

interface UsageIndicatorProps {
  usage: UsageData;
}

const UPGRADE_BENEFITS = {
  free: {
    nextPlan: 'Starter',
    nextPrice: 19,
    highlights: ['30 analyses/mo', '10,000 paths', 'Live data'],
  },
  starter: {
    nextPlan: 'Pro',
    nextPrice: 39,
    highlights: ['100 analyses/mo', 'Portfolio (5)', 'Exports'],
  },
  pro: {
    nextPlan: 'Trader',
    nextPrice: 99,
    highlights: ['500 analyses/mo', 'Portfolio (20)', 'API'],
  },
  trader: null,
};

export const UsageIndicator = forwardRef<HTMLDivElement, UsageIndicatorProps>(
  function UsageIndicator({ usage }, ref) {
  const planConfig = PLAN_CONFIG[usage.plan];
  const isPaid = usage.plan !== 'free';
  const percentage = (usage.analysisCount / usage.limit) * 100;
  const remaining = usage.limit - usage.analysisCount;
  const isNearLimit = remaining <= 3;
  const isAtLimit = remaining <= 0;
  const upgradeBenefits = UPGRADE_BENEFITS[usage.plan as keyof typeof UPGRADE_BENEFITS];

  return (
    <div ref={ref} className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPaid ? (
            <Sparkles className="h-4 w-4 text-primary" />
          ) : (
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium text-foreground text-sm">
            {planConfig.name} Plan
          </span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-foreground">
            {usage.analysisCount} / {usage.limit}
          </span>
          <span className="text-muted-foreground ml-1">analyses</span>
        </div>
      </div>
      
      <Progress 
        value={Math.min(percentage, 100)} 
        className={`h-2 ${
          isAtLimit 
            ? 'bg-bearish/20' 
            : isNearLimit 
              ? 'bg-caution/20' 
              : ''
        }`}
      />
      
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {isAtLimit 
            ? "You've reached your monthly limit" 
            : isNearLimit 
              ? `${remaining} analyses remaining this month`
              : `Resets at start of next month`
          }
        </p>
        
        {(isNearLimit || isAtLimit) && usage.plan !== 'trader' && (
          <Button size="sm" variant={isAtLimit ? 'default' : 'outline'} asChild>
            <Link to="/pricing">
              <Sparkles className="h-3 w-3 mr-1" />
              Upgrade
            </Link>
          </Button>
        )}
      </div>

      {/* Value proposition for upgrade */}
      {upgradeBenefits && !isAtLimit && !isNearLimit && (
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-primary" />
              <span>
                Upgrade to <span className="font-medium text-foreground">{upgradeBenefits.nextPlan}</span> for:
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {upgradeBenefits.highlights.map((benefit) => (
              <span 
                key={benefit} 
                className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded"
              >
                {benefit}
              </span>
            ))}
            <Link 
              to="/pricing" 
              className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium hover:bg-primary/20 transition-colors"
            >
              ${upgradeBenefits.nextPrice}/mo →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
});
