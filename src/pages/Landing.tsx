import { useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Database,
  Brain,
  Gauge,
  Quote
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

// 3 simplified features
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
  { name: 'Tesla, Inc.', ticker: 'TSLA', riskScore: 78, riskLevel: 'High' },
  { name: 'Apple Inc.', ticker: 'AAPL', riskScore: 23, riskLevel: 'Low' },
  { name: 'Amazon.com, Inc.', ticker: 'AMZN', riskScore: 45, riskLevel: 'Medium' },
  { name: 'NVIDIA Corporation', ticker: 'NVDA', riskScore: 35, riskLevel: 'Medium' },
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

// Helper function to get risk level color
const getRiskLevelColor = (level: string) => {
  switch (level) {
    case 'High':
      return 'text-destructive bg-destructive/10';
    case 'Medium':
      return 'text-warning bg-warning/10';
    case 'Low':
      return 'text-bullish bg-bullish/10';
    default:
      return 'text-muted-foreground bg-muted';
  }
};

export default function Landing() {
  useEffect(() => {
    document.title = 'OutputLens: AI-Powered Risk Intelligence for Smarter Trading';
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-gradient py-16 lg:py-24 overflow-hidden">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <Badge variant="secondary" className="px-4 py-1.5 text-sm">
              AI-Powered Risk Intelligence
            </Badge>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground font-brand leading-tight">
              Stop Guessing,{' '}
              <span className="text-primary">Start Winning</span>
            </h1>
            
            {/* Subhead */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              OutputLens provides a comprehensive risk management layer, leveraging AI to analyze 
              qualitative, quantitative, and scenario-based data for smarter asset purchasing decisions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild className="px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                <Link to="/auth?mode=signup">
                  Request a Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8 py-6 text-lg">
                <a href="#features">
                  Learn More
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="section-container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Our Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-brand">
              A Smarter Way to Assess Risk
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              OutputLens combines powerful data analysis with cutting-edge AI to give you an unparalleled edge in the market.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-border/50 hover:border-primary/30 transition-all duration-300 group"
              >
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
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
        <section id="demo" className="py-16 bg-muted/30">
          <div className="section-container">
            <div className="max-w-3xl mx-auto">
              <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <InteractivePreview />
              </Suspense>
            </div>
          </div>
        </section>
      </LazySection>

      {/* Asset Risk Dashboard Section */}
      <section className="py-20 bg-background">
        <div className="section-container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Use Cases</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4 font-brand">
              Real-time Asset Risk Analysis
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See our AI in action. Here's a sample of real-time risk assessments for popular market assets.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Card className="border-border/50">
              <CardContent className="p-0">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Asset Risk Dashboard</h3>
                  <p className="text-xs text-muted-foreground">Probability of risk for asset purchase based on our analysis.</p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead className="text-center">Risk Score</TableHead>
                      <TableHead className="text-center">Risk Level</TableHead>
                      <TableHead className="text-right">Ticker</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleAssets.map((asset) => (
                      <TableRow 
                        key={asset.ticker} 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">{asset.name}</TableCell>
                        <TableCell className="text-center">
                          <span className="font-mono font-semibold">{asset.riskScore}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="secondary" 
                            className={getRiskLevelColor(asset.riskLevel)}
                          >
                            {asset.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {asset.ticker}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4 font-brand">
              Trusted by Professionals
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear what our users have to say about their experience with OutputLens.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />
                  <p className="text-sm text-foreground mb-6 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="border-t border-border pt-4">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
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
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="section-container">
          <div className="glass-card p-8 md:p-12 text-center max-w-3xl mx-auto border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-brand">
              Ready to Elevate Your Trading?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Sign up to get early access, or contact us for a personalized demo for your team. 
              We're here to answer any questions you have.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="px-8 py-6 text-lg">
                <Link to="/auth?mode=signup">
                  Sign Up for Early Access
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8 py-6 text-lg">
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
