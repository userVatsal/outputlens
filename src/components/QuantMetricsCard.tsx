import { QuantMetrics } from '@/types/trade';
import { Activity, Gauge, Target, Calendar } from 'lucide-react';

interface QuantMetricsCardProps {
  metrics: QuantMetrics;
  currencySymbol: string;
}

export function QuantMetricsCard({ metrics, currencySymbol }: QuantMetricsCardProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Nominal Exposure */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Target className="h-4 w-4" />
          <span>Nominal Exposure</span>
        </div>
        <div className="font-mono text-xl font-semibold text-foreground">
          {currencySymbol}{metrics.nominalExposure.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Per unit position at entry
        </p>
      </div>

      {/* Volatility Proxy */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Activity className="h-4 w-4" />
          <span>Volatility Estimate</span>
        </div>
        <div className="font-mono text-xl font-semibold text-foreground">
          ±{metrics.volatilityProxy.toFixed(1)}%
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Expected range over {metrics.holdingPeriodDays} days
        </p>
      </div>

      {/* Max Expected Move */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Gauge className="h-4 w-4" />
          <span>Max Expected Move</span>
        </div>
        <div className="font-mono text-xl font-semibold text-foreground">
          ±{metrics.maxExpectedMove.toFixed(1)}%
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          2σ range (covers ~95% of moves)
        </p>
      </div>

      {/* Risk Score */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Calendar className="h-4 w-4" />
          <span>Risk Score</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xl font-semibold text-foreground">
            {metrics.riskScore}/10
          </span>
          <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
            metrics.riskLabel === 'Low' ? 'bg-bullish/10 text-bullish' :
            metrics.riskLabel === 'Medium' ? 'bg-caution/10 text-caution' :
            'bg-bearish/10 text-bearish'
          }`}>
            {metrics.riskLabel}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Based on volatility and holding period
        </p>
      </div>
    </div>
  );
}
