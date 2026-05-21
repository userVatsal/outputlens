import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { MonteCarloHero } from '@/components/landing/MonteCarloHero';
import { StatsBar } from '@/components/landing/StatsBar';

const SUGGESTED = ['AAPL', 'TSLA', 'NVDA', 'BTC-USD', 'SPY'];

const tailScenarios = [
  { label: '99% tail loss',  value: '−42.8%', note: 'Once-in-100-day event for this asset' },
  { label: '95% VaR',        value: '−18.4%', note: 'Loss you should plan to absorb' },
  { label: 'Max drawdown',   value: '−27.1%', note: 'Path-dependent peak-to-trough' },
];

const models = ['Black-Scholes-Merton', 'Geometric Brownian Motion', 'GARCH(1,1)', 'Heston Stochastic Vol', 'Hidden Markov Regimes'];

const testimonials = [
  {
    quote: 'OutputLens showed me a bimodal distribution on a position I thought was straightforward. Resized before the move.',
    name: 'James W.', role: 'Head of Quant Risk', firm: 'Long/Short Equity Fund',
  },
  {
    quote: 'The regime detection picked up a vol shift four hours before our internal signal. That alone paid for the year.',
    name: 'Priya S.', role: 'Senior Portfolio Manager', firm: 'Multi-Strategy Hedge Fund',
  },
];

