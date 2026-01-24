import { useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Globe, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EnhancedQuantMetricsCard } from '@/components/EnhancedQuantMetricsCard';
import { EnhancedScenarioDisplay } from '@/components/EnhancedScenarioDisplay';
import { EnhancedRiskSummary } from '@/components/EnhancedRiskSummary';
import { ReturnDistributionChart } from '@/components/ReturnDistributionChart';
import { ScenarioProbabilityChart } from '@/components/ScenarioProbabilityChart';
import { FeatureGate } from '@/components/FeatureGate';
import { Layout } from '@/components/layout/Layout';
import { useTrade } from '@/hooks/useTrade';
import { MARKETS } from '@/types/trade';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components for performance
const SentimentIndicator = lazy(() => import('@/components/SentimentIndicator').then(m => ({ default: m.SentimentIndicator })));
const AIExplanation = lazy(() => import('@/components/AIExplanation').then(m => ({ default: m.AIExplanation })));

// Loading skeleton for lazy-loaded components
function SectionSkeleton() {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

const Results = () => {
  const navigate = useNavigate();
  const { analysis, clearAnalysis } = useTrade();

  useEffect(() => {
    if (!analysis) {
      navigate('/analyze');
    }
  }, [analysis, navigate]);

  if (!analysis) {
    return null;
  }

  const { input, riskMetrics, scenarios, simulation, marketData } = analysis;
  const marketInfo = MARKETS[input.market];

  // Count all scenarios
  const totalScenarios = 
    scenarios.base.length + 
    scenarios.upside.length + 
    scenarios.downside.length + 
    scenarios.tail.length;

  const handleNewAnalysis = () => {
    clearAnalysis();
    navigate('/analyze');
  };

  return (
    <Layout hideFooter>
      <div className="section-container py-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewAnalysis}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground font-brand">Trade Analysis Results</h1>
              <p className="text-sm text-muted-foreground">
                Monte Carlo simulation with {simulation.paths.toLocaleString()} paths
              </p>
            </div>
            {/* Data quality indicator */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              marketData.dataQuality === 'live' 
                ? 'bg-bullish/10 text-bullish' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {marketData.dataQuality === 'live' ? (
                <>
                  <Wifi className="h-3 w-3" />
                  Live Data
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  Default Estimates
                </>
              )}
            </div>
          </div>

          {/* Trade Input Summary */}
          <div className="glass-card p-4 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Market:</span>
                <span className="font-semibold text-foreground">{marketInfo.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Asset:</span>
                <span className="font-mono font-semibold text-foreground">{input.asset}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Direction:</span>
                <span className={`flex items-center gap-1 font-semibold ${
                  input.direction === 'long' ? 'text-bullish' : 'text-bearish'
                }`}>
                  {input.direction === 'long' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {input.direction.charAt(0).toUpperCase() + input.direction.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Entry:</span>
                <span className="font-mono font-semibold text-foreground">
                  {marketInfo.currencySymbol}{input.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Horizon:</span>
                <span className="font-semibold text-foreground">{input.timeHorizon}</span>
              </div>
              {input.confidence && input.confidence !== 5 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Confidence:</span>
                  <span className="font-semibold text-foreground">{input.confidence}/10</span>
                </div>
              )}
            </div>
            {input.assumptions && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Your thesis:</span> "{input.assumptions}"
                </p>
              </div>
            )}
          </div>

          {/* Step 1: Advanced Risk Metrics */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">1</div>
              <h2 className="text-lg font-semibold text-foreground font-brand">Risk Metrics</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Computed from Monte Carlo simulation using {marketData.dataQuality === 'live' ? 'live' : 'estimated'} volatility data.
            </p>
            <EnhancedQuantMetricsCard 
              riskMetrics={riskMetrics} 
              simulation={simulation}
              currencySymbol={marketInfo.currencySymbol} 
            />
            {/* Distribution Chart */}
            <div className="mt-4">
              <ReturnDistributionChart 
                riskMetrics={riskMetrics}
                simulation={simulation}
              />
            </div>
          </div>

          {/* Step 2: Risk Overview */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">2</div>
              <h2 className="text-lg font-semibold text-foreground font-brand">Risk Overview</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Best and worst case outcomes with simulated probabilities.
            </p>
            <EnhancedRiskSummary analysis={analysis} />
          </div>

          {/* Step 3: Scenario Probability Charts */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">3</div>
              <h2 className="text-lg font-semibold text-foreground font-brand">
                Scenario Probabilities
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Visual breakdown of outcome probabilities and expected returns.
            </p>
            <ScenarioProbabilityChart scenarios={scenarios} currencySymbol={marketInfo.currencySymbol} />
          </div>

          {/* Step 4: Structured Scenarios */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.35s' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">4</div>
              <h2 className="text-lg font-semibold text-foreground font-brand">
                Detailed Scenarios ({totalScenarios} scenarios)
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Dynamic scenarios generated from simulation, organized by outcome type.
            </p>
            <EnhancedScenarioDisplay scenarios={scenarios} currencySymbol={marketInfo.currencySymbol} />
          </div>

          {/* Step 5: Market Sentiment - Feature Gated */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">5</div>
              <h2 className="text-lg font-semibold text-foreground font-brand">Market Sentiment</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              AI-analyzed sentiment from news and qualitative signals.
            </p>
            <FeatureGate feature="sentiment">
              <Suspense fallback={<SectionSkeleton />}>
                <SentimentIndicator asset={input.asset} market={input.market} />
              </Suspense>
            </FeatureGate>
          </div>

          {/* Step 6: AI Explanation - Lazy Loaded */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.45s' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">6</div>
              <h2 className="text-lg font-semibold text-foreground font-brand">AI Explanation</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Qualitative reasoning based on Monte Carlo results and risk metrics.
            </p>
            <Suspense fallback={<SectionSkeleton />}>
              <AIExplanation analysis={analysis} />
            </Suspense>
          </div>

          {/* New Analysis Button */}
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.55s' }}>
            <Button onClick={handleNewAnalysis} className="px-8">
              Analyze Another Trade
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Educational Disclaimer:</strong> This analysis uses Monte Carlo simulation with {simulation.paths.toLocaleString()} paths 
              and {marketData.dataQuality === 'live' ? 'live market data' : 'estimated volatility'}. 
              It does not predict actual outcomes and is not financial advice. 
              Markets are inherently unpredictable. Always consult a qualified financial advisor before trading.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Results;
