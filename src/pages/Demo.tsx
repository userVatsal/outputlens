import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Play,
  Eye,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { EnhancedQuantMetricsCard } from '@/components/EnhancedQuantMetricsCard';
import { EnhancedRiskSummary } from '@/components/EnhancedRiskSummary';
import { ReturnDistributionChart } from '@/components/ReturnDistributionChart';
import { ScenarioProbabilityChart } from '@/components/ScenarioProbabilityChart';
import { EnhancedScenarioDisplay } from '@/components/EnhancedScenarioDisplay';
import { DEMO_ANALYSIS } from '@/lib/demoData';

export default function Demo() {
  const analysis = DEMO_ANALYSIS;
  const [showingResults, setShowingResults] = useState(false);
  
  // Simulate analysis loading for engagement
  useEffect(() => {
    const timer = setTimeout(() => setShowingResults(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      {/* Demo Header */}
      <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 border-b border-border">
        <div className="section-container py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground font-brand">
                    Live Demo
                  </h1>
                  <Badge className="bg-primary/20 text-primary">
                    <Play className="h-3 w-3 mr-1" />
                    Sample Analysis
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  This is a real analysis output. Sign up to analyze your own trades.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button size="lg" asChild className="shadow-lg">
                <Link to="/auth?mode=signup">
                  Analyze Your Trades
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container py-8">
        {/* Trade Summary Bar */}
        <Card className="mb-6 border-primary/20">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-sm text-muted-foreground">Asset</span>
                  <p className="font-bold text-lg">{analysis.input.asset}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Direction</span>
                  <p className="font-bold text-lg flex items-center gap-1">
                    {analysis.input.direction === 'long' ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-bullish" />
                        Long
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-bearish" />
                        Short
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Entry Price</span>
                  <p className="font-bold text-lg font-mono">${analysis.input.entryPrice}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Horizon</span>
                  <p className="font-bold text-lg">{analysis.input.timeHorizon}</p>
                </div>
              </div>
              
              <Badge variant="outline" className="bg-bullish/10 text-bullish border-bullish/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Live Market Data
              </Badge>
            </div>
          </CardContent>
        </Card>

        {showingResults ? (
          <div className="space-y-8">
            {/* Key Metrics Grid */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Quantitative Risk Metrics
              </h2>
              <EnhancedQuantMetricsCard 
                riskMetrics={analysis.riskMetrics} 
                simulation={analysis.simulation}
                currencySymbol="$"
              />
            </section>

            {/* Distribution Chart */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Return Distribution</h2>
              <ReturnDistributionChart 
                riskMetrics={analysis.riskMetrics}
                simulation={analysis.simulation}
              />
            </section>

            {/* Risk Summary */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Risk Assessment
              </h2>
              <EnhancedRiskSummary analysis={analysis} />
            </section>

            {/* Scenario Probability */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Scenario Probabilities</h2>
              <ScenarioProbabilityChart 
                scenarios={analysis.scenarios} 
                currencySymbol="$"
              />
            </section>

            {/* Detailed Scenarios */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Scenario Analysis
              </h2>
              <EnhancedScenarioDisplay 
                scenarios={analysis.scenarios}
                currencySymbol="$"
              />
            </section>

            {/* AI Explanation */}
            <section>
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI-Powered Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                      {analysis.explanation}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* CTA Section */}
            <section className="py-8">
              <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/30">
                <CardContent className="py-8 text-center">
                  <h3 className="text-2xl font-bold mb-2 font-brand">
                    This is what you get for every trade.
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                    10,000 Monte Carlo simulations, institutional-grade risk metrics, 
                    and AI explanations—all in under 2 seconds.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" asChild className="px-8">
                      <Link to="/auth?mode=signup">
                        Analyze Your First Trade Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/pricing">
                        See Pricing
                        <ChevronRight className="ml-1 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    ✓ 10 free analyses/month • ✓ No credit card required
                  </p>
                </CardContent>
              </Card>
            </section>
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto animate-pulse">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground">Running 10,000 simulations...</p>
              <Progress value={75} className="w-48 mx-auto" />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
