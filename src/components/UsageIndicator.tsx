import { Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { UsageData } from '@/hooks/useUsage';

interface UsageIndicatorProps {
  usage: UsageData;
}

export function UsageIndicator({ usage }: UsageIndicatorProps) {
  const isPro = usage.tier === 'pro';
  const percentage = isPro ? 0 : (usage.analysisCount / usage.limit) * 100;
  const remaining = isPro ? Infinity : usage.limit - usage.analysisCount;
  const isNearLimit = !isPro && remaining <= 3;
  const isAtLimit = !isPro && remaining <= 0;

  if (isPro) {
    return (
      <div className="flex items-center gap-2 text-sm text-primary">
        <Sparkles className="h-4 w-4" />
        <span className="font-medium">Pro Plan</span>
        <span className="text-muted-foreground">• Unlimited analyses</span>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="font-medium text-foreground">
            {usage.analysisCount} / {usage.limit}
          </span>
          <span className="text-muted-foreground ml-1">analyses this month</span>
        </div>
        {isNearLimit && !isAtLimit && (
          <Button size="sm" variant="outline" asChild>
            <Link to="/pricing">
              <Sparkles className="h-3 w-3 mr-1" />
              Upgrade
            </Link>
          </Button>
        )}
      </div>
      <Progress 
        value={percentage} 
        className={`h-2 ${isAtLimit ? 'bg-bearish/20' : isNearLimit ? 'bg-caution/20' : ''}`}
      />
      {isAtLimit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-bearish">You've reached your monthly limit</p>
          <Button size="sm" asChild>
            <Link to="/pricing">
              <Sparkles className="h-3 w-3 mr-1" />
              Upgrade to Pro
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
