import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Sparkles, Loader2, Globe2, Cpu, Brain, Database, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePlan } from '@/hooks/usePlan';
import { PLAN_CONFIG, SubscriptionPlan } from '@/lib/stripe';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const plans: { key: SubscriptionPlan; badge?: string }[] = [
  { key: 'free' },
  { key: 'starter' },
  { key: 'pro', badge: 'Most Popular' },
  { key: 'trader' },
];

// Tier features organized by layer with visual styling
const tierLayers = [
  {
    name: 'Layer 1: Stochastic Engine',
    icon: Cpu,
    color: 'bg-blue-500/10 border-blue-500/20',
    features: [
      { 
        feature: 'Stochastic Models', 
        tooltip: 'Mathematical simulation engines',
        free: 'Basic GBM', 
        starter: 'GBM + GARCH', 
        pro: 'Full Suite', 
        trader: 'Full + API' 
      },
      { 
        feature: 'Monte Carlo Paths', 
        tooltip: 'Number of simulation paths for accuracy',
        free: '5,000', 
        starter: '10,000', 
        pro: '10,000', 
        trader: '10,000' 
      },
      { 
        feature: 'Regime Switching', 
        tooltip: 'Bull/Bear/Stress market detection',
        free: false, 
        starter: true, 
        pro: true, 
        trader: true 
      },
      { 
        feature: 'Jump Diffusion', 
        tooltip: 'Model sudden price jumps',
        free: false, 
        starter: false, 
        pro: true, 
        trader: true 
      },
    ],
  },
  {
    name: 'Layer 2: Neural Intelligence',
    icon: Database,
    color: 'bg-green-500/10 border-green-500/20',
    features: [
      { 
        feature: 'Neural Database', 
        tooltip: 'Historical pattern similarity search',
        free: 'Limited', 
        starter: 'Full', 
        pro: 'Full + Auto', 
        trader: 'Full + Auto' 
      },
      { 
        feature: 'Regime Detection (HMM)', 
        tooltip: 'Hidden Markov Model for market states',
        free: false, 
        starter: true, 
        pro: true, 
        trader: true 
      },
    ],
  },
  {
    name: 'Layer 3: AI Interpretation',
    icon: Brain,
    color: 'bg-purple-500/10 border-purple-500/20',
    features: [
      { 
        feature: 'AI Explanation', 
        tooltip: 'LLM explains results (never predicts)',
        free: 'Manual', 
        starter: 'Auto', 
        pro: 'Advanced', 
        trader: 'Advanced' 
      },
      { 
        feature: 'RAG Knowledge', 
        tooltip: 'Retrieval-augmented risk context',
        free: false, 
        starter: true, 
        pro: true, 
        trader: true 
      },
    ],
  },
  {
    name: 'Access & Limits',
    icon: Globe2,
    color: 'bg-muted border-border',
    features: [
      { 
        feature: 'Markets', 
        tooltip: 'Geographic market coverage',
        free: 'US Only', 
        starter: 'Global', 
        pro: 'Global', 
        trader: 'Global' 
      },
      { 
        feature: 'Portfolio Assets', 
        tooltip: 'Max assets in portfolio analysis',
        free: '—', 
        starter: '—', 
        pro: '5', 
        trader: '20' 
      },
      { 
        feature: 'API Access', 
        tooltip: 'Programmatic API calls per month',
        free: '—', 
        starter: '—', 
        pro: '—', 
        trader: '100/mo' 
      },
    ],
  },
];

// Streamlined FAQs (removed technical IP details)
const faqs = [
  {
    question: 'What do I get with the Free tier?',
    answer: 'Free gives you 5 risk analyses per month on US stocks only, using basic Monte Carlo simulation with 5,000 paths. Perfect for learning probabilistic risk concepts.',
  },
  {
    question: 'Why upgrade to Starter or Pro?',
    answer: 'Paid plans unlock global markets (UK, EU, Crypto, Forex), 10,000 Monte Carlo paths for higher accuracy, regime detection for market state awareness, and AI-powered explanations of your risk profile.',
  },
  {
    question: 'Is this a trading signal service?',
    answer: 'No. OutputLens shows probability distributions, not price predictions. We quantify uncertainty—we never tell you what to buy or sell. This is risk infrastructure, not trading advice.',
  },
  {
    question: 'Can I upgrade or downgrade anytime?',
    answer: 'Yes. All subscriptions can be changed at any time from your Account page. Changes take effect immediately with prorated billing.',
  },
];

// Render cell value with proper styling
const renderCellValue = (value: string | boolean, isPro: boolean = false) => {
  if (typeof value === 'boolean') {
    return value ? (
      <div className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center mx-auto',
        isPro ? 'bg-primary/20' : 'bg-bullish/20'
      )}>
        <Check className={cn('h-4 w-4', isPro ? 'text-primary' : 'text-bullish')} />
      </div>
    ) : (
      <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
        <X className="h-4 w-4 text-muted-foreground/50" />
      </div>
    );
  }
  return (
    <span className={cn(
      'text-sm',
      isPro ? 'text-primary font-medium' : 'text-muted-foreground'
    )}>
      {value}
    </span>
  );
};

