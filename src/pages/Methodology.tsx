import { Layout } from '@/components/layout/Layout';
import { BarChart3, Shield, AlertTriangle, BookOpen, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';

const scenarios = [
  {
    name: 'Bullish Continuation',
    description: 'Market momentum continues upward with strong buyer confidence.',
    range: '+2% to +6%',
    risk: 'Low',
    color: 'bullish',
  },
  {
    name: 'Mild Pullback',
    description: 'Normal profit-taking or consolidation after recent gains.',
    range: '-3% to -1%',
    risk: 'Medium',
    color: 'caution',
  },
  {
    name: 'High Volatility',
    description: 'Erratic price swings with market uncertainty.',
    range: '-5% to +5%',
    risk: 'High',
    color: 'bearish',
  },
  {
    name: 'Sideways',
    description: 'Price consolidation with no clear direction.',
    range: '-1% to +1%',
    risk: 'Low',
    color: 'neutral',
  },
];

export default function Methodology() {
  return (
    <Layout>
      <div className="section-container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <BookOpen className="h-4 w-4" />
              Methodology
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              How OutputLens Works
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We show the probability distribution of possible outcomes—not predictions. 
              Understand the full range of where your trade could end up.
            </p>
          </div>

          {/* Key Principles */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              Key Principles
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-card p-6">
                <h3 className="font-semibold text-foreground mb-2">No Predictions</h3>
                <p className="text-sm text-muted-foreground">
                  We don't predict what will happen. We show the probability distribution 
                  of possible outcomes based on current market conditions and historical patterns.
                </p>
              </div>
              <div className="glass-card p-6">
                <h3 className="font-semibold text-foreground mb-2">Educational Tool</h3>
                <p className="text-sm text-muted-foreground">
                  OutputLens helps you think through trades systematically. It's a learning 
                  tool—not financial advice or trading signals.
                </p>
              </div>
              <div className="glass-card p-6">
                <h3 className="font-semibold text-foreground mb-2">Dynamic Scenarios</h3>
                <p className="text-sm text-muted-foreground">
                  Scenarios are generated from Monte Carlo simulation using live volatility 
                  data when available, with robust fallbacks for reliability.
                </p>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <Activity className="h-6 w-6 text-primary" />
              Monte Carlo Simulation
            </h2>
            <div className="glass-card p-6 mb-6">
              <p className="text-muted-foreground mb-4">
                For each trade, we run <strong className="text-foreground">10,000 simulated price paths</strong> using 
                Geometric Brownian Motion (GBM)—the same mathematical model used by quantitative 
                finance professionals.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-muted/30 text-center">
                  <p className="text-2xl font-bold text-primary font-mono">10,000</p>
                  <p className="text-xs text-muted-foreground">Simulation Paths</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 text-center">
                  <p className="text-2xl font-bold text-primary font-mono">GBM</p>
                  <p className="text-xs text-muted-foreground">Brownian Motion</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 text-center">
                  <p className="text-2xl font-bold text-primary font-mono">&lt;2s</p>
                  <p className="text-xs text-muted-foreground">Processing Time</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-6">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Live Data Integration
              </h4>
              <p className="text-sm text-muted-foreground">
                When available, simulations use real-time volatility from Finnhub, Twelve Data, 
                and CoinGecko. If live data is unavailable, we fall back to historical volatility 
                estimates to ensure you always get a result.
              </p>
            </div>
          </section>

          {/* Scenario Types */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-primary" />
              Base Scenarios
            </h2>
            <p className="text-muted-foreground mb-6">
              Every analysis includes four base scenarios derived from the simulation distribution:
            </p>
            <div className="space-y-4">
              {scenarios.map((scenario) => (
                <div key={scenario.name} className="glass-card p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{scenario.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full risk-badge-${scenario.risk.toLowerCase()}`}>
                          {scenario.risk} Risk
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{scenario.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Typical Range</p>
                      <p className="font-mono font-semibold text-foreground">{scenario.range}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Market-Specific */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Market-Specific Scenarios
            </h2>
            <p className="text-muted-foreground mb-6">
              Additional tail-risk scenarios based on regional factors and central bank policies:
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-card p-6">
                <div className="text-2xl mb-3">🇺🇸</div>
                <h3 className="font-semibold text-foreground mb-2">US Markets</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Fed Policy Shock</li>
                  <li>• Earnings Season Volatility</li>
                  <li>• CPI / Jobs Data Release</li>
                </ul>
              </div>
              <div className="glass-card p-6">
                <div className="text-2xl mb-3">🇬🇧</div>
                <h3 className="font-semibold text-foreground mb-2">UK Markets</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• BOE Rate Decision</li>
                  <li>• FTSE Sector Rotation</li>
                  <li>• Sterling Volatility Event</li>
                </ul>
              </div>
              <div className="glass-card p-6">
                <div className="text-2xl mb-3">🇪🇺</div>
                <h3 className="font-semibold text-foreground mb-2">EU Markets</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• ECB Policy Shock</li>
                  <li>• Political / Election Risk</li>
                  <li>• Energy Price Shock</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Direction Impact */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              How Direction Affects Returns
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6 border-l-4 border-l-bullish">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="h-5 w-5 text-bullish" />
                  <h3 className="font-semibold text-foreground">Long Position</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  You profit when prices go up. A +5% price move means +5% return. 
                  A -5% price move means -5% return.
                </p>
              </div>
              <div className="glass-card p-6 border-l-4 border-l-bearish">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingDown className="h-5 w-5 text-bearish" />
                  <h3 className="font-semibold text-foreground">Short Position</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  You profit when prices go down. A -5% price move means +5% return. 
                  A +5% price move means -5% return.
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="glass-card p-8 bg-caution/5 border-caution/20">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-caution flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Important Disclaimer</h3>
                <p className="text-sm text-muted-foreground">
                  OutputLens is for educational purposes only. Monte Carlo simulations show 
                  possible outcomes based on mathematical models—they are not predictions. 
                  Markets are unpredictable, and past volatility patterns do not guarantee 
                  future results. This is not financial advice. Always consult a qualified 
                  financial advisor before making trading decisions.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}