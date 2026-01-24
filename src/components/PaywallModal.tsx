import { Link } from 'react-router-dom';
import { Sparkles, Check, TrendingUp } from 'lucide-react';
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

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const upgradePlans: SubscriptionPlan[] = ['starter', 'pro', 'trader'];

export function PaywallModal({ open, onOpenChange }: PaywallModalProps) {
  const { plan: currentPlan, createCheckoutSession } = usePlan();

  const handleUpgrade = async (planKey: SubscriptionPlan) => {
    const config = PLAN_CONFIG[planKey];
    if (!config.priceId) return;
    
    try {
      await createCheckoutSession(config.priceId);
      onOpenChange(false);
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  // Filter to show only upgrade options
  const planOrder: SubscriptionPlan[] = ['free', 'starter', 'pro', 'trader'];
  const currentIndex = planOrder.indexOf(currentPlan);
  const availableUpgrades = upgradePlans.filter(
    (p) => planOrder.indexOf(p) > currentIndex
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription>
            You've reached your monthly analysis limit. Upgrade to continue analyzing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {availableUpgrades.map((planKey) => {
            const config = PLAN_CONFIG[planKey];
            return (
              <div
                key={planKey}
                className={`p-4 rounded-lg border ${
                  config.highlighted 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-muted/30'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {config.name}
                      </span>
                      {config.highlighted && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {config.analysesLimit} analyses/month
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">
                      ${config.price}
                    </span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                </div>

                <ul className="space-y-1 mb-3">
                  {config.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-3 w-3 text-bullish flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full" 
                  variant={config.highlighted ? 'default' : 'outline'}
                  onClick={() => handleUpgrade(planKey)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get {config.name}
                </Button>
              </div>
            );
          })}

          <div className="text-center pt-2">
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => onOpenChange(false)}
            >
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
