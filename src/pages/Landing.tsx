import { useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  ArrowRight, 
  Check, 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Globe2, 
  LineChart,
  Activity,
  Target,
  Play,
  Sparkles,
  Database,
  Cpu,
  Building2,
  Layers,
  Zap,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { LazySection } from '@/components/landing/LazySection';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load below-the-fold components
const InteractivePreview = lazy(() => import('@/components/landing/InteractivePreview').then(m => ({ default: m.InteractivePreview })));
const DataProviderLogos = lazy(() => import('@/components/landing/DataProviderLogos').then(m => ({ default: m.DataProviderLogos })));
const AISemanticSection = lazy(() => import('@/components/landing/AISemanticSection').then(m => ({ default: m.AISemanticSection })));
const ProblemSolutionSection = lazy(() => import('@/components/landing/ProblemSolutionSection').then(m => ({ default: m.ProblemSolutionSection })));

// 6 features with YC-grade technical terminology
const features = [
  {
    icon: Activity,
    title: 'Monte Carlo Simulation',
    description: 'Free: 5,000 paths (US only). Paid: 10,000+ paths (Global). GBM with fixed seeding for reproducibility.',
    badge: null,
    layer: 1,
  },
  {
    icon: Cpu,
    title: 'Stochastic Modeling',
    description: 'Fat-tailed distributions, regime switching via HMM, mean reversion (Ornstein-Uhlenbeck). Layer 1 IP.',
    badge: null,
    layer: 1,
  },
  {
    icon: Shield,
    title: 'Risk Metrics',
    description: 'VaR (90/95/99%), Expected Shortfall (CVaR), tail loss density, max drawdown. Deterministic math.',
    badge: null,
    layer: 1,
  },
  {
    icon: Database,
    title: 'Neural Database + RAG',
    description: 'Stores embeddings of volatility regimes, return distributions, correlation states. Retrieves context, never predicts.',
    badge: 'Layer 2',
    layer: 2,
  },
  {
    icon: Brain,
    title: 'AI Interpretation Layer',
    description: 'Layer 3 only: LLMs explain distributions. Never compute prices. Every number cited from Layer 1-2.',
    badge: null,
    layer: 3,
  },
  {
    icon: Globe2,
    title: 'Global Market Access',
    description: 'Free: US Only. Paid: UK, EU, Crypto, Forex. Monetized by compute + data, not UI.',
    badge: null,
    layer: 1,
  },
];

const metrics = [
  { value: '10,000', label: 'Monte Carlo Paths', sublabel: 'Up to (Paid)', tooltip: 'Free: 5,000 | Paid: 10,000' },
  { value: 'GBM', label: 'Stochastic Engine', sublabel: 'Deterministic Math', tooltip: null },
  { value: '<2s', label: 'Results Delivered', sublabel: 'Edge Functions', tooltip: null },
  { value: '3-Layer', label: 'Intelligence Stack', sublabel: 'Math → ML → AI', tooltip: 'Layer 1: Math, Layer 2: ML, Layer 3: AI' },
];

// ISP-based use cases with technical value props
const useCases = [
  {
    persona: 'Active Traders',
    subhead: 'Retail → Semi-Pro',
    problem: 'Overconfidence, gut decisions, no tail awareness',
    value: '5,000 Monte Carlo paths + VaR quantifies tail exposure before you trade. Free US tier for education.',
    icon: TrendingUp,
  },
  {
    persona: 'Quant / Technical Analysts',
    subhead: 'Data-Driven',
    problem: 'Tools fragmented & opaque',
    value: 'Modular engine: GBM, GARCH, HMM, scenario transformers. API-ready. Reproducible with fixed seeding.',
    icon: BarChart3,
  },
  {
    persona: 'B2B / Funds / Fintechs',
    subhead: 'Enterprise',
    problem: 'Risk tooling expensive, slow, legacy',
    value: 'Deterministic engine runs without OpenAI. License the math, not the UI. Compute-based pricing.',
    icon: Building2,
  },
];

const comparisonPoints = [
  { feature: 'Three-Layer Intelligence Architecture', us: true, others: false },
  { feature: 'Deterministic, Reproducible Simulations', us: true, others: false },
  { feature: 'Monte Carlo with Fixed Seeding', us: true, others: false },
  { feature: 'Neural Database for Scenario Similarity', us: true, others: false },
  { feature: 'Regime-Switching Stochastic Models', us: true, others: false },
  { feature: 'AI That Explains, Never Predicts', us: true, others: false },
  { feature: 'Transparent IP Boundaries', us: true, others: false },
];

export default function Landing() {
  useEffect(() => {
    document.title = 'OutputLens: Probabilistic Risk Intelligence | Monte Carlo Simulation';
  }, []);

  return (
    <Layout>
      {/* Hero Section - YC-style */}
      <section className="hero-gradient py-16 lg:py-24 overflow-hidden">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Trust badges - Three-layer architecture */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Badge variant="secondary" className="px-3 py-1">
                <Target className="h-3 w-3 mr-1" />
                Probabilities, Not Predictions
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20">
                <Layers className="h-3 w-3 mr-1" />
                Three-Layer Intelligence
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <LineChart className="h-3 w-3 mr-1" />
                Open Methodology
              </Badge>
            </div>

            {/* Problem-first headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground font-brand leading-tight">
              Quantify Uncertainty{' '}
              <span className="text-primary">Before You Trade</span>
            </h1>
            
            {/* Hidden SEO paragraph for crawlers */}
            <p className="sr-only">
              OutputLens is a probabilistic risk intelligence platform using Monte Carlo simulation 
              with Geometric Brownian Motion, stochastic volatility models, and neural database 
              to quantify downside risk and scenario regimes. Probabilities, not predictions.
            </p>
            
            {/* Value-focused subhead with tier info */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Free: US markets, 5 analyses/mo. Paid: Global markets, unlimited analyses + neural insights. 
              The same mathematical tools used by hedge funds—without hype or black-box predictions.
            </p>

            {/* Why Now? - YC essential (prominent placement) */}
            <div className="inline-block px-4 py-2 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-primary font-medium">
                Markets are more volatile, correlated, and regime-driven than ever. Traditional indicators fail during tail events. Probabilistic risk modeling is no longer optional.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild className="px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                <Link to="/auth?mode=signup">
                  Quantify Your Risk – Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8 py-6 text-lg">
                <a href="#demo">
                  <Play className="mr-2 h-5 w-5" />
                  Try Interactive Demo
                </a>
              </Button>
            </div>

            {/* Microcopy with value prop */}
            <p className="text-sm text-muted-foreground">
              ✓ 5 free analyses/month • ✓ No credit card • ✓ US markets free • ✓ Truth over hype
            </p>
          </div>
        </div>
      </section>

      {/* Three-Layer Architecture Visualization */}
      <section className="py-12 bg-muted/30 border-y border-border">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-3">Architecture</Badge>
              <h2 className="text-2xl font-bold text-foreground font-brand">Three-Layer Intelligence Stack</h2>
              <p className="text-sm text-muted-foreground mt-2">Deterministic math first. AI interprets, never predicts.</p>
            </div>
            
            <div className="space-y-3">
              {/* Layer 3 */}
              <div className="rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Layer 3: AI Interpretation (LLM + RAG)</p>
                      <p className="text-xs text-muted-foreground">Explains distributions • Never predicts • Cites Layer 1-2</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">Interpretation Only</Badge>
                </div>
              </div>
              
              {/* Layer 2 */}
              <div className="rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-bullish/10 flex items-center justify-center">
                      <Database className="h-5 w-5 text-bullish" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Layer 2: Statistical Adaptation (ML)</p>
                      <p className="text-xs text-muted-foreground">HMM regime detection • Neural DB similarity • Volatility adjustment</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">Classification</Badge>
                </div>
              </div>
              
              {/* Layer 1 */}
              <div className="rounded-lg border-2 border-primary/50 bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                      <Cpu className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Layer 1: Deterministic Math/Physics (CORE IP)</p>
                      <p className="text-xs text-muted-foreground">GBM simulation • VaR/CVaR • Scenarios • Reproducible with fixed seeding</p>
                    </div>
                  </div>
                  <Badge className="text-xs bg-primary text-primary-foreground">Core Engine</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem → Solution → How - Lazy loaded */}
      <LazySection fallback={<div className="py-16"><Skeleton className="h-96 max-w-4xl mx-auto" /></div>}>
        <Suspense fallback={<div className="py-16"><Skeleton className="h-96 max-w-4xl mx-auto" /></div>}>
          <ProblemSolutionSection />
        </Suspense>
      </LazySection>

      {/* Interactive Demo + Data Providers - Lazy loaded */}
      <LazySection fallback={<div className="py-16"><Skeleton className="h-64 max-w-3xl mx-auto" /></div>}>
        <section className="py-16 bg-background">
          <div className="section-container">
            <div className="max-w-3xl mx-auto space-y-8">
              <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <InteractivePreview />
              </Suspense>
              <Suspense fallback={<Skeleton className="h-16 w-full" />}>
                <DataProviderLogos />
              </Suspense>
            </div>
          </div>
        </section>
      </LazySection>

      {/* Metrics Bar - YC terminology */}
      <section className="py-8 bg-card border-y border-border">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary font-mono">
                  {metric.value}
                </p>
                <p className="text-sm font-medium text-foreground">{metric.label}</p>
                <p className="text-xs text-muted-foreground">{metric.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - YC terminology with Layer indicators */}
      <section className="py-20 bg-background">
        <div className="section-container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Capabilities</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-brand">
              Institutional-Grade Probabilistic Risk
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stochastic processes, Monte Carlo simulation, and AI interpretation—transparent, reproducible, and deterministic.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card p-6 hover:border-primary/30 transition-all duration-300 group relative"
              >
                {feature.badge && (
                  <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 bg-bullish/10 text-bullish border border-bullish/20 rounded-full font-semibold">
                    {feature.badge}
                  </span>
                )}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases - ISP-based with technical value */}
      <section className="py-20 bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Who We Serve</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4 font-brand">
              Three Ideal Customer Profiles
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Most traders guess. Institutions quantify. We close that gap.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {useCases.map((item, index) => (
              <div key={index} className="glass-card p-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-4">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{item.persona}</h3>
                <p className="text-xs text-primary mb-3">{item.subhead}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  <span className="font-semibold">Problem:</span> {item.problem}
                </p>
                <p className="text-sm text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
          {/* Shared CTA */}
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <a href="#demo">
                Try Interactive Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* IP Transparency Section - NEW */}
      <section className="py-12 bg-background">
        <div className="section-container">
          <div className="max-w-2xl mx-auto">
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">IP Transparency</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      The mathematics are public. Our IP is how we orchestrate, interpret, 
                      and operationalize them at scale. The engine runs independently of 
                      Supabase and OpenAI—benchmarkable, testable, licensable.
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">GBM: Public Math</Badge>
                      <Badge variant="outline">VaR: Public Math</Badge>
                      <Badge className="bg-primary/10 text-primary border-primary/20">Orchestration: Our IP</Badge>
                      <Badge className="bg-primary/10 text-primary border-primary/20">Interpretation: Our IP</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Section - YC differentiators */}
      <section className="py-20 bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Why OutputLens</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4 font-brand">
              Why We Win
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Others show targets → we show distributions. Others predict → we quantify downside. Others hide math → we explain it.
            </p>
          </div>
          <div className="max-w-2xl mx-auto glass-card overflow-hidden">
            <div className="grid grid-cols-3 p-4 bg-muted/50 border-b border-border font-semibold text-sm">
              <span>Feature</span>
              <span className="text-center text-primary">OutputLens</span>
              <span className="text-center text-muted-foreground">Others</span>
            </div>
            {comparisonPoints.map((point) => (
              <div key={point.feature} className="grid grid-cols-3 p-4 border-b border-border/50 text-sm">
                <span className="text-foreground">{point.feature}</span>
                <span className="text-center">
                  {point.us === true ? (
                    <Check className="h-5 w-5 text-bullish mx-auto" />
                  ) : (
                    <span className="text-muted-foreground">{point.us}</span>
                  )}
                </span>
                <span className="text-center">
                  {point.others === true ? (
                    <Check className="h-5 w-5 text-bullish mx-auto" />
                  ) : point.others === false ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <span className="text-muted-foreground">{point.others}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI-Optimized FAQ & Semantic Section - Lazy loaded */}
      <LazySection fallback={<div className="py-16"><Skeleton className="h-96 max-w-4xl mx-auto" /></div>}>
        <Suspense fallback={<div className="py-16"><Skeleton className="h-96 max-w-4xl mx-auto" /></div>}>
          <AISemanticSection />
        </Suspense>
      </LazySection>

      {/* Final CTA Section - YC mission */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="section-container">
          <div className="glass-card p-8 md:p-12 text-center max-w-3xl mx-auto border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-brand">
              We Quantify Uncertainty Before Capital Is Deployed
            </h2>
            <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
              Truth over hype. Probabilities, not predictions. Deterministic math first, AI second.
            </p>
            <p className="text-sm text-muted-foreground/80 mb-6">
              Free: US markets, 5 analyses/month. Paid: Global markets + neural insights + compute-based pricing.
            </p>
            
            {/* ROI Hook */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bullish/10 border border-bullish/20 text-bullish text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              3-Layer Stack • Reproducible Engine • Neural DB • Regime Switching
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="px-8 py-6 text-lg">
                <Link to="/auth?mode=signup">
                  Quantify Your First Trade
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8 py-6 text-lg">
                <Link to="/pricing">Compare Plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
