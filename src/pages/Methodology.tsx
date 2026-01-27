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
  ArrowRight,
  Sparkles,
  CheckCircle2,
  LineChart,
  Database,
  Cpu,
  Atom,
  XCircle
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

const dataPoints = [
  { value: '10,000', label: 'Monte Carlo Paths', sublabel: 'Up to (Paid)' },
  { value: 'GBM', label: 'Stochastic Engine', sublabel: 'Geometric Brownian Motion' },
  { value: 'Neural', label: 'Database', sublabel: 'Regime Similarity' },
  { value: '99%', label: 'VaR Coverage', sublabel: 'Tail Risk' },
];

// Stochastic models section
const stochasticModels = [
  {
    name: 'Geometric Brownian Motion (GBM)',
    description: 'Primary simulation engine with random drift. The foundation of options pricing and risk modeling.',
    icon: Activity,
  },
  {
    name: 'GARCH-like Dynamics',
    description: 'Stochastic volatility extensions that capture volatility clustering and mean reversion.',
    icon: LineChart,
  },
  {
    name: 'Fat-Tailed Distributions',
    description: 'Non-Gaussian returns modeling. Markets have fatter tails than normal distributions predict.',
    icon: BarChart3,
  },
  {
    name: 'Regime Switching',
    description: 'Bull / Base / Bear state detection. Markets operate in distinct regimes with different dynamics.',
    icon: TrendingUp,
  },
];

// Physics-inspired models
const physicsModels = [
  { analogy: 'Market as particle system', explanation: 'Assets move under random forces, just like particles in statistical mechanics.' },
  { analogy: 'Volatility = energy', explanation: 'Higher volatility means more "energy" in the system, wider price swings.' },
  { analogy: 'Liquidity shocks = impulse forces', explanation: 'Sudden liquidity changes act like impulse forces on asset prices.' },
  { analogy: 'Correlation clustering = phase transitions', explanation: 'Markets undergo phase transitions where correlations suddenly spike.' },
];

// What AI does NOT do
const aiDoesNot = [
  'Never predicts price',
  'Never gives trading signals',
  'Never optimizes portfolios',
  'Never provides financial advice',
];

const aiDoes = [
  'Explains probability distributions',
  'Translates math into plain English',
  'Summarizes risk scenarios',
  'Highlights tail event exposure',
];

