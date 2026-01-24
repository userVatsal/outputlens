import { Link } from 'react-router-dom';
import { Shield, Zap, Target, ArrowRight, Check, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';

const features = [
  {
    icon: Target,
    title: 'Scenario Analysis',
    description: 'See how your trade might perform across multiple market conditions—bullish, bearish, volatile, or sideways.',
  },
  {
    icon: Shield,
    title: 'Risk Assessment',
    description: 'Understand your best and worst case scenarios before entering a position. Knowledge is protection.',
  },
  {
    icon: Zap,
    title: 'AI Explanations',
    description: 'Get plain-language explanations of potential outcomes. No jargon, just clarity.',
  },
];

const benefits = [
  'Analyze trades across US, UK, and EU markets',
  'Educational scenarios based on market conditions',
  'AI-powered risk explanations',
  'Track your analysis history',
  'No financial advice—just information',
];

export default function Landing() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-gradient py-20 lg:py-32">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <BarChart3 className="h-4 w-4" />
              Educational Trading Tool
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Understand Your Trade{' '}
              <span className="text-primary">Before You Enter</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              OutputLens shows you how your trade might perform across different market scenarios. 
              Educational analysis only—not financial advice.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="px-8">
                <Link to="/auth?mode=signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/methodology">How It Works</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Free tier: 10 analyses per month • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How OutputLens Helps
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We don't predict the market. We help you understand the range of possibilities 
              so you can make more informed decisions.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card p-8 text-center opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">
                Everything you need to evaluate trades
              </h2>
              <p className="text-muted-foreground">
                Whether you're new to trading or experienced, understanding potential 
                outcomes is essential. OutputLens provides educational scenario analysis 
                to help you think through your trades.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-bullish/10 flex items-center justify-center mt-0.5">
                      <Check className="h-3 w-3 text-bullish" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Sample Analysis</p>
                  <p className="text-sm text-muted-foreground">AAPL Long Position</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-bullish/5 border border-bullish/20">
                  <span className="text-sm text-muted-foreground">Best Case</span>
                  <span className="font-mono font-semibold text-bullish">+6.0%</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                  <span className="text-sm text-muted-foreground">Likely Range</span>
                  <span className="font-mono font-semibold text-foreground">-1% to +3%</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-bearish/5 border border-bearish/20">
                  <span className="text-sm text-muted-foreground">Worst Case</span>
                  <span className="font-mono font-semibold text-bearish">-8.0%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Hypothetical example for illustration only
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="section-container">
          <div className="glass-card p-12 text-center bg-gradient-to-br from-primary/5 to-primary/10">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to analyze your first trade?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Start with 10 free analyses per month. Upgrade to Pro for unlimited access.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="px-8">
                <Link to="/auth?mode=signup">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
