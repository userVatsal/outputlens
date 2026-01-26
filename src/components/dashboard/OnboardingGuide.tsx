import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Play, Sparkles, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OnboardingGuideProps {
  profileName?: string | null;
  onDismiss: () => void;
}

const ONBOARDING_DISMISSED_KEY = 'outputlens_onboarding_dismissed';

const popularAssets = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'BTC', name: 'Bitcoin', market: 'crypto' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'SPY', name: 'S&P 500 ETF' },
];

const steps = [
  {
    number: 1,
    title: 'Search Asset',
    description: 'Find any stock, crypto, or ETF',
    icon: Search,
  },
  {
    number: 2,
    title: 'Set Your View',
    description: 'Bullish or bearish direction',
    icon: TrendingUp,
  },
  {
    number: 3,
    title: 'Run Analysis',
    description: 'Get risk intelligence instantly',
    icon: Play,
  },
];

export function OnboardingGuide({ profileName, onDismiss }: OnboardingGuideProps) {
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(ONBOARDING_DISMISSED_KEY);
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
    setIsDismissed(true);
    onDismiss();
  };

  const handleStartAnalysis = (asset?: string, market?: string) => {
    if (asset) {
      navigate(`/workspace?asset=${asset}${market ? `&market=${market}` : ''}`);
    } else {
      navigate('/workspace');
    }
  };

  if (isDismissed) {
    return null;
  }

  const firstName = profileName?.split(' ')[0];

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6 mb-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss onboarding guide"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Welcome to OutputLens{firstName ? `, ${firstName}` : ''}!
          </h2>
          <p className="text-sm text-muted-foreground">
            Get started with your first risk analysis in 3 simple steps
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {steps.map((step, index) => (
          <div 
            key={step.number}
            className="relative flex items-start gap-3 p-4 rounded-xl bg-background/60 border border-border/50"
          >
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl font-bold text-lg",
              "bg-primary/10 text-primary"
            )}>
              {step.number}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <step.icon className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground">{step.title}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {step.description}
              </p>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 z-10" />
            )}
          </div>
        ))}
      </div>

      {/* Popular Assets */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-3">Try these popular assets:</p>
        <div className="flex flex-wrap gap-2">
          {popularAssets.map((asset) => (
            <button
              key={asset.symbol}
              onClick={() => handleStartAnalysis(asset.symbol, asset.market)}
              className="px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 hover:border-primary/30 transition-colors text-sm font-medium text-foreground"
            >
              {asset.symbol}
              <span className="text-muted-foreground ml-1.5">({asset.name})</span>
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-4">
        <Button 
          onClick={() => handleStartAnalysis()}
          size="lg"
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          Run Your First Risk Analysis
        </Button>
        <p className="text-xs text-muted-foreground">
          💡 Your first analysis is free!
        </p>
      </div>
    </div>
  );
}