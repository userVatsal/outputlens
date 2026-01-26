import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function WhySection() {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-6">
      <h2 className="text-lg font-semibold text-foreground font-brand mb-3">
        Why OutputLens Exists
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Markets are irrational, liquidity is fragmented, and drawdowns happen faster than most traders anticipate. 
        OutputLens equips traders and B2B firms with AI-powered, probabilistic risk analysis so you can see the downside before you trade.
      </p>
      <Link 
        to="/about" 
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-3"
      >
        Learn more about our mission
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
