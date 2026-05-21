import { useEffect, Suspense, lazy } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Globe, Wifi, WifiOff, History, Eye, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReturnDistributionChart } from '@/components/ReturnDistributionChart';
import { FeatureGate } from '@/components/FeatureGate';
import { AppShell } from '@/components/layout/AppShell';
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
  ActionPanel,
  MonteCarloFanChart,
  ScenarioProbabilityDonut
} from '@/components/workspace';
import { investmentToShares } from '@/lib/positionCalculations';

const SentimentIndicator = lazy(() => import('@/components/SentimentIndicator').then(m => ({ default: m.SentimentIndicator })));

function SectionSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

function MetaPill({ icon, label, value, valueClass = 'text-foreground' }: { icon: React.ReactNode; label: string; value: React.ReactNode; valueClass?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-elevated px-3 py-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${valueClass}`}>{value}</span>
    </div>
  );
}

const Results = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const historyId = searchParams.get('history');

  const { analysis, clearAnalysis, isHistorical, loadHistoricalAnalysis, isLoading } = useTrade();

  useEffect(() => {
    document.title = 'Analysis Results | OutputLens';
  }, []);

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
      <AppShell>
        <div className="section-container py-6 lg:py-10">
          <div className="mx-auto max-w-6xl space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-20 w-full" />
            <SectionSkeleton />
            <SectionSkeleton />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!analysis) {
    return null;
  }

  const { input, riskMetrics, scenarios, simulation, marketData } = analysis;
  const marketInfo = MARKETS[input.market];
  const currencySymbol = marketInfo.currencySymbol;

  const shares = input.positionSize
    ? (input.positionType === 'shares'
        ? input.positionSize
        : investmentToShares(input.positionSize, input.entryPrice))
    : 100;

  const handleNewAnalysis = () => {
    clearAnalysis();
    navigate('/workspace');
  };

  const handleBackToHistory = () => {
    clearAnalysis();
    navigate('/history');
  };

  return (
    <AppShell>
      <div className="section-container py-6 lg:py-10">
        <div className="mx-auto max-w-6xl space-y-6">

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={isHistorical ? handleBackToHistory : handleNewAnalysis}
                className="flex-shrink-0"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                    Risk Analysis Results
                  </h1>
                  {isHistorical && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      View only
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Monte Carlo simulation with{' '}
                  <span className="font-mono tabular-nums text-foreground">{simulation.paths.toLocaleString()}</span> paths
                  {isHistorical && analysis.analyzedAt && (
                    <span className="ml-2 text-muted-foreground/70">
                      • Analyzed {new Date(analysis.analyzedAt).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-mono uppercase tracking-widest ${
              marketData.dataQuality === 'live'
                ? 'bg-bullish/10 text-bullish border border-bullish/20'
                : 'bg-elevated text-muted-foreground border border-border'
            }`}>
              {marketData.dataQuality === 'live' ? (
                <><Wifi className="h-3 w-3" /> Live data</>
              ) : (
                <><WifiOff className="h-3 w-3" /> Default estimates</>
              )}
            </div>
          </div>

          {/* Trade Input Summary */}
          <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-wrap gap-2">
              <MetaPill icon={<Globe className="h-3.5 w-3.5" />} label="Market" value={marketInfo.name} />
              <MetaPill icon={<span className="font-mono text-[11px]">#</span>} label="Asset" value={<span className="font-mono">{input.asset}</span>} />
              <MetaPill
                icon={input.direction === 'long' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                label="Direction"
                value={input.direction.charAt(0).toUpperCase() + input.direction.slice(1)}
                valueClass={input.direction === 'long' ? 'text-bullish' : 'text-bearish'}
              />
              <MetaPill
                icon={<span className="font-mono text-[11px]">{currencySymbol}</span>}
                label="Entry"
                value={<span className="font-mono">{currencySymbol}{input.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>}
              />
              <MetaPill icon={<Clock className="h-3.5 w-3.5" />} label="Horizon" value={input.timeHorizon} />
              {input.confidence && input.confidence !== 5 && (
                <MetaPill icon={<span className="font-mono text-[11px]">±</span>} label="Confidence" value={`${input.confidence}/10`} />
              )}
            </div>
            {input.assumptions && (
              <div className="mt-3 border-t border-border pt-3">
                <p className="text-sm text-muted-foreground">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70 mr-2">Thesis</span>
                  <span className="italic text-foreground/90">"{input.assumptions}"</span>
                </p>
              </div>
            )}
          </div>

          {/* Risk Snapshot */}
          <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <RiskSnapshot 
              analysis={analysis} 
              currencySymbol={currencySymbol}
            />
          </div>

          {/* Monte Carlo fan chart — hero visual */}
          <div className="animate-fade-in" style={{ animationDelay: '0.18s' }}>
            <MonteCarloFanChart analysis={analysis} currencySymbol={currencySymbol} />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <PnLSummary 
              analysis={analysis}
              shares={shares}
              currencySymbol={currencySymbol}
            />
          </div>

          {/* Scenario probability donut */}
          <div className="animate-fade-in" style={{ animationDelay: '0.22s' }}>
            <ScenarioProbabilityDonut analysis={analysis} />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <TailRiskPanel 
              scenarios={scenarios}
              expectedShortfall={riskMetrics.expectedShortfall}
              kurtosis={simulation.kurtosis}
              currencySymbol={currencySymbol}
              entryPrice={input.entryPrice}
            />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <ScenarioRegimeCards 
              scenarios={scenarios}
              shares={shares}
              currencySymbol={currencySymbol}
              entryPrice={input.entryPrice}
            />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
            <ReturnDistributionChart 
              riskMetrics={riskMetrics}
              simulation={simulation}
            />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <AdvancedMetrics 
              metrics={riskMetrics}
              kurtosis={simulation.kurtosis}
              skewness={simulation.skewness}
            />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.45s' }}>
            <RiskInterpretation 
              analysis={analysis}
            />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="mb-3 flex items-center gap-2">
              <h3 className="font-display text-base font-semibold text-foreground">Market sentiment</h3>
              <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                STARTER
              </span>
            </div>
            <FeatureGate feature="sentiment" showPreview={true}>
              <Suspense fallback={<SectionSkeleton />}>
                <SentimentIndicator asset={input.asset} market={input.market} />
              </Suspense>
            </FeatureGate>
          </div>

          <div className="animate-fade-in pt-2" style={{ animationDelay: '0.55s' }}>
            {isHistorical ? (
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button variant="outline" onClick={handleBackToHistory} className="w-full sm:w-auto px-6">
                  <History className="mr-2 h-4 w-4" />
                  Back to history
                </Button>
                <Button onClick={handleNewAnalysis} className="w-full sm:w-auto px-8">
                  Analyze new trade
                </Button>
              </div>
            ) : (
              <ActionPanel 
                analysis={analysis}
                onNewAnalysis={handleNewAnalysis}
              />
            )}
          </div>

        </div>
      </div>
    </AppShell>
  );
};

export default Results;