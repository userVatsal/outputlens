import { useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Database,
  Brain,
  Gauge,
  Quote,
  TrendingUp,
  BarChart3,
  Shield,
  Play,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { LazySection } from '@/components/landing/LazySection';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalysisFlowAnimation } from '@/components/landing/AnalysisFlowAnimation';
import { LiveAssetDashboard } from '@/components/landing/LiveAssetDashboard';

// Lazy load below-the-fold components
const InteractivePreview = lazy(() => import('@/components/landing/InteractivePreview').then(m => ({ default: m.InteractivePreview })));
const AISemanticSection = lazy(() => import('@/components/landing/AISemanticSection').then(m => ({ default: m.AISemanticSection })));

// 3 simplified features with streamlined icons
const features = [
  {
    icon: Database,
    title: 'Data Aggregation',
    description: 'Aggregate qualitative and quantitative data from diverse sources to get a holistic view of asset risks.',
    gradient: 'from-primary/20 to-primary/5',
  },
  {
    icon: Brain,
    title: 'AI Scenario Analysis',
    description: 'Our Gen-AI tools analyze potential scenarios, incorporating internal and external factors to foresee market shifts.',
    gradient: 'from-bullish/20 to-bullish/5',
  },
  {
    icon: Gauge,
    title: 'Risk Probability Prediction',
    description: 'Receive a clear risk probability score for any asset, visualized in an intuitive gauge, to guide your investment decisions.',
    gradient: 'from-warning/20 to-warning/5',
  },
];

// Testimonials data
const testimonials = [
  {
    quote: "OutputLens has revolutionized my trading strategy. The risk probability predictions are incredibly accurate and have saved me from several potential losses. It's like having an AI co-pilot.",
    name: "Sarah L.",
    role: "Day Trader",
    avatar: "S"
  },
  {
    quote: "The depth of analysis, combining both quantitative and qualitative data, is unmatched. OutputLens provides the clarity we need to make high-stakes decisions with confidence.",
    name: "Michael B.",
    role: "Hedge Fund Manager",
    avatar: "M"
  },
  {
    quote: "I was skeptical at first, but the AI scenario analysis is a game-changer. It surfaces risks I would have never considered. An essential tool for any serious analyst.",
    name: "Jessica T.",
    role: "Financial Analyst",
    avatar: "J"
  }
];

// Stats for social proof
const stats = [
  { value: '10,000+', label: 'Monte Carlo Simulations', sublabel: 'Per analysis' },
  { value: '<2s', label: 'Analysis Speed', sublabel: 'Real-time results' },
  { value: '95%', label: 'VaR Accuracy', sublabel: 'Confidence level' },
  { value: '24/7', label: 'Market Coverage', sublabel: 'Global access' },
];

export default function Landing() {
  useEffect(() => {
    document.title = 'OutputLens: AI-Powered Risk Intelligence for Smarter Trading';
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-gradient py-20 lg:py-28 overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/3 to-bullish/3 rounded-full blur-3xl" />
        </div>
        
        <div className="section-container relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge with animation */}
            <div className="animate-fade-in opacity-0" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
              <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium shadow-sm">
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                AI-Powered Risk Intelligence
              </Badge>
            </div>

            {/* Headline with staggered animation */}
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight animate-fade-in opacity-0"
              style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
            >
              Stop Guessing,{' '}
              <span className="text-primary relative inline-block">
                Start Winning
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="currentColor" strokeWidth="3" className="animate-[dash_2s_ease-in-out_forwards]" />
                </svg>
              </span>
            </h1>
            
            {/* Subhead */}
            <p 
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in opacity-0"
              style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
            >
              OutputLens provides a comprehensive risk management layer, leveraging AI to analyze 
              qualitative, quantitative, and scenario-based data for smarter asset purchasing decisions.
            </p>

            {/* CTA Buttons */}
            <div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in opacity-0"
              style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
            >
              <Button 
                size="lg" 
                asChild 
                className="px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
              >
                <Link to="/auth?mode=signup">
                  Request a Demo
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="px-8 py-6 text-lg hover:bg-muted/50 transition-all duration-300 group"
              >
                <a href="#how-it-works">
                  <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  See How It Works
                </a>
              </Button>
            </div>

            {/* Trust indicators */}
            <div 
              className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground animate-fade-in opacity-0"
              style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-bullish" />
                <span>Bank-grade security</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span>Real-time analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-warning" />
                <span>No predictions, just data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 bg-card border-y border-border">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center animate-fade-in opacity-0"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              >
                <p className="text-3xl md:text-4xl font-bold text-primary font-mono">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-foreground">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="section-container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Our Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              A Smarter Way to Assess Risk
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              OutputLens combines powerful data analysis with cutting-edge AI to give you an unparalleled edge in the market.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="border-border/50 hover:border-primary/40 transition-all duration-500 group hover:shadow-xl animate-fade-in opacity-0 overflow-hidden relative"
                style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <CardContent className="p-8 relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Analysis Flow Animation */}
      <section id="how-it-works" className="py-24 bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              From Data to Decisions in Seconds
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Watch how OutputLens transforms raw market data into actionable risk insights.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <AnalysisFlowAnimation />
          </div>
        </div>
      </section>

      {/* Interactive Demo - Lazy loaded */}
      <LazySection fallback={<div className="py-16"><Skeleton className="h-64 max-w-3xl mx-auto" /></div>}>
        <section id="demo" className="py-24 bg-background">
          <div className="section-container">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Try It Now</Badge>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Experience the Power
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Test our risk analysis engine with real market data. No signup required.
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
                <InteractivePreview />
              </Suspense>
            </div>
          </div>
        </section>
      </LazySection>

      {/* Live Asset Dashboard Section */}
      <section className="py-24 bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Real-Time Data</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Live Asset Risk Analysis
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              See our AI in action with real-time market data and risk assessments.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <LiveAssetDashboard />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-background">
        <div className="section-container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Trusted by Professionals
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Hear what our users have to say about their experience with OutputLens.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl animate-fade-in opacity-0 group"
                style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
              >
                <CardContent className="p-8">
                  <Quote className="h-10 w-10 text-primary/20 mb-6 group-hover:text-primary/40 transition-colors duration-300" />
                  <p className="text-foreground mb-8 leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                      <span className="text-primary-foreground font-semibold text-lg">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - Lazy loaded */}
      <LazySection fallback={<div className="py-16"><Skeleton className="h-96 max-w-4xl mx-auto" /></div>}>
        <Suspense fallback={<div className="py-16"><Skeleton className="h-96 max-w-4xl mx-auto" /></div>}>
          <AISemanticSection />
        </Suspense>
      </LazySection>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-background to-primary/5 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-bullish/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
        
        <div className="section-container relative">
          <div className="glass-card p-10 md:p-16 text-center max-w-3xl mx-auto border-primary/20 shadow-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6 animate-bounce" style={{ animationDuration: '2s' }}>
              <TrendingUp className="h-8 w-8" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Elevate Your Trading?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              Sign up to get early access, or contact us for a personalized demo for your team. 
              We're here to answer any questions you have.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                asChild 
                className="px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
              >
                <Link to="/auth?mode=signup">
                  Sign Up for Early Access
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="px-8 py-6 text-lg hover:bg-muted/50 transition-all duration-300"
              >
                <a href="mailto:contact@outputlens.com">
                  Contact Us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
