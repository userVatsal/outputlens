import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { 
  BarChart3, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  Target,
  Brain,
  Globe2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  LineChart
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const scenarios = [
  {
    name: 'Bullish Continuation',
    description: 'Momentum holds. Buyers stay confident. Trend extends.',
    range: '+2% to +6%',
    risk: 'Low',
    color: 'bullish',
    icon: TrendingUp,
  },
  {
    name: 'Mild Pullback',
    description: 'Healthy profit-taking. Consolidation before the next move.',
    range: '-3% to -1%',
    risk: 'Medium',
    color: 'caution',
    icon: Activity,
  },
  {
    name: 'High Volatility',
    description: 'Uncertainty spikes. Whipsaw price action. Wide swings.',
    range: '-5% to +5%',
    risk: 'High',
    color: 'bearish',
    icon: Zap,
  },
  {
    name: 'Sideways',
    description: 'Market pauses. No clear direction. Time decay matters.',
    range: '-1% to +1%',
    risk: 'Low',
    color: 'neutral',
    icon: BarChart3,
  },
];

const principles = [
  {
    icon: Target,
    title: 'Probabilities, Not Predictions',
    description: 'We show where your trade could end up—not where it will. Every outcome has a probability.',
  },
  {
    icon: Brain,
    title: 'Think Systematically',
    description: 'Replace gut feelings with quantified scenarios. Build intuition through simulation.',
  },
  {
    icon: Activity,
    title: 'Real Market Conditions',
    description: 'Live volatility from Finnhub, Twelve Data, and CoinGecko. Your analysis reflects today\'s market.',
  },
];

const dataPoints = [
  { value: '10,000', label: 'Simulation Paths', sublabel: 'Per Analysis' },
  { value: 'GBM', label: 'Geometric Brownian', sublabel: 'Motion Model' },
  { value: '<2s', label: 'Processing Time', sublabel: 'Edge Functions' },
  { value: '99%', label: 'VaR Coverage', sublabel: 'Tail Risk' },
];

export default function Methodology() {
  // SEO: Set page-specific document title
  useEffect(() => {
    document.title = 'Methodology - How Monte Carlo Simulation Works | OutputLens';
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-gradient py-16 lg:py-20">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="px-3 py-1">
              <Shield className="h-3 w-3 mr-1" />
              Methodology
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-brand leading-tight">
              The Math Behind{' '}
              <span className="text-primary">Every Scenario</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Institutional-grade Monte Carlo simulation. 10,000 price paths. 
              The same quantitative methods used by hedge funds—now in your browser.
            </p>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="py-8 bg-card border-y border-border">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {dataPoints.map((metric) => (
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

      <div className="section-container py-16">
        <div className="max-w-4xl mx-auto space-y-20">
          
          {/* Core Principles */}
          <section>
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4">Core Principles</Badge>
              <h2 className="text-3xl font-bold text-foreground font-brand mb-3">
                What We Believe
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                OutputLens is built on three fundamental principles that guide every analysis.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {principles.map((principle) => (
                <div key={principle.title} className="glass-card p-6 hover:border-primary/30 transition-all duration-300 group">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <principle.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{principle.title}</h3>
                  <p className="text-sm text-muted-foreground">{principle.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Monte Carlo Simulation */}
          <section>
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4">The Engine</Badge>
              <h2 className="text-3xl font-bold text-foreground font-brand mb-3">
                Monte Carlo Simulation
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                The gold standard for modeling uncertain outcomes in quantitative finance.
              </p>
            </div>
            
            <div className="glass-card p-8 mb-6">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    How It Works
                  </h3>
                  <ul className="space-y-3">
                    {[
                      'We simulate 10,000 possible price paths using Geometric Brownian Motion',
                      'Each path incorporates current volatility and random market movements',
                      'The result: a probability distribution of potential outcomes',
                      'You see win rates, expected returns, and tail risks—not just one price target'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card p-6 bg-muted/30">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Live Data Sources
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Simulations use real-time volatility from multiple providers:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Finnhub</Badge>
                    <Badge variant="secondary">Twelve Data</Badge>
                    <Badge variant="secondary">CoinGecko</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Automatic fallback to historical volatility ensures reliable results.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Base Scenarios */}
          <section>
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4">Scenario Framework</Badge>
              <h2 className="text-3xl font-bold text-foreground font-brand mb-3">
                Four Base Scenarios
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Every analysis produces four core scenarios derived from the simulation distribution.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {scenarios.map((scenario) => (
                <div key={scenario.name} className="glass-card p-6 hover:border-primary/20 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        scenario.color === 'bullish' ? 'bg-bullish/10 text-bullish' :
                        scenario.color === 'bearish' ? 'bg-bearish/10 text-bearish' :
                        scenario.color === 'caution' ? 'bg-caution/10 text-caution' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        <scenario.icon className="h-4 w-4" />
                      </div>
                      <h3 className="font-semibold text-foreground">{scenario.name}</h3>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full risk-badge-${scenario.risk.toLowerCase()}`}>
                      {scenario.risk}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">Typical Range</span>
                    <span className="font-mono font-semibold text-foreground">{scenario.range}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Market-Specific Scenarios */}
          <section>
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4">Regional Analysis</Badge>
              <h2 className="text-3xl font-bold text-foreground font-brand mb-3">
                Market-Specific Tail Events
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Additional scenarios based on regional factors and central bank policies.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { 
                  flag: '🇺🇸', 
                  market: 'US Markets', 
                  events: ['Fed Policy Shock', 'Earnings Season Vol', 'CPI / Jobs Release'] 
                },
                { 
                  flag: '🇬🇧', 
                  market: 'UK Markets', 
                  events: ['BOE Rate Decision', 'FTSE Sector Rotation', 'Sterling Vol Event'] 
                },
                { 
                  flag: '🇪🇺', 
                  market: 'EU Markets', 
                  events: ['ECB Policy Shock', 'Political Risk', 'Energy Price Shock'] 
                },
              ].map((region) => (
                <div key={region.market} className="glass-card p-6 hover:border-primary/20 transition-all">
                  <div className="text-3xl mb-3">{region.flag}</div>
                  <h3 className="font-semibold text-foreground mb-3">{region.market}</h3>
                  <ul className="space-y-2">
                    {region.events.map((event) => (
                      <li key={event} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {event}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Direction Impact */}
          <section>
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4">Position Mechanics</Badge>
              <h2 className="text-3xl font-bold text-foreground font-brand mb-3">
                Long vs Short Returns
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                How your position direction affects P&L when price moves.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6 border-l-4 border-l-bullish">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-bullish/10">
                    <TrendingUp className="h-5 w-5 text-bullish" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Long Position</h3>
                    <p className="text-xs text-muted-foreground">"I think it will go up"</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 rounded bg-muted/30">
                    <span className="text-muted-foreground">Price +5%</span>
                    <span className="font-mono text-bullish">+5% profit</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/30">
                    <span className="text-muted-foreground">Price -5%</span>
                    <span className="font-mono text-bearish">-5% loss</span>
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-6 border-l-4 border-l-bearish">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-bearish/10">
                    <TrendingDown className="h-5 w-5 text-bearish" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Short Position</h3>
                    <p className="text-xs text-muted-foreground">"I think it will go down"</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 rounded bg-muted/30">
                    <span className="text-muted-foreground">Price -5%</span>
                    <span className="font-mono text-bullish">+5% profit</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/30">
                    <span className="text-muted-foreground">Price +5%</span>
                    <span className="font-mono text-bearish">-5% loss</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="glass-card p-8 bg-caution/5 border-caution/20">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-caution/10 flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-caution" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Educational Tool Only</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  OutputLens shows probability distributions based on mathematical models—not predictions. 
                  Markets are inherently unpredictable. Past volatility patterns do not guarantee future results. 
                  This is not financial advice.
                </p>
                <p className="text-xs text-muted-foreground">
                  Always consult a qualified financial advisor before making investment decisions.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="glass-card p-8 md:p-10 text-center border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 font-brand">
              See the Math in Action
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Run your first Monte Carlo simulation in under 2 seconds. Free.
            </p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bullish/10 border border-bullish/20 text-bullish text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              10,000 scenarios. Zero guesswork.
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="px-8">
                <Link to="/demo">
                  <LineChart className="mr-2 h-5 w-5" />
                  See Live Demo
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8">
                <Link to="/analyze">
                  Analyze Your Trade
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
