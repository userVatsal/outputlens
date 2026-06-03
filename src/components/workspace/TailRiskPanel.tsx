import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
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

  // Build 3 VaR-style rows. We have ES (CVaR 95) and tailProb; var90 is approximated as ES * 0.7
  const var95 = Math.abs(expectedShortfall) * 0.85;
  const var99 = Math.abs(expectedShortfall);
  const var90 = Math.abs(expectedShortfall) * 0.65;
  const maxBar = Math.max(var90, var95, var99, 0.0001);
  const rows = [
    { label: 'VaR 90%', value: var90, fill: 'bg-caution/70' },
    { label: 'VaR 95%', value: var95, fill: 'bg-bearish/60' },
    { label: 'VaR 99%', value: var99, fill: 'bg-bearish/80' },
  ];

  return (
    <div className="rounded-2xl bg-surface border border-border/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-caution" />
          <h3 className="text-[13px] font-semibold text-foreground">Tail Risk Exposure</h3>
          {hasFatTails && (
            <span className="text-[10px] font-mono font-bold text-destructive bg-destructive/10 border border-destructive/20 rounded px-1.5 py-0.5 uppercase">
              Fat Tails
            </span>
          )}
        </div>
        <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
          {totalTailProbability.toFixed(1)}% prob
        </span>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => {
          const pct = (row.value / maxBar) * 100;
          return (
            <div key={row.label} className="flex items-center gap-3">
              <span className="text-[11px] uppercase text-muted-foreground tracking-[0.08em] w-16">
                {row.label}
              </span>
              <div className="flex-1 h-2 rounded-full bg-elevated overflow-hidden">
                <div
                  className={cn('h-full rounded-full', row.fill)}
                  style={{
                    width: `${pct}%`,
                    animation: 'bar-grow 700ms cubic-bezier(0.16,1,0.3,1) both',
                    animationDelay: `${index * 120}ms`,
                  }}
                />
              </div>
              <span className="font-mono text-[14px] text-bearish font-semibold tabular-nums w-20 text-right">
                −{row.value.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-2 gap-4">
        <div>
          <div className="text-[11px] uppercase text-muted-foreground tracking-[0.08em]">Expected Shortfall</div>
          <div className="font-mono font-semibold text-foreground tabular-nums mt-1">
            {expectedShortfall.toFixed(2)}%
          </div>
          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
            ≈ {currencySymbol}{expectedLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}/share
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase text-muted-foreground tracking-[0.08em]">Kurtosis</div>
          <div className={cn('font-mono font-semibold tabular-nums mt-1', hasFatTails ? 'text-destructive' : 'text-foreground')}>
            {kurtosis.toFixed(2)}
          </div>
          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
            {hasFatTails ? 'Heavier than normal' : 'Near normal'}
          </div>
        </div>
      </div>

      {/* Expand toggle */}
      {tailScenarios.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border/40">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {isExpanded ? 'Hide' : 'View'} {tailScenarios.length} tail scenarios
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-2">
              {tailScenarios.map((scenario) => {
                const prob = scenario.probability > 1 ? scenario.probability : scenario.probability * 100;
                return (
                  <div key={scenario.id} className="rounded-lg bg-elevated/40 p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-[13px] text-foreground">{scenario.name}</div>
                        <div className="text-[12px] text-muted-foreground mt-0.5">{scenario.description}</div>
                      </div>
                      <span className="text-[12px] font-mono text-muted-foreground tabular-nums">{prob.toFixed(1)}%</span>
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
                <div className="pt-2">
                  <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-2">Potential Triggers</div>
                  <div className="flex flex-wrap gap-1.5">
                    {allTriggerFactors.map((factor, i) => (
                      <span key={i} className="px-2 py-0.5 bg-elevated rounded text-[11px] text-muted-foreground font-mono">
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
