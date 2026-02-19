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

  const tailScenarios = scenarios.tail;
  const totalTailProbability = tailScenarios.reduce((sum, s) => {
    const prob = s.probability > 1 ? s.probability : s.probability * 100;
    return sum + prob;
  }, 0);

  const allTriggerFactors = tailScenarios
    .flatMap(s => s.triggerFactors || [])
    .filter((value, index, self) => self.indexOf(value) === index);

  const hasFatTails = kurtosis > 1;
  const expectedLoss = Math.abs(expectedShortfall) * entryPrice / 100;

  // Visual probability bar width (cap at 20% for visual scaling — tail risk rarely exceeds this)
  const barWidth = Math.min((totalTailProbability / 15) * 100, 100);

  return (
    <div className="rounded-lg overflow-hidden border border-caution/30 mb-4">
      {/* Dark amber header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-caution/10 border-b border-caution/20">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-caution" />
          <span className="text-[10px] font-mono font-bold text-caution/80 uppercase tracking-widest">
            Tail Risk Exposure
          </span>
          {hasFatTails && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-destructive/20 text-destructive font-mono font-bold uppercase">
              Fat Tails
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold font-mono text-caution">{totalTailProbability.toFixed(1)}%</span>
          <span className="text-[10px] text-muted-foreground font-mono">probability</span>
        </div>
      </div>

      {/* Probability scale bar */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-[10px] font-mono text-muted-foreground w-16">0%</span>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-caution rounded-full transition-all duration-700"
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground w-12 text-right">15%+</span>
        </div>
        <p className="text-xs text-muted-foreground ml-16">Rare but impactful events — requires position sizing awareness</p>
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-3 gap-0 divide-x divide-border px-0 mt-3 border-t border-border">
        <div className="px-4 py-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
            <TrendingDown className="h-3 w-3" />
            Exp. Shortfall
          </div>
          <div className="font-mono font-semibold text-foreground">{expectedShortfall.toFixed(1)}%</div>
          <div className="text-[10px] text-muted-foreground font-mono">
            ≈ {currencySymbol}{expectedLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}/share
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
            <Zap className="h-3 w-3" />
            Kurtosis
          </div>
          <div className={cn('font-mono font-semibold', hasFatTails ? 'text-destructive' : 'text-foreground')}>
            {kurtosis.toFixed(2)}
          </div>
          <div className="text-[10px] text-muted-foreground font-mono">
            {hasFatTails ? 'Heavier than normal' : 'Near normal'}
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
            <AlertTriangle className="h-3 w-3" />
            Implication
          </div>
          <div className="font-mono font-semibold text-foreground text-sm">Size carefully</div>
          <div className="text-[10px] text-muted-foreground font-mono">Risk small % of capital</div>
        </div>
      </div>

      {/* Expand toggle */}
      {tailScenarios.length > 0 && (
        <div className="border-t border-border">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-4 py-2 w-full font-mono transition-colors"
          >
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {isExpanded ? 'Hide' : 'View'} {tailScenarios.length} tail scenarios
          </button>

          {isExpanded && (
            <div className="border-t border-border divide-y divide-border/50 bg-muted/20">
              {tailScenarios.map((scenario) => {
                const prob = scenario.probability > 1 ? scenario.probability : scenario.probability * 100;
                return (
                  <div key={scenario.id} className="px-4 py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm text-foreground">{scenario.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{scenario.description}</div>
                      </div>
                      <span className="text-sm font-mono text-muted-foreground">{prob.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-muted-foreground font-mono">Return range:</span>
                      <span className={cn('text-[10px] font-mono', scenario.returnRangeMin < 0 ? 'text-destructive' : 'text-bullish')}>
                        {scenario.returnRangeMin.toFixed(1)}% to {scenario.returnRangeMax.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
              {allTriggerFactors.length > 0 && (
                <div className="px-4 py-3">
                  <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-2">Potential Triggers</div>
                  <div className="flex flex-wrap gap-1.5">
                    {allTriggerFactors.map((factor, i) => (
                      <span key={i} className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground font-mono">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