export default function Methodology() {
  useEffect(() => {
    document.title = 'Methodology - Stochastic Models & Physics-Inspired Risk | OutputLens';
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
              The Math & Physics Behind{' '}
              <span className="text-primary">Every Scenario</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Stochastic processes, Monte Carlo simulation, and AI interpretation—transparent, reproducible, and deterministic.
            </p>

            {/* IP Boundary Statement */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Target className="h-4 w-4" />
              The mathematics are public. Our IP is how we orchestrate, interpret, and operationalize them at scale.
            </div>
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
                Truth Over Hype
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Probabilities, not predictions. Deterministic math first, AI second. Transparent methodology.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Target, title: 'Probabilities, Not Predictions', description: 'We show where your trade could end up—not where it will. Every outcome has a probability.' },
                { icon: Cpu, title: 'Deterministic Math First', description: 'Monte Carlo simulation with GBM. Reproducible, seeded, vectorized. AI explains—never decides.' },
                { icon: Activity, title: 'Real Market Conditions', description: 'Live volatility from Finnhub, Twelve Data, CoinGecko. Analysis reflects today\'s market regime.' },
              ].map((principle) => (
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

          {/* Stochastic & Financial Mathematics */}
          <section>
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4">Stochastic & Financial Mathematics</Badge>
              <h2 className="text-3xl font-bold text-foreground font-brand mb-3">
                The Simulation Engine
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Geometric Brownian Motion at the core, with stochastic volatility extensions and fat-tailed modeling.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {stochasticModels.map((model) => (
                <div key={model.name} className="glass-card p-6 hover:border-primary/20 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                      <model.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{model.name}</h3>
                      <p className="text-sm text-muted-foreground">{model.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Physics-Inspired Modeling */}
          <section>
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4">
                <Atom className="h-3 w-3 mr-1" />
                Physics-Inspired Modeling
              </Badge>
              <h2 className="text-3xl font-bold text-foreground font-brand mb-3">
                Statistical Mechanics Analogies
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                We use physics analogies to build intuition—not to predict. These are models for understanding, not forecasting.
              </p>
            </div>
            
            <div className="glass-card p-8">
              <div className="grid md:grid-cols-2 gap-6">
                {physicsModels.map((model) => (
                  <div key={model.analogy} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground mb-1">{model.analogy}</p>
                      <p className="text-sm text-muted-foreground">{model.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground italic">
                  ⚠️ These are models for intuition, not predictions. They help users think probabilistically about market dynamics.
                </p>
              </div>
            </div>
          </section>

          {/* Neural Database + RAG */}
          <section>
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4">
                <Database className="h-3 w-3 mr-1" />
                Neural Database + RAG
              </Badge>
              <h2 className="text-3xl font-bold text-foreground font-brand mb-3">
                Context Retrieval, Not Prediction
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                The neural database retrieves historically similar volatility and regime patterns to contextualize risk.
              </p>
            </div>
            
            <div className="glass-card p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    What We Store
                  </h3>
                  <ul className="space-y-2">
                    {['Embeddings of historical price paths', 'Volatility regime signatures', 'Tail event patterns (crashes, squeezes)', 'Macro + sentiment metadata'].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    What We Retrieve
                  </h3>
                  <ul className="space-y-2">
                    {['Scenario similarity search', 'Pattern recognition for context', 'Historical regime comparisons', 'AI explanation grounding'].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Critical grounding statement */}
              <div className="mt-6 p-4 rounded-lg bg-caution/10 border border-caution/20">
                <p className="text-sm text-foreground font-medium">
                  ⚠️ The neural database does NOT predict markets. It retrieves historically similar volatility and regime patterns to contextualize risk.
                </p>
              </div>

              {/* Free vs Paid */}
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="font-semibold text-foreground mb-2">Free Tier</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Limited history retrieval</li>
                    <li>• Manual "Explain" button</li>
                    <li>• US markets only</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="font-semibold text-foreground mb-2">Paid Tiers</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Full history access</li>
                    <li>• Auto AI explanations</li>
                    <li>• Cross-asset comparisons</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* LLM Usage Principles */}
          <section>
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4">
                <Brain className="h-3 w-3 mr-1" />
                AI Interpretation Layer
              </Badge>
              <h2 className="text-3xl font-bold text-foreground font-brand mb-3">
                What AI Does—And Does NOT Do
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                LLMs explain distributions and summarize risk. They never predict prices or give trading signals.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6 border-l-4 border-l-bearish">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-bearish" />
                  LLMs Never:
                </h3>
                <ul className="space-y-2">
                  {aiDoesNot.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-bearish" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="glass-card p-6 border-l-4 border-l-bullish">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-bullish" />
                  LLMs Only:
                </h3>
                <ul className="space-y-2">
                  {aiDoes.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-bullish" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
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
                The gold standard for modeling uncertain outcomes. 10,000 paths, vectorized, seeded, reproducible.
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
                      'Fat-tailed distributions capture extreme events better than Gaussian models',
                      'The result: a probability distribution of potential outcomes—not a prediction'
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
                Four Base Scenario Regimes
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Every analysis produces four core scenario regimes derived from the simulation distribution.
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
                <h3 className="font-semibold text-foreground mb-2">Risk Analysis Disclaimer</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  OutputLens shows probability distributions based on stochastic models—not predictions. 
                  The neural database retrieves historical patterns—it does NOT predict markets. 
                  LLMs explain math—they never predict prices or give trading signals. 
                  Markets are inherently unpredictable. Past volatility patterns do not guarantee future results.
                </p>
                <p className="text-xs text-muted-foreground">
                  This is not financial advice. Always conduct your own due diligence before making investment decisions.
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
              Probabilities, not predictions. Run your first Monte Carlo simulation in under 2 seconds.
            </p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bullish/10 border border-bullish/20 text-bullish text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              GBM Engine • Neural Database • Regime Switching • Open Methodology
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="px-8">
                <Link to="/demo">
                  <LineChart className="mr-2 h-5 w-5" />
                  See Live Analysis
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8">
                <Link to="/workspace">
                  Run Risk Analysis
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