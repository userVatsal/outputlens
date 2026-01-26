import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Target, 
  Activity, 
  LineChart, 
  TrendingUp, 
  BarChart3, 
  Building2,
  Twitter,
  MessageSquare,
  Instagram,
  Youtube,
  ArrowRight,
  Clock,
  BookOpen
} from 'lucide-react';

const story = {
  problem: "Most traders lose money because they trade on gut feeling. Institutional players have quantitative tools. Retail traders don't.",
  insight: "We saw a gap: Monte Carlo simulation, tail risk analysis, and scenario planning were locked behind Bloomberg terminals and prop desk infrastructure.",
  solution: "OutputLens brings institutional-grade risk analysis to every trader. AI-powered. Quantitative + qualitative. In your browser."
};

const personas = [
  {
    title: "Active Day Traders",
    description: "Size positions with probability distributions, not hunches.",
    icon: TrendingUp
  },
  {
    title: "Quantitative Analysts",
    description: "Build intuition through Monte Carlo simulation and tail risk metrics.",
    icon: BarChart3
  },
  {
    title: "Hedge Funds & Asset Managers",
    description: "B2B scenario planning and portfolio risk assessment.",
    icon: Building2
  }
];

const approach = [
  {
    icon: Brain,
    title: "AI-Powered Risk Analysis",
    description: "10,000 Monte Carlo simulations powered by live market volatility."
  },
  {
    icon: Target,
    title: "Qualitative Scenario Planning",
    description: "Translate complex quant outputs into actionable risk interpretations."
  },
  {
    icon: Activity,
    title: "Tail Risk Measurement",
    description: "VaR, Expected Shortfall, and black swan probability analysis."
  },
  {
    icon: LineChart,
    title: "Portfolio & Asset Tracking",
    description: "Monitor positions with real-time alerts and sentiment signals."
  }
];

const articles = [
  {
    title: "How to Interpret Monte Carlo Risk Scenarios",
    excerpt: "Learn to read probability distributions and make smarter sizing decisions.",
    readTime: "5 min read",
    category: "Tutorial"
  },
  {
    title: "Understanding Tail Risk in Volatile Markets",
    excerpt: "Why 95% VaR isn't enough—and how Expected Shortfall protects you.",
    readTime: "7 min read",
    category: "Insights"
  },
  {
    title: "Position Sizing with Quantitative Analysis",
    excerpt: "From gut feeling to probability-based risk management.",
    readTime: "6 min read",
    category: "Strategy"
  }
];

const socialLinks = [
  { name: "X / Twitter", icon: Twitter, url: "#" },
  { name: "Reddit", icon: MessageSquare, url: "#" },
  { name: "Instagram", icon: Instagram, url: "#" },
  { name: "YouTube", icon: Youtube, url: "#" }
];

export default function About() {
  useEffect(() => {
    document.title = 'About OutputLens - Why We Built AI Risk Intelligence | OutputLens';
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="section-container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <BookOpen className="w-4 h-4 mr-2" />
              Our Story
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-brand font-bold text-foreground mb-6">
              Why We Built{' '}
              <span className="text-primary">OutputLens</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Markets are irrational. Drawdowns are inevitable. We built the tools to quantify what others guess.
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

      {/* Why We Exist Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-brand font-bold text-foreground mb-4">
              Why We Exist
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A founder-led mission to democratize institutional-grade risk analysis.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* The Problem */}
            <Card className="border-l-4 border-l-destructive">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-destructive">The Problem</span>
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {story.problem}
                </p>
              </CardContent>
            </Card>

            {/* The Insight */}
            <Card className="border-l-4 border-l-caution">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-caution">The Insight</span>
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {story.insight}
                </p>
              </CardContent>
            </Card>

            {/* The Solution */}
            <Card className="border-l-4 border-l-bullish">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-bullish">The Solution</span>
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {story.solution}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Customer Personas */}
          <div className="mt-16">
            <h3 className="text-2xl font-brand font-semibold text-foreground text-center mb-8">
              Who We Serve
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {personas.map((persona, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <persona.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      {persona.title}
                    </h4>
                    <p className="text-muted-foreground">
                      {persona.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="py-16 md:py-24">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-brand font-bold text-foreground mb-4">
              Our Approach
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Institutional-grade tools, accessible to everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {approach.map((item, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog / Learning Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-brand font-bold text-foreground mb-4">
              Learn & Explore
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tutorials, insights, and strategies to sharpen your risk management.
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {articles.map((article, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <Badge variant="outline" className="mb-4">
                    {article.category}
                  </Badge>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    {article.readTime}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Social Links */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Follow Us
            </h3>
            <div className="flex justify-center gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24">
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
