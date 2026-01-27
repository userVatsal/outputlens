import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  BarChart3, 
  Building2,
  Instagram,
  Youtube,
  ArrowRight,
  Rocket,
  BookOpen,
  Target,
  Zap,
  Shield,
  Activity,
} from 'lucide-react';

// X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const personas = [
  {
    title: "Active Traders",
    subtitle: "Retail → Semi-Pro",
    description: "Get institutional-grade risk metrics before you trade. Know your win probability and worst-case scenarios.",
    icon: TrendingUp
  },
  {
    title: "Quant Analysts", 
    subtitle: "Data-Driven",
    description: "Modular risk engine with reproducible simulations. Build on solid mathematical foundations.",
    icon: BarChart3
  },
  {
    title: "Funds & Fintechs",
    subtitle: "Enterprise",
    description: "Risk infrastructure that scales. API access, deterministic outputs, transparent methodology.",
    icon: Building2
  }
];

// Core principles (user-focused, not technical)
const corePrinciples = [
  { icon: Target, title: "Truth over hype", description: "We never predict. We quantify." },
  { icon: Activity, title: "Probabilities", description: "Distributions, not price targets." },
  { icon: Shield, title: "Transparency", description: "Open methodology you can verify." },
  { icon: Zap, title: "Accessible", description: "Institutional tools for everyone." },
];

const socialLinks = [
  { name: "Founder on X", icon: XIcon, url: "https://x.com/ivatsal1", handle: "@ivatsal1" },
  { name: "OutputLens on X", icon: XIcon, url: "https://x.com/outputlens", handle: "@outputlens" },
  { name: "Instagram", icon: Instagram, url: "https://instagram.com/outputlens", handle: "@outputlens" },
  { name: "YouTube", icon: Youtube, url: "https://youtube.com/@outputlens", handle: "@outputlens" }
];

// Simplified glossary (educational value, no IP details)
const glossaryTerms = [
  {
    term: "Win Probability",
    definition: "The statistical likelihood your trade will be profitable at your target timeframe.",
  },
  {
    term: "VaR (Value at Risk)",
    definition: "The maximum expected loss at a given confidence level (e.g., 95% VaR = 5% chance of exceeding).",
  },
  {
    term: "Expected Shortfall",
    definition: "Average loss when things go wrong—the mean of the worst outcomes beyond VaR.",
  },
  {
    term: "Monte Carlo Simulation",
    definition: "Running thousands of random price scenarios to understand the full range of possibilities.",
  },
  {
    term: "Tail Risk",
    definition: "Low-probability, high-impact events—the 'black swans' that can devastate portfolios.",
  },
  {
    term: "Sharpe Ratio",
    definition: "Risk-adjusted return: how much return you get per unit of risk taken.",
  },
];

export default function About() {
  useEffect(() => {
    document.title = 'About OutputLens - Our Mission | OutputLens';
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="section-container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Rocket className="w-4 h-4 mr-2" />
              Our Story
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-brand font-bold text-foreground mb-6">
              Why We Built{' '}
              <span className="text-primary">OutputLens</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              Markets are irrational, and drawdowns are inevitable. We built OutputLens to give every trader 
              access to institutional-grade risk quantification—transparent, accessible, and honest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/workspace">
                  Try Risk Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/methodology">
                  Our Methodology
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 md:py-20 bg-primary/5 border-y border-primary/10">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <Target className="w-5 h-5" />
              <span className="font-semibold">Our Mission</span>
            </div>
            <blockquote className="text-2xl md:text-3xl font-brand font-semibold text-foreground leading-relaxed mb-4">
              "Build the most trustworthy probabilistic risk platform—giving traders the same 
              quantitative tools used by institutions, without hype or black-box predictions."
            </blockquote>
            <p className="text-lg text-muted-foreground">
              We quantify uncertainty before capital is deployed. Probabilities, not predictions.
            </p>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-16 md:py-20">
        <div className="section-container">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              What We Believe
            </Badge>
          </div>
          <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {corePrinciples.map((principle, index) => (
              <div key={index} className="text-center p-4 rounded-lg bg-card border border-border">
                <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-primary/10 flex items-center justify-center">
                  <principle.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{principle.title}</h3>
                <p className="text-xs text-muted-foreground">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              Who We Serve
            </Badge>
            <h2 className="text-3xl font-brand font-bold text-foreground">
              Built for Risk-Aware Traders
            </h2>
          </div>
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
            {personas.map((persona, idx) => (
              <div key={idx} className="glass-card p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <persona.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-1">{persona.title}</h3>
                <p className="text-sm text-primary mb-3">{persona.subtitle}</p>
                <p className="text-sm text-muted-foreground">{persona.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learn & Explore - Glossary */}
      <section className="py-16 md:py-20">
        <div className="section-container">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <BookOpen className="w-4 h-4 mr-2" />
              Learn & Explore
            </Badge>
            <h2 className="text-3xl font-brand font-bold text-foreground mb-4">
              Risk Metrics Glossary
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Understanding these concepts will help you make better risk-aware decisions.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-4">
            {glossaryTerms.map((item) => (
              <div key={item.term} className="glass-card p-5">
                <h3 className="font-semibold text-foreground mb-2">{item.term}</h3>
                <p className="text-sm text-muted-foreground">{item.definition}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-brand font-bold text-foreground mb-2">
              Connect With Us
            </h2>
            <p className="text-muted-foreground">Follow our journey and get updates</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <social.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{social.handle}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Final CTA */}
      <section className="py-16 md:py-20">
        <div className="section-container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-brand font-bold text-foreground mb-4">
              Ready to Quantify Your Risk?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of traders who understand their risk before they trade.
            </p>
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/auth?mode=signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
