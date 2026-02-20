import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Sparkles,
  Loader2,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useMarketData } from '@/hooks/useMarketData';

interface InteractivePreviewProps {
  className?: string;
}

const ASSETS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'TSLA', name: 'Tesla, Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'AMZN', name: 'Amazon.com' },
  { symbol: 'SPY',  name: 'S&P 500 ETF' },
];

export function InteractivePreview({ className }: InteractivePreviewProps) {
  const navigate = useNavigate();
  const { fetchMarketData, isLoading: isPriceFetching } = useMarketData();

  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [amount, setAmount] = useState(1000);
  const [horizon, setHorizon] = useState<'1W' | '1M' | '3M'>('1W');
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [livePriceChange, setLivePriceChange] = useState<number | null>(null);

  useEffect(() => {
    setLivePrice(null);
    setLivePriceChange(null);
    fetchMarketData(selectedSymbol, 'US').then(data => {
      if (data) {
        setLivePrice(data.price);
        setLivePriceChange(data.changePercent ?? null);
      }
    });
  }, [selectedSymbol]);

  const handleRunAnalysis = () => {
    const params = new URLSearchParams({
      asset: selectedSymbol,
      market: 'US',
      direction,
      amount: String(amount),
      horizon,
    });
    navigate(`/workspace?${params.toString()}`);
  };

  const selectedAsset = ASSETS.find(a => a.symbol === selectedSymbol)!;
  const priceChangePositive = (livePriceChange ?? 0) >= 0;

  return (
    <div id="demo" className={cn('glass-card p-6 md:p-8 shadow-2xl border-primary/20', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Risk Analysis Launcher</p>
            <p className="text-sm text-muted-foreground">Real prices · 10,000 Monte Carlo paths</p>
          </div>
        </div>
        <Badge className="bg-bullish/10 text-bullish border-bullish/20">
          <Sparkles className="h-3 w-3 mr-1" />
          No signup
        </Badge>
      </div>

      {/* Asset Pills */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {ASSETS.map((asset) => (
          <button
            key={asset.symbol}
            onClick={() => setSelectedSymbol(asset.symbol)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium font-mono transition-all',
              selectedSymbol === asset.symbol
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted hover:bg-muted/80 text-foreground'
            )}
          >
            {asset.symbol}
          </button>
        ))}
      </div>

      {/* Live Price Display */}
      <div className="mb-5 rounded-lg border border-border bg-muted/30 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">{selectedAsset.name}</p>
          {isPriceFetching ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Fetching live price…</span>
            </div>
          ) : livePrice ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-foreground">
                ${livePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {livePriceChange !== null && (
                <span className={cn(
                  'text-sm font-mono flex items-center gap-0.5',
                  priceChangePositive ? 'text-bullish' : 'text-destructive'
                )}>
                  {priceChangePositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {priceChangePositive ? '+' : ''}{livePriceChange.toFixed(2)}%
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Price unavailable</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* Investment Amount Slider */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Investment Amount</span>
          <span className="text-sm font-mono font-medium">${amount.toLocaleString()}</span>
        </div>
        <Slider
          value={[amount]}
          onValueChange={([val]) => setAmount(val)}
          min={100}
          max={100000}
          step={100}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>$100</span>
          {livePrice && (
            <span className="text-foreground font-mono">
              ≈ {(amount / livePrice).toFixed(2)} shares
            </span>
          )}
          <span>$100k</span>
        </div>
      </div>

      {/* Direction & Horizon */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Direction */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Direction:</span>
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setDirection('long')}
              className={cn(
                'px-3 py-1 rounded text-sm font-medium transition-all flex items-center gap-1',
                direction === 'long' ? 'bg-bullish text-bullish-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <TrendingUp className="h-3 w-3" />Long
            </button>
            <button
              onClick={() => setDirection('short')}
              className={cn(
                'px-3 py-1 rounded text-sm font-medium transition-all flex items-center gap-1',
                direction === 'short' ? 'bg-destructive text-destructive-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <TrendingDown className="h-3 w-3" />Short
            </button>
          </div>
        </div>

        {/* Horizon */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Horizon:</span>
          <div className="flex bg-muted rounded-lg p-1">
            {(['1W', '1M', '3M'] as const).map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={cn(
                  'px-3 py-1 rounded text-sm font-medium transition-all font-mono',
                  horizon === h ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div className="flex items-center gap-2 mb-5 p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
        <Activity className="h-3.5 w-3.5 text-primary flex-shrink-0" />
        <span>
          You'll be taken to the <strong className="text-foreground">Risk Workspace</strong> with your parameters pre-filled.
          Run the full analysis — sign in only when you want to save results.
        </span>
      </div>

      {/* Big CTA */}
      <Button
        onClick={handleRunAnalysis}
        className="w-full py-6 text-base font-semibold gap-2"
        size="lg"
        disabled={isPriceFetching}
      >
        Run Full Risk Analysis →
        <ArrowRight className="h-4 w-4" />
      </Button>

      <p className="text-center text-xs text-muted-foreground mt-3">
        Free · No credit card · No signup required to try
      </p>
    </div>
  );
}
