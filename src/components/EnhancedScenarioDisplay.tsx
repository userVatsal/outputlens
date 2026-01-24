import { useState } from 'react';
import { ChevronDown, ChevronRight, Target, TrendingUp, TrendingDown, AlertTriangle, Percent } from 'lucide-react';
import { DynamicScenario, DynamicScenarioSet } from '@/lib/scenarioEngine';
import { RiskLevel } from '@/types/trade';

interface EnhancedScenarioDisplayProps {
  scenarios: DynamicScenarioSet;
  currencySymbol: string;
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const colors = {
    Low: 'bg-bullish/10 text-bullish',
    Medium: 'bg-yellow-500/10 text-yellow-600',
    High: 'bg-bearish/10 text-bearish'
  };
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[level]}`}>
      {level}
    </span>
  );
}

function ProbabilityBadge({ probability, label }: { probability: number; label: string }) {
  const pct = (probability * 100).toFixed(0);
  const colors = 
    probability >= 0.3 ? 'bg-primary/10 text-primary' :
    probability >= 0.1 ? 'bg-muted text-foreground' :
    'bg-muted/50 text-muted-foreground';
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors}`}>
      {pct}% • {label}
    </span>
  );
}

function formatReturn(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function formatPrice(price: number, currencySymbol: string): string {
  return `${currencySymbol}${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface ScenarioCategoryProps {
  title: string;
  description: string;
  results: DynamicScenario[];
  currencySymbol: string;
  icon: React.ReactNode;
  colorClass: string;
  defaultOpen?: boolean;
}

function ScenarioCategory({ 
  title, 
  description, 
  results, 
  currencySymbol, 
  icon, 
  colorClass,
  defaultOpen = true 
}: ScenarioCategoryProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  if (results.length === 0) return null;

  // Calculate combined probability for this category
  const totalProbability = results.reduce((sum, s) => sum + s.probability, 0);

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
      >
        <div className={`p-2 rounded-lg ${colorClass}`}>
          {icon}
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <span className="text-xs text-muted-foreground">
              ({results.length} scenario{results.length > 1 ? 's' : ''})
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">
              {(totalProbability * 100).toFixed(0)}% combined
            </div>
          </div>
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-border/50">
          {results.map((scenario) => (
            <div 
              key={scenario.id}
              className="p-4 border-b border-border/30 last:border-b-0 hover:bg-muted/30 transition-colors"
            >
              <div className="flex flex-wrap items-start gap-4">
                {/* Scenario Info */}
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground">{scenario.name}</h4>
                    <RiskBadge level={scenario.riskLevel} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {scenario.description}
                  </p>
                  <ProbabilityBadge 
                    probability={scenario.probability} 
                    label={scenario.probabilityLabel} 
                  />
                </div>

                {/* Price Range */}
                <div className="text-right min-w-[140px]">
                  <div className="text-xs text-muted-foreground mb-1">Price Range</div>
                  <div className="font-mono text-sm">
                    {formatPrice(scenario.priceRangeMin, currencySymbol)} – {formatPrice(scenario.priceRangeMax, currencySymbol)}
                  </div>
                </div>

                {/* Return Range */}
                <div className="text-right min-w-[120px]">
                  <div className="text-xs text-muted-foreground mb-1">Return Range</div>
                  <div className={`font-mono text-sm font-medium ${
                    scenario.returnRangeMin >= 0 && scenario.returnRangeMax >= 0 ? 'text-bullish' :
                    scenario.returnRangeMin < 0 && scenario.returnRangeMax < 0 ? 'text-bearish' :
                    'text-foreground'
                  }`}>
                    {formatReturn(scenario.returnRangeMin)} to {formatReturn(scenario.returnRangeMax)}
                  </div>
                </div>
              </div>

              {/* Trigger Factors */}
              {scenario.triggerFactors && scenario.triggerFactors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/30">
                  <div className="text-xs text-muted-foreground mb-1">Potential triggers:</div>
                  <div className="flex flex-wrap gap-1">
                    {scenario.triggerFactors.map((factor, i) => (
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
          ))}
        </div>
      )}
    </div>
  );
}

export function EnhancedScenarioDisplay({ scenarios, currencySymbol }: EnhancedScenarioDisplayProps) {
  return (
    <div className="space-y-4">
      <ScenarioCategory
        title="Base Case"
        description="Most probable outcome based on current volatility"
        results={scenarios.base}
        currencySymbol={currencySymbol}
        icon={<Target className="h-5 w-5 text-primary" />}
        colorClass="bg-primary/10"
        defaultOpen={true}
      />
      
      <ScenarioCategory
        title="Upside Scenarios"
        description="Favorable outcomes if catalysts align"
        results={scenarios.upside}
        currencySymbol={currencySymbol}
        icon={<TrendingUp className="h-5 w-5 text-bullish" />}
        colorClass="bg-bullish/10"
        defaultOpen={true}
      />
      
      <ScenarioCategory
        title="Downside Scenarios"
        description="Adverse outcomes to prepare for"
        results={scenarios.downside}
        currencySymbol={currencySymbol}
        icon={<TrendingDown className="h-5 w-5 text-bearish" />}
        colorClass="bg-bearish/10"
        defaultOpen={true}
      />
      
      <ScenarioCategory
        title="Tail Risk Events"
        description="Rare but impactful extreme outcomes"
        results={scenarios.tail}
        currencySymbol={currencySymbol}
        icon={<AlertTriangle className="h-5 w-5 text-yellow-500" />}
        colorClass="bg-yellow-500/10"
        defaultOpen={false}
      />
    </div>
  );
}