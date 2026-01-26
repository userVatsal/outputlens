import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart3, 
  TrendingUp, 
  Shield, 
  Sparkles,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface InteractivePreviewProps {
  className?: string;
}

const DEMO_RESULTS = {
  AAPL: { win: 62, expected: 1.8, var95: -4.2, risk: 4 },
  TSLA: { win: 54, expected: 2.4, var95: -7.8, risk: 6 },
  MSFT: { win: 65, expected: 1.5, var95: -3.6, risk: 3 },
  SPY: { win: 58, expected: 0.8, var95: -2.4, risk: 2 },
};

type DemoSymbol = keyof typeof DEMO_RESULTS;

export function InteractivePreview({ className }: InteractivePreviewProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<DemoSymbol>('AAPL');
  const [isAnimating, setIsAnimating] = useState(false);
  
  const results = DEMO_RESULTS[selectedSymbol];
  
  const handleSymbolChange = (symbol: DemoSymbol) => {
    if (symbol === selectedSymbol) return;
    setIsAnimating(true);
    setTimeout(() => {
      setSelectedSymbol(symbol);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className={cn('glass-card p-6 md:p-8 shadow-2xl border-primary/20', className)}>
      {/* Symbol Selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Try It Live</p>
            <p className="text-sm text-muted-foreground">Select an asset to preview</p>
          </div>
        </div>
        <Badge className="bg-bullish/10 text-bullish border-bullish/20">
          <Sparkles className="h-3 w-3 mr-1" />
          Interactive Demo
        </Badge>
      </div>

      {/* Symbol Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(Object.keys(DEMO_RESULTS) as DemoSymbol[]).map((symbol) => (
          <button
            key={symbol}
            onClick={() => handleSymbolChange(symbol)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              selectedSymbol === symbol
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted hover:bg-muted/80 text-foreground'
            )}
          >
            {symbol}
          </button>
        ))}
      </div>

      {/* Results Preview */}
      <div className={cn(
        'transition-all duration-300',
        isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      )}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Win Probability</p>
            <p className="text-xl font-bold font-mono text-bullish">{results.win}%</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Expected Return</p>
            <p className="text-xl font-bold font-mono text-foreground">+{results.expected}%</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">95% VaR</p>
            <p className="text-xl font-bold font-mono text-bearish">{results.var95}%</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Risk Score</p>
            <p className="text-xl font-bold font-mono text-foreground">{results.risk}/10</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center p-3 rounded-lg bg-bullish/5 border border-bullish/20">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-bullish" />
              <span className="text-sm font-medium">Bullish Continuation</span>
            </div>
            <Badge variant="outline" className="text-bullish">24% probability</Badge>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Base Regime</span>
            </div>
            <Badge variant="outline">50% probability</Badge>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-bearish/5 border border-bearish/20">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-bearish" />
              <span className="text-sm font-medium">Bearish Scenario</span>
            </div>
            <Badge variant="outline" className="text-bearish">26% probability</Badge>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="flex-1">
          <Link to="/auth?mode=signup">
            Run Risk Analysis – Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link to="/demo">
            <Play className="h-4 w-4 mr-2" />
            See Full Demo
          </Link>
        </Button>
      </div>
    </div>
  );
}
