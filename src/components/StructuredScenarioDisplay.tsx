import { StructuredScenarios, ScenarioResult, RiskLevel } from '@/types/trade';
import { TrendingUp, TrendingDown, Minus, Target, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface StructuredScenarioDisplayProps {
  scenarios: StructuredScenarios;
  currencySymbol: string;
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const baseClasses = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium';
  
  switch (level) {
    case 'Low':
      return <span className={`${baseClasses} risk-badge-low`}>Low</span>;
    case 'Medium':
      return <span className={`${baseClasses} risk-badge-medium`}>Medium</span>;
    case 'High':
      return <span className={`${baseClasses} risk-badge-high`}>High</span>;
  }
}

function formatReturn(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function formatPrice(price: number, currencySymbol: string): string {
  return `${currencySymbol}${price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface ScenarioCategoryProps {
  title: string;
  description: string;
  results: ScenarioResult[];
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

  return (
    <div className="glass-card overflow-hidden">
      {/* Category Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClass}`}>
            {icon}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{results.length} scenario{results.length !== 1 ? 's' : ''}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Scenarios */}
      {isOpen && (
        <div className="border-t border-border/50">
          {results.map((result, index) => (
            <div 
              key={result.scenario.id} 
              className={`p-4 ${index !== results.length - 1 ? 'border-b border-border/30' : ''}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{result.scenario.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {result.scenario.probability}
                    </span>
                    <RiskBadge level={result.scenario.riskLevel} />
                  </div>
                  <p className="text-sm text-muted-foreground">{result.scenario.description}</p>
                </div>
                <div className="flex gap-6 lg:gap-8 text-sm">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">Price Range</div>
                    <div className="font-mono text-foreground">
                      {formatPrice(result.priceRangeMin, currencySymbol)} – {formatPrice(result.priceRangeMax, currencySymbol)}
                    </div>
                  </div>
                  <div className="text-right min-w-[100px]">
                    <div className="text-xs text-muted-foreground mb-1">Expected Return</div>
                    <div className={`font-mono font-medium ${
                      result.returnMax < 0 ? 'text-bearish' : 
                      result.returnMin > 0 ? 'text-bullish' : 
                      'text-muted-foreground'
                    }`}>
                      {formatReturn(result.returnMin)} to {formatReturn(result.returnMax)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StructuredScenarioDisplay({ scenarios, currencySymbol }: StructuredScenarioDisplayProps) {
  return (
    <div className="space-y-4">
      <ScenarioCategory
        title="Base Case"
        description="Most likely outcomes under normal market conditions"
        results={scenarios.base}
        currencySymbol={currencySymbol}
        icon={<Target className="h-4 w-4 text-primary" />}
        colorClass="bg-primary/10"
        defaultOpen={true}
      />

      <ScenarioCategory
        title="Upside Scenarios"
        description="Favorable outcomes if positive catalysts emerge"
        results={scenarios.upside}
        currencySymbol={currencySymbol}
        icon={<TrendingUp className="h-4 w-4 text-bullish" />}
        colorClass="bg-bullish/10"
        defaultOpen={true}
      />

      <ScenarioCategory
        title="Downside Scenarios"
        description="Adverse outcomes from negative developments"
        results={scenarios.downside}
        currencySymbol={currencySymbol}
        icon={<TrendingDown className="h-4 w-4 text-bearish" />}
        colorClass="bg-bearish/10"
        defaultOpen={true}
      />

      <ScenarioCategory
        title="Tail Risk Events"
        description="Low probability, high impact scenarios"
        results={scenarios.tail}
        currencySymbol={currencySymbol}
        icon={<AlertTriangle className="h-4 w-4 text-caution" />}
        colorClass="bg-caution/10"
        defaultOpen={false}
      />
    </div>
  );
}
