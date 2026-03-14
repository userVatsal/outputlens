import { useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Database,
  Brain,
  Gauge,
  CheckCircle,
  Shield,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { LazySection } from '@/components/landing/LazySection';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalysisFlowAnimation } from '@/components/landing/AnalysisFlowAnimation';
import { LiveAssetDashboard } from '@/components/landing/LiveAssetDashboard';
import { FloatingOrbs } from '@/components/landing/FloatingOrbs';
import { GlobeGraphic } from '@/components/landing/GlobeGraphic';
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
      {/* ─── HERO — Sarvam-inspired warm gradient with floating orbs ─── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden hero-gradient-warm">
        <FloatingOrbs variant="warm" />

        {/* Globe wireframe background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <GlobeGraphic className="w-[600px] h-[600px] md:w-[800px] md:h-[800px] text-foreground" />
        </div>

        <div className="relative z-10 section-container py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* Tag pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold glass-card">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-foreground">AI-Powered Risk Intelligence</span>
            </div>

            {/* Hero headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-foreground">
              Know Your Risk
              <br />
              <span className="text-primary">Before You Trade</span>
            </h1>

            {/* Subhead */}
            <p className="text-lg md:text-xl text-foreground/60 max-w-xl mx-auto leading-relaxed">
              Monte Carlo simulation, AI scenario analysis, and real-time market data — probabilities, not predictions.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-primary-foreground text-base bg-foreground hover:opacity-90 transition-all group shadow-lg"
              >
                Experience OutputLens
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm text-foreground/70 hover:text-foreground glass-card transition-all"
              >
                See How It Works
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-5 text-sm text-foreground/40 pt-2">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-bullish" /> No credit card</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-bullish" /> 5 free analyses</span>
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" /> Secure</span>
            </div>
          </div>

          {/* Glass card terminal preview */}
          <div className="mt-16 max-w-2xl mx-auto perspective-1000">
            <div className="glass-card-dark rounded-2xl overflow-hidden shadow-2xl animate-fade-in preserve-3d" style={{ transform: 'rotateX(2deg)' }}>
              <div className="terminal-header">
                <div className="terminal-dot" style={{ backgroundColor: '#FF5F57' }} />
                <div className="terminal-dot" style={{ backgroundColor: '#FEBC2E' }} />
                <div className="terminal-dot" style={{ backgroundColor: '#28C840' }} />
                <span className="text-xs ml-3 text-white/35 font-mono">outputlens — risk engine</span>
              </div>
              <div className="p-5 space-y-1 font-mono text-[0.8rem]">
                <div className="text-white/40">$ analyze TSLA --horizon 30d --direction long</div>
                <div className="text-white/30">→ Running 10,000 Monte Carlo paths...</div>
                <div className="text-white/30">→ Detecting regime: VOLATILE</div>
                <div className="text-green-400 font-semibold mt-1">✓ Analysis complete in 1.8s</div>
                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Win Probability', value: '67%', color: '#4ade80' },
                    { label: '95% VaR', value: '-12.4%', color: '#f87171' },
                    { label: 'Risk Score', value: '6/10', color: '#facc15' },
                  ].map(m => (
                    <div key={m.label} className="text-center">
                      <p className="text-white/35 text-[0.68rem]">{m.label}</p>
                      <p className="font-bold text-base" style={{ color: m.color }}>{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR — glass strip ─── */}
      <section className="py-6 bg-card/80 backdrop-blur border-b border-border">
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
      <section className="relative py-24 bg-background overflow-hidden">
        <FloatingOrbs variant="cool" />
        <div className="relative z-10 section-container">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start max-w-5xl">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">The Problem</p>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground leading-tight">
                Most traders enter positions without knowing their actual downside.
              </h2>
            </div>
            <div className="space-y-6 pt-2 md:pt-10">
              {painPoints.map((p, i) => (
                <div key={i} className="flex items-start gap-4 glass-card p-5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-destructive/12">
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

      {/* ─── HOW IT WORKS — terminal animation with glass bg ─── */}
      <section id="how-it-works" className="relative py-24 bg-muted/50 overflow-hidden">
        <div className="section-container relative z-10">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">
              From data to decision
              <br />in under 2 seconds.
            </h2>
          </div>
          <div className="max-w-4xl">
            <AnalysisFlowAnimation />
          </div>
        </div>
      </section>

      {/* ─── FEATURES — glass cards with 3D hover ─── */}
      <section id="features" className="relative py-24 bg-background overflow-hidden">
        <FloatingOrbs variant="cool" />
        <div className="section-container relative z-10">
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
                  <div className={cn('p-10 lg:p-14 flex flex-col justify-center', !isEven && 'md:order-2')}>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
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
      <section className="py-24 bg-muted/50">
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
        <section id="demo" className="relative py-24 bg-background overflow-hidden">
          <FloatingOrbs variant="cool" />
          <div className="section-container relative z-10">
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

      {/* ─── TESTIMONIALS — glass cards ─── */}
      <section className="py-24 bg-muted/50">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
            {testimonials.map((t) => (
              <div key={t.name} className="glass-card p-8">
                <p className="text-foreground leading-relaxed mb-6 text-[1.05rem]">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground flex-shrink-0 bg-primary"
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

      {/* ─── FINAL CTA — warm gradient bookend with glass card ─── */}
      <section className="relative py-24 overflow-hidden hero-gradient-warm">
        <FloatingOrbs variant="warm" />
        <div className="relative z-10 section-container">
          <div className="glass-card-dark max-w-2xl mx-auto p-12 md:p-16 text-center rounded-3xl">
            <GlobeGraphic className="absolute inset-0 w-full h-full text-white pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">
                Ready to trade with clarity?
              </h2>
              <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
                Stop guessing. Start quantifying. Your first 5 analyses are free.
              </p>
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-foreground text-base bg-white hover:bg-white/90 transition-all group shadow-lg"
              >
                Get Started Now
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <p className="text-white/30 text-sm mt-4">No credit card required · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
