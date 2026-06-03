import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BarChart3, Layers, GitBranch, AlertTriangle, History, Sparkles, Briefcase, Grid3x3 } from 'lucide-react';
import { FanChart } from './FanChart';
import { PLAN_CONFIG, type SubscriptionPlan } from '@/lib/stripe';
import { useCountUp } from '@/hooks/useCountUp';

/* ───────────── HERO ───────────── */
export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 md:pt-24 pb-16 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 55% at 50% -5%, hsl(189 100% 50% / 0.07), transparent 65%)' }}
      />
      <div className="relative w-full max-w-[1280px] mx-auto px-6 grid lg:grid-cols-5 gap-12 lg:gap-14 items-center">
        {/* Left: 60% */}
        <div className="lg:col-span-3">
          <div
            className="border-l-2 border-primary pl-3 font-mono text-primary text-[11px] uppercase"
            style={{ letterSpacing: '0.15em', animation: 'fade-up 500ms ease-out both' }}
          >
            Institutional-Grade Risk Intelligence
          </div>
          <h1
            className="mt-6 font-display font-extrabold"
            style={{
              fontSize: 'clamp(36px, 5.5vw, 58px)',
              letterSpacing: '-0.03em',
              lineHeight: 1.02,
              animation: 'fade-up 600ms ease-out 100ms both',
            }}
          >
            <span className="block text-foreground">The market is a</span>
            <span className="block text-primary">distribution.</span>
            <span className="block text-foreground">Trade it like one.</span>
          </h1>
          <p
            className="mt-5 text-muted-foreground"
            style={{ fontSize: 16, lineHeight: 1.75, maxWidth: 460, animation: 'fade-up 700ms ease-out 200ms both' }}
          >
            OutputLens runs 10,000 Monte Carlo simulations on any asset — giving you the full probability of outcomes, not a forecast.
          </p>
          <div className="mt-8 flex flex-wrap gap-3" style={{ animation: 'fade-up 700ms ease-out 300ms both' }}>
            <Link
              to="/auth?mode=signup"
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm px-6 py-3 hover:brightness-110 transition-all min-h-[48px]"
            >
              Analyse a Position Free →
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center rounded-lg border border-border text-foreground/70 hover:text-foreground hover:border-foreground/30 text-sm px-5 py-3 transition-colors min-h-[48px]"
            >
              See how it works
            </a>
          </div>
          <div
            className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] text-foreground/35"
            style={{ animation: 'fade-up 700ms ease-out 400ms both' }}
          >
            <span>✓ No credit card</span>
            <span aria-hidden>·</span>
            <span>✓ First simulation free</span>
            <span aria-hidden>·</span>
            <span>✓ 2,400+ analysts</span>
          </div>
        </div>

        {/* Right: 40% — Chart */}
        <div className="lg:col-span-2 relative">
          <div className="rounded-xl border border-border bg-surface p-4 md:p-5 relative shadow-[0_4px_24px_hsl(var(--primary)/0.08)]">
            <div className="hidden lg:block">
              <FanChart height={380} />
            </div>
            <div className="lg:hidden">
              <FanChart height={260} />
            </div>

            <div
              className="absolute -top-3 -right-3 rounded-lg bg-elevated border border-border px-3 py-2 font-mono text-[12px] font-semibold shadow-[0_4px_24px_hsl(var(--primary)/0.08)]"
              style={{ color: 'hsl(var(--bullish))', animation: 'fade-up 600ms ease-out 1000ms both' }}
            >
              P95 +34.2%
            </div>
            <div
              className="absolute -bottom-3 -left-3 rounded-lg bg-elevated border border-border px-3 py-2 font-mono text-[12px] font-semibold shadow-[0_4px_24px_hsl(var(--primary)/0.08)]"
              style={{ color: 'hsl(var(--bearish))', animation: 'fade-up 600ms ease-out 1100ms both' }}
            >
              CVaR 95% −12.1%
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── STATS BAR ───────────── */
export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.3 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const sims = Math.floor(useCountUp(10000, { trigger: visible, duration: 1200 }));
  const accuracy = Math.floor(useCountUp(947, { trigger: visible, duration: 1200 })); // shown as 94.7

  const fmt = (n: number) => n.toLocaleString('en-US');

  const stats = [
    { v: fmt(sims), label: 'Simulations' },
    { v: `${(accuracy / 10).toFixed(1)}%`, label: 'Accuracy' },
    { v: '<0.3s', label: 'Results' },
    { v: 'GBM·GARCH·HMM', label: 'Models' },
  ];

  return (
    <section ref={ref} className="bg-surface border-y border-border/50">
      <div className="max-w-[1280px] mx-auto px-6 py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 md:divide-x md:divide-border/40">
          {stats.map((s) => (
            <div key={s.label} className="text-center px-4 py-3">
              <div className="font-mono font-bold text-primary text-[28px] md:text-[36px] tabular-nums leading-none">{s.v}</div>
              <div className="mt-3 text-[12px] text-muted-foreground uppercase" style={{ letterSpacing: '0.1em' }}>{s.label}</div>
            </div>
          ))}
        </div>
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
        <h2 className="section-title text-center">From ticker to distribution in 3 steps</h2>
        <div className="mt-10 md:mt-14 flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-4">
          {STEPS.map((s, idx) => (
            <div key={s.n} className="flex flex-col md:flex-row md:items-start md:flex-1 md:gap-4">
              <div className="text-center md:text-left flex-1">
                <div className="w-11 h-11 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-center font-mono font-bold text-primary mx-auto md:mx-0">
                  {s.n}
                </div>
                <h3 className="mt-4 font-semibold text-lg text-foreground">{s.title}</h3>
                <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="hidden md:block mt-6 w-12 border-t border-dashed border-border/40 flex-shrink-0" />
              )}
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
        <h2 className="section-title text-center">Everything you need to quantify uncertainty</h2>
        <p className="mt-3 text-base text-muted-foreground text-center">Built for analysts who reject point forecasts</p>

        <div className="mt-10 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl bg-surface border border-border/50 p-6 hover:border-primary/20 hover:bg-elevated/50 transition-all duration-200"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'hsl(var(--primary) / 0.08)' }}
              >
                <f.icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 font-semibold text-[15px] text-foreground group-hover:text-primary transition-colors">{f.title}</h3>
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
    <section className="py-16 md:py-20 bg-surface border-y border-border/50">
      <div className="max-w-[1280px] mx-auto px-6">
        <h2 className="section-title text-center">Trusted by quant teams</h2>
        <div className="mt-10 md:mt-12 grid md:grid-cols-3 gap-5">
          {QUOTES.map((t) => (
            <figure
              key={t.a}
              className="relative rounded-xl bg-background border border-border/50 border-t-2 border-t-primary/40 p-7"
            >
              <blockquote className="italic text-[15px] text-foreground/85 leading-[1.75] before:content-['\201C'] before:text-primary before:text-[28px] before:font-serif before:leading-none before:block before:mb-2">
                {t.q}
              </blockquote>
              <figcaption className="mt-5">
                <div className="font-semibold text-sm text-foreground">{t.a}</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">{t.r}</div>
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
const PLAN_DESCRIPTIONS: Record<string, string> = {
  starter: 'For individual analysts getting started with probabilistic risk.',
  pro: 'For active traders running portfolios.',
  trader: 'For desks running multi-asset portfolios.',
};
const PAID_PLANS: SubscriptionPlan[] = ['starter', 'pro', 'trader'];
const PLANS = (annual: boolean) => PAID_PLANS.map((key) => {
  const cfg = PLAN_CONFIG[key];
  const effectiveMonthly = annual ? Math.round(cfg.price * (1 - ANNUAL_DISCOUNT)) : cfg.price;
  return {
    name: cfg.name,
    price: `$${effectiveMonthly}`,
    period: '/month',
    subPrice: annual ? `Billed $${effectiveMonthly * 12}/year` : null,
    desc: PLAN_DESCRIPTIONS[key] ?? '',
    features: cfg.features,
    highlight: !!cfg.highlighted,
    cta: 'Start free',
  };
});
export function Pricing() {
  const [annual, setAnnual] = useState(true);
  const plans = PLANS(annual);
  return (
    <section id="pricing" className="py-16 md:py-20">
      <div className="max-w-[1280px] mx-auto px-6">
        <h2 className="section-title text-center">Simple, transparent pricing</h2>
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
              className={`relative rounded-xl p-8 border transition-all ${
                p.highlight
                  ? 'border-primary bg-gradient-to-b from-primary/5 to-transparent shadow-[0_0_0_1px_hsl(var(--primary)/0.3),0_8px_32px_hsl(var(--primary)/0.1)]'
                  : 'border-border/50 bg-surface'
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-2.5 right-6 bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="text-primary text-xs font-semibold uppercase" style={{ letterSpacing: '0.1em' }}>{p.name}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <div className="font-mono font-bold text-foreground text-[44px] leading-none tabular-nums">{p.price}</div>
                {p.period && <div className="text-sm text-muted-foreground">{p.period}</div>}
              </div>
              {p.subPrice && <div className="mt-1 text-[12px] text-muted-foreground">{p.subPrice}</div>}
              <p className="mt-2 text-[13px] text-muted-foreground">{p.desc}</p>
              <Link
                to="/auth?mode=signup"
                className={`mt-6 w-full inline-flex items-center justify-center rounded-lg font-semibold text-sm min-h-[46px] px-5 transition-all ${
                  p.highlight
                    ? 'bg-primary text-primary-foreground hover:brightness-110'
                    : 'border border-primary text-primary bg-transparent hover:bg-primary/10'
                }`}
              >
                {p.cta}
              </Link>
              <ul className="mt-6">
                {p.features.map((f, i) => (
                  <li key={f} className={`flex items-start gap-2 py-2 text-[13px] text-muted-foreground ${i < p.features.length - 1 ? 'border-b border-border/40' : ''}`}>
                    <span className="text-primary font-semibold leading-5">✓</span>
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
  const cols: Array<{ title: string; links: Array<{ label: string; to: string; external?: boolean }> }> = [
    { title: 'Product', links: [
      { label: 'Features', to: '#features' },
      { label: 'Pricing', to: '#pricing' },
      { label: 'Methodology', to: '/methodology' },
      { label: 'Changelog', to: '/blog' },
    ]},
    { title: 'Company', links: [
      { label: 'About', to: '/about' },
      { label: 'Blog', to: '/blog' },
      { label: 'Roadmap', to: '/blog' },
      { label: 'Contact', to: 'mailto:hello@outputlens.com' },
      { label: 'Status', to: 'https://status.outputlens.com', external: true },
    ]},
    { title: 'Legal',   links: [
      { label: 'Privacy', to: '/privacy' },
      { label: 'Terms', to: '/terms' },
    ]},
  ];
  return (
    <footer className="bg-gradient-to-b from-background to-surface border-t border-border/50 pt-14 pb-8">
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="font-display text-lg font-bold tracking-tight flex items-center gap-2">
            <span className="block w-1.5 h-1.5 bg-primary rounded-sm" aria-hidden />
            <span><span className="text-foreground">Output</span><span className="text-primary">Lens</span></span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Probabilities, not predictions.</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase" style={{ letterSpacing: '0.1em' }}>{c.title}</div>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l.label}>
                  {l.external || l.to.startsWith('mailto:') || l.to.startsWith('http') ? (
                    <a
                      href={l.to}
                      target={l.external ? '_blank' : undefined}
                      rel={l.external ? 'noopener noreferrer' : undefined}
                      className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l.label}
                    </a>
                  ) : l.to.startsWith('#') ? (
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
      <div className="max-w-[1280px] mx-auto px-6 mt-10 pt-6 border-t border-border/40">
        <p className="text-[12px] text-foreground/40">
          © {new Date().getFullYear()} OutputLens Ltd. All rights reserved. · Not financial advice. Probabilistic tools only.
        </p>
      </div>
    </footer>
  );
}