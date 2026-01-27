import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Cpu, Brain } from 'lucide-react';

export function WhySection() {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-6">
      <h2 className="text-lg font-semibold text-foreground font-brand mb-3">
        Three-Layer Intelligence Architecture
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        OutputLens is not a trading tool. It is risk infrastructure for decisions under uncertainty. 
        We quantify the downside before you trade—using the same mathematical models hedge funds use, 
        but accessible in your browser.
      </p>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Cpu className="h-3.5 w-3.5 text-primary" />
          <span>Layer 1: Math</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span>Layer 2: ML</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Brain className="h-3.5 w-3.5 text-primary" />
          <span>Layer 3: AI</span>
        </div>
      </div>
      <Link 
        to="/methodology" 
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        See how our three-layer system works
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
