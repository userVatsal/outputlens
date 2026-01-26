import { Link } from 'react-router-dom';
import { Sparkles, Check, TrendingUp, BarChart3, Brain, FileDown, Bell, Code } from 'lucide-react';
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

export type PaywallTrigger = 'usage_limit' | 'portfolio' | 'sentiment' | 'exports' | 'alerts' | 'api' | 'generic';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: PaywallTrigger;
}

const TRIGGER_CONFIG: Record<PaywallTrigger, {
  title: string;
  description: string;
  icon: React.ElementType;
  highlightFeatures: string[];
}> = {
  usage_limit: {
    title: "You've Hit Your Monthly Limit",
    description: "You've used all 5 free analyses this month. Upgrade to continue analyzing trades.",
    icon: TrendingUp,
    highlightFeatures: ['More analyses', 'Live market data', 'Full Monte Carlo'],
  },
  portfolio: {
    title: "Portfolio Analysis is a Pro Feature",
    description: "Analyze your entire portfolio with correlations, risk metrics, and optimization.",
    icon: BarChart3,
    highlightFeatures: ['Portfolio VaR', 'Correlation matrix', 'Position sizing'],
  },
  sentiment: {
    title: "Market Sentiment is a Starter Feature",
    description: "Get AI-analyzed sentiment from 100+ news and social media sources.",
    icon: Brain,
    highlightFeatures: ['News sentiment', 'Social signals', 'Trend analysis'],
  },
  exports: {
    title: "Exports are a Pro Feature",
    description: "Download professional PDF and CSV reports to share with your team.",
    icon: FileDown,
    highlightFeatures: ['PDF reports', 'CSV exports', 'Branded documents'],
  },
  alerts: {
    title: "Price Alerts are a Trader Feature",
    description: "Get notified when your assets hit target prices or risk thresholds.",
    icon: Bell,
    highlightFeatures: ['Price alerts', 'Risk alerts', 'Email notifications'],
  },
  api: {
    title: "API Access is a Trader Feature",
    description: "Integrate OutputLens with your trading tools via our REST API.",
    icon: Code,
    highlightFeatures: ['REST API', '100 calls/mo', 'Webhooks'],
  },
  generic: {
    title: "Upgrade Your Plan",
    description: "Unlock more features and analyses with a paid subscription.",
    icon: Sparkles,
    highlightFeatures: ['More analyses', 'Live data', 'Exports'],
  },
};

const upgradePlans: SubscriptionPlan[] = ['starter', 'pro', 'trader'];

export function PaywallModal({ open, onOpenChange, trigger = 'generic' }: PaywallModalProps) {
  const { plan: currentPlan, createCheckoutSession } = usePlan();
  const config = TRIGGER_CONFIG[trigger];
  const Icon = config.icon;

  const handleUpgrade = async (planKey: SubscriptionPlan) => {
    const planConfig = PLAN_CONFIG[planKey];
    if (!planConfig.priceId) return;
    
    try {
      await createCheckoutSession(planConfig.priceId);
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
            <Icon className="h-5 w-5 text-primary" />
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        {/* Highlighted features for this trigger */}
        <div className="flex flex-wrap gap-2 py-2">
          {config.highlightFeatures.map((feature) => (
            <span 
              key={feature}
              className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium"
            >
              {feature}
            </span>
          ))}
        </div>

        <div className="space-y-4 py-2">
          {availableUpgrades.map((planKey) => {
            const planConfig = PLAN_CONFIG[planKey];
            return (
              <div
                key={planKey}
                className={`p-4 rounded-lg border ${
                  planConfig.highlighted 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-muted/30'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {planConfig.name}
                      </span>
                      {planConfig.highlighted && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {planConfig.analysesLimit} analyses/month
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">
                      ${planConfig.price}
                    </span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                </div>

                <ul className="space-y-1 mb-3">
                  {planConfig.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-3 w-3 text-bullish flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full" 
                  variant={planConfig.highlighted ? 'default' : 'outline'}
                  onClick={() => handleUpgrade(planKey)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get {planConfig.name}
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
