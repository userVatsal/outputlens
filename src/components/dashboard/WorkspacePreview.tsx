import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Activity,
  LineChart,
  Brain,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  BarChart3,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const pipelineSteps = [
  { id: 1, icon: Target, label: 'Asset Selection', detail: 'Symbol, direction, time horizon' },
  { id: 2, icon: Activity, label: 'Market Data', detail: 'Live prices & volatility' },
  { id: 3, icon: LineChart, label: 'Monte Carlo', detail: 'Running 10,000 paths' },
  { id: 4, icon: Brain, label: 'AI Analysis', detail: 'Scenarios & risk scoring' },
];

const sampleMetrics = [
  { label: 'Win Probability', value: '67%', trend: 'up' },
  { label: 'VaR (95%)', value: '-12.3%', trend: 'neutral' },
  { label: 'Expected Return', value: '+8.7%', trend: 'up' },
  { label: 'Tail Risk', value: '2.1x', trend: 'down' },
];

const histogramBars = [15, 25, 45, 70, 100, 85, 62, 40, 22, 12];

export function WorkspacePreview() {
  const [activeStep, setActiveStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= pipelineSteps.length - 1) {
          setShowResults(true);
          return prev;
        }
        return prev + 1;
      });
    }, 1800);

    const reset = setTimeout(() => {
      setActiveStep(0);
      setShowResults(false);
    }, 11000);

    return () => {
      clearInterval(interval);
      clearTimeout(reset);
    };
  }, [activeStep === 0 ? activeStep : undefined]);

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="font-semibold font-display text-foreground">Risk Analysis Workspace</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Institutional-grade simulation & AI insights</p>
        </div>
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link to="/workspace">
            Open Workspace <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Pipeline — left */}
        <div className="p-5 border-r border-border/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Analysis Pipeline</p>
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-4 top-4 bottom-4 w-px bg-border" />

            <div className="space-y-1">
              {pipelineSteps.map((step, idx) => {
                const Icon = step.icon;
                const isComplete = idx < activeStep || showResults;
                const isActive = idx === activeStep && !showResults;

                return (
                  <div key={step.id} className="relative flex items-center gap-4 py-3">
                    {/* Node */}
                    <div className={cn(
                      'relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-400',
                      isComplete && 'border-primary bg-primary',
                      isActive && 'border-primary bg-primary/10',
                      !isComplete && !isActive && 'border-border bg-card',
                    )}>
                      {isActive ? (
                        <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                      ) : isComplete ? (
                        <CheckCircle className="h-4 w-4 text-white" />
                      ) : (
                        <span className="text-xs font-mono text-muted-foreground">{step.id}</span>
                      )}
                    </div>

                    <div>
                      <p className={cn(
                        'text-sm font-medium transition-colors',
                        (isComplete || isActive) ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results — right */}
        <div className={cn(
          'p-5 transition-all duration-700',
          showResults ? 'opacity-100' : 'opacity-30'
        )}>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Sample Results</p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {sampleMetrics.map((m) => (
              <div key={m.label} className="border border-border rounded p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                  {m.trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-bullish" />}
                  {m.trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
                </div>
                <p className={cn(
                  'text-lg font-bold font-mono',
                  m.trend === 'up' && 'text-bullish',
                  m.trend === 'down' && 'text-destructive',
                  m.trend === 'neutral' && 'text-foreground'
                )}>
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          {/* Mini histogram */}
          <div className="border border-border rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Return Distribution</span>
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex items-end gap-0.5 h-14">
              {histogramBars.map((h, i) => (
                <div
                  key={i}
                  className={cn('flex-1 rounded-t-sm transition-all duration-500', i === 4 ? 'bg-primary' : 'bg-primary/25')}
                  style={{ height: showResults ? `${h}%` : '10%', transitionDelay: `${i * 30}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="sm:hidden border-t border-border p-4">
        <Button asChild size="sm" className="w-full">
          <Link to="/workspace">Open Workspace <ArrowRight className="h-3.5 w-3.5 ml-1.5" /></Link>
        </Button>
      </div>
    </div>
  );
}
