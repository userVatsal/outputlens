import { ScenarioResult, RiskLevel, Market, MARKETS } from '@/types/trade';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScenarioTableProps {
  results: ScenarioResult[];
  market: Market;
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  
  switch (level) {
    case 'Low':
      return <span className={`${baseClasses} risk-badge-low`}>Low</span>;
    case 'Medium':
      return <span className={`${baseClasses} risk-badge-medium`}>Medium</span>;
    case 'High':
      return <span className={`${baseClasses} risk-badge-high`}>High</span>;
  }
}

function ReturnIndicator({ min, max }: { min: number; max: number }) {
  const avgReturn = (min + max) / 2;
  
  if (avgReturn > 1) {
    return <TrendingUp className="h-4 w-4 text-bullish" />;
  } else if (avgReturn < -1) {
    return <TrendingDown className="h-4 w-4 text-bearish" />;
  }
  return <Minus className="h-4 w-4 text-neutral" />;
}

function formatPrice(price: number, currencySymbol: string): string {
  return `${currencySymbol}${price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatReturn(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function ScenarioTable({ results, market }: ScenarioTableProps) {
  const marketInfo = MARKETS[market];
  const currencySymbol = marketInfo.currencySymbol;

  return (
    <div className="overflow-hidden rounded-lg border border-border/50 bg-card">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Scenario</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Expected Price ({marketInfo.currency})</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Expected Return</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Risk</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={result.scenario.id} className={`scenario-row ${index === results.length - 1 ? 'border-b-0' : ''}`}>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <ReturnIndicator min={result.returnMin} max={result.returnMax} />
                    <div>
                      <div className="font-medium text-foreground">{result.scenario.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{result.scenario.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-right font-mono text-sm">
                  {formatPrice(result.priceRangeMin, currencySymbol)} – {formatPrice(result.priceRangeMax, currencySymbol)}
                </td>
                <td className="px-4 py-4 text-right">
                  <span className={`font-mono text-sm font-medium ${
                    result.returnMax < 0 ? 'text-bearish' : result.returnMin > 0 ? 'text-bullish' : 'text-muted-foreground'
                  }`}>
                    {formatReturn(result.returnMin)} to {formatReturn(result.returnMax)}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <RiskBadge level={result.scenario.riskLevel} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-border/50">
        {results.map((result) => (
          <div key={result.scenario.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ReturnIndicator min={result.returnMin} max={result.returnMax} />
                <span className="font-medium">{result.scenario.name}</span>
              </div>
              <RiskBadge level={result.scenario.riskLevel} />
            </div>
            <p className="text-xs text-muted-foreground">{result.scenario.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Expected Price</div>
                <div className="font-mono">{formatPrice(result.priceRangeMin, currencySymbol)} – {formatPrice(result.priceRangeMax, currencySymbol)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Expected Return</div>
                <div className={`font-mono font-medium ${
                  result.returnMax < 0 ? 'text-bearish' : result.returnMin > 0 ? 'text-bullish' : 'text-muted-foreground'
                }`}>
                  {formatReturn(result.returnMin)} to {formatReturn(result.returnMax)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
