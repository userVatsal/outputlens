import { EnhancedTradeAnalysis } from '@/types/analysis';
import { RiskLevel } from '@/types/trade';
import { Shield, ShieldAlert, ShieldX, TrendingUp, TrendingDown, Percent } from 'lucide-react';

interface EnhancedRiskSummaryProps {
  analysis: EnhancedTradeAnalysis;
}

function RiskIcon({ level }: { level: RiskLevel }) {
  switch (level) {
    case 'Low':
      return <Shield className="h-5 w-5 text-bullish" />;
    case 'Medium':
      return <ShieldAlert className="h-5 w-5 text-yellow-500" />;
    case 'High':
      return <ShieldX className="h-5 w-5 text-bearish" />;
  }
}

function formatReturn(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function formatProbability(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

export function EnhancedRiskSummary({ analysis }: EnhancedRiskSummaryProps) {
  const { bestCase, worstCase, overallRisk, riskMetrics } = analysis;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Best Case */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-bullish" />
          <h4 className="font-semibold text-foreground">Best Case</h4>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{bestCase.scenario.name}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-bullish font-mono">
              {formatReturn(bestCase.returnMax)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Percent className="h-3 w-3" />
            <span>{formatProbability(bestCase.scenario.probability)} probability</span>
          </div>
        </div>
      </div>

      {/* Worst Case */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="h-5 w-5 text-bearish" />
          <h4 className="font-semibold text-foreground">Worst Case</h4>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{worstCase.scenario.name}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-bearish font-mono">
              {formatReturn(worstCase.returnMin)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Percent className="h-3 w-3" />
            <span>{formatProbability(worstCase.scenario.probability)} probability</span>
          </div>
        </div>
      </div>

      {/* Win/Loss Ratio */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex">
            <TrendingUp className="h-4 w-4 text-bullish" />
            <TrendingDown className="h-4 w-4 text-bearish -ml-1" />
          </div>
          <h4 className="font-semibold text-foreground">Win/Loss</h4>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-bullish rounded-full transition-all"
                  style={{ width: `${riskMetrics.probabilityOfProfit * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-bullish font-medium">
              {formatProbability(riskMetrics.probabilityOfProfit)} Win
            </span>
            <span className="text-bearish font-medium">
              {formatProbability(riskMetrics.probabilityOfLoss)} Loss
            </span>
          </div>
        </div>
      </div>

      {/* Overall Risk */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <RiskIcon level={overallRisk} />
          <h4 className="font-semibold text-foreground">Overall Risk</h4>
        </div>
        <div className="space-y-2">
          <div className={`text-2xl font-bold ${
            overallRisk === 'Low' ? 'text-bullish' :
            overallRisk === 'Medium' ? 'text-yellow-500' : 'text-bearish'
          }`}>
            {overallRisk}
          </div>
          <div className="text-xs text-muted-foreground">
            Score: {riskMetrics.riskScore}/10
          </div>
          <div className="text-xs text-muted-foreground">
            Sharpe: {riskMetrics.sharpeProxy.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}