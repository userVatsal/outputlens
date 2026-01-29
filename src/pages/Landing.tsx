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
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { LazySection } from '@/components/landing/LazySection';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Lazy load below-the-fold components
const InteractivePreview = lazy(() => import('@/components/landing/InteractivePreview').then(m => ({ default: m.InteractivePreview })));
const AISemanticSection = lazy(() => import('@/components/landing/AISemanticSection').then(m => ({ default: m.AISemanticSection })));

// 3 simplified features with streamlined icons
const features = [
  {
    icon: Database,
    title: 'Data Aggregation',
    description: 'Aggregate qualitative and quantitative data from diverse sources to get a holistic view of asset risks.',
  },
  {
    icon: Brain,
    title: 'AI Scenario Analysis',
    description: 'Our Gen-AI tools analyze potential scenarios, incorporating internal and external factors to foresee market shifts.',
  },
  {
    icon: Gauge,
    title: 'Risk Probability Prediction',
    description: 'Receive a clear risk probability score for any asset, visualized in an intuitive gauge, to guide your investment decisions.',
  },
];

// Sample asset dashboard data
const sampleAssets = [
  { name: 'Tesla, Inc.', ticker: 'TSLA', riskScore: 78, riskLevel: 'High' as const },
  { name: 'Apple Inc.', ticker: 'AAPL', riskScore: 23, riskLevel: 'Low' as const },
  { name: 'Amazon.com, Inc.', ticker: 'AMZN', riskScore: 45, riskLevel: 'Medium' as const },
  { name: 'NVIDIA Corporation', ticker: 'NVDA', riskScore: 35, riskLevel: 'Medium' as const },
];

// Testimonials data
const testimonials = [
  {
    quote: "OutputLens has revolutionized my trading strategy. The risk probability predictions are incredibly accurate and have saved me from several potential losses. It's like having an AI co-pilot.",
    name: "Sarah L.",
    role: "Day Trader"
  },
  {
    quote: "The depth of analysis, combining both quantitative and qualitative data, is unmatched. OutputLens provides the clarity we need to make high-stakes decisions with confidence.",
    name: "Michael B.",
    role: "Hedge Fund Manager"
  },
  {
    quote: "I was skeptical at first, but the AI scenario analysis is a game-changer. It surfaces risks I would have never considered. An essential tool for any serious analyst.",
    name: "Jessica T.",
    role: "Financial Analyst"
  }
];

// Helper function to get risk level styles
const getRiskLevelStyles = (level: 'High' | 'Medium' | 'Low') => {
  switch (level) {
    case 'High':
      return {
        badge: 'bg-destructive/10 text-destructive border-destructive/20',
        bar: 'bg-destructive',
      };
    case 'Medium':
      return {
        badge: 'bg-warning/10 text-warning border-warning/20',
        bar: 'bg-warning',
      };
    case 'Low':
      return {
        badge: 'bg-bullish/10 text-bullish border-bullish/20',
        bar: 'bg-bullish',
      };
  }
};

export default function Landing() {
  useEffect(() => {
    document.title = 'OutputLens: AI-Powered Risk Intelligence for Smarter Trading';
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-gradient py-20 lg:py-28 overflow-hidden relative">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        </div>
        
        <div className="section-container relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge with animation */}
            <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
              <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium">
                <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                AI-Powered Risk Intelligence
              </Badge>
            </div>

            {/* Headline with staggered animation */}
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight animate-fade-in"
              style={{ animationDelay: '100ms' }}
            >
              Stop Guessing,{' '}
              <span className="text-primary relative">
                Start Winning
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
              </span>
            </h1>
            
            {/* Subhead */}
            <p 
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in"
              style={{ animationDelay: '200ms' }}
            >
              OutputLens provides a comprehensive risk management layer, leveraging AI to analyze 
              qualitative, quantitative, and scenario-based data for smarter asset purchasing decisions.
            </p>

            {/* CTA Buttons */}
            <div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in"
              style={{ animationDelay: '300ms' }}
            >
              <Button 
                size="lg" 
                asChild 
                className="px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
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
                className="px-8 py-6 text-lg hover:bg-muted/50 transition-all duration-300"
              >
                <a href="#features">
                  Learn More
                </a>
              </Button>
            </div>

            {/* Trust indicators */}
            <div 
              className="flex items-center justify-center gap-6 pt-6 text-sm text-muted-foreground animate-fade-in"
              style={{ animationDelay: '400ms' }}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-bullish" />
                <span>Bank-grade security</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span>Real-time analysis</span>
              </div>
            </div>
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
                className="border-border/50 hover:border-primary/40 transition-all duration-300 group hover:shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110">
                    <feature.icon className="h-7 w-7" />
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

      {/* Interactive Demo - Lazy loaded */}
      <LazySection fallback={<div className="py-16"><Skeleton className="h-64 max-w-3xl mx-auto" /></div>}>
        <section id="demo" className="py-20 bg-muted/30">
          <div className="section-container">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Try It Now</Badge>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                See the AI in Action
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience our risk analysis engine with real market data.
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
                <InteractivePreview />
              </Suspense>
            </div>
          </div>
        </section>
      </LazySection>

      {/* Asset Risk Dashboard Section */}
      <section className="py-24 bg-background">
        <div className="section-container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Use Cases</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Real-time Asset Risk Analysis
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              See our AI in action. Here's a sample of real-time risk assessments for popular market assets.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="p-6 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Asset Risk Dashboard</h3>
                      <p className="text-sm text-muted-foreground">Probability of risk for asset purchase based on our analysis.</p>
                    </div>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">Asset</TableHead>
                      <TableHead className="text-center font-semibold">Risk Score</TableHead>
                      <TableHead className="text-center font-semibold">Risk Level</TableHead>
                      <TableHead className="text-right font-semibold">Ticker</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleAssets.map((asset, index) => {
                      const styles = getRiskLevelStyles(asset.riskLevel);
                      return (
                        <TableRow 
                          key={asset.ticker} 
                          className="cursor-pointer hover:bg-muted/50 transition-colors duration-200 group"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                {asset.ticker.slice(0, 2)}
                              </div>
                              {asset.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
                                  style={{ width: `${asset.riskScore}%` }}
                                />
                              </div>
                              <span className="font-mono font-semibold text-sm w-8">{asset.riskScore}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant="outline" 
                              className={`${styles.badge} font-medium`}
                            >
                              {asset.riskLevel}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                              {asset.ticker}
                            </span>
                            <ArrowRight className="h-4 w-4 inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-muted/30">
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
                className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-8">
                  <Quote className="h-10 w-10 text-primary/20 mb-6" />
                  <p className="text-foreground mb-8 leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-lg">
                        {testimonial.name.charAt(0)}
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
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
        
        <div className="section-container relative">
          <div className="glass-card p-10 md:p-16 text-center max-w-3xl mx-auto border-primary/20 shadow-xl">
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
                className="px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <Link to="/auth?mode=signup">
                  Sign Up for Early Access
                  <ArrowRight className="ml-2 h-5 w-5" />
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
