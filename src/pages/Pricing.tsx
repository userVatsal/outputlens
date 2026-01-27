import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, Loader2, Database, Globe2, Cpu, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { usePlan } from '@/hooks/usePlan';
import { PLAN_CONFIG, SubscriptionPlan } from '@/lib/stripe';
import { toast } from 'sonner';

const plans: { key: SubscriptionPlan; badge?: string }[] = [
  { key: 'free' },
  { key: 'starter' },
  { key: 'pro', badge: 'Most Popular' },
  { key: 'trader' },
];

// YC-style three-layer architecture tier table
const tierFeatures = [
  { 
    feature: 'Layer 1: Stochastic Models', 
    free: 'Basic GBM', 
    starter: 'GBM + GARCH', 
    pro: 'Full Suite', 
    trader: 'Full + API' 
  },
  { 
    feature: 'Monte Carlo Paths', 
    free: '5,000', 
    starter: '10,000', 
    pro: '10,000', 
    trader: '10,000' 
  },
  { 
    feature: 'Regime Switching', 
    free: '❌', 
    starter: '✓', 
    pro: '✓', 
    trader: '✓' 
  },
  { 
    feature: 'Jump Diffusion', 
    free: '❌', 
    starter: '❌', 
    pro: '✓', 
    trader: '✓' 
  },
  { 
    feature: 'Layer 2: Neural Database', 
    free: 'Limited', 
    starter: 'Full', 
    pro: 'Full + Auto', 
    trader: 'Full + Auto' 
  },
  { 
    feature: 'Regime Detection (HMM)', 
    free: '❌', 
    starter: '✓', 
    pro: '✓', 
    trader: '✓' 
  },
  { 
    feature: 'Layer 3: AI Interpretation', 
    free: 'Manual', 
    starter: 'Auto', 
    pro: 'Advanced', 
    trader: 'Advanced' 
  },
  { 
    feature: 'RAG Knowledge Access', 
    free: '❌', 
    starter: '✓', 
    pro: '✓', 
    trader: '✓' 
  },
  { 
    feature: 'Markets', 
    free: 'US Only', 
    starter: 'Global', 
    pro: 'Global', 
    trader: 'Global' 
  },
  { 
    feature: 'Portfolio Assets', 
    free: '—', 
    starter: '—', 
    pro: '5', 
    trader: '20' 
  },
  { 
    feature: 'API Access', 
    free: '—', 
    starter: '—', 
    pro: '—', 
    trader: '100/mo' 
  },
];

const faqs = [
  {
    question: 'What is the three-layer intelligence architecture?',
    answer: 'Layer 1 (Deterministic Math): GBM simulation, VaR/CVaR calculations—pure math that works without AI. Layer 2 (Statistical/ML): HMM regime detection, neural database for similarity search. Layer 3 (AI Interpretation): LLMs explain outputs—they NEVER predict prices or generate numbers.',
  },
  {
    question: 'What stochastic models do you use?',
    answer: 'We use Geometric Brownian Motion (GBM) as the primary engine, with GARCH-like stochastic volatility extensions, fat-tailed distribution modeling, and regime switching detection for Bull/Base/Bear/Stress market states.',
  },
  {
    question: 'How does the neural database work?',
    answer: 'The neural database stores embeddings of historical price paths, volatility regimes, and tail events. It retrieves historically similar patterns to contextualize your risk analysis. Critically, it does NOT predict markets—it provides historical context.',
  },
  {
    question: 'Why don\'t you predict prices?',
    answer: 'Prediction tools give single price targets. We show the entire probability distribution of possible outcomes. Markets are inherently unpredictable—our LLMs explain distributions and summarize risk, but never predict prices or give trading signals.',
  },
  {
    question: 'How does regime detection work?',
    answer: 'We use Hidden Markov Models (HMM) to detect latent market regimes: bull, neutral, bear, and stress. Layer 1 simulation parameters adapt based on detected regime, creating more realistic scenario distributions.',
  },
  {
    question: "What's the difference between basic GBM and full stochastic suite?",
    answer: "Basic GBM (Free): Standard Geometric Brownian Motion. Full Suite (Pro+): GBM + GARCH volatility clustering + regime switching + jump diffusion for more realistic tail risk modeling.",
  },
  {
    question: 'Can I upgrade or downgrade anytime?',
    answer: "Yes. All subscriptions can be changed at any time from your Account page. Changes take effect immediately with prorated billing.",
  },
  {
    question: 'What makes this different from AI trading tools?',
    answer: 'We are NOT a trading tool. We are risk infrastructure. Layer 1 computes probabilities. Layer 2 detects regimes. Layer 3 explains—never signals. Others show targets → we show distributions. Others predict → we quantify downside.',
  },
];

export default function Pricing() {
  const { plan: currentPlan, createCheckoutSession, isLoading: planLoading } = usePlan();
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | null>(null);

  // SEO: Set page-specific document title
  useEffect(() => {
    document.title = 'Pricing - Free to Trader Plans | OutputLens';
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4 font-brand">
            Probabilistic Risk Intelligence
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-4">
            Free: US markets, 5 analyses/mo. Paid: Global markets + neural insights.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Cpu className="h-4 w-4" />
              GBM Engine
            </span>
            <span className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              Neural Database
            </span>
            <span className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              AI Explanation (Never Predicts)
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
                  {key === 'free' && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      <Globe2 className="h-3 w-3 mr-1" />
                      US Markets Only
                    </Badge>
                  )}
                  {key !== 'free' && (
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

        {/* Tier Comparison Table */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8 font-brand">
            Tier Comparison
          </h2>
          <div className="glass-card overflow-hidden">
            <div className="grid grid-cols-5 p-4 bg-muted/50 border-b border-border font-semibold text-sm">
              <span>Feature</span>
              <span className="text-center">Free</span>
              <span className="text-center">Starter</span>
              <span className="text-center text-primary">Pro</span>
              <span className="text-center">Trader</span>
            </div>
            {tierFeatures.map((row) => (
              <div key={row.feature} className="grid grid-cols-5 p-4 border-b border-border/50 text-sm">
                <span className="text-foreground font-medium">{row.feature}</span>
                <span className="text-center text-muted-foreground">{row.free}</span>
                <span className="text-center text-muted-foreground">{row.starter}</span>
                <span className="text-center text-primary">{row.pro}</span>
                <span className="text-center text-muted-foreground">{row.trader}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8 font-brand">
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
            OutputLens provides probabilistic risk analysis using stochastic models—not predictions. 
            The neural database retrieves historical patterns—it does NOT predict markets.
            LLMs explain math—they never predict prices or give trading signals. Not financial advice.
          </p>
        </div>
      </div>
    </Layout>
  );
}