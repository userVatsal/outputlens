import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector or element identifier
  position: 'top' | 'bottom' | 'left' | 'right';
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'asset-search',
    title: 'Search for any asset',
    description: 'Type a company name like "Apple" or "Tesla" - we\'ll find the ticker for you.',
    target: 'asset-search',
    position: 'bottom',
  },
  {
    id: 'direction',
    title: 'Set your view',
    description: 'Do you think the price will go up or down? Click to select your direction.',
    target: 'direction-buttons',
    position: 'bottom',
  },
  {
    id: 'timing',
    title: 'Choose your timeframe',
    description: 'When do you plan to enter and exit? We\'ll simulate scenarios for that period.',
    target: 'timing-section',
    position: 'top',
  },
  {
    id: 'analyze',
    title: 'See all possible outcomes',
    description: 'Hit analyze to run 10,000 Monte Carlo simulations and see your risk profile!',
    target: 'analyze-button',
    position: 'top',
  },
];

interface OnboardingTooltipsProps {
  onComplete: () => void;
  isVisible: boolean;
}

export function OnboardingTooltips({ onComplete, isVisible }: OnboardingTooltipsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Reset when visibility changes
    if (isVisible) {
      setCurrentStep(0);
      setDismissed(false);
    }
  }, [isVisible]);

  if (!isVisible || dismissed) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setDismissed(true);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
        onClick={handleSkip}
      />
      
      {/* Floating tooltip */}
      <div 
        className={cn(
          "fixed z-50 w-80 glass-card p-4 shadow-2xl border-primary/30 animate-fade-in",
          "left-1/2 -translate-x-1/2",
          // Position based on step
          currentStep <= 1 ? "top-1/3" : "bottom-1/3"
        )}
      >
        {/* Progress dots */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {ONBOARDING_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  idx === currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
          <button
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close onboarding"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">{step.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground pl-8">
            {step.description}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={isFirstStep}
            className="text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Skip tour
            </button>
            <Button size="sm" onClick={handleNext}>
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// Welcome card for first-time users
interface WelcomeCardProps {
  assetFromUrl?: string | null;
  onDismiss: () => void;
}

export function WelcomeCard({ assetFromUrl, onDismiss }: WelcomeCardProps) {
  return (
    <div className="glass-card p-6 mb-6 border-primary/30 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              {assetFromUrl 
                ? `Ready to analyze ${assetFromUrl}?` 
                : 'Welcome to OutputLens!'}
            </h2>
            <p className="text-sm text-muted-foreground max-w-md">
              {assetFromUrl 
                ? `We've pre-loaded ${assetFromUrl} for you. Set your direction and timing to see how your trade might perform.`
                : 'Your first analysis is on us. Search for any stock, crypto, or index to see how your trade might perform across 10,000 scenarios.'}
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Dismiss welcome message"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
