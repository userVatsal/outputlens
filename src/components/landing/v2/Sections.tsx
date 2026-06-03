import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Check, Activity, BarChart3, Layers, GitBranch, AlertTriangle, History, Sparkles, Briefcase, Grid3x3 } from 'lucide-react';
import { FanChart } from './FanChart';

/* ───────────── HERO ───────────── */
export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 md:pt-24 pb-16 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, hsl(189 100% 50% / 0.08), transparent 60%)' }}
      />
      <div className="relative w-full max-w-[1280px] mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="order-1 lg:order-1">
          <div className="text-primary font-semibold uppercase text-[11px]" style={{ letterSpacing: '0.1em', animation: 'fade-up 500ms ease-out both' }}>
            AI-Powered Risk Intelligence
          </div>
          <h1
            className="mt-5 font-display font-extrabold text-foreground leading-[1.04]"
            style={{ fontSize: 'clamp(30px, 5.5vw, 52px)', letterSpacing: '-0.03em', animation: 'fade-up 600ms ease-out 100ms both' }}
          >
            The market is a distribution. Trade it like one.
          </h1>
          <p
            className="mt-6 text-muted-foreground"
            style={{ fontSize: 'clamp(15px, 1.5vw, 17px)', lineHeight: 1.7, maxWidth: 480, animation: 'fade-up 700ms ease-out 200ms both' }}
          >
            OutputLens runs 10,000 Monte Carlo simulations on any asset giving you the full probability of outcomes — not a forecast, not a prediction, a distribution.
          </p>
          <div className="mt-8 flex flex-wrap gap-3" style={{ animation: 'fade-up 700ms ease-out 300ms both' }}>
            <Link
              to="/auth?mode=signup"
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm px-5 py-3 hover:brightness-110 transition-all min-h-[44px]"
            >
              Analyse a Position Free →
            </Link>
            <button
              className="inline-flex items-center gap-2 rounded-md text-foreground/80 hover:text-foreground hover:bg-elevated font-medium text-sm px-5 py-3 transition-colors min-h-[44px]"
              type="button"
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Play className="h-4 w-4 fill-current" /> See how it works
            </button>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-foreground/40 justify-center sm:justify-start" style={{ animation: 'fade-up 700ms ease-out 400ms both' }}>
            <span>✓ No credit card</span>
            <span>✓ First simulation free</span>
            <span>✓ 2,400+ analysts</span>
          </div>
        </div>

        {/* Chart */}
        <div className="order-2 lg:order-2 relative">
          <div className="rounded-md border border-border bg-surface p-4 md:p-5 relative">
            <div className="hidden lg:block">
              <FanChart height={380} />
            </div>
            <div className="lg:hidden">
              <FanChart height={260} />
            </div>
            {/* Floating stat chips */}
            <div
              className="absolute top-6 right-6 rounded bg-elevated border border-border px-3 py-2 font-mono text-[12px] font-semibold"
              style={{ color: 'hsl(var(--bullish))', animation: 'fade-up 600ms ease-out 1000ms both' }}
            >
              P95 +34.2%
            </div>
            <div
              className="absolute bottom-6 left-6 rounded bg-elevated border border-border px-3 py-2 font-mono text-[12px] font-semibold"
              style={{ color: 'hsl(var(--bearish))', animation: 'fade-up 600ms ease-out 1100ms both' }}
            >
              VaR 95% -12.1%
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── STATS BAR ───────────── */
function useCountUp(target: number, trigger: boolean, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let raf = 0; const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setValue(Math.floor(target * (0.2 + 0.8 * p)));
      if (p < 1) raf = requestAnimationFrame(step);
      else setValue(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, trigger, duration]);
  return value;
}

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.3 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const sims = useCountUp(10000, visible);
  const analysts = useCountUp(2400, visible);
  const accuracy = useCountUp(947, visible); // shown as 94.7

  const fmt = (n: number) => n.toLocaleString('en-US');

  const stats = [
    { v: fmt(sims), label: 'Simulations' },
    { v: `${fmt(analysts)}+`, label: 'Analysts' },
    { v: `${(accuracy / 10).toFixed(1)}%`, label: 'Accuracy' },
    { v: '<0.3s', label: 'Results' },
  ];

  return (
    <section ref={ref} className="bg-surface border-y border-border">
      <div className="max-w-[1280px] mx-auto px-6 py-6 md:py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="font-mono font-bold text-primary text-[28px] md:text-[32px] tabular-nums leading-none">{s.v}</div>
            <div className="mt-2 text-[13px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────── HOW IT WORKS ───────────── */
const STEPS = [
  { n: 1, title: 'Enter any asset', desc: 'Ticker, ETF, crypto. Single name or full portfolio.' },
  { n: 2, title: 'We run 10,000 simulations', desc: 'GBM, GARCH, regime detection — calibrated to live data.' },
  { n: 3, title: 'See your full distribution', desc: 'VaR, CVaR, percentile bands. The shape of risk, exposed.' },
];
export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-20">
      <div className="max-w-[1280px] mx-auto px-6">
        <h2 className="font-display font-bold text-foreground text-center" style={{ fontSize: 'clamp(28px, 4vw, 36px)', letterSpacing: '-0.02em' }}>
          From ticker to distribution in 3 steps
        </h2>
        <div className="mt-10 md:mt-12 grid md:grid-cols-3 gap-8 md:gap-6">
          {STEPS.map((s) => (
            <div key={s.n} className="text-center md:text-left">
              <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center font-mono font-semibold text-muted-foreground mx-auto md:mx-0">
                {s.n}
              </div>
              <h3 className="mt-4 font-semibold text-foreground text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── FEATURES ───────────── */
const FEATURES = [
  { icon: Activity,      title: 'Monte Carlo Engine',  desc: '10,000-path stochastic simulation with GBM, GARCH and Heston models.' },
  { icon: GitBranch,     title: 'Regime Detection',    desc: 'Hidden Markov models pick up volatility shifts before they hit your P&L.' },
  { icon: AlertTriangle, title: 'VaR & CVaR',          desc: 'Tail risk metrics at 90/95/99% confidence, computed in under a second.' },
  { icon: Grid3x3,       title: 'Correlation Matrix',  desc: 'Cluster portfolios by realised co-movement, not assumed sectors.' },
  { icon: Layers,        title: 'Scenario Builder',    desc: 'Shock vol, rates or specific assets — see the distribution recompute live.' },
  { icon: Sparkles,      title: 'AI Analysis',         desc: 'Plain-English commentary on regime, distribution shape and next moves.' },
  { icon: Briefcase,     title: 'Portfolio Risk',      desc: 'Position-level contribution to total risk. Find your hidden concentrations.' },
  { icon: BarChart3,     title: 'Risk Alerts',         desc: 'Get notified when tail risk crosses your thresholds — by email or SMS.' },
  { icon: History,       title: 'Simulation History',  desc: 'Every analysis saved and replayable. Compare distributions over time.' },
];
export function Features() {
  return (
    <section id="features" className="py-16 md:py-20 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 100% 100%, hsl(252 100% 69% / 0.06), transparent 60%)' }}
      />
      <div className="relative max-w-[1280px] mx-auto px-6">
        <h2 className="font-display font-bold text-foreground text-center" style={{ fontSize: 'clamp(28px, 4vw, 36px)', letterSpacing: '-0.02em' }}>
          Everything you need to quantify uncertainty
        </h2>
        <p className="mt-3 text-base text-muted-foreground text-center">Built for analysts who reject point forecasts</p>

        <div className="mt-10 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-md bg-surface border border-border p-6 hover:border-foreground/20 transition-colors">
              <f.icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
              <h3 className="mt-3 font-semibold text-foreground text-base">{f.title}</h3>
              <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── SOCIAL PROOF ───────────── */
const QUOTES = [
  { q: 'OutputLens showed me a bimodal distribution on a position I thought was straightforward. Resized before the move.', a: 'James W.', r: 'Head of Quant Risk, Long/Short Equity Fund' },
  { q: 'The regime detection picked up a vol shift four hours before our internal signal. That alone paid for the year.', a: 'Priya S.', r: 'Senior Portfolio Manager, Multi-Strategy' },
  { q: 'First tool that treats risk like a distribution instead of a single number. Now part of every position review.', a: 'Marcus T.', r: 'Risk Lead, Macro Hedge Fund' },
];
export function SocialProof() {
  return (
    <section className="py-16 md:py-20 bg-surface border-y border-border">
      <div className="max-w-[1280px] mx-auto px-6">
        <h2 className="font-display font-bold text-foreground text-center" style={{ fontSize: 'clamp(28px, 4vw, 36px)', letterSpacing: '-0.02em' }}>
          Trusted by quant teams
        </h2>
        <div className="mt-10 md:mt-12 grid md:grid-cols-3 gap-4">
          {QUOTES.map((t) => (
            <figure key={t.a} className="rounded-md bg-background border border-border p-6 border-l-[3px] border-l-primary">
              <blockquote className="italic text-[15px] text-foreground leading-[1.7]">"{t.q}"</blockquote>
              <figcaption className="mt-4">
                <div className="font-semibold text-sm text-foreground">{t.a}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.r}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── PRICING ───────────── */
const ANNUAL_DISCOUNT = 0.2; // 20% off annual
const BASE_PLANS = [
  { name: 'Starter', monthly: 12, desc: 'For individual analysts getting started with probabilistic risk.',
    features: ['30 analyses/month', 'Global markets (UK, EU, Crypto, Forex)', '10,000 Monte Carlo paths', 'GBM + GARCH + regime switching', 'Auto AI explanations'], highlight: false, cta: 'Start free' },
  { name: 'Pro',     monthly: 29, desc: 'For active traders running portfolios.',
    features: ['100 analyses/month', 'Full stochastic suite + jump diffusion', 'Portfolio analysis (5 assets)', 'Neural database + auto insights', 'CSV/PDF exports', 'Unlimited history'], highlight: true, cta: 'Start free' },
  { name: 'Trader',  monthly: 79, desc: 'For desks running multi-asset portfolios.',
    features: ['500 analyses/month', 'Portfolio analysis (20 assets)', '100 API calls/month', 'Priority support', 'All advanced models'], highlight: false, cta: 'Start free' },
];
const PLANS = (annual: boolean) => BASE_PLANS.map((p) => {
  const effectiveMonthly = annual
    ? Math.round(p.monthly * (1 - ANNUAL_DISCOUNT))
    : p.monthly;
  return {
    ...p,
    price: `$${effectiveMonthly}`,
    period: '/month',
    subPrice: annual ? `Billed $${effectiveMonthly * 12}/year` : null,
  };
});
export function Pricing() {
  const [annual, setAnnual] = useState(true);
  const plans = PLANS(annual);
  return (
    <section id="pricing" className="py-16 md:py-20">
      <div className="max-w-[1280px] mx-auto px-6">
        <h2 className="font-display font-bold text-foreground text-center" style={{ fontSize: 'clamp(28px, 4vw, 36px)', letterSpacing: '-0.02em' }}>
          Simple, transparent pricing
        </h2>
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="inline-flex bg-surface border border-border rounded-full p-1">
            <button onClick={() => setAnnual(true)} className={`px-4 py-1.5 text-sm rounded-full transition-colors ${annual ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground'}`}>Annual</button>
            <button onClick={() => setAnnual(false)} className={`px-4 py-1.5 text-sm rounded-full transition-colors ${!annual ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground'}`}>Monthly</button>
          </div>
          {annual && <span className="text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded" style={{ background: 'hsl(var(--bullish) / 0.15)', color: 'hsl(var(--bullish))' }}>Save 20%</span>}
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-md bg-surface p-7 border ${p.highlight ? 'border-primary' : 'border-border'}`}
            >
              {p.highlight && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1" style={{ borderRadius: '0 6px 0 4px' }}>
                  Most Popular
                </div>
              )}
              <div className="text-primary text-xs font-semibold uppercase" style={{ letterSpacing: '0.1em' }}>{p.name}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <div className="font-mono font-bold text-foreground text-[40px] leading-none">{p.price}</div>
                {p.period && <div className="text-sm text-muted-foreground">{p.period}</div>}
              </div>
              {p.subPrice && <div className="mt-1 text-[12px] text-muted-foreground">{p.subPrice}</div>}
              <p className="mt-2 text-[13px] text-muted-foreground">{p.desc}</p>
              <Link
                to="/auth?mode=signup"
                className={`mt-6 w-full inline-flex items-center justify-center rounded-md font-semibold text-sm min-h-[44px] px-5 transition-all ${
                  p.highlight
                    ? 'bg-primary text-primary-foreground hover:brightness-110'
                    : 'border border-primary text-primary bg-transparent hover:bg-primary/10'
                }`}
              >
                {p.cta}
              </Link>
              <ul className="mt-6">
                {p.features.map((f, i) => (
                  <li key={f} className={`flex items-start gap-2 py-1.5 text-[13px] text-muted-foreground ${i < p.features.length - 1 ? 'border-b border-border' : ''}`}>
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 justify-center text-[12px] text-foreground/40">
          <span>✓ Cancel anytime</span>
          <span>✓ No price increases</span>
          <span>✓ SOC2 compliant</span>
          <span>✓ First month refund guarantee</span>
        </div>
      </div>
    </section>
  );
}

/* ───────────── FOOTER ───────────── */
export function FooterV2() {
  const cols: Array<{ title: string; links: Array<{ label: string; to: string }> }> = [
    { title: 'Product', links: [{ label: 'Features', to: '#features' }, { label: 'Pricing', to: '#pricing' }, { label: 'Changelog', to: '/about' }, { label: 'Status', to: '/about' }] },
    { title: 'Company', links: [{ label: 'About', to: '/about' }, { label: 'Blog', to: '/blog' }, { label: 'Careers', to: '/about' }, { label: 'Contact', to: '/about' }] },
    { title: 'Legal',   links: [{ label: 'Privacy', to: '/privacy' }, { label: 'Terms', to: '/terms' }, { label: 'Security', to: '/privacy' }, { label: 'Data Processing', to: '/privacy' }] },
  ];
  return (
    <footer className="bg-surface border-t border-border pt-12 pb-8">
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="font-display text-lg font-bold tracking-tight">
            <span className="text-foreground">Output</span><span className="text-primary">Lens</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Probabilities, not predictions.</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase" style={{ letterSpacing: '0.1em' }}>{c.title}</div>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l.label}>
                  {l.to.startsWith('#') ? (
                    <a href={l.to} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">{l.label}</a>
                  ) : (
                    <Link to={l.to} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-[1280px] mx-auto px-6 mt-8 pt-6 border-t border-border">
        <p className="text-[12px] text-foreground/40">© {new Date().getFullYear()} OutputLens Ltd. All rights reserved.</p>
      </div>
    </footer>
  );
}