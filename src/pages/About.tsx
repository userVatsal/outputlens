import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  BarChart3, 
  Building2,
  Instagram,
  Youtube,
  ArrowRight,
  Clock,
  Rocket,
  BookOpen,
  Target,
  Zap,
  Shield,
  LineChart,
  PieChart,
  Activity,
  Calendar
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

const socialLinks = [
  { name: "Founder on X", icon: XIcon, url: "https://x.com/ivatsal1", handle: "@ivatsal1" },
  { name: "OutputLens on X", icon: XIcon, url: "https://x.com/outputlens", handle: "@outputlens" },
  { name: "Instagram", icon: Instagram, url: "https://instagram.com/outputlens", handle: "@outputlens" },
  { name: "YouTube", icon: Youtube, url: "https://youtube.com/@outputlens", handle: "@outputlens" }
];

// Article 1: Trading Terms
const outputLensTerms = [
  {
    term: "Win Probability",
    definition: "The statistical likelihood that a trade will be profitable at the end of your specified time horizon, calculated through Monte Carlo simulation.",
    whyItMatters: "Most traders rely on gut feeling. Win probability gives you a quantified edge before you enter a position.",
    howWeHelp: "OutputLens runs 10,000+ simulations using historical volatility and current market conditions to calculate your exact win probability."
  },
  {
    term: "VaR (Value at Risk) - 95%",
    definition: "The maximum expected loss you could experience 95% of the time. In other words, there's only a 5% chance your loss will exceed this number.",
    whyItMatters: "VaR helps you size positions appropriately and set stop-losses based on statistical reality, not arbitrary levels.",
    howWeHelp: "We calculate 95% VaR for every analysis, showing you the realistic worst-case scenario for your trade."
  },
  {
    term: "Expected Shortfall (CVaR)",
    definition: "Also called Conditional VaR, this measures the average loss when things go really wrong—specifically, the average of the worst 5% of outcomes.",
    whyItMatters: "VaR tells you the threshold; Expected Shortfall tells you how bad it gets when you cross it. This is crucial for tail risk management.",
    howWeHelp: "OutputLens shows Expected Shortfall alongside VaR, giving you a complete picture of downside risk."
  },
  {
    term: "Monte Carlo Simulation",
    definition: "A computational technique that runs thousands of random price path simulations based on historical volatility patterns to model possible future outcomes.",
    whyItMatters: "Instead of predicting one outcome, Monte Carlo shows you the full distribution of possibilities, revealing risks you might not have considered.",
    howWeHelp: "Every OutputLens analysis runs 10,000 Monte Carlo paths, generating realistic scenario distributions for your specific trade."
  },
  {
    term: "Tail Risk",
    definition: "The probability and severity of extreme, rare events—the 'black swan' scenarios that fall in the tails of a probability distribution.",
    whyItMatters: "Tail events, while rare, can wipe out months or years of gains. Understanding tail risk is essential for survival.",
    howWeHelp: "Our Tail Risk Panel specifically highlights low-probability, high-impact scenarios with their potential magnitude."
  },
  {
    term: "Sharpe Ratio",
    definition: "A measure of risk-adjusted return, calculated as the excess return (above risk-free rate) divided by the standard deviation of returns.",
    whyItMatters: "A high return means nothing if you took massive risk to achieve it. Sharpe Ratio tells you how efficiently you're being compensated for risk.",
    howWeHelp: "OutputLens calculates expected Sharpe Ratio for your trades, helping you compare opportunities on a risk-adjusted basis."
  },
  {
    term: "Kurtosis",
    definition: "A statistical measure of how 'fat' the tails of a distribution are. High kurtosis means more extreme outcomes than a normal distribution would predict.",
    whyItMatters: "Financial markets have fat tails—extreme moves happen more often than traditional models suggest. Ignoring kurtosis leads to underestimating risk.",
    howWeHelp: "We display kurtosis in our Advanced Metrics panel, alerting you when a distribution has dangerous fat tails."
  },
  {
    term: "Skewness",
    definition: "A measure of asymmetry in a probability distribution. Negative skewness means the left tail (losses) is longer; positive skewness means the right tail (gains) is longer.",
    whyItMatters: "Skewness tells you if your risk/reward is truly symmetric or if you're exposed to more downside than upside.",
    howWeHelp: "OutputLens calculates skewness for every simulation, revealing hidden asymmetry in your trade's risk profile."
  }
];

const industryTerms = [
  {
    term: "Alpha",
    definition: "The excess return of an investment relative to a benchmark index. Positive alpha means you're beating the market.",
    whyItMatters: "Alpha is the 'edge'—what separates skilled traders from those who'd be better off buying an index fund."
  },
  {
    term: "Beta",
    definition: "A measure of an asset's volatility relative to the overall market. A beta of 1.5 means the asset moves 50% more than the market.",
    whyItMatters: "Understanding beta helps you gauge how much market risk you're taking on with a position."
  },
  {
    term: "Drawdown",
    definition: "The peak-to-trough decline during a specific period. Maximum drawdown is the largest historical drop from a peak.",
    whyItMatters: "Drawdowns test psychological resilience. Knowing potential drawdowns helps you size positions you can actually hold."
  },
  {
    term: "Leverage",
    definition: "Using borrowed capital to increase potential returns (and losses). 2x leverage means you control twice the position your capital would normally allow.",
    whyItMatters: "Leverage amplifies everything—gains, losses, and the speed at which you can blow up an account."
  },
  {
    term: "Position Sizing",
    definition: "The process of determining how much capital to allocate to a single trade, typically based on risk parameters.",
    whyItMatters: "Position sizing is often more important than entry timing. Proper sizing ensures no single trade can devastate your portfolio."
  },
  {
    term: "Stop Loss",
    definition: "A predetermined price level at which you'll exit a losing trade to limit downside.",
    whyItMatters: "Stop losses enforce discipline and prevent emotional decision-making during drawdowns."
  },
  {
    term: "Take Profit",
    definition: "A predetermined price level at which you'll exit a winning trade to lock in gains.",
    whyItMatters: "Without take profit levels, winning trades can turn into losers. It's essential for capturing gains systematically."
  },
  {
    term: "Risk-Reward Ratio",
    definition: "The ratio between your potential profit and potential loss on a trade. A 3:1 ratio means you're risking $1 to make $3.",
    whyItMatters: "Even with a 50% win rate, a favorable risk-reward ratio can lead to profitable trading."
  }
];

// Article 2: Trading Strategies
const strategies = [
  {
    name: "Momentum Strategies",
    description: "Riding trends by buying assets showing strong upward price movement and selling those trending downward.",
    keyPrinciples: [
      "Trend-following: 'The trend is your friend'",
      "Breakout trading on volume confirmation",
      "Relative strength comparison across assets"
    ],
    howOutputLensHelps: "Our Monte Carlo simulations incorporate momentum factors, and our scenario analysis shows probability of trend continuation vs. reversal.",
    icon: TrendingUp
  },
  {
    name: "Mean Reversion",
    description: "Betting that overextended moves will revert to historical averages—buying dips and selling rallies.",
    keyPrinciples: [
      "Statistical extremes tend to normalize",
      "Bollinger Bands and RSI for overbought/oversold signals",
      "Pair trading to isolate relative value"
    ],
    howOutputLensHelps: "Our tail risk analysis identifies extreme scenarios, while VaR calculations help set appropriate entry points for mean reversion trades.",
    icon: Activity
  },
  {
    name: "Risk Parity",
    description: "Allocating capital based on risk contribution rather than dollar amounts, ensuring each position contributes equally to portfolio volatility.",
    keyPrinciples: [
      "Balance volatility, not just capital",
      "Diversification across uncorrelated assets",
      "Dynamic rebalancing as volatilities change"
    ],
    howOutputLensHelps: "Portfolio-level analysis shows risk contribution from each holding, enabling true risk-parity allocation.",
    icon: PieChart
  },
  {
    name: "Quantitative/Systematic",
    description: "Algorithm-driven strategies that remove emotion, using backtested rules and statistical models for all decisions.",
    keyPrinciples: [
      "Data-driven decision making",
      "Backtesting on historical data",
      "Consistent execution without emotional bias"
    ],
    howOutputLensHelps: "OutputLens provides the quantitative metrics (Sharpe, Kurtosis, VaR) that systematic traders need to validate their strategies.",
    icon: LineChart
  },
  {
    name: "Event-Driven",
    description: "Trading around specific catalysts like earnings announcements, M&A, central bank meetings, or economic data releases.",
    keyPrinciples: [
      "Anticipate market reactions to scheduled events",
      "Volatility expansion around catalysts",
      "Risk management for binary outcomes"
    ],
    howOutputLensHelps: "Our scenario regime analysis models bullish, bearish, and base case outcomes—perfect for event-driven setups with binary risk.",
    icon: Zap
  }
];

export default function About() {
  useEffect(() => {
    document.title = 'About OutputLens - Mission, Learn & Explore | OutputLens';
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

      {/* Mission Statement Section */}
      <section className="py-16 md:py-20 bg-primary/5 border-y border-primary/10">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <Target className="w-5 h-5" />
              <span className="font-semibold">Our Mission</span>
            </div>
            <blockquote className="text-2xl md:text-3xl font-brand font-semibold text-foreground leading-relaxed">
              "OutputLens exists to democratize institutional-grade risk analysis. We believe every trader deserves to quantify their downside before they trade—not guess. Our mission is to close the gap between retail intuition and hedge fund precision."
            </blockquote>
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
      <section id="learn" className="py-16 md:py-24">
        <div className="section-container">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <BookOpen className="w-4 h-4 mr-2" />
              Learn & Explore
            </Badge>
            <h2 className="text-3xl md:text-4xl font-brand font-bold text-foreground mb-4">
              Educational Resources
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sharpen your risk management with in-depth guides on trading terminology and strategies.
            </p>
          </div>

          {/* Article 1: Trading Terms */}
          <div id="trading-terms" className="max-w-5xl mx-auto mb-16">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 md:p-8 border-b">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="default">Glossary</Badge>
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    10 min read
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-brand font-bold text-foreground mb-2">
                  Understanding Trading & Investment Terms
                </h3>
                <p className="text-muted-foreground">
                  Master the essential terminology from OutputLens metrics to industry-standard concepts. Each term includes a clear definition, why it matters, and how OutputLens helps you apply it.
                </p>
              </div>
              
              <CardContent className="p-6 md:p-8">
                {/* OutputLens Terminology */}
                <div className="mb-10">
                  <h4 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    OutputLens Terminology
                  </h4>
                  <div className="space-y-6">
                    {outputLensTerms.map((item, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/50 border border-border">
                        <h5 className="font-semibold text-foreground text-lg mb-2">{item.term}</h5>
                        <p className="text-muted-foreground mb-3">{item.definition}</p>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20">
                            <span className="text-xs font-semibold text-amber-600 uppercase">Why It Matters</span>
                            <p className="text-sm text-foreground mt-1">{item.whyItMatters}</p>
                          </div>
                          <div className="p-3 rounded bg-primary/10 border border-primary/20">
                            <span className="text-xs font-semibold text-primary uppercase">How OutputLens Helps</span>
                            <p className="text-sm text-foreground mt-1">{item.howWeHelp}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Industry Standard Terms */}
                <div>
                  <h4 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Industry Standard Terms
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {industryTerms.map((item, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/50 border border-border">
                        <h5 className="font-semibold text-foreground mb-2">{item.term}</h5>
                        <p className="text-sm text-muted-foreground mb-2">{item.definition}</p>
                        <p className="text-xs text-primary">{item.whyItMatters}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Article 2: Trading Strategies */}
          <div id="strategies-2026" className="max-w-5xl mx-auto mb-16">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 p-6 md:p-8 border-b">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">Strategy</Badge>
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    12 min read
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-brand font-bold text-foreground mb-2">
                  Trading & Hedge Fund Strategies in 2026
                </h3>
                <p className="text-muted-foreground">
                  Explore the major approaches used by professional traders and hedge funds—from momentum to mean reversion to quantitative systematic trading—and how OutputLens supports each strategy type.
                </p>
              </div>
              
              <CardContent className="p-6 md:p-8">
                <div className="space-y-8">
                  {strategies.map((strategy, index) => {
                    const Icon = strategy.icon;
                    return (
                      <div key={index} className="p-6 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-foreground text-xl mb-2">{strategy.name}</h5>
                            <p className="text-muted-foreground">{strategy.description}</p>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                          <div className="p-4 rounded bg-background border border-border">
                            <span className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Key Principles</span>
                            <ul className="space-y-1">
                              {strategy.keyPrinciples.map((principle, pIndex) => (
                                <li key={pIndex} className="text-sm text-foreground flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  {principle}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-4 rounded bg-primary/5 border border-primary/20">
                            <span className="text-xs font-semibold text-primary uppercase mb-2 block">How OutputLens Helps</span>
                            <p className="text-sm text-foreground">{strategy.howOutputLensHelps}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Insights - Coming Soon */}
          <div id="monthly-insights" className="max-w-5xl mx-auto">
            <Card className="overflow-hidden opacity-80">
              <div className="bg-gradient-to-r from-muted to-muted/50 p-6 md:p-8 border-b">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="secondary">Coming Soon</Badge>
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    February 2026
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-brand font-bold text-foreground mb-2">
                  Monthly Finance Insights
                </h3>
                <p className="text-muted-foreground">
                  Stay tuned for our monthly analysis of market trends, emerging opportunities, and in-depth company or sector analysis. Each month we'll cover what's new in finance with data-driven insights.
                </p>
              </div>
              <CardContent className="p-6 md:p-8">
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">First Article Coming February 2026</p>
                  <p className="text-muted-foreground">Topics will include market analysis, company deep-dives, and actionable insights for traders.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="py-12 bg-muted/30">
        <div className="section-container">
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
