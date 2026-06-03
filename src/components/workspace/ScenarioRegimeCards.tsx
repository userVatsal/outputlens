import { useState } from 'react';
import { Target, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { DynamicScenarioSet, DynamicScenario } from '@/lib/scenarioEngine';
import { calculatePriceRange, formatPrice, formatCurrencyWithSign, calculatePnL } from '@/lib/positionCalculations';
import { cn } from '@/lib/utils';

interface ScenarioRegimeCardsProps {
  scenarios: DynamicScenarioSet;
  currencySymbol: string;
  entryPrice: number;
  shares: number;
}

interface RegimeRowProps {
  title: string;
  scenarios: DynamicScenario[];
  color: 'base' | 'bullish' | 'bearish';
  currencySymbol: string;
  entryPrice: number;
  shares: number;
}

function RegimeRow({ title, scenarios, color, currencySymbol, entryPrice, shares }: RegimeRowProps) {
  const [expanded, setExpanded] = useState(false);
  if (scenarios.length === 0) return null;

  const totalProbability = scenarios.reduce((sum, s) => {
    const prob = s.probability > 1 ? s.probability : s.probability * 100;
    return sum + prob;
  }, 0);

  const minReturn = Math.min(...scenarios.map(s => s.returnRangeMin));
  const maxReturn = Math.max(...scenarios.map(s => s.returnRangeMax));
  const priceRange = calculatePriceRange(entryPrice, minReturn, maxReturn);
  const pnlMin = calculatePnL(entryPrice, minReturn, shares);
  const pnlMax = calculatePnL(entryPrice, maxReturn, shares);
  const returnIsPositive = (minReturn + maxReturn) / 2 >= 0;

  const colorMap = {
    base: {
      bar: 'bg-primary',
      text: 'text-primary',
      badge: 'bg-primary/10 text-primary',
      border: 'border-primary/20',
    },
    bullish: {
      bar: 'bg-bullish',
      text: 'text-bullish',
      badge: 'bg-bullish/10 text-bullish',
      border: 'border-bullish/20',
    },
    bearish: {
      bar: 'bg-destructive',
      text: 'text-destructive',
      badge: 'bg-destructive/10 text-destructive',
      border: 'border-destructive/20',
    },
  }[color];

  const Icon = color === 'bullish' ? TrendingUp : color === 'bearish' ? TrendingDown : Target;

  return (
    <div className={cn('rounded-lg border overflow-hidden', colorMap.border)}>
      {/* Main row */}
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Label */}
        <div className="flex items-center gap-2 w-32 flex-shrink-0">
          <Icon className={cn('h-4 w-4 flex-shrink-0', colorMap.text)} />
          <span className="text-sm font-semibold text-foreground truncate">{title}</span>
        </div>

        {/* Probability bar */}
        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', colorMap.bar)}
              style={{ width: `${Math.min(totalProbability, 100)}%` }}
            />
          </div>
          <span className={cn('text-sm font-mono font-bold w-12 text-right flex-shrink-0', colorMap.text)}>
            {totalProbability.toFixed(0)}%
          </span>
        </div>

        {/* Price target */}
        <div className="hidden md:block text-right w-36 flex-shrink-0">
          <div className="text-xs text-muted-foreground font-mono">
            {formatPrice(priceRange.priceMin, currencySymbol)} – {formatPrice(priceRange.priceMax, currencySymbol)}
          </div>
        </div>

        {/* P&L */}
        <div className={cn('text-right w-28 flex-shrink-0 font-mono text-sm font-semibold', returnIsPositive ? 'text-bullish' : 'text-destructive')}>
          {formatCurrencyWithSign(pnlMin.totalPnl, currencySymbol)} to {formatCurrencyWithSign(pnlMax.totalPnl, currencySymbol)}
        </div>

        {/* Expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded sub-scenarios */}
      {expanded && (
        <div className="border-t border-border bg-muted/20 divide-y divide-border/50">
          {scenarios.map((scenario) => {
            const prob = scenario.probability > 1 ? scenario.probability : scenario.probability * 100;
            const scenarioPriceRange = calculatePriceRange(entryPrice, scenario.returnRangeMin, scenario.returnRangeMax);
            return (
              <div key={scenario.id} className="px-4 py-2.5">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm text-foreground">{scenario.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">{prob.toFixed(1)}%</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Target: {formatPrice(scenarioPriceRange.priceMin, currencySymbol)} – {formatPrice(scenarioPriceRange.priceMax, currencySymbol)}
                </div>
                {scenario.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">{scenario.description}</p>
                )}
                {scenario.triggerFactors && scenario.triggerFactors.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {scenario.triggerFactors.slice(0, 3).map((factor, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-muted rounded text-[10px] text-muted-foreground">
                        {factor}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ScenarioRegimeCards({ scenarios, currencySymbol, entryPrice, shares }: ScenarioRegimeCardsProps) {
  return (
    <div className="rounded-2xl bg-surface border border-border/50 p-5">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold text-foreground">Scenario Regimes</h3>
        <div className="hidden md:flex items-center gap-6 text-[10px] text-muted-foreground font-mono">
          <span className="w-36 text-right">PRICE TARGET</span>
          <span className="w-28 text-right">P&L RANGE</span>
          <span className="w-4" />
        </div>
      </div>

      <div className="space-y-2">
        <RegimeRow
          title="Base Regime"
          scenarios={scenarios.base}
          color="base"
          currencySymbol={currencySymbol}
          entryPrice={entryPrice}
          shares={shares}
        />
        <RegimeRow
          title="Bullish"
          scenarios={scenarios.upside}
          color="bullish"
          currencySymbol={currencySymbol}
          entryPrice={entryPrice}
          shares={shares}
        />
        <RegimeRow
          title="Bearish"
          scenarios={scenarios.downside}
          color="bearish"
          currencySymbol={currencySymbol}
          entryPrice={entryPrice}
          shares={shares}
        />
      </div>
    </div>
  );
}
