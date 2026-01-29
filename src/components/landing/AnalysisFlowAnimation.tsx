import { useState, useEffect } from 'react';
import { 
  Database, 
  Brain, 
  BarChart3, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    id: 1,
    icon: Database,
    title: 'Data Aggregation',
    description: 'We collect real-time market data, news sentiment, and historical patterns',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
  },
  {
    id: 2,
    icon: Brain,
    title: 'AI Processing',
    description: '10,000 Monte Carlo simulations analyze every possible scenario',
    color: 'text-bullish',
    bgColor: 'bg-bullish/10',
    borderColor: 'border-bullish/30',
  },
  {
    id: 3,
    icon: BarChart3,
    title: 'Risk Scoring',
    description: 'Clear probability scores and risk levels you can act on',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
  },
];

const outputMetrics = [
  { label: 'Win Probability', value: '67%', color: 'text-bullish' },
  { label: '95% VaR', value: '-12.4%', color: 'text-destructive' },
  { label: 'Risk Score', value: '6/10', color: 'text-warning' },
];

export function AnalysisFlowAnimation() {
  const [activeStep, setActiveStep] = useState(0);
  const [showOutput, setShowOutput] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= steps.length - 1) {
          setShowOutput(true);
          setTimeout(() => {
            setShowOutput(false);
            setActiveStep(0);
          }, 3000);
          return prev;
        }
        setShowOutput(false);
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="relative py-12">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-4 mb-12">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                'w-3 h-3 rounded-full transition-all duration-500',
                activeStep >= index 
                  ? 'bg-primary scale-100' 
                  : 'bg-muted scale-75'
              )}
            />
            {index < steps.length - 1 && (
              <div 
                className={cn(
                  'w-16 h-0.5 mx-2 transition-all duration-500',
                  activeStep > index ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Main animation area */}
      <div className="relative h-80 md:h-72">
        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'relative p-6 rounded-2xl border-2 transition-all duration-500',
                activeStep >= index
                  ? `${step.bgColor} ${step.borderColor} opacity-100 translate-y-0`
                  : 'bg-muted/30 border-border/50 opacity-50 translate-y-4',
                activeStep === index && 'ring-2 ring-primary/20 shadow-lg scale-[1.02]'
              )}
            >
              {/* Pulse effect on active step */}
              {activeStep === index && (
                <div className="absolute inset-0 rounded-2xl animate-pulse-glow" />
              )}
              
              <div className={cn(
                'inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-all duration-300',
                activeStep >= index ? step.bgColor : 'bg-muted',
              )}>
                <step.icon className={cn(
                  'h-7 w-7 transition-all duration-300',
                  activeStep >= index ? step.color : 'text-muted-foreground'
                )} />
              </div>
              
              <h3 className={cn(
                'text-lg font-semibold mb-2 transition-colors duration-300',
                activeStep >= index ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {step.title}
              </h3>
              
              <p className={cn(
                'text-sm transition-colors duration-300',
                activeStep >= index ? 'text-muted-foreground' : 'text-muted-foreground/50'
              )}>
                {step.description}
              </p>

              {/* Processing animation */}
              {activeStep === index && (
                <div className="absolute top-4 right-4">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed checkmark */}
              {activeStep > index && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 rounded-full bg-bullish flex items-center justify-center">
                    <Zap className="h-3 w-3 text-bullish-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Arrow connectors (desktop) */}
        <div className="hidden md:flex absolute top-1/2 left-0 right-0 -translate-y-1/2 justify-around px-20 pointer-events-none">
          {[0, 1].map((i) => (
            <ArrowRight
              key={i}
              className={cn(
                'h-6 w-6 transition-all duration-500',
                activeStep > i ? 'text-primary opacity-100' : 'text-muted opacity-30'
              )}
            />
          ))}
        </div>
      </div>

      {/* Output visualization */}
      <div
        className={cn(
          'mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-background to-bullish/5 border-2 border-primary/20 transition-all duration-700',
          showOutput 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Analysis Complete</p>
            <p className="text-sm text-muted-foreground">Your risk assessment is ready</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {outputMetrics.map((metric, index) => (
            <div
              key={metric.label}
              className={cn(
                'text-center p-4 rounded-xl bg-background/80 transition-all duration-500',
                showOutput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
              <p className={cn('text-2xl font-bold font-mono', metric.color)}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        {/* Scenario preview */}
        <div className="mt-4 flex gap-2">
          <div className="flex-1 p-2 rounded-lg bg-bullish/10 border border-bullish/20 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-bullish" />
            <span className="text-xs font-medium">Bullish: 28%</span>
          </div>
          <div className="flex-1 p-2 rounded-lg bg-muted flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium">Base: 42%</span>
          </div>
          <div className="flex-1 p-2 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
            <Shield className="h-4 w-4 text-destructive" />
            <span className="text-xs font-medium">Bearish: 30%</span>
          </div>
        </div>
      </div>

      {/* Play/Pause control */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isPlaying ? 'Pause animation' : 'Play animation'}
        </button>
      </div>
    </div>
  );
}
