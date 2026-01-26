import { useEffect, Suspense, lazy } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Globe, Wifi, WifiOff, History, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReturnDistributionChart } from '@/components/ReturnDistributionChart';
import { FeatureGate } from '@/components/FeatureGate';
import { Layout } from '@/components/layout/Layout';
import { useTrade } from '@/hooks/useTrade';
import { MARKETS } from '@/types/trade';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RiskSnapshot, 
  PnLSummary, 
  TailRiskPanel, 
  ScenarioRegimeCards, 
  AdvancedMetrics, 
  RiskInterpretation,
  ActionPanel 
} from '@/components/workspace';
import { investmentToShares } from '@/lib/positionCalculations';

// Lazy load heavy components for performance
const SentimentIndicator = lazy(() => import('@/components/SentimentIndicator').then(m => ({ default: m.SentimentIndicator })));

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
  const [searchParams] = useSearchParams();
  const historyId = searchParams.get('history');
  
  const { analysis, clearAnalysis, isHistorical, loadHistoricalAnalysis, isLoading } = useTrade();

  // SEO: Set page-specific document title
  useEffect(() => {
    document.title = 'Analysis Results | OutputLens';
  }, []);

  // Load historical analysis if historyId is present
  useEffect(() => {
    if (historyId && !analysis) {
      loadHistoricalAnalysis(historyId).then(success => {
        if (!success) {
          navigate('/history');
        }
      });
    } else if (!historyId && !analysis) {
      navigate('/workspace');
    }
  }, [historyId, analysis, navigate, loadHistoricalAnalysis]);

  if (isLoading) {
    return (
      <Layout hideFooter>
        <div className="section-container py-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
                <p className="text-muted-foreground">Loading analysis...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!analysis) {
    return null;
  }

  const { input, riskMetrics, scenarios, simulation, marketData } = analysis;
  const marketInfo = MARKETS[input.market];
  const currencySymbol = marketInfo.currencySymbol;
  
  // Calculate shares for P&L display
  const shares = input.positionSize 
    ? (input.positionType === 'shares' 
        ? input.positionSize 
        : investmentToShares(input.positionSize, input.entryPrice))
    : 100; // Default for legacy analyses without position size

  const handleNewAnalysis = () => {
    clearAnalysis();
    navigate('/workspace');
  };

  const handleBackToHistory = () => {
    clearAnalysis();
    navigate('/history');
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
              onClick={isHistorical ? handleBackToHistory : handleNewAnalysis}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground font-brand">Risk Analysis Results</h1>
                {isHistorical && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    View Only
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Monte Carlo simulation with {simulation.paths.toLocaleString()} paths
                {isHistorical && analysis.analyzedAt && (
                  <span className="ml-2 text-muted-foreground/70">
                    • Analyzed {new Date(analysis.analyzedAt).toLocaleDateString()}
                  </span>
                )}
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
                  {currencySymbol}{input.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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

          {/* Risk Snapshot - Above the fold */}
          <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <RiskSnapshot 
              analysis={analysis} 
              currencySymbol={currencySymbol}
            />
          </div>

          {/* P&L Summary */}
          <div className="animate-fade-in mb-6" style={{ animationDelay: '0.2s' }}>
            <PnLSummary 
              analysis={analysis}
              shares={shares}
              currencySymbol={currencySymbol}
            />
          </div>

          {/* Tail Risk Panel */}
          <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <TailRiskPanel 
              scenarios={scenarios}
              expectedShortfall={riskMetrics.expectedShortfall}
              kurtosis={simulation.kurtosis}
              currencySymbol={currencySymbol}
              entryPrice={input.entryPrice}
            />
          </div>

          {/* Scenario Regime Cards */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <ScenarioRegimeCards 
              scenarios={scenarios}
              shares={shares}
              currencySymbol={currencySymbol}
              entryPrice={input.entryPrice}
            />
          </div>

          {/* Return Distribution Chart */}
          <div className="animate-fade-in mb-6" style={{ animationDelay: '0.35s' }}>
            <ReturnDistributionChart 
              riskMetrics={riskMetrics}
              simulation={simulation}
            />
          </div>

          {/* Advanced Metrics - Collapsed */}
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <AdvancedMetrics 
              metrics={riskMetrics}
              kurtosis={simulation.kurtosis}
              skewness={simulation.skewness}
            />
          </div>

          {/* Risk Interpretation */}
          <div className="animate-fade-in" style={{ animationDelay: '0.45s' }}>
            <RiskInterpretation 
              analysis={analysis}
            />
          </div>

          {/* Sentiment - Feature Gated */}
          <div className="animate-fade-in mb-6" style={{ animationDelay: '0.5s' }}>
            <FeatureGate feature="sentiment">
              <Suspense fallback={<SectionSkeleton />}>
                <SentimentIndicator asset={input.asset} market={input.market} />
              </Suspense>
            </FeatureGate>
          </div>

          {/* Action Panel */}
          <div className="animate-fade-in" style={{ animationDelay: '0.55s' }}>
            {isHistorical ? (
              <div className="text-center flex items-center justify-center gap-4">
                <Button variant="outline" onClick={handleBackToHistory} className="px-6">
                  <History className="h-4 w-4 mr-2" />
                  Back to History
                </Button>
                <Button onClick={handleNewAnalysis} className="px-8">
                  Analyze New Trade
                </Button>
              </div>
            ) : (
              <ActionPanel 
                analysis={analysis}
                onNewAnalysis={handleNewAnalysis}
              />
            )}
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              This analysis uses Monte Carlo simulation with {simulation.paths.toLocaleString()} paths 
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