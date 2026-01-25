import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { usePlan } from '@/hooks/usePlan';
import { PLAN_CONFIG, SubscriptionPlan } from '@/lib/stripe';
import { toast } from 'sonner';

const plans: { key: SubscriptionPlan; badge?: string }[] = [
  { key: 'free' },
  { key: 'starter' },
  { key: 'pro', badge: 'Most Popular' },
  { key: 'trader' },
];

const faqs = [
  {
    question: 'Is this financial advice?',
    answer: 'No. OutputLens is an educational tool that shows the probability distribution of possible outcomes using Monte Carlo simulation. It does not provide financial advice, trading signals, or predictions.',
  },
  {
    question: 'How do the simulations work?',
    answer: 'We run up to 10,000 Monte Carlo paths using Geometric Brownian Motion, incorporating live volatility data when available. The result is a probability distribution of possible outcomes—not a single prediction.',
  },
  {
    question: "What's the difference between VaR and Expected Shortfall?",
    answer: "VaR (Value at Risk) tells you the maximum expected loss at a given confidence level (e.g., 95%). Expected Shortfall goes further—it shows the average loss when things are worse than VaR.",
  },
  {
    question: 'Can I cancel anytime?',
    answer: "Yes. All subscriptions can be cancelled at any time from your Account page. You'll retain access until the end of your billing period.",
  },
  {
    question: 'What markets are supported?',
    answer: 'We support US (NYSE/NASDAQ), UK (LSE), and European (Euronext/DAX) markets with region-specific scenarios and local currencies.',
  },
  {
    question: 'How is my data used?',
    answer: "We store your analysis history to show you past trades. We don't sell your data. See our Privacy Policy for full details.",
  },
];

export default function Pricing() {
  const { plan: currentPlan, createCheckoutSession, isLoading: planLoading } = usePlan();
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | null>(null);

  // SEO: Set page-specific document title
  useEffect(() => {
    document.title = 'Pricing Plans - AI Risk Analysis Tool | OutputLens';
  }, []);

  const handleSubscribe = async (planKey: SubscriptionPlan) => {
    const config = PLAN_CONFIG[planKey];
    if (!config.priceId) return;

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
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Start free, upgrade when you need more. No hidden fees. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-20">
          {plans.map(({ key, badge }) => {
            const config = PLAN_CONFIG[key];
            const isCurrentPlan = key === currentPlan;
            const isHighlighted = config.highlighted;
            const canUpgrade = isUpgrade(key);

            return (
              <div
                key={key}
                className={`glass-card p-6 relative flex flex-col ${
                  isHighlighted ? 'border-2 border-primary ring-2 ring-primary/20' : ''
                } ${isCurrentPlan ? 'bg-primary/5' : ''}`}
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
                      Your Plan
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

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Frequently Asked Questions
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

        {/* Disclaimer */}
        <div className="mt-16 text-center">
          <p className="text-xs text-muted-foreground max-w-xl mx-auto">
            OutputLens is for educational purposes only. It does not provide financial advice
            or trading recommendations. Past scenarios do not guarantee future results.
          </p>
        </div>
      </div>
    </Layout>
  );
}
