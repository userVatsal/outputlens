import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, TrendingDown, Zap } from 'lucide-react';
import { DynamicScenarioSet } from '@/lib/scenarioEngine';
import { cn } from '@/lib/utils';

interface TailRiskPanelProps {
  scenarios: DynamicScenarioSet;
  expectedShortfall: number;
  kurtosis: number;
  currencySymbol: string;
  entryPrice: number;
}

export function TailRiskPanel({ 
  scenarios, 
  expectedShortfall, 
  kurtosis,
  currencySymbol,
  entryPrice 
}: TailRiskPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate combined tail probability
  const tailScenarios = scenarios.tail;
  const totalTailProbability = tailScenarios.reduce((sum, s) => {
    const prob = s.probability > 1 ? s.probability : s.probability * 100;
    return sum + prob;
  }, 0);

  // Get all trigger factors from tail scenarios
  const allTriggerFactors = tailScenarios
    .flatMap(s => s.triggerFactors || [])
    .filter((value, index, self) => self.indexOf(value) === index);

  // Fat tails warning
  const hasFatTails = kurtosis > 1;

  // Calculate expected loss in currency
  const expectedLoss = Math.abs(expectedShortfall) * entryPrice / 100;

  return (
    <div className="rounded-xl border-2 border-dashed border-caution/40 bg-caution/5 p-5 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-caution/20">
            <AlertTriangle className="h-6 w-6 text-caution" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              Tail Risk Exposure
              {hasFatTails && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-bearish/10 text-bearish font-medium">
                  Fat Tails Detected
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Rare but impactful events that require position sizing awareness
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-caution">
            {totalTailProbability.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">combined probability</div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-caution/20">
        <div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
            <TrendingDown className="h-3.5 w-3.5" />
            Expected Shortfall
          </div>
          <div className="font-semibold text-foreground">
            {expectedShortfall.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">
            ≈ {currencySymbol}{expectedLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })} per share
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
            <Zap className="h-3.5 w-3.5" />
            Kurtosis
          </div>
          <div className={cn(
            "font-semibold",
            hasFatTails ? "text-bearish" : "text-foreground"
          )}>
            {kurtosis.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">
            {hasFatTails ? 'Heavier than normal' : 'Near normal'}
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Implication
          </div>
          <div className="font-semibold text-foreground text-sm">
            Position sizing critical
          </div>
          <div className="text-xs text-muted-foreground">
            Risk small % of capital
          </div>
        </div>
      </div>

      {/* Expandable Section */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-4 w-4" />
            Hide tail scenarios
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            View {tailScenarios.length} tail scenarios
          </>
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {tailScenarios.map((scenario) => {
            const prob = scenario.probability > 1 ? scenario.probability : scenario.probability * 100;
            return (
              <div 
                key={scenario.id}
                className="p-3 rounded-lg bg-background/60 border border-border/50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-foreground">{scenario.name}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {scenario.description}
                    </div>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">
                    {prob.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">Return range:</span>
                  <span className={cn(
                    "text-xs font-mono",
                    scenario.returnRangeMin < 0 ? "text-bearish" : "text-bullish"
                  )}>
                    {scenario.returnRangeMin.toFixed(1)}% to {scenario.returnRangeMax.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}

          {/* Trigger Factors */}
          {allTriggerFactors.length > 0 && (
            <div className="pt-3 border-t border-caution/20">
              <div className="text-xs text-muted-foreground mb-2">Potential triggers:</div>
              <div className="flex flex-wrap gap-1.5">
                {allTriggerFactors.map((factor, i) => (
                  <span 
                    key={i}
                    className="px-2 py-0.5 bg-muted/50 rounded text-xs text-muted-foreground"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
