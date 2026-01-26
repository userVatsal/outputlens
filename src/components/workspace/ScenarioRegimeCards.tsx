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

interface RegimeCardProps {
  title: string;
  scenarios: DynamicScenario[];
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
  currencySymbol: string;
  entryPrice: number;
  shares: number;
}

function probabilityToLabel(probability: number): string {
  if (probability >= 50) return 'Most Likely';
  if (probability >= 25) return 'Likely';
  if (probability >= 10) return 'Possible';
  if (probability >= 5) return 'Unlikely';
  return 'Rare';
}

function RegimeCard({ title, scenarios, icon, borderColor, bgColor, currencySymbol, entryPrice, shares }: RegimeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (scenarios.length === 0) return null;

  // Calculate combined probability
  const totalProbability = scenarios.reduce((sum, s) => {
    const prob = s.probability > 1 ? s.probability : s.probability * 100;
    return sum + prob;
  }, 0);

  // Get representative return range (union of all scenarios)
  const minReturn = Math.min(...scenarios.map(s => s.returnRangeMin));
  const maxReturn = Math.max(...scenarios.map(s => s.returnRangeMax));

  const returnIsPositive = (minReturn + maxReturn) / 2 >= 0;
  
  // Calculate price range and P&L
  const priceRange = calculatePriceRange(entryPrice, minReturn, maxReturn);
  const pnlMin = calculatePnL(entryPrice, minReturn, shares);
  const pnlMax = calculatePnL(entryPrice, maxReturn, shares);

  return (
    <div className={cn(
      "rounded-xl border-2 p-4 transition-all",
      borderColor,
      bgColor
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="p-1.5 rounded-lg bg-background/80">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">{title}</h4>
          <div className="text-xs text-muted-foreground">
            {scenarios.length} scenario{scenarios.length > 1 ? 's' : ''}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-foreground">
            {totalProbability.toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground">
            {probabilityToLabel(totalProbability)}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-2 mb-3">
        {/* Price Targets */}
        <div className="bg-background/50 rounded-lg px-3 py-2">
          <div className="text-xs text-muted-foreground">Price Target</div>
          <div className="font-mono font-semibold text-sm text-foreground">
            {formatPrice(priceRange.priceMin, currencySymbol)} – {formatPrice(priceRange.priceMax, currencySymbol)}
          </div>
        </div>
        
        {/* P&L Range */}
        <div className="bg-background/50 rounded-lg px-3 py-2">
          <div className="text-xs text-muted-foreground">P&L Range ({shares} share{shares !== 1 ? 's' : ''})</div>
          <div className={cn(
            "font-mono font-semibold text-sm",
            returnIsPositive ? "text-bullish" : "text-bearish"
          )}>
            {formatCurrencyWithSign(pnlMin.totalPnl, currencySymbol)} to {formatCurrencyWithSign(pnlMax.totalPnl, currencySymbol)}
          </div>
        </div>
        
        {/* Return % */}
        <div className="flex justify-between items-center bg-background/50 rounded-lg px-3 py-2">
          <span className="text-xs text-muted-foreground">Return</span>
          <span className={cn(
            "font-mono text-sm",
            returnIsPositive ? "text-bullish" : "text-bearish"
          )}>
            {minReturn >= 0 ? '+' : ''}{minReturn.toFixed(1)}% to {maxReturn >= 0 ? '+' : ''}{maxReturn.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Expand/Collapse */}
      {scenarios.length > 0 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-1"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Hide details
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              View details
            </>
          )}
        </button>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
          {scenarios.map((scenario) => {
            const prob = scenario.probability > 1 ? scenario.probability : scenario.probability * 100;
            const scenarioPriceRange = calculatePriceRange(entryPrice, scenario.returnRangeMin, scenario.returnRangeMax);
            return (
              <div 
                key={scenario.id}
                className="p-2.5 rounded-lg bg-background/60"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm text-foreground">{scenario.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">{prob.toFixed(1)}%</span>
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  Target: {formatPrice(scenarioPriceRange.priceMin, currencySymbol)} – {formatPrice(scenarioPriceRange.priceMax, currencySymbol)}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {scenario.description}
                </p>
                {scenario.triggerFactors && scenario.triggerFactors.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {scenario.triggerFactors.slice(0, 3).map((factor, i) => (
                      <span 
                        key={i}
                        className="px-1.5 py-0.5 bg-muted/50 rounded text-[10px] text-muted-foreground"
                      >
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
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Scenario Regimes</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RegimeCard
          title="Base Case"
          scenarios={scenarios.base}
          icon={<Target className="h-5 w-5 text-primary" />}
          borderColor="border-primary/30"
          bgColor="bg-primary/5"
          currencySymbol={currencySymbol}
          entryPrice={entryPrice}
          shares={shares}
        />
        
        <RegimeCard
          title="Upside"
          scenarios={scenarios.upside}
          icon={<TrendingUp className="h-5 w-5 text-bullish" />}
          borderColor="border-bullish/30"
          bgColor="bg-bullish/5"
          currencySymbol={currencySymbol}
          entryPrice={entryPrice}
          shares={shares}
        />
        
        <RegimeCard
          title="Downside"
          scenarios={scenarios.downside}
          icon={<TrendingDown className="h-5 w-5 text-bearish" />}
          borderColor="border-bearish/30"
          bgColor="bg-bearish/5"
          currencySymbol={currencySymbol}
          entryPrice={entryPrice}
          shares={shares}
        />
      </div>
    </div>
  );
}
