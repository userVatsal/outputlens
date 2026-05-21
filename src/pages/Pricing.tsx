import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, Loader2, ChevronDown, Shield, Clock, RefreshCw, CreditCard, Headphones } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { usePlan } from '@/hooks/usePlan';
import { PLAN_CONFIG, SubscriptionPlan } from '@/lib/stripe';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Anchor high → low. Trader sits first so every cheaper plan feels reasonable by comparison.
const plans: { key: SubscriptionPlan; badge?: string }[] = [
  { key: 'trader', badge: 'Institutional-grade' },
  { key: 'pro', badge: 'Most Popular' },
  { key: 'starter' },
  { key: 'free' },
];

const objections = [
  { icon: Shield,    label: '14-day refund — no questions' },
  { icon: RefreshCw, label: 'Cancel anytime, one click' },
  { icon: CreditCard,label: 'No card required for Free' },
  { icon: Clock,     label: 'Setup in under 30 seconds' },
  { icon: Headphones,label: 'Human support, not chatbots' },
];

const faqs = [
  { q: "What do I get with the Free tier?", a: "5 risk analyses per month on US stocks only, using basic Monte Carlo simulation with 5,000 paths. Perfect for learning probabilistic risk concepts." },
  { q: "Why upgrade to Starter or Pro?", a: "Paid plans unlock global markets (UK, EU, Crypto, Forex), 10,000 Monte Carlo paths, regime detection, and AI-powered explanations." },
  { q: "Is this a trading signal service?", a: "No. OutputLens shows probability distributions, not price predictions. We quantify uncertainty — we never tell you what to buy or sell." },
  { q: "Can I upgrade or downgrade anytime?", a: "Yes. All subscriptions can be changed at any time from your Account page. Changes take effect immediately with prorated billing." },
];

export default function Pricing() {
  const { plan: currentPlan, createCheckoutSession, isLoading: planLoading } = usePlan();
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => { document.title = 'Pricing | OutputLens'; }, []);

  const handleSubscribe = async (planKey: SubscriptionPlan) => {
    const config = PLAN_CONFIG[planKey];
    if (!config.priceId) return;
    setLoadingPlan(planKey);
    try { await createCheckoutSession(config.priceId); }
    catch { toast.error('Unable to start checkout. Please try again.'); }
    finally { setLoadingPlan(null); }
  };

  const planOrder: SubscriptionPlan[] = ['free', 'starter', 'pro', 'trader'];
  const isUpgrade = (key: SubscriptionPlan) => planOrder.indexOf(key) > planOrder.indexOf(currentPlan);

  return (
    <Layout>
      {/* Header */}
      <section className="hero-gradient py-20">
        <div className="section-container text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-4 tracking-tight">
            Quantify risk for less than a coffee a day.
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Bloomberg Terminal: <span className="font-mono text-foreground">$24,000/yr</span>.
            OutputLens Trader: <span className="font-mono text-foreground">$79/mo</span>.
            Same probabilistic depth. None of the bloat.
          </p>
        </div>
      </section>

      <div className="section-container py-16">
        {/* Pricing cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto mb-20">
          {plans.map(({ key, badge }) => {
            const config = PLAN_CONFIG[key];
            const isCurrent = key === currentPlan;
            const isHighlighted = config.highlighted;

            return (
              <div key={key} className={cn(
                'relative flex flex-col rounded-lg border bg-card p-6',
                isHighlighted ? 'border-primary shadow-lg shadow-primary/10' : 'border-border',
                isCurrent && 'ring-2 ring-bullish/40',
              )}>
                {badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: 'hsl(var(--primary))' }}>
                      <Sparkles className="h-3 w-3" />{badge}
                    </span>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold text-bullish-foreground bg-bullish">✓ Current</span>
                  </div>
                )}

                <div className="mb-5">
                  <h2 className="font-bold text-foreground text-lg mb-2">{config.name}</h2>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">${config.price}</span>
                    {config.price > 0 && <span className="text-muted-foreground text-sm">/mo</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{config.analysesLimit} analyses/month</p>
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {config.features.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-bullish flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                {key === 'free' ? (
                  <Link to="/auth?mode=signup"
                    className={cn('w-full py-2 rounded text-sm font-semibold text-center transition-all', isCurrent ? 'bg-muted text-muted-foreground cursor-default pointer-events-none' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80')}>
                    {isCurrent ? 'Current Plan' : 'Start Free'}
                  </Link>
                ) : (
                  <button
                    className={cn('w-full py-2 rounded text-sm font-semibold transition-all flex items-center justify-center gap-2',
                      isHighlighted && isUpgrade(key) ? 'text-white hover:opacity-90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                      isCurrent && 'bg-muted text-muted-foreground cursor-default')}
                    style={isHighlighted && isUpgrade(key) ? { backgroundColor: 'hsl(var(--primary))' } : {}}
                    disabled={isCurrent || loadingPlan === key || planLoading}
                    onClick={() => handleSubscribe(key)}
                  >
                    {loadingPlan === key && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isCurrent ? 'Current Plan' : `Get ${config.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ accordion */}
        <div className="max-w-2xl mx-auto">
          {/* Objection-killer strip — addresses risk-aversion right before FAQ */}
          <div className="mb-12 grid grid-cols-2 md:grid-cols-5 gap-3">
            {objections.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2 p-4 rounded-lg border border-border bg-card/40">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground leading-snug">{label}</span>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold font-display text-foreground text-center mb-8">Common Questions</h2>
          <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-foreground text-sm">{faq.q}</span>
                  <ChevronDown className={cn('h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform', openFaq === i && 'rotate-180')} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