export default function Pricing() {
  const { plan: currentPlan, createCheckoutSession, isLoading: planLoading } = usePlan();
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    document.title = 'Pricing - Free to Trader Plans | OutputLens';
  }, []);

  const handleSubscribe = async (planKey: SubscriptionPlan) => {
    const config = PLAN_CONFIG[planKey];
    if (!config.priceId) return;

    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please sign up or log in to subscribe to a plan.');
      return;
    }

    setLoadingPlan(planKey);
    try {
      await createCheckoutSession(config.priceId);
    } catch (err) {
      toast.error('Unable to start checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const getButtonText = (planKey: SubscriptionPlan) => {
    if (planKey === currentPlan) return 'Current Plan';
    if (planKey === 'free') return 'Start Free';
    return `Get ${PLAN_CONFIG[planKey].name}`;
  };

  const isUpgrade = (planKey: SubscriptionPlan) => {
    const planOrder: SubscriptionPlan[] = ['free', 'starter', 'pro', 'trader'];
    return planOrder.indexOf(planKey) > planOrder.indexOf(currentPlan);
  };

  return (
    <Layout>
      <div className="section-container py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4 font-brand">
            Risk Intelligence Plans
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-4">
            Free: US markets, 5 analyses/mo. Paid: Global markets + advanced features.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Cpu className="h-4 w-4" />
              Monte Carlo Engine
            </span>
            <span className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              Pattern Database
            </span>
            <span className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              AI Insights
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          {plans.map(({ key, badge }) => {
            const config = PLAN_CONFIG[key];
            const isCurrentPlan = key === currentPlan;
            const isHighlighted = config.highlighted;
            const canUpgrade = isUpgrade(key);

            return (
              <div
                key={key}
                className={cn(
                  'glass-card p-6 relative flex flex-col transition-all',
                  isHighlighted && 'border-2 border-primary ring-2 ring-primary/20',
                  isCurrentPlan && 'bg-bullish/5 border-bullish/30'
                )}
              >
                {badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
                      <Sparkles className="h-3 w-3" />
                      {badge}
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <span className="inline-flex items-center gap-1 bg-bullish text-bullish-foreground text-xs font-medium px-2 py-1 rounded-full">
                      ✓ Your Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-foreground mb-2">{config.name}</h2>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-foreground">
                      ${config.price}
                    </span>
                    {config.price > 0 && (
                      <span className="text-muted-foreground">/mo</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {config.analysesLimit} analyses/month
                  </p>
                  {key === 'free' ? (
                    <Badge variant="outline" className="mt-2 text-xs">
                      <Globe2 className="h-3 w-3 mr-1" />
                      US Markets Only
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="mt-2 text-xs bg-primary/10 text-primary border-primary/20">
                      <Globe2 className="h-3 w-3 mr-1" />
                      Global Markets
                    </Badge>
                  )}
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  {config.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-bullish/10 flex items-center justify-center mt-0.5">
                        <Check className="h-3 w-3 text-bullish" />
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {key === 'free' ? (
                  <Button
                    variant={isCurrentPlan ? 'outline' : 'secondary'}
                    className="w-full"
                    disabled={isCurrentPlan}
                    asChild={!isCurrentPlan}
                  >
                    {isCurrentPlan ? (
                      <span>Current Plan</span>
                    ) : (
                      <Link to="/auth?mode=signup">Start Free</Link>
                    )}
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={isHighlighted && canUpgrade ? 'default' : 'outline'}
                    disabled={isCurrentPlan || loadingPlan === key || planLoading}
                    onClick={() => handleSubscribe(key)}
                  >
                    {loadingPlan === key ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {getButtonText(key)}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Enhanced Tier Comparison Table */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8 font-brand">
            Feature Comparison
          </h2>
          
          <div className="glass-card overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-5 p-4 bg-muted/50 border-b border-border font-semibold text-sm sticky top-0">
              <span>Feature</span>
              <span className="text-center">Free</span>
              <span className="text-center">Starter</span>
              <span className="text-center text-primary">Pro</span>
              <span className="text-center">Trader</span>
            </div>
            
            {/* Layer Groups */}
            {tierLayers.map((layer) => (
              <div key={layer.name}>
                {/* Layer Header */}
                <div className={cn(
                  'grid grid-cols-5 px-4 py-3 border-b border-border',
                  layer.color
                )}>
                  <div className="col-span-5 flex items-center gap-2">
                    <layer.icon className="h-4 w-4 text-foreground" />
                    <span className="font-semibold text-sm text-foreground">{layer.name}</span>
                  </div>
                </div>
                
                {/* Layer Features */}
                {layer.features.map((row, idx) => (
                  <div 
                    key={row.feature} 
                    className={cn(
                      'grid grid-cols-5 px-4 py-3 border-b border-border/50 text-sm items-center',
                      idx % 2 === 0 && 'bg-muted/20'
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-foreground">{row.feature}</span>
                      {row.tooltip && (
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{row.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <div className="text-center">{renderCellValue(row.free)}</div>
                    <div className="text-center">{renderCellValue(row.starter)}</div>
                    <div className="text-center">{renderCellValue(row.pro, true)}</div>
                    <div className="text-center">{renderCellValue(row.trader)}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Streamlined FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8 font-brand">
            Common Questions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="glass-card p-5">
                <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}
