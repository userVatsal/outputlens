import { Link } from 'react-router-dom';
import { Sparkles, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePlan } from '@/hooks/usePlan';
import { PLAN_CONFIG, SubscriptionPlan } from '@/lib/stripe';
import { toast } from 'sonner';

export type PaywallTrigger = 
  | 'usage_limit' 
  | 'stress_scenario'
  | 'global_markets'
  | 'generic';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: PaywallTrigger;
}

export function PaywallModal({ open, onOpenChange, trigger = 'usage_limit' }: PaywallModalProps) {
  const { plan: currentPlan, createCheckoutSession } = usePlan();

  const handleUpgrade = async (planKey: SubscriptionPlan) => {
    const planConfig = PLAN_CONFIG[planKey];
    if (!planConfig.priceId) return;
    
    try {
      await createCheckoutSession(planConfig.priceId);
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to start checkout';
      toast.error(message);
    }
  };

  // Filter to show only upgrade options
  const planOrder: SubscriptionPlan[] = ['free', 'starter', 'pro', 'trader'];
  const currentIndex = planOrder.indexOf(currentPlan);
  const availableUpgrades = (['starter', 'pro'] as SubscriptionPlan[]).filter(
    (p) => planOrder.indexOf(p) > currentIndex
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {trigger === 'usage_limit' 
              ? 'Monthly limit reached' 
              : 'Upgrade to continue'}
          </DialogTitle>
          <DialogDescription>
            Free users can run 5 US market analyses per month.
            Upgrade to unlock more analyses and global markets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {availableUpgrades.map((planKey) => {
            const planConfig = PLAN_CONFIG[planKey];
            return (
              <div
                key={planKey}
                className="p-4 rounded-lg border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">
                    {planConfig.name}
                  </span>
                  <span className="text-lg font-semibold">
                    ${planConfig.price}<span className="text-sm text-muted-foreground">/mo</span>
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {planConfig.analysesLimit === Infinity ? 'Unlimited' : planConfig.analysesLimit} analyses/month
                </p>
                <Button 
                  className="w-full" 
                  variant={planKey === 'starter' ? 'default' : 'outline'}
                  onClick={() => handleUpgrade(planKey)}
                >
                  Get {planConfig.name}
                </Button>
              </div>
            );
          })}
        </div>

        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={() => onOpenChange(false)}
        >
          Maybe later
        </Button>
      </DialogContent>
    </Dialog>
  );
}