export default function Landing() {
  const [ticker, setTicker] = useState('');
  const [activeTicker, setActiveTicker] = useState('AAPL');
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    document.title = 'OutputLens — The market is a distribution. Your model should be too.';
  }, []);

  const runFree = (sym?: string) => {
    const t = (sym ?? ticker).trim().toUpperCase();
    if (!t) return;
    setActiveTicker(t);
    setRevealed(true);
    setTimeout(() => document.getElementById('sim-output')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  return (
    <Layout>
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" aria-hidden />
        <div className="relative section-container py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="text-label animate-stagger-up" style={{ animationDelay: '100ms' }}>
              <span className="inline-flex items-center gap-2">
                <span className="live-dot" /> AI-powered risk intelligence
              </span>
            </div>

            <h1 className="text-display text-foreground mt-5 animate-stagger-up" style={{ animationDelay: '200ms' }}>
              The market is a distribution.<br />
              <span className="text-primary">Your model should be too.</span>
            </h1>

            <p className="text-foreground/70 text-lg mt-6 max-w-2xl leading-relaxed animate-stagger-up" style={{ animationDelay: '400ms' }}>
              OutputLens runs 10,000 Monte Carlo simulations on any asset or portfolio — giving you the full probability distribution of outcomes before you trade.
              Not a forecast. Not a prediction. A distribution.
            </p>

            <div className="mt-8 animate-stagger-up" style={{ animationDelay: '600ms' }}>
              <form onSubmit={e => { e.preventDefault(); runFree(); }} className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <input
                  type="text"
                  value={ticker}
                  onChange={e => setTicker(e.target.value)}
                  placeholder="Enter a ticker — AAPL, TSLA, BTC-USD…"
                  className="trading-input flex-1 rounded-md px-4 py-3 font-mono"
                />
                <button type="submit" className="btn-primary btn-primary-glow whitespace-nowrap">
                  Run Free Simulation <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              <p className="text-sm text-muted-foreground mt-3">
                We&apos;ll run 100 free Monte Carlo paths. No account needed.{' '}
                <span className="text-foreground/80">2,400+ analysts already running simulations.</span>
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {SUGGESTED.map(s => (
                  <button
                    key={s}
                    onClick={() => { setTicker(s); runFree(s); }}
                    className="text-xs font-mono px-2.5 py-1 rounded border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div id="sim-output" className="mt-14 max-w-3xl glass-card p-5 md:p-7 animate-stagger-up" style={{ animationDelay: '800ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-label">Live simulation</span>
                <span className="text-xs font-mono text-foreground">· {activeTicker}</span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">Updated {new Date().toUTCString().slice(17, 22)} UTC</span>
            </div>

            <MonteCarloHero ticker={activeTicker} running={revealed} />

            {revealed && (
              <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-primary text-label">
                    <Lock className="h-3.5 w-3.5" /> Unlock the full distribution
                  </div>
                  <p className="text-foreground font-semibold mt-1">
                    Your full 10,000-path simulation is ready.
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>✓ VaR / CVaR at 95% &amp; 99%</li>
                    <li>✓ Regime detection + AI commentary</li>
                    <li>✓ Export to PDF</li>
                  </ul>
                </div>
                <Link to="/auth?mode=signup" className="btn-primary whitespace-nowrap">
                  Unlock Full Analysis — Free <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section-container -mt-2 mb-20">
        <StatsBar />
      </section>

      <section className="bg-surface border-y border-border py-20">
        <div className="section-container">
          <div className="max-w-2xl">
            <p className="text-label">The trade you haven&apos;t modelled</p>
            <h2 className="text-3xl md:text-4xl font-display text-foreground mt-3 leading-tight">
              Every trade you make without a distribution is a trade made blind.
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Point forecasts hide the shape of risk. The numbers below are what a typical mid-cap equity actually looks like at the tail — before any AI commentary.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-10">
            {tailScenarios.map(t => (
              <div key={t.label} className="surface-elevated rounded-xl p-6">
                <div className="text-label">{t.label}</div>
                <div className="text-data-lg text-destructive mt-2">{t.value}</div>
                <p className="text-sm text-muted-foreground mt-3">{t.note}</p>
                <Link to="/methodology" className="text-xs text-primary hover:underline mt-3 inline-flex items-center gap-1 font-mono">
                  How we calculate this ↗
                </Link>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mt-8 font-mono">
            The quant desk at every Tier-1 fund already knows their tail risk. Do you?
          </p>
        </div>
      </section>

      <section className="section-container py-20">
        <div className="max-w-2xl">
          <p className="text-label">Built on the models institutions actually use</p>
          <h2 className="text-2xl md:text-3xl font-display text-foreground mt-3">
            Deterministic math first. AI second.
          </h2>
        </div>
        <div className="flex flex-wrap gap-3 mt-8">
          {models.map(m => (
            <span key={m} className="px-3 py-2 rounded-md border border-border bg-elevated text-sm font-mono text-foreground/90">
              {m}
            </span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-6">
          OutputLens orchestrates 10,000 simulations per analysis — not thousands, not &quot;many&quot;.{' '}
          <Link to="/methodology" className="text-primary hover:underline">See the methodology ↗</Link>
        </p>
      </section>

      <section className="bg-surface border-y border-border py-20">
        <div className="section-container">
          <p className="text-label">Verified role — not a paid review</p>
          <div className="grid md:grid-cols-2 gap-6 mt-8 max-w-5xl">
            {testimonials.map(t => (
              <figure key={t.name} className="surface-elevated rounded-xl p-7">
                <blockquote className="text-foreground leading-relaxed text-[1.02rem]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 pt-5 border-t border-border">
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {t.role}, <span className="text-foreground/70">{t.firm}</span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="section-container py-24 text-center">
        <p className="text-label">For analysts who reject point forecasts</p>
        <h2 className="text-3xl md:text-5xl font-display text-foreground mt-4 max-w-3xl mx-auto leading-tight">
          If you use a single expected-return figure, this isn&apos;t for you.
        </h2>
        <p className="text-muted-foreground mt-6 max-w-xl mx-auto">
          OutputLens is for analysts who think probabilistically — and want the math to prove it.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <Link to="/auth?mode=signup" className="btn-primary btn-primary-glow">
            Analyse a Position Free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/methodology" className="btn-ghost">See How It Works</Link>
        </div>
        <div className="mt-6 flex items-center justify-center gap-5 text-xs text-muted-foreground font-mono flex-wrap">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-bullish" /> SOC2 Type II</span>
          <span>·</span>
          <span>Cancel in 2 clicks</span>
          <span>·</span>
          <span>We don&apos;t sell data</span>
        </div>
      </section>
    </Layout>
  );
}