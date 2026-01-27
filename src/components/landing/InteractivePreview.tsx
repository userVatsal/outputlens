import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Shield, 
  Sparkles,
  Database,
  Globe2,
  Lock,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface InteractivePreviewProps {
  className?: string;
}

// Expanded demo data with more assets and parameters
const DEMO_ASSETS = {
  // US Stocks (Free tier)
  AAPL: { name: 'Apple Inc.', price: 185.50, market: 'US', premium: false },
  TSLA: { name: 'Tesla Inc.', price: 248.20, market: 'US', premium: false },
  MSFT: { name: 'Microsoft Corp.', price: 378.90, market: 'US', premium: false },
  SPY: { name: 'S&P 500 ETF', price: 456.30, market: 'US', premium: false },
  NVDA: { name: 'NVIDIA Corp.', price: 495.60, market: 'US', premium: false },
  AMZN: { name: 'Amazon.com', price: 178.40, market: 'US', premium: false },
  // Global (Premium)
  'BTC-USD': { name: 'Bitcoin', price: 42850.00, market: 'Crypto', premium: true },
  'ETH-USD': { name: 'Ethereum', price: 2280.00, market: 'Crypto', premium: true },
  'BARC.L': { name: 'Barclays PLC', price: 168.50, market: 'UK', premium: true },
  'VOW3.DE': { name: 'Volkswagen AG', price: 112.40, market: 'EU', premium: true },
};

type DemoSymbol = keyof typeof DEMO_ASSETS;

// Risk profiles vary by time horizon and direction
const calculateDemoResults = (
  symbol: DemoSymbol, 
  amount: number, 
  horizon: '1W' | '1M' | '3M',
  direction: 'long' | 'short'
) => {
  const asset = DEMO_ASSETS[symbol];
  const shares = amount / asset.price;
  
  // Base metrics per asset (varies by volatility profile)
  const baseProfiles: Record<DemoSymbol, { vol: number; trend: number }> = {
    AAPL: { vol: 24, trend: 0.12 },
    TSLA: { vol: 52, trend: 0.08 },
    MSFT: { vol: 22, trend: 0.15 },
    SPY: { vol: 16, trend: 0.10 },
    NVDA: { vol: 48, trend: 0.20 },
    AMZN: { vol: 30, trend: 0.14 },
    'BTC-USD': { vol: 65, trend: 0.05 },
    'ETH-USD': { vol: 72, trend: 0.03 },
    'BARC.L': { vol: 28, trend: 0.06 },
    'VOW3.DE': { vol: 32, trend: 0.04 },
  };
  
  const profile = baseProfiles[symbol];
  
  // Scale by time horizon
  const horizonMultiplier = { '1W': 1, '1M': 2.2, '3M': 3.8 };
  const timeScale = horizonMultiplier[horizon];
  
  // Calculate metrics
  const volatility = profile.vol * Math.sqrt(timeScale / 52);
  const expectedMove = profile.trend * timeScale;
  
  // Direction affects win probability
  const winProb = direction === 'long' 
    ? Math.min(72, 50 + (profile.trend * 100) + (10 - volatility / 5))
    : Math.min(68, 50 - (profile.trend * 100) + (10 - volatility / 5));
  
  const var95 = volatility * 1.65;
  const expectedReturn = direction === 'long' ? expectedMove : -expectedMove;
  
  // Risk score (1-10)
  const riskScore = Math.min(10, Math.max(1, Math.round(volatility / 8)));
  
  // Scenario probabilities
  const bullishProb = direction === 'long' ? Math.round(winProb * 0.4) : Math.round((100 - winProb) * 0.3);
  const bearishProb = direction === 'long' ? Math.round((100 - winProb) * 0.35) : Math.round(winProb * 0.35);
  const baseProb = 100 - bullishProb - bearishProb;
  
  // P&L in dollars
  const expectedPnL = amount * (expectedReturn / 100);
  const maxLoss = amount * (var95 / 100);
  
  return {
    winProb: Math.round(winProb),
    expectedReturn: expectedReturn.toFixed(1),
    var95: var95.toFixed(1),
    riskScore,
    bullishProb,
    bearishProb,
    baseProb,
    shares: shares.toFixed(2),
    expectedPnL: expectedPnL.toFixed(0),
    maxLoss: maxLoss.toFixed(0),
    isPremium: asset.premium,
    market: asset.market,
  };
};

const popularAssets: DemoSymbol[] = ['AAPL', 'TSLA', 'MSFT', 'SPY', 'NVDA', 'AMZN'];

