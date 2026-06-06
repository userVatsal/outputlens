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

// Annual: 20% off the monthly price defined in PLAN_CONFIG.
const getPrice = (key: SubscriptionPlan, annual: boolean) => {
  const monthly = PLAN_CONFIG[key].price;
  return annual ? Math.round(monthly * 0.8) : monthly;
};

const objections = [
  { icon: Shield,    label: '14-day refund — no questions' },
  { icon: RefreshCw, label: 'Cancel anytime, one click' },
  { icon: CreditCard,label: 'No card required for Free' },
  { icon: Clock,     label: 'Setup in under 30 seconds' },
  { icon: Headphones,label: 'Human support, not chatbots' },
];

const faqs = [
  { q: "What do I get with the Free tier?", a: "3 risk analyses per month on US stocks, using basic Monte Carlo with 5,000 simulation paths. No credit card required. It's designed to show you what probabilistic risk analysis looks like before you commit." },
  { q: "What does Starter ($19/mo) add over Free?", a: "Everything. Global markets (UK, EU, Crypto, Forex), 10,000 Monte Carlo paths, GARCH volatility modelling, HMM regime detection, and automatic Claude AI explanations. 10× more analyses per month." },
  { q: "Why choose Pro ($39/mo) over Starter?", a: "Jump diffusion for tail risk and earnings shocks, portfolio analysis across 5 assets simultaneously, Claude Sonnet (more capable than Haiku), PDF exports, shareable analysis links, email risk alerts, and unlimited history. It's for active traders running a real book." },
  { q: "Is this a trading signal service?", a: "No. OutputLens shows probability distributions, not price predictions. We quantify uncertainty — we never tell you what to buy or sell. Every output includes a disclaimer." },
  { q: "Can I upgrade or downgrade anytime?", a: "Yes. Changes take effect immediately with prorated billing. Downgrading preserves your data but limits future analyses." },
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
            OutputLens Trader: <span className="font-mono text-foreground">$99/mo</span>.
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
                    <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                      billed ${displayPrice * 12}/year · save ${(PLAN_CONFIG[key].price - displayPrice) * 12}/year
                    </p>
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

          {/* Value comparison */}
          <section className="mt-16 max-w-3xl mx-auto">
            <h3 className="font-display font-bold text-center text-foreground" style={{ fontSize: 'clamp(20px,3vw,28px)', letterSpacing: '-0.02em' }}>
              What you get per dollar
            </h3>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 text-muted-foreground font-medium">Tool</th>
                    <th className="text-right pb-3 text-muted-foreground font-medium">Price</th>
                    <th className="text-right pb-3 text-muted-foreground font-medium">Monte Carlo</th>
                    <th className="text-right pb-3 text-muted-foreground font-medium">VaR/CVaR</th>
                    <th className="text-right pb-3 text-muted-foreground font-medium">Regime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {[
                    { name: 'Bloomberg Terminal', price: '£1,667/mo', mc: '✓', var: '✓', regime: '✓', highlight: false },
                    { name: 'FactSet',            price: '$1,000/mo', mc: '✓', var: '✓', regime: '~', highlight: false },
                    { name: 'Koyfin Pro',         price: '$49/mo',    mc: '✗', var: '✗', regime: '✗', highlight: false },
                    { name: 'TradingView Pro',    price: '$15/mo',    mc: '✗', var: '✗', regime: '✗', highlight: false },
                    { name: 'OutputLens Pro',     price: '$39/mo',    mc: '✓', var: '✓', regime: '✓', highlight: true  },
                  ].map((row) => (
                    <tr key={row.name} className={row.highlight ? 'bg-primary/5 font-semibold' : ''}>
                      <td className={cn('py-3 pl-2', row.highlight && 'text-primary')}>{row.name}</td>
                      <td className="py-3 text-right font-mono">{row.price}</td>
                      <td className={cn('py-3 text-right', row.mc === '✓' ? 'text-bullish' : 'text-muted-foreground')}>{row.mc}</td>
                      <td className={cn('py-3 text-right', row.var === '✓' ? 'text-bullish' : 'text-muted-foreground')}>{row.var}</td>
                      <td className={cn('py-3 pr-2 text-right', row.regime === '✓' ? 'text-bullish' : 'text-muted-foreground')}>{row.regime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-[12px] text-muted-foreground mt-4">
              OutputLens Pro delivers Bloomberg-grade risk mathematics at 97% lower cost.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
