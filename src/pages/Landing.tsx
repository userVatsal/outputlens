import { useEffect } from 'react';
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
  Lock,
  Target,
  Play,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { InteractivePreview } from '@/components/landing/InteractivePreview';
import { DataProviderLogos } from '@/components/landing/DataProviderLogos';
import { AISemanticSection } from '@/components/landing/AISemanticSection';
import { ProblemSolutionSection } from '@/components/landing/ProblemSolutionSection';

// 6 features with Free vs Paid differentiation
const features = [
  {
    icon: Activity,
    title: 'Monte Carlo Simulation',
    description: 'Free: 5,000 paths | Paid: 10,000 paths for full probability distribution.',
    badge: null,
  },
  {
    icon: Shield,
    title: 'Advanced Risk Metrics',
    description: 'VaR, Expected Shortfall, and tail risk quantified before you enter.',
    badge: null,
  },
  {
    icon: Brain,
    title: 'AI Risk Interpretation',
    description: 'Free: Manual trigger | Paid: Auto-generated insights with every analysis.',
    badge: null,
  },
  {
    icon: LineChart,
    title: 'Live Market Data',
    description: 'Free: 15min delay | Paid: Real-time data from global exchanges.',
    badge: null,
  },
  {
    icon: Globe2,
    title: 'Multi-Market Support',
    description: 'US, UK, EU stocks, ETFs, crypto, and forex in one platform.',
    badge: null,
  },
  {
    icon: BarChart3,
    title: 'Portfolio Analysis',
    description: 'Analyze up to 20 correlated assets with correlation risk insights.',
    badge: 'PRO',
  },
];

const metrics = [
  { value: '10,000', label: 'Simulation Paths', sublabel: 'Up to (Paid)', tooltip: 'Free: 5,000 | Paid: 10,000' },
  { value: '95%', label: 'VaR Coverage', sublabel: 'Confidence Level', tooltip: null },
  { value: '<2s', label: 'Results Delivered', sublabel: 'Edge Functions', tooltip: null },
  { value: '24/7', label: 'Market Data', sublabel: 'Live Feeds', tooltip: 'Free: 15min delay | Paid: Real-time' },
];

// Compressed use cases with value props
const useCases = [
  {
    persona: 'Active Trader',
    useCase: 'Size positions with probability, not guesswork. Free tier available.',
    icon: TrendingUp,
  },
  {
    persona: 'Portfolio Manager',
    useCase: 'Stress-test correlation risk. Upgrade for full portfolio features.',
    icon: BarChart3,
  },
  {
    persona: 'Quant Analyst',
    useCase: 'Build intuition through simulation. API access on Trader tier.',
    icon: Target,
  },
];

const comparisonPoints = [
  { feature: 'Monte Carlo Simulation', us: true, others: false },
  { feature: 'Live Volatility Data', us: true, others: false },
  { feature: 'AI Risk Interpretation', us: true, others: false },
  { feature: 'Multi-Market Support', us: true, others: 'Limited' },
  { feature: 'Tail Risk Analysis', us: true, others: false },
  { feature: 'Sentiment Integration', us: true, others: false },
];

export default function Landing() {
  useEffect(() => {
    document.title = 'OutputLens: AI Risk & Scenario Intelligence | Monte Carlo Simulation';
  }, []);

  return (
    <Layout>
      {/* Hero Section - Problem-first, YC-style */}
      <section className="hero-gradient py-16 lg:py-24 overflow-hidden">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Trust badges - reordered for relatability */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Badge variant="secondary" className="px-3 py-1">
                <LineChart className="h-3 w-3 mr-1" />
                Live Market Data
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Activity className="h-3 w-3 mr-1" />
                10,000 Simulations
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Lock className="h-3 w-3 mr-1" />
                Bank-Grade Encryption
              </Badge>
            </div>

            {/* Problem-first headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground font-brand leading-tight">
              Quantify Risk{' '}
              <span className="text-primary">Before You Trade</span>
            </h1>
            
            {/* Hidden SEO paragraph for crawlers */}
            <p className="sr-only">
              OutputLens is an AI-powered risk & scenario intelligence platform using Monte Carlo simulation 
              to calculate Value at Risk (VaR), Expected Shortfall, and tail risk for stocks, crypto, 
              and forex. Quantify portfolio risk and scenario regimes before you trade.
            </p>
            
            {/* Value-focused subhead with tier info */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Free: 5 analyses/mo. Starter & Pro: Unlimited analyses + advanced simulations. Know the downside before deploying capital.
            </p>

            {/* FOMO microcopy */}
            <p className="text-sm text-muted-foreground/80 max-w-2xl mx-auto">
              ⚡ Only 5 free analyses/month — start quantifying now.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild className="px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                <Link to="/auth?mode=signup">
                  Run Risk Analysis – Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8 py-6 text-lg">
                <Link to="/demo">
                  <Play className="mr-2 h-5 w-5" />
                  See Live Demo
                </Link>
              </Button>
            </div>

            {/* Microcopy with value prop */}
            <p className="text-sm text-muted-foreground">
              ✓ 5 free analyses/month • ✓ No credit card • ✓ Up to 10,000 Monte Carlo paths
            </p>
          </div>
        </div>
      </section>

      {/* Problem → Solution → How */}
      <ProblemSolutionSection />

      {/* Interactive Demo + Data Providers */}
      <section className="py-16 bg-background">
        <div className="section-container">
          <div className="max-w-3xl mx-auto space-y-8">
            <InteractivePreview />
            <DataProviderLogos />
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
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

      {/* Features Grid - Streamlined to 5 */}
      <section className="py-20 bg-background">
        <div className="section-container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Capabilities</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-brand">
              Institutional-Grade Risk Analysis
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Quantitative methods used by hedge funds—now accessible to everyone.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card p-6 hover:border-primary/30 transition-all duration-300 group relative"
              >
                {feature.badge && (
                  <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 bg-primary text-primary-foreground rounded-full font-semibold">
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

      {/* Use Cases - Compressed */}
      <section className="py-20 bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Use Cases</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4 font-brand">
              Who Uses OutputLens
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {useCases.map((item, index) => (
              <div key={index} className="glass-card p-6 text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-4">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.persona}</h3>
                <p className="text-sm text-muted-foreground">{item.useCase}</p>
              </div>
            ))}
          </div>
          {/* Shared CTA */}
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/demo">
                See How It Works
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-background">
        <div className="section-container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Why OutputLens</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4 font-brand">
              Beyond Traditional Analysis
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Most tools give you a single price target. We give you the entire probability distribution.
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

      {/* AI-Optimized FAQ & Semantic Section */}
      <AISemanticSection />

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="section-container">
          <div className="glass-card p-8 md:p-12 text-center max-w-3xl mx-auto border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-brand">
              Stop Guessing. Start Quantifying.
            </h2>
            <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
              Your first 5 analyses are free. Quantify your next trade in under 2 seconds.
            </p>
            <p className="text-sm text-muted-foreground/80 mb-6">
              Limited free tier — 5 analyses/month
            </p>
            
            {/* ROI Hook */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bullish/10 border border-bullish/20 text-bullish text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Up to 10,000 Monte Carlo paths • Institutional methodology
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="px-8 py-6 text-lg">
                <Link to="/auth?mode=signup">
                  Run Your First Risk Analysis
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
