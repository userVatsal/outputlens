import { AdvancedRiskMetrics } from '@/lib/riskMetrics';
import { Activity, Gauge, Target, TrendingUp, TrendingDown, ShieldAlert, BarChart3, Wifi, WifiOff } from 'lucide-react';

interface EnhancedQuantMetricsCardProps {
  riskMetrics: AdvancedRiskMetrics;
  simulation: {
    paths: number;
    meanReturn: number;
    medianReturn: number;
    stdDev: number;
    skewness: number;
    kurtosis: number;
  };
  currencySymbol: string;
}

export function EnhancedQuantMetricsCard({ riskMetrics, simulation, currencySymbol }: EnhancedQuantMetricsCardProps) {
  const winPct = (riskMetrics.probabilityOfProfit * 100).toFixed(0);
  const lossPct = (riskMetrics.probabilityOfLoss * 100).toFixed(0);
  
  return (
    <div className="space-y-4">
      {/* Primary Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Win/Loss Probability */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <BarChart3 className="h-4 w-4" />
            <span>Win Rate</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-bullish">{winPct}%</span>
            <span className="text-sm text-muted-foreground">win</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {lossPct}% chance of loss
          </div>
        </div>

        {/* Expected Return */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            {riskMetrics.expectedReturn >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>Expected Return</span>
          </div>
          <div className={`font-mono text-2xl font-bold ${
            riskMetrics.expectedReturn >= 0 ? 'text-bullish' : 'text-bearish'
          }`}>
            {riskMetrics.expectedReturn >= 0 ? '+' : ''}{riskMetrics.expectedReturn.toFixed(2)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Median: {riskMetrics.medianReturn >= 0 ? '+' : ''}{riskMetrics.medianReturn.toFixed(2)}%
          </div>
        </div>

        {/* Value at Risk */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <ShieldAlert className="h-4 w-4" />
            <span>95% VaR</span>
          </div>
          <div className="font-mono text-2xl font-bold text-bearish">
            -{riskMetrics.valueAtRisk95.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            CVaR: -{riskMetrics.expectedShortfall.toFixed(1)}%
          </div>
        </div>

        {/* Risk Score */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Gauge className="h-4 w-4" />
            <span>Risk Score</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-foreground">
              {riskMetrics.riskScore}
            </span>
            <span className="text-sm text-muted-foreground">/10</span>
          </div>
          <div className={`text-xs font-medium mt-1 ${
            riskMetrics.riskLabel === 'Low' ? 'text-bullish' :
            riskMetrics.riskLabel === 'Medium' ? 'text-yellow-500' : 'text-bearish'
          }`}>
            {riskMetrics.riskLabel} Risk
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Volatility */}
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Activity className="h-3 w-3" />
            <span>Volatility</span>
            {riskMetrics.usedLiveData ? (
              <span className="ml-auto flex items-center gap-1 text-bullish">
                <Wifi className="h-2.5 w-2.5" />
                Live
              </span>
            ) : (
              <span className="ml-auto flex items-center gap-1">
                <WifiOff className="h-2.5 w-2.5" />
              </span>
            )}
          </div>
          <div className="font-mono text-lg font-semibold">
            ±{riskMetrics.volatilityProxy.toFixed(1)}%
          </div>
        </div>

        {/* Max Expected Move */}
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Target className="h-3 w-3" />
            <span>Max Expected Move</span>
          </div>
          <div className="font-mono text-lg font-semibold">
            ±{riskMetrics.maxExpectedMove.toFixed(1)}%
          </div>
        </div>

        {/* Skewness */}
        <div className="glass-card p-3">
          <div className="text-xs text-muted-foreground mb-1">Distribution Skew</div>
          <div className="font-mono text-lg font-semibold">
            {simulation.skewness >= 0 ? '+' : ''}{simulation.skewness.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">
            {simulation.skewness < -0.5 ? '↙ Left-skewed' : simulation.skewness > 0.5 ? '↗ Right-skewed' : '↔ Symmetric'}
          </div>
        </div>

        {/* Kurtosis */}
        <div className="glass-card p-3">
          <div className="text-xs text-muted-foreground mb-1">Tail Thickness</div>
          <div className="font-mono text-lg font-semibold">
            {simulation.kurtosis >= 0 ? '+' : ''}{simulation.kurtosis.toFixed(2)}
          </div>
          <div className={`text-xs ${simulation.kurtosis > 1 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
            {simulation.kurtosis > 1 ? '⚠️ Fat tails' : 'Normal tails'}
          </div>
        </div>
      </div>

      {/* Simulation Info */}
      <div className="text-xs text-center text-muted-foreground">
        Based on {riskMetrics.simulationPaths.toLocaleString()} Monte Carlo simulation paths
      </div>
    </div>
  );
}