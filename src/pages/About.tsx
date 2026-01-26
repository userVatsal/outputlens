import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  BarChart3, 
  Building2,
  Instagram,
  Youtube,
  ArrowRight,
  Clock,
  Rocket
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
    description: "Quantify positions with probability, not gut.",
    icon: TrendingUp
  },
  {
    title: "Quantitative Analysts", 
    description: "Build intuition through scenario-based risk.",
    icon: BarChart3
  },
  {
    title: "Hedge Funds & Asset Managers",
    description: "Portfolio-level risk planning for B2B.",
    icon: Building2
  }
];

const articles = [
  {
    title: "How to Read Monte Carlo Scenarios",
    readTime: "5 min",
    category: "Tutorial"
  },
  {
    title: "Tail Risk & 95% VaR Limitations",
    readTime: "7 min",
    category: "Insight"
  },
  {
    title: "Probability-Based Position Sizing",
    readTime: "6 min",
    category: "Strategy"
  }
];

const socialLinks = [
  { name: "Founder on X", icon: XIcon, url: "https://x.com/ivatsal1", handle: "@ivatsal1" },
  { name: "OutputLens on X", icon: XIcon, url: "https://x.com/outputlens", handle: "@outputlens" },
  { name: "Instagram", icon: Instagram, url: "https://instagram.com/outputlens", handle: "@outputlens" },
  { name: "YouTube", icon: Youtube, url: "https://youtube.com/@outputlens", handle: "@outputlens" }
];

export default function About() {
  useEffect(() => {
    document.title = 'About OutputLens - Why We Built AI Risk Intelligence | OutputLens';
  }, []);

  return (
    <Layout>
      {/* Hero Section - Our Story & Mission */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="section-container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Rocket className="w-4 h-4 mr-2" />
              Our Story & Mission
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-brand font-bold text-foreground mb-6">
              Why We Built{' '}
              <span className="text-primary">OutputLens</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              Markets are irrational, and drawdowns are inevitable. We built OutputLens to give traders the same institutional-grade risk tools that hedge funds use — AI-powered, in-browser, and accessible to everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/workspace">
                  Explore Risk Scenarios
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/methodology">
                  See How It Works
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve Section - Compact Bullets */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-brand font-bold text-foreground mb-4">
              Who We Serve
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Compact Persona Bullets */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {personas.map((persona, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <persona.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {persona.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {persona.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tagline */}
            <div className="text-center">
              <p className="text-xl md:text-2xl font-brand font-semibold text-foreground">
                Most traders guess. Institutions quantify.{' '}
                <span className="text-primary">We close that gap.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Learn & Explore Section */}
      <section className="py-16 md:py-24">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-brand font-bold text-foreground mb-4">
              Learn & Explore
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sharpen your risk management with tutorials, insights, and strategies.
            </p>
          </div>

          {/* Compact Article Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
            {articles.map((article, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {article.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {article.readTime}
                    </span>
                  </div>
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* See All Resources Link */}
          <div className="text-center mb-12">
            <Link 
              to="/methodology" 
              className="inline-flex items-center text-primary hover:underline font-medium"
            >
              See All Resources
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {/* Social Links with Handles */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Follow Us
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{social.handle}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-brand font-bold text-foreground mb-4">
              Start Analyzing Risk Today
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join traders who quantify before they trade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/workspace">
                  Try Free Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
