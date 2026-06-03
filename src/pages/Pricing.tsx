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

// 20% off annual: monthly [0,12,29,79] → annual [0,10,24,66]
const PRICE_MAP: Record<SubscriptionPlan, { monthly: number; annual: number }> = {
  free:    { monthly: 0,  annual: 0 },
  starter: { monthly: 12, annual: 10 },
  pro:     { monthly: 29, annual: 24 },
  trader:  { monthly: 79, annual: 66 },
};
const getPrice = (key: SubscriptionPlan, annual: boolean) =>
  annual ? PRICE_MAP[key].annual : PRICE_MAP[key].monthly;

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
  const [annual, setAnnual] = useState(false);

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
        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setAnnual(false)}
            className={cn(
              'px-4 h-9 rounded-lg text-sm font-medium transition-all',
              !annual ? 'bg-surface text-foreground border border-border/60' : 'text-muted-foreground hover:text-foreground'
            )}
          >Monthly</button>
          <button
            onClick={() => setAnnual(true)}
            className={cn(
              'px-4 h-9 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2',
              annual ? 'bg-surface text-foreground border border-border/60' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Annual
            <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5">Save 20%</span>
          </button>
        </div>

        {/* Pricing cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto mb-20">
          {plans.map(({ key, badge }) => {
            const config = PLAN_CONFIG[key];
            const isCurrent = key === currentPlan;
            const isHighlighted = config.highlighted;
            const displayPrice = getPrice(key, annual);

            return (
              <div key={key} className={cn(
                'relative flex flex-col rounded-2xl border bg-surface p-8 transition-all',
                isHighlighted
                  ? 'border-primary bg-gradient-to-b from-primary/[0.06] to-transparent shadow-[0_0_0_1px_hsl(var(--primary)/0.25),0_12px_40px_hsl(var(--primary)/0.12)]'
                  : 'border-border/50 hover:border-primary/15',
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
                    <span className="text-3xl font-bold font-display text-foreground tabular-nums">${displayPrice}</span>
                    {displayPrice > 0 && <span className="text-muted-foreground text-sm">/mo</span>}
                  </div>
                  {annual && displayPrice > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-1 font-mono">billed yearly</p>
                  )}
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
          <div className="mb-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {objections.map(({ icon: Icon, label }) => (
              <div key={label} className="inline-flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-[13px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold font-display text-foreground text-center mb-8">Common Questions</h2>
          <div>
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className={cn(
                  'rounded-xl border border-border/40 mb-2 transition-colors',
                  isOpen && 'bg-surface'
                )}>
                  <button
                    className="w-full flex justify-between items-center gap-4 p-5 text-left cursor-pointer"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                  >
                    <span className="font-semibold text-[14px] text-foreground">{faq.q}</span>
                    <ChevronDown className={cn('h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform', isOpen && 'rotate-180')} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5">
                      <p className="text-[14px] text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
