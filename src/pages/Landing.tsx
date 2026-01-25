import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Zap, 
  ArrowRight, 
  Check, 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Globe2, 
  LineChart,
  Activity,
  Lock,
  ChevronRight,
  BookOpen,
  Play,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { InteractivePreview } from '@/components/landing/InteractivePreview';
import { DataProviderLogos } from '@/components/landing/DataProviderLogos';
import { AISemanticSection } from '@/components/landing/AISemanticSection';

const features = [
  {
    icon: Activity,
    title: 'Monte Carlo Simulation',
    description: 'See all possible outcomes, not just one price target. 10,000 probabilistic paths reveal where your trade could realistically end up.',
  },
  {
    icon: Shield,
    title: 'Advanced Risk Metrics',
    description: 'Calculate VaR, Expected Shortfall, and tail risk before you enter. Know your worst-case scenario upfront.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Complex quantitative results translated into plain language. Understand what the numbers actually mean for your trade.',
  },
  {
    icon: LineChart,
    title: 'Live Market Data',
    description: 'Analysis uses current volatility from global markets. Your scenarios reflect real market conditions, not static assumptions.',
  },
  {
    icon: Globe2,
    title: 'Multi-Market Support',
    description: 'US, UK, and EU markets with localized currencies. Stocks, ETFs, crypto, and forex—all in one platform.',
  },
  {
    icon: Zap,
    title: 'Sentiment Analysis',
    description: 'AI agents monitor news and social signals continuously. Qualitative data quantified into your scenario analysis.',
  },
];

const metrics = [
  { value: '10,000', label: 'Scenarios Simulated', sublabel: 'Per Trade' },
  { value: '95%', label: 'Confidence Metrics', sublabel: 'VaR Coverage' },
  { value: '<2s', label: 'Results Delivered', sublabel: 'Edge Functions' },
  { value: '24/7', label: 'Global Market Data', sublabel: 'Live Feeds' },
];

// Use cases instead of fake testimonials
const useCases = [
  {
    persona: 'Active Trader',
    useCase: 'See the probability distribution before sizing your position. Know your max drawdown before you enter.',
    icon: TrendingUp,
  },
  {
    persona: 'Portfolio Manager',
    useCase: 'Run multi-asset scenarios to understand correlation risk. Quantify tail events across your book.',
    icon: BarChart3,
  },
  {
    persona: 'Learning Investor',
    useCase: 'Understand how volatility affects potential outcomes. Build intuition for risk-reward without real capital at stake.',
    icon: BookOpen,
  },
];

const comparisonPoints = [
  { feature: 'Monte Carlo Simulation', us: true, others: false },
  { feature: 'Live Volatility Data', us: true, others: false },
  { feature: 'AI-Powered Explanations', us: true, others: false },
  { feature: 'Multi-Market Support', us: true, others: 'Limited' },
  { feature: 'Tail Risk Analysis', us: true, others: false },
  { feature: 'Sentiment Integration', us: true, others: false },
];

export default function Landing() {
  // SEO: Set page-specific document title
  useEffect(() => {
    document.title = 'OutputLens: AI Trade Risk Analysis - Monte Carlo Simulation Tool';
  }, []);

  return (
    <Layout>
      {/* Hero Section - Enhanced */}
      <section className="hero-gradient py-16 lg:py-24 overflow-hidden">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Trust badges - verifiable claims only */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Badge variant="secondary" className="px-3 py-1">
                <Activity className="h-3 w-3 mr-1" />
                10,000 Simulation Paths
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <LineChart className="h-3 w-3 mr-1" />
                Live Market Data
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Lock className="h-3 w-3 mr-1" />
                Bank-Grade Encryption
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground font-brand leading-tight">
              OutputLens: See Every Outcome{' '}
              <span className="text-primary">Before You Trade</span>
            </h1>
            
            {/* Hidden SEO paragraph for crawlers */}
            <p className="sr-only">
              OutputLens is an AI-powered trade risk analysis platform using Monte Carlo simulation 
              to calculate Value at Risk (VaR), Expected Shortfall, and tail risk for stocks, crypto, 
              and forex. Analyze portfolio risk and scenario outcomes before you trade.
            </p>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              10,000 Monte Carlo simulations in 2 seconds. Know your worst case, best case, and everything in between.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild className="px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                <Link to="/demo">
                  <Play className="mr-2 h-5 w-5" />
                  See Live Demo
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8 py-6 text-lg">
                <Link to="/auth?mode=signup">
                  Analyze Your First Trade Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              ✓ 5 free analyses/month • ✓ No credit card required • ✓ Avoid one bad trade and it pays for itself
            </p>
          </div>

          {/* Hero Visual - Interactive Preview */}
          <div className="mt-12 max-w-3xl mx-auto">
            <InteractivePreview />
          </div>

          {/* Data Provider Logos */}
          <div className="mt-12">
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

      {/* Features Grid - Enhanced */}
      <section className="py-20 bg-background">
        <div className="section-container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-brand">
              Institutional-Grade Analysis
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The same quantitative methods used by hedge funds and prop desks—now accessible to everyone.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card p-6 hover:border-primary/30 transition-all duration-300 group"
              >
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

      {/* Comparison Section */}
      <section className="py-20 bg-muted/30">
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

      {/* Use Cases */}
      <section className="py-20 bg-background">
        <div className="section-container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Use Cases</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4 font-brand">
              Built for Every Trader
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you're sizing a position, managing a portfolio, or learning the ropes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((item, index) => (
              <div key={index} className="glass-card p-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-4">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.persona}</h3>
                <p className="text-sm text-muted-foreground">{item.useCase}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI-Optimized FAQ & Semantic Section */}
      <AISemanticSection />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="section-container">
          <div className="glass-card p-8 md:p-12 text-center max-w-3xl mx-auto border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-brand">
              Stop Guessing. Start Quantifying.
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Your first analysis is free. See the probability distribution of your next trade in under 2 seconds.
            </p>
            
            {/* ROI Hook */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bullish/10 border border-bullish/20 text-bullish text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Avoid one bad trade per month and OutputLens pays for itself
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="px-8 py-6 text-lg">
                <Link to="/auth?mode=signup">
                  Analyze Your First Trade Free
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