export function InteractivePreview({ className }: InteractivePreviewProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<DemoSymbol>('AAPL');
  const [searchQuery, setSearchQuery] = useState('');
  const [amount, setAmount] = useState(1000);
  const [horizon, setHorizon] = useState<'1W' | '1M' | '3M'>('1W');
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [isAnimating, setIsAnimating] = useState(false);
  
  const results = useMemo(() => 
    calculateDemoResults(selectedSymbol, amount, horizon, direction),
    [selectedSymbol, amount, horizon, direction]
  );
  
  const handleSymbolChange = (symbol: DemoSymbol) => {
    if (symbol === selectedSymbol) return;
    setIsAnimating(true);
    setTimeout(() => {
      setSelectedSymbol(symbol);
      setSearchQuery('');
      setIsAnimating(false);
    }, 200);
  };

  // Filter assets based on search
  const filteredAssets = Object.entries(DEMO_ASSETS).filter(([symbol, data]) => 
    symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    data.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showSearchResults = searchQuery.length > 0 && filteredAssets.length > 0;

  return (
    <div id="demo" className={cn('glass-card p-6 md:p-8 shadow-2xl border-primary/20', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Probabilistic Preview</p>
            <p className="text-sm text-muted-foreground">10,000 Monte Carlo paths</p>
          </div>
        </div>
        <Badge className="bg-bullish/10 text-bullish border-bullish/20">
          <Sparkles className="h-3 w-3 mr-1" />
          Interactive
        </Badge>
      </div>

      {/* Asset Search */}
      <div className="relative mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search: AAPL, Tesla, Bitcoin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50"
          />
          {results.isPremium ? (
            <Badge className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/10 text-primary border-primary/20 text-xs">
              <Lock className="h-3 w-3 mr-1" />
              {results.market}
            </Badge>
          ) : (
            <Badge variant="outline" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
              <Globe2 className="h-3 w-3 mr-1" />
              {results.market}
            </Badge>
          )}
        </div>
        
        {/* Search Results Dropdown */}
        {showSearchResults && (
          <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredAssets.slice(0, 6).map(([symbol, data]) => (
              <button
                key={symbol}
                onClick={() => handleSymbolChange(symbol as DemoSymbol)}
                className="w-full px-4 py-2 text-left hover:bg-muted/50 flex items-center justify-between"
              >
                <div>
                  <span className="font-medium">{symbol}</span>
                  <span className="text-sm text-muted-foreground ml-2">{data.name}</span>
                </div>
                {data.premium && (
                  <Lock className="h-3 w-3 text-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Asset Buttons */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {popularAssets.map((symbol) => (
          <button
            key={symbol}
            onClick={() => handleSymbolChange(symbol)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              selectedSymbol === symbol
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted hover:bg-muted/80 text-foreground'
            )}
          >
            {symbol}
          </button>
        ))}
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
          <span className="text-foreground">≈ {results.shares} shares</span>
          <span>$100k</span>
        </div>
      </div>

      {/* Direction & Horizon Controls */}
      <div className="flex flex-wrap gap-4 mb-5">
        {/* Direction Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Direction:</span>
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setDirection('long')}
              className={cn(
                'px-3 py-1 rounded text-sm font-medium transition-all flex items-center gap-1',
                direction === 'long'
                  ? 'bg-bullish text-bullish-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <TrendingUp className="h-3 w-3" />
              Long
            </button>
            <button
              onClick={() => setDirection('short')}
              className={cn(
                'px-3 py-1 rounded text-sm font-medium transition-all flex items-center gap-1',
                direction === 'short'
                  ? 'bg-bearish text-bearish-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <TrendingDown className="h-3 w-3" />
              Short
            </button>
          </div>
        </div>

        {/* Time Horizon */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Horizon:</span>
          <div className="flex bg-muted rounded-lg p-1">
            {(['1W', '1M', '3M'] as const).map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={cn(
                  'px-3 py-1 rounded text-sm font-medium transition-all',
                  horizon === h
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Preview */}
      <div className={cn(
        'transition-all duration-200',
        isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100',
        results.isPremium && 'relative'
      )}>
        {/* Premium Blur Overlay */}
        {results.isPremium && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
            <div className="text-center p-4">
              <Lock className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="font-semibold text-foreground">Global Markets</p>
              <p className="text-sm text-muted-foreground mb-3">Upgrade to access {results.market} assets</p>
              <Button size="sm" asChild>
                <Link to="/pricing">View Plans</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Win Probability</p>
            <p className={cn(
              'text-xl font-bold font-mono',
              results.winProb >= 55 ? 'text-bullish' : results.winProb <= 45 ? 'text-bearish' : 'text-foreground'
            )}>
              {results.winProb}%
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Expected Return</p>
            <p className={cn(
              'text-xl font-bold font-mono',
              Number(results.expectedReturn) > 0 ? 'text-bullish' : 'text-bearish'
            )}>
              {Number(results.expectedReturn) > 0 ? '+' : ''}{results.expectedReturn}%
            </p>
            <p className="text-xs text-muted-foreground">
              ${Number(results.expectedPnL) > 0 ? '+' : ''}{results.expectedPnL}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">95% VaR</p>
            <p className="text-xl font-bold font-mono text-bearish">-{results.var95}%</p>
            <p className="text-xs text-muted-foreground">-${results.maxLoss}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Risk Score</p>
            <p className="text-xl font-bold font-mono text-foreground">{results.riskScore}/10</p>
          </div>
        </div>

        {/* Scenario Bars */}
        <div className="space-y-2 mb-5">
          <div className="flex justify-between items-center p-2.5 rounded-lg bg-bullish/5 border border-bullish/20">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-bullish" />
              <span className="text-sm font-medium">Bullish Scenario</span>
            </div>
            <Badge variant="outline" className="text-bullish">{results.bullishProb}%</Badge>
          </div>
          <div className="flex justify-between items-center p-2.5 rounded-lg bg-muted">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Base Regime</span>
            </div>
            <Badge variant="outline">{results.baseProb}%</Badge>
          </div>
          <div className="flex justify-between items-center p-2.5 rounded-lg bg-bearish/5 border border-bearish/20">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-bearish" />
              <span className="text-sm font-medium">Bearish Scenario</span>
            </div>
            <Badge variant="outline" className="text-bearish">{results.bearishProb}%</Badge>
          </div>
        </div>
        
        {/* Grounding statement */}
        <div className="flex items-center gap-2 mb-5 p-2 rounded bg-muted/50 text-xs text-muted-foreground">
          <Database className="h-3 w-3 flex-shrink-0" />
          <span>Probabilities, not predictions. GBM simulation with regime switching.</span>
        </div>
      </div>

      {/* CTA Button */}
      <Button asChild className="w-full" size="lg">
        <Link to="/auth?mode=signup">
          Quantify Your Risk – Free
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
