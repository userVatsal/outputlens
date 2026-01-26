import { TrendingUp, TrendingDown, AlertTriangle, Target, Activity } from 'lucide-react';
import { EnhancedTradeAnalysis } from '@/types/analysis';
import { cn } from '@/lib/utils';

interface RiskSnapshotProps {
  analysis: EnhancedTradeAnalysis;
}

function RiskGauge({ score, label }: { score: number; label: string }) {
  // Score 1-10, determine color
  const getColor = (score: number) => {
    if (score <= 3) return 'text-bullish';
    if (score <= 6) return 'text-caution';
    return 'text-bearish';
  };

  const getBgColor = (score: number) => {
    if (score <= 3) return 'bg-bullish/10';
    if (score <= 6) return 'bg-caution/10';
    return 'bg-bearish/10';
  };

  return (
    <div className={cn("rounded-xl p-5 text-center", getBgColor(score))}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <Activity className={cn("h-5 w-5", getColor(score))} />
        <span className="text-sm font-medium text-muted-foreground">Risk Level</span>
      </div>
      <div className={cn("text-3xl font-bold", getColor(score))}>
        {score}/10
      </div>
      <div className={cn("text-sm font-semibold mt-1", getColor(score))}>
        {label}
      </div>
    </div>
  );
}

function WinProbability({ probability }: { probability: number }) {
  const isPositive = probability >= 50;
  const color = isPositive ? 'text-bullish' : 'text-bearish';
  const bgColor = isPositive ? 'bg-bullish/10' : 'bg-bearish/10';
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className={cn("rounded-xl p-5 text-center", bgColor)}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <Icon className={cn("h-5 w-5", color)} />
        <span className="text-sm font-medium text-muted-foreground">Win Probability</span>
      </div>
      <div className={cn("text-3xl font-bold", color)}>
        {probability.toFixed(0)}%
      </div>
      <div className={cn("text-sm font-semibold mt-1", color)}>
        {isPositive ? 'Positive Odds' : 'Negative Odds'}
      </div>
    </div>
  );
}

function TailRiskIndicator({ probability }: { probability: number }) {
  const isElevated = probability > 2;
  const color = isElevated ? 'text-caution' : 'text-muted-foreground';
  const bgColor = isElevated ? 'bg-caution/10' : 'bg-muted/50';

  return (
    <div className={cn("rounded-xl p-5 text-center", bgColor)}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <AlertTriangle className={cn("h-5 w-5", color)} />
        <span className="text-sm font-medium text-muted-foreground">Tail Risk</span>
      </div>
      <div className={cn("text-3xl font-bold", color)}>
        {probability.toFixed(1)}%
      </div>
      <div className={cn("text-sm font-semibold mt-1", color)}>
        {isElevated ? 'Elevated' : 'Normal'}
      </div>
    </div>
  );
}

function ExpectedReturn({ expectedReturn }: { expectedReturn: number }) {
  const isPositive = expectedReturn >= 0;
  const color = isPositive ? 'text-bullish' : 'text-bearish';
  const bgColor = isPositive ? 'bg-bullish/10' : 'bg-bearish/10';
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className={cn("rounded-xl p-5 text-center", bgColor)}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <Target className={cn("h-5 w-5", color)} />
        <span className="text-sm font-medium text-muted-foreground">Expected Return</span>
      </div>
      <div className={cn("text-3xl font-bold", color)}>
        {isPositive ? '+' : ''}{expectedReturn.toFixed(1)}%
      </div>
      <div className={cn("text-sm font-semibold mt-1", color)}>
        {isPositive ? 'Positive EV' : 'Negative EV'}
      </div>
    </div>
  );
}

export function RiskSnapshot({ analysis }: RiskSnapshotProps) {
  const { riskMetrics, scenarios } = analysis;
  
  // Calculate tail risk as sum of all tail scenario probabilities
  const tailRiskProbability = scenarios.tail.reduce((sum, s) => {
    // Handle both decimal (0.01) and percentage (1) formats
    const prob = s.probability > 1 ? s.probability : s.probability * 100;
    return sum + prob;
  }, 0);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-foreground">Risk Snapshot</h2>
        {riskMetrics.usedLiveData && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-bullish/10 text-bullish font-medium">
            Live Data
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <RiskGauge 
          score={riskMetrics.riskScore} 
          label={riskMetrics.riskLabel} 
        />
        <WinProbability probability={riskMetrics.probabilityOfProfit} />
        <TailRiskIndicator probability={tailRiskProbability} />
        <ExpectedReturn expectedReturn={riskMetrics.expectedReturn} />
      </div>
    </div>
  );
}
