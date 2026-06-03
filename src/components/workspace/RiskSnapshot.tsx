import { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Activity, Bookmark, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { EnhancedTradeAnalysis } from '@/types/analysis';
import { formatCurrencyWithSign, calculatePnL, investmentToShares } from '@/lib/positionCalculations';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TrackAssetModal } from '@/components/workspace/TrackAssetModal';
import { useTrackedAssets } from '@/hooks/useTrackedAssets';
import { useCountUp } from '@/hooks/useCountUp';

interface RiskSnapshotProps {
  analysis: EnhancedTradeAnalysis;
  currencySymbol: string;
  previousRiskScore?: number | null;
  previousWinProb?: number | null;
}

function TrendArrow({ current, previous, inverted = false }: { current: number; previous: number | null | undefined; inverted?: boolean }) {
  if (previous === null || previous === undefined) return null;
  const delta = current - previous;
  if (Math.abs(delta) < 0.5) return <Minus className="h-3 w-3 text-muted-foreground" />;
  const isImproving = inverted ? delta > 0 : delta < 0;
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-medium', isImproving ? 'text-bullish' : 'text-destructive')}>
      {delta > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(delta).toFixed(1)}
    </span>
  );
}

interface MetricBlockProps {
  label: string;
  value: string;
  sub: string;
  color: 'bullish' | 'bearish' | 'caution' | 'neutral';
  icon: React.ReactNode;
  delay?: number;
}

function MetricBlock({ label, value, sub, color, icon, delay = 0 }: MetricBlockProps) {
  const textColor = {
    bullish: 'text-bullish',
    bearish: 'text-destructive',
    caution: 'text-caution',
    neutral: 'text-foreground',
  };

  return (
    <div
      className="rounded-xl bg-surface border border-border/50 p-5 hover:border-primary/15 transition-colors animate-fade-in"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      <div className="flex items-center gap-2">
        <span className={cn('w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center', textColor[color])}>{icon}</span>
      </div>
      <div className={cn('font-mono font-bold text-[32px] tabular-nums leading-none mt-4', textColor[color])}>{value}</div>
      <div className="text-[11px] uppercase text-muted-foreground tracking-[0.08em] mt-2">{label}</div>
      <div className="text-[12px] text-muted-foreground/70 mt-1">{sub}</div>
    </div>
  );
}

export function RiskSnapshot({ analysis, currencySymbol, previousRiskScore, previousWinProb }: RiskSnapshotProps) {
  const { riskMetrics, scenarios, input, simulation } = analysis;
  const [showTrackModal, setShowTrackModal] = useState(false);
  const { isAssetTracked } = useTrackedAssets();

  const isTracked = isAssetTracked(input.asset, input.market);

  const tailRiskProbability = scenarios.tail.reduce((sum, s) => {
    const prob = s.probability > 1 ? s.probability : s.probability * 100;
    return sum + prob;
  }, 0);

  const shares = input.positionType === 'dollars' && input.positionSize
    ? investmentToShares(input.positionSize, input.entryPrice)
    : (input.positionSize || 1);

  const expectedPnL = calculatePnL(input.entryPrice, simulation.meanReturn, shares);
  const isPositiveReturn = riskMetrics.expectedReturn >= 0;
  const isHighRisk = riskMetrics.riskScore > 6;
  const isMediumRisk = riskMetrics.riskScore > 3;
  const isWinner = riskMetrics.probabilityOfProfit >= 50;
  const isElevatedTail = tailRiskProbability > 2;

  // Animated counters
  const aRisk = useCountUp(riskMetrics.riskScore);
  const aWin  = useCountUp(riskMetrics.probabilityOfProfit);
  const aTail = useCountUp(tailRiskProbability);
  const aPnl  = useCountUp(expectedPnL.totalPnl);
  const aRet  = useCountUp(riskMetrics.expectedReturn);

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[13px] font-semibold text-foreground">Risk Snapshot</h2>
          {riskMetrics.usedLiveData && (
            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-bullish/10 text-bullish font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-bullish animate-pulse" />
              LIVE
            </span>
          )}
        </div>
        {!isTracked ? (
          <Button variant="outline" size="sm" onClick={() => setShowTrackModal(true)} className="h-7 text-xs gap-1.5">
            <Bookmark className="h-3.5 w-3.5" />
            Monitor
          </Button>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-mono flex items-center gap-1">
            <Bookmark className="h-3 w-3" />
            Monitored
          </span>
        )}
      </div>

      {/* 4-metric grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricBlock
          label="Risk Score"
          value={`${aRisk.toFixed(1)}/10`}
          sub={riskMetrics.riskLabel}
          color={isHighRisk ? 'bearish' : isMediumRisk ? 'caution' : 'bullish'}
          icon={<Activity className="h-4 w-4" />}
          delay={0}
        />
        <MetricBlock
          label="Win Prob"
          value={`${aWin.toFixed(0)}%`}
          sub={isWinner ? 'Positive Odds' : 'Negative Odds'}
          color={isWinner ? 'bullish' : 'bearish'}
          icon={isWinner ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          delay={80}
        />
        <MetricBlock
          label="Tail Risk"
          value={`${aTail.toFixed(1)}%`}
          sub={isElevatedTail ? 'Elevated' : 'Normal'}
          color={isElevatedTail ? 'caution' : 'neutral'}
          icon={<AlertTriangle className="h-4 w-4" />}
          delay={160}
        />
        <MetricBlock
          label="Expected P&L"
          value={formatCurrencyWithSign(aPnl, currencySymbol)}
          sub={`${isPositiveReturn ? '+' : ''}${aRet.toFixed(1)}%`}
          color={isPositiveReturn ? 'bullish' : 'bearish'}
          icon={<Target className="h-4 w-4" />}
          delay={240}
        />
      </div>

      <TrackAssetModal open={showTrackModal} onOpenChange={setShowTrackModal} analysis={analysis} />
    </div>
  );
}
