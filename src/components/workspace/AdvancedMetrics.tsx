import { useState } from 'react';
import { ChevronDown, ChevronUp, BarChart3, TrendingDown, Activity, Gauge } from 'lucide-react';
import { AdvancedRiskMetrics } from '@/lib/riskMetrics';
import { cn } from '@/lib/utils';

interface AdvancedMetricsProps {
  metrics: AdvancedRiskMetrics;
  kurtosis: number;
  skewness: number;
}

function MetricItem({
  label, 
  value, 
  subtext, 
  icon,
  highlight 
}: { 
  label: string; 
  value: string; 
  subtext?: string;
  icon: React.ReactNode;
  highlight?: 'positive' | 'negative' | 'warning';
}) {
  const textColor = highlight === 'positive' 
    ? 'text-bullish' 
    : highlight === 'negative' 
      ? 'text-bearish'
      : highlight === 'warning'
        ? 'text-caution'
        : 'text-foreground';

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
      <div className="p-1.5 rounded bg-background">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={cn("font-semibold", textColor)}>{value}</div>
        {subtext && (
          <div className="text-xs text-muted-foreground mt-0.5">{subtext}</div>
        )}
      </div>
    </div>
  );
}

export function AdvancedMetrics({ metrics, kurtosis, skewness }: AdvancedMetricsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasFatTails = kurtosis > 1;
  const hasNegativeSkew = skewness < -0.5;
  const hasPositiveSkew = skewness > 0.5;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold text-foreground">Advanced Statistics</span>
        </div>
        <div className="flex items-center gap-3">
          {hasFatTails && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-caution/10 text-caution">
              Fat Tails
            </span>
          )}
          {hasNegativeSkew && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-bearish/10 text-bearish">
              Negative Skew
            </span>
          )}
          {hasPositiveSkew && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-bullish/10 text-bullish">
              Positive Skew
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Volatility */}
            <MetricItem
              label="Volatility"
              value={`${metrics.volatilityProxy.toFixed(1)}%`}
              subtext="Scaled to holding period"
              icon={<Activity className="h-4 w-4 text-muted-foreground" />}
            />

            {/* Max Expected Move */}
            <MetricItem
              label="Max Expected Move"
              value={`±${metrics.maxExpectedMove.toFixed(1)}%`}
              subtext="Within holding period"
              icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
            />

            {/* VaR 95% */}
            <MetricItem
              label="Value at Risk (95%)"
              value={`${metrics.valueAtRisk95.toFixed(2)}%`}
              subtext="5% chance of exceeding"
              icon={<Gauge className="h-4 w-4 text-muted-foreground" />}
              highlight="negative"
            />

            {/* VaR 99% */}
            <MetricItem
              label="Value at Risk (99%)"
              value={`${metrics.valueAtRisk99.toFixed(2)}%`}
              subtext="1% chance of exceeding"
              icon={<Gauge className="h-4 w-4 text-muted-foreground" />}
              highlight="negative"
            />

            {/* Expected Shortfall */}
            <MetricItem
              label="Expected Shortfall (CVaR)"
              value={`${metrics.expectedShortfall.toFixed(2)}%`}
              subtext="Average loss if VaR exceeded"
              icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
              highlight="negative"
            />

            {/* Skewness */}
            <MetricItem
              label="Skewness"
              value={skewness.toFixed(2)}
              subtext={hasNegativeSkew ? 'Left-tailed' : hasPositiveSkew ? 'Right-tailed' : 'Symmetric'}
              icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
              highlight={hasNegativeSkew ? 'negative' : hasPositiveSkew ? 'positive' : undefined}
            />

            {/* Kurtosis */}
            <MetricItem
              label="Excess Kurtosis"
              value={kurtosis.toFixed(2)}
              subtext={hasFatTails ? 'Fat tails detected' : 'Near normal'}
              icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
              highlight={hasFatTails ? 'warning' : undefined}
            />

            {/* Sharpe Proxy */}
            <MetricItem
              label="Sharpe Proxy"
              value={metrics.sharpeProxy.toFixed(2)}
              subtext="Risk-adjusted return estimate"
              icon={<Gauge className="h-4 w-4 text-muted-foreground" />}
              highlight={metrics.sharpeProxy > 0.5 ? 'positive' : metrics.sharpeProxy < 0 ? 'negative' : undefined}
            />

            {/* Sortino Proxy */}
            <MetricItem
              label="Sortino Proxy"
              value={metrics.sortinoProxy.toFixed(2)}
              subtext="Downside-adjusted return"
              icon={<Gauge className="h-4 w-4 text-muted-foreground" />}
              highlight={metrics.sortinoProxy > 0.5 ? 'positive' : metrics.sortinoProxy < 0 ? 'negative' : undefined}
            />
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              <strong>VaR</strong> measures potential loss at a confidence level. 
              <strong> CVaR</strong> (Expected Shortfall) is the average loss when VaR is exceeded. 
              <strong> Kurtosis</strong> &gt; 0 indicates fatter tails than normal distribution.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
