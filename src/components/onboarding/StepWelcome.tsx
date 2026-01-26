import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Bell, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StepWelcomeProps {
  userName: string | null;
  onComplete: () => void;
}

export function StepWelcome({ userName, onComplete }: StepWelcomeProps) {
  const [showContent, setShowContent] = useState(false);
  const firstName = userName?.split(' ')[0] || 'there';

  useEffect(() => {
    // Animate in content
    const timer = setTimeout(() => setShowContent(true), 100);
    
    // Auto-advance after 5 seconds (giving user time to read)
    const autoAdvance = setTimeout(() => onComplete(), 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoAdvance);
    };
  }, [onComplete]);

  return (
    <div 
      className={`text-center space-y-8 transition-all duration-700 ${
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {/* Welcome animation */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-primary/20 rounded-full animate-ping" />
        </div>
        <div className="relative flex items-center justify-center w-24 h-24 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-lg">
          <Sparkles className="h-12 w-12 text-primary-foreground" />
        </div>
      </div>

      {/* Welcome message */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome, {firstName}! 🎉
        </h1>
        
        <div className="glass-card p-6 text-left max-w-sm mx-auto">
          <p className="text-muted-foreground italic">
            "I'm Vatsal, founder of OutputLens. I built this for traders who want to 
            understand risk before they enter."
          </p>
        </div>
      </div>

      {/* What's next */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          What's next
        </h2>
        
        <div className="grid gap-3 text-left max-w-sm mx-auto">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm text-foreground">Run your first analysis in seconds</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm text-foreground">Track assets you're watching</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm text-foreground">Get alerts when conditions change</span>
          </div>
        </div>
      </div>

      {/* Continue button */}
      <Button onClick={onComplete} size="lg" className="group">
        Continue to Dashboard
        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Button>

      {/* Auto-advance indicator */}
      <p className="text-xs text-muted-foreground">
        Continuing automatically in a few seconds...
      </p>
    </div>
  );
}
