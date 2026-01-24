import { Sparkles, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { UsageData } from '@/hooks/useUsage';
import { PLAN_CONFIG } from '@/lib/stripe';

interface UsageIndicatorProps {
  usage: UsageData;
}

export function UsageIndicator({ usage }: UsageIndicatorProps) {
  const planConfig = PLAN_CONFIG[usage.plan];
  const isPaid = usage.plan !== 'free';
  const percentage = (usage.analysisCount / usage.limit) * 100;
  const remaining = usage.limit - usage.analysisCount;
  const isNearLimit = remaining <= 3;
  const isAtLimit = remaining <= 0;

  return (
    <div className="glass-card p-4 space-y-3">
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
    </div>
  );
}
