import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Shield,
  Zap,
  Target,
  Brain,
  LineChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const analysisSteps = [
  { 
    id: 1, 
    label: 'Asset Selection', 
    description: 'Choose your asset and position',
    icon: Target,
    color: 'text-blue-500'
  },
  { 
    id: 2, 
    label: 'Data Processing', 
    description: 'Fetching market data & volatility',
    icon: Activity,
    color: 'text-amber-500'
  },
  { 
    id: 3, 
    label: 'Monte Carlo Simulation', 
    description: 'Running 10,000 price paths',
    icon: LineChart,
    color: 'text-purple-500'
  },
  { 
    id: 4, 
    label: 'AI Risk Analysis', 
    description: 'Generating insights & scenarios',
    icon: Brain,
    color: 'text-primary'
  },
];

const sampleMetrics = [
  { label: 'Win Probability', value: '67%', trend: 'up' },
  { label: 'VaR (95%)', value: '-12.3%', trend: 'neutral' },
  { label: 'Expected Return', value: '+8.7%', trend: 'up' },
  { label: 'Tail Risk', value: '2.1x', trend: 'down' },
];

export function WorkspacePreview() {
  const [activeStep, setActiveStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= analysisSteps.length - 1) {
          setShowResults(true);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    const resetTimeout = setTimeout(() => {
      setActiveStep(0);
      setShowResults(false);
    }, 12000);

    return () => {
      clearInterval(interval);
      clearTimeout(resetTimeout);
    };
  }, [activeStep === 0]);

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background relative">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/3 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <CardContent className="p-6 md:p-8 relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold font-display text-foreground mb-2 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Risk Analysis Workspace
            </h3>
            <p className="text-muted-foreground max-w-lg">
              Run institutional-grade risk analysis with Monte Carlo simulation and AI-powered insights.
            </p>
          </div>
          <Button asChild size="lg" className="hidden md:inline-flex group">
            <Link to="/workspace">
              Start Analysis
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Analysis Flow Animation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Steps */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground mb-4">Analysis Pipeline</p>
            {analysisSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;
              const isComplete = index < activeStep || showResults;
              
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg border transition-all duration-500",
                    isActive && "border-primary/50 bg-primary/5 shadow-sm",
                    isComplete && !isActive && "border-primary/20 bg-primary/5",
                    !isActive && !isComplete && "border-border bg-card/50"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-all duration-300",
                    isActive && "bg-primary/20 animate-pulse",
                    isComplete && !isActive && "bg-primary/10",
                    !isActive && !isComplete && "bg-muted"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5 transition-colors",
                      isActive || isComplete ? step.color : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium text-sm transition-colors",
                      isActive || isComplete ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {step.description}
                    </p>
                  </div>
                  {isComplete && (
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center animate-scale-in">
                      <Zap className="h-3 w-3 text-primary" />
                    </div>
                  )}
                  {isActive && !showResults && (
                    <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Results Preview */}
          <div className={cn(
            "space-y-3 transition-all duration-700",
            showResults ? "opacity-100 translate-y-0" : "opacity-30 translate-y-4"
          )}>
            <p className="text-sm font-medium text-muted-foreground mb-4">Sample Results</p>
            <div className="grid grid-cols-2 gap-3">
              {sampleMetrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className={cn(
                    "p-4 rounded-lg border border-border bg-card/80 backdrop-blur-sm transition-all duration-500",
                    showResults && "animate-slide-up"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{metric.label}</span>
                    {metric.trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-bullish" />}
                    {metric.trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-bearish" />}
                  </div>
                  <p className={cn(
                    "text-lg font-bold font-mono",
                    metric.trend === 'up' && "text-bullish",
                    metric.trend === 'down' && "text-bearish",
                    metric.trend === 'neutral' && "text-foreground"
                  )}>
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Mini chart placeholder */}
            <div className="p-4 rounded-lg border border-border bg-card/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">Return Distribution</span>
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <div className="h-16 flex items-end gap-1">
                {[20, 35, 55, 80, 100, 85, 60, 40, 25, 15].map((height, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 rounded-t transition-all duration-500",
                      showResults ? "bg-primary/60" : "bg-muted",
                      i === 4 && "bg-primary"
                    )}
                    style={{ 
                      height: showResults ? `${height}%` : '20%',
                      transitionDelay: `${i * 50}ms`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="mt-6 md:hidden">
          <Button asChild size="lg" className="w-full group">
            <Link to="/workspace">
              <BarChart3 className="h-4 w-4 mr-2" />
              Start Analysis
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
