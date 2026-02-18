import { useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Database,
  Brain,
  Gauge,
  TrendingUp,
  TrendingDown,
  Shield,
  CheckCircle,
  BarChart3,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { LazySection } from '@/components/landing/LazySection';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalysisFlowAnimation } from '@/components/landing/AnalysisFlowAnimation';
import { LiveAssetDashboard } from '@/components/landing/LiveAssetDashboard';
import { cn } from '@/lib/utils';

const InteractivePreview = lazy(() => import('@/components/landing/InteractivePreview').then(m => ({ default: m.InteractivePreview })));
const AISemanticSection = lazy(() => import('@/components/landing/AISemanticSection').then(m => ({ default: m.AISemanticSection })));

const statsBar = [
  { value: '<2s', label: 'Analysis time' },
  { value: '10,000', label: 'Monte Carlo paths' },
  { value: '95%', label: 'VaR confidence level' },
  { value: 'Global', label: 'Market coverage' },
];

const painPoints = [
  'You see a chart and a gut feeling. Not a probability.',
  'You exit positions too early or hold through disasters.',
  'You have no idea how bad the worst-case scenario actually is.',
];

const features = [
  {
    icon: Database,
    title: 'Data Aggregation',
    description: 'Real-time prices, volatility regimes, and qualitative signals — all synthesized before your analysis runs.',
    visual: (
      <div className="space-y-2">
        {['Market Data', 'News Sentiment', 'Volatility 30D', 'Historical Patterns'].map((item, i) => (
          <div key={item} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary/60 flex-shrink-0" />
            <div className="h-2 rounded-full bg-primary/20 flex-1" style={{ width: `${[85, 62, 78, 55][i]}%` }}>
              <div className="h-full rounded-full bg-primary/50" style={{ width: '100%' }} />
            </div>
            <span className="text-xs text-white/50 font-mono w-8">{[85, 62, 78, 55][i]}%</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Brain,
    title: 'AI Scenario Analysis',
    description: 'Monte Carlo simulation builds 10,000 price paths. AI interprets them into scenarios you can actually act on.',
    visual: (
      <div className="space-y-2">
        {[
          { label: 'Bull case', pct: 28, color: 'bg-bullish' },
          { label: 'Base case', pct: 42, color: 'bg-primary' },
          { label: 'Bear case', pct: 30, color: 'bg-destructive' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="text-xs text-white/50 w-20 flex-shrink-0">{s.label}</span>
            <div className="h-5 rounded flex-1 bg-white/5 overflow-hidden">
              <div className={cn('h-full rounded flex items-center justify-end pr-2', s.color)} style={{ width: `${s.pct}%` }}>
                <span className="text-xs font-mono text-white font-semibold">{s.pct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Gauge,
    title: 'Risk Probability Score',
    description: 'A single, clear number. Win probability. Maximum drawdown. Expected shortfall. No jargon.',
    visual: (
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Win Prob', value: '67%', color: 'text-bullish' },
          { label: '95% VaR', value: '-12.4%', color: 'text-destructive' },
          { label: 'Risk Score', value: '6/10', color: 'text-caution' },
        ].map(m => (
          <div key={m.label} className="bg-white/5 rounded p-3 text-center">
            <p className={cn('text-lg font-bold font-mono', m.color)}>{m.value}</p>
            <p className="text-xs text-white/40 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>
    ),
  },
];

const testimonials = [
  {
    quote: "The risk probability predictions are incredibly accurate. It's like having an institutional risk desk available 24/7.",
    name: "Sarah L.",
    role: "Day Trader",
  },
  {
    quote: "The depth of analysis, combining both quantitative and qualitative data, is unmatched. An essential tool.",
    name: "Michael B.",
    role: "Portfolio Manager",
  },
];

export default function Landing() {
  useEffect(() => {
    document.title = 'OutputLens: AI-Powered Risk Intelligence for Smarter Trading';
  }, []);

  return (
    <Layout>
      {/* ─── HERO — dark navy, 2-column ─── */}
      <section className="hero-gradient py-20 lg:py-28 overflow-hidden">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: copy */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border"
                style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', backgroundColor: 'rgba(255,255,255,0.06)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-dot" />
                AI-Powered Risk Intelligence
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-white leading-[1.1] tracking-tight font-display">
                Know Your Risk Before You{' '}
                <span className="text-blue-400">Risk Your Money</span>
              </h1>

              <p className="text-lg text-white/60 max-w-lg leading-relaxed">
                OutputLens quantifies your downside before you enter a position. Monte Carlo simulation, AI scenario analysis, and real-time market data — in under 2 seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-3">
                <Link
                  to="/auth?mode=signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded font-semibold text-white text-sm transition-all hover:opacity-90 group"
                  style={{ backgroundColor: 'hsl(225, 83%, 53%)' }}
                >
                  Start Free Analysis
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded font-medium text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/40 transition-all"
                >
                  See How It Works
                </a>
              </div>

              <div className="flex items-center gap-5 text-sm text-white/40">
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-green-400" /> No credit card</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-green-400" /> 5 free analyses</span>
                <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-blue-400" /> Bank-grade security</span>
              </div>
            </div>

            {/* Right: terminal widget */}
            <div className="terminal-window shadow-2xl">
              <div className="terminal-header">
                <div className="terminal-dot" style={{ backgroundColor: '#FF5F57' }} />
                <div className="terminal-dot" style={{ backgroundColor: '#FEBC2E' }} />
                <div className="terminal-dot" style={{ backgroundColor: '#28C840' }} />
                <span className="text-xs ml-3" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace' }}>outputlens — risk-analysis</span>
              </div>
              <div className="p-5 space-y-1" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>
                <div style={{ color: 'rgba(255,255,255,0.4)' }}>$ analyze TSLA --horizon 30d --direction long</div>
                <div style={{ color: 'rgba(255,255,255,0.3)' }}>→ Fetching market data... done</div>
                <div style={{ color: 'rgba(255,255,255,0.3)' }}>→ Running 10,000 Monte Carlo paths...</div>
                <div style={{ color: 'rgba(255,255,255,0.3)' }}>→ Detecting regime: VOLATILE</div>
                <div style={{ color: 'rgba(255,255,255,0.3)' }}>→ Calculating CVaR at 95%... done</div>
                <div className="text-green-400 font-semibold mt-1">✓ Analysis complete in 1.8s</div>
                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
                  {[
                    { label: 'Win Probability', value: '67%', color: '#4ade80' },
                    { label: '95% VaR', value: '-12.4%', color: '#f87171' },
                    { label: 'Expected Return', value: '+8.7%', color: '#4ade80' },
                    { label: 'Tail Risk (CVaR)', value: '-18.2%', color: '#f87171' },
                    { label: 'Sharpe Ratio', value: '1.42', color: 'rgba(255,255,255,0.7)' },
                    { label: 'Risk Score', value: '6 / 10', color: '#facc15' },
                  ].map(m => (
                    <div key={m.label}>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>{m.label}</p>
                      <p style={{ color: m.color, fontWeight: 700, fontSize: '0.9rem' }}>{m.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>SCENARIO DISTRIBUTION</p>
                  {[
                    { s: 'Bull case (+18.4%)', pct: 28, color: '#4ade80' },
                    { s: 'Base case (+5.2%)', pct: 42, color: '#60a5fa' },
                    { s: 'Bear case (-14.7%)', pct: 30, color: '#f87171' },
                  ].map(sc => (
                    <div key={sc.s} className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full flex-shrink-0" style={{ width: `${sc.pct * 1.5}px`, backgroundColor: sc.color, opacity: 0.7 }} />
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>{sc.s} — {sc.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR — white strip ─── */}
      <section className="py-6 bg-card border-b border-border">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {statsBar.map((stat) => (
              <div key={stat.label} className="px-6 py-2 text-center">
                <p className="text-xl font-bold font-display text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THE PROBLEM — editorial 2-column ─── */}
      <section className="py-24 bg-background">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start max-w-5xl">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">The Problem</p>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground leading-tight">
                Most traders enter positions without knowing their actual downside.
              </h2>
            </div>
            <div className="space-y-6 pt-2 md:pt-10">
              {painPoints.map((p, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: 'hsl(var(--destructive) / 0.12)' }}>
                    <span className="text-destructive text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-foreground leading-relaxed">{p}</p>
                </div>
              ))}
              <div className="pt-4">
                <Link
                  to="/auth?mode=signup"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  See how OutputLens fixes this <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS — terminal animation ─── */}
      <section id="how-it-works" className="py-24" style={{ backgroundColor: 'hsl(220, 16%, 97%)' }}>
        <div className="section-container">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">
              From data to decision<br />in under 2 seconds.
            </h2>
          </div>
          <div className="max-w-4xl">
            <AnalysisFlowAnimation />
          </div>
        </div>
      </section>

      {/* ─── FEATURES — alternating 2-column layout ─── */}
      <section id="features" className="py-24 bg-background">
        <div className="section-container">
          <div className="mb-14 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">What We Analyse</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">
              Three layers of risk intelligence.
            </h2>
          </div>

          <div className="space-y-0">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              const isEven = i % 2 === 0;
              return (
                <div
                  key={feature.title}
                  className={cn(
                    'grid md:grid-cols-2 gap-0 border-t border-border',
                    i === features.length - 1 && 'border-b'
                  )}
                >
                  {/* Text panel */}
                  <div className={cn('p-10 lg:p-14 flex flex-col justify-center', !isEven && 'md:order-2')}>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                  {/* Visual panel */}
                  <div
                    className={cn(
                      'p-10 lg:p-14 flex items-center justify-center',
                      !isEven && 'md:order-1',
                      'border-t md:border-t-0',
                      isEven ? 'md:border-l border-border' : 'md:border-r border-border'
                    )}
                    style={{ backgroundColor: 'hsl(222, 47%, 13%)' }}
                  >
                    <div className="w-full max-w-xs">{feature.visual}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── LIVE ASSET DASHBOARD ─── */}
      <section className="py-24" style={{ backgroundColor: 'hsl(220, 16%, 97%)' }}>
        <div className="section-container">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Live Data</p>
            <h2 className="text-3xl font-bold font-display text-foreground mb-2">
              Real-time risk assessment.
            </h2>
            <p className="text-muted-foreground">
              Powered by live market data. Refreshed every 60 seconds.
            </p>
          </div>
          <div className="max-w-4xl">
            <LiveAssetDashboard />
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE DEMO ─── */}
      <LazySection fallback={<div className="py-16"><Skeleton className="h-64 max-w-3xl mx-auto" /></div>}>
        <section id="demo" className="py-24 bg-background">
          <div className="section-container">
            <div className="mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Try It Now</p>
              <h2 className="text-3xl font-bold font-display text-foreground mb-2">
                Run a real analysis. No signup required.
              </h2>
            </div>
            <div className="max-w-3xl">
              <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
                <InteractivePreview />
              </Suspense>
            </div>
          </div>
        </section>
      </LazySection>

      {/* ─── TESTIMONIALS — editorial strip ─── */}
      <section className="py-24" style={{ backgroundColor: 'hsl(220, 16%, 97%)' }}>
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-card border border-border rounded-lg p-8">
                <p className="text-foreground leading-relaxed mb-6 text-[1.05rem]">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: 'hsl(225, 83%, 53%)' }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <LazySection fallback={<div className="py-16"><Skeleton className="h-96 max-w-4xl mx-auto" /></div>}>
        <Suspense fallback={<div className="py-16"><Skeleton className="h-96 max-w-4xl mx-auto" /></div>}>
          <AISemanticSection />
        </Suspense>
      </LazySection>

      {/* ─── FINAL CTA — dark navy bookend ─── */}
      <section className="py-24 hero-gradient">
        <div className="section-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">
            Ready to trade with clarity?
          </h2>
          <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
            Stop guessing. Start quantifying. Your first 5 analyses are free.
          </p>
          <Link
            to="/auth?mode=signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded font-semibold text-white text-base transition-all hover:opacity-90 group"
            style={{ backgroundColor: 'hsl(225, 83%, 53%)' }}
          >
            Start Free Analysis
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="text-white/30 text-sm mt-4">No credit card required · Cancel anytime</p>
        </div>
      </section>
    </Layout>
  );
}
