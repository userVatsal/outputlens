import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Play,
  Eye,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ChevronRight,
  Search
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  RiskSnapshot, 
  PnLSummary, 
  TailRiskPanel, 
  ScenarioRegimeCards, 
  AdvancedMetrics, 
  RiskInterpretation 
} from '@/components/workspace';
import { ReturnDistributionChart } from '@/components/ReturnDistributionChart';
import { DEMO_ANALYSIS } from '@/lib/demoData';
import { POPULAR_ASSETS } from '@/lib/popularAssets';
import { investmentToShares } from '@/lib/positionCalculations';
import { MARKETS } from '@/types/trade';

export default function Demo() {
  const analysis = DEMO_ANALYSIS;
  const navigate = useNavigate();
  const [showingResults, setShowingResults] = useState(false);
  const [tryYourOwnQuery, setTryYourOwnQuery] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState<'fetching' | 'simulating' | 'generating'>('fetching');
  const [simulationCount, setSimulationCount] = useState(0);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [signupPromptDismissed, setSignupPromptDismissed] = useState(false);
  const popularAssets = POPULAR_ASSETS.US;

  // Calculate derived values for Workspace components
  const currencySymbol = MARKETS[analysis.input.market].currencySymbol;
  const shares = analysis.input.positionType === 'shares' 
    ? analysis.input.positionSize 
    : investmentToShares(analysis.input.positionSize, analysis.input.entryPrice);

  // SEO: Set page-specific document title
  useEffect(() => {
    document.title = 'Live Demo - 10,000 Monte Carlo Simulations | OutputLens';
  }, []);
  
  // Show soft signup prompt after viewing results for a bit
  useEffect(() => {
    if (showingResults && !signupPromptDismissed) {
      const timer = setTimeout(() => {
        setShowSignupPrompt(true);
      }, 5000); // Show after 5 seconds of viewing results
      return () => clearTimeout(timer);
    }
  }, [showingResults, signupPromptDismissed]);
  
  // Simulate analysis loading with phases for engagement
  useEffect(() => {
    // Phase 1: Fetching market data (0-30%)
    const phase1 = setTimeout(() => {
      setLoadingPhase('fetching');
    }, 0);
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 30);
    
    // Simulation counter animation
    const simInterval = setInterval(() => {
      setSimulationCount(prev => {
        if (prev >= 10000) return 10000;
        return prev + Math.floor(Math.random() * 400) + 200;
      });
    }, 100);
    
    // Phase 2: Running Monte Carlo (30%)
    const phase2 = setTimeout(() => {
      setLoadingPhase('simulating');
    }, 600);
    
    // Phase 3: Generating insights (70%)
    const phase3 = setTimeout(() => {
      setLoadingPhase('generating');
    }, 1200);
    
    // Show results
    const showTimer = setTimeout(() => {
      setShowingResults(true);
      clearInterval(progressInterval);
      clearInterval(simInterval);
    }, 1800);
    
    return () => {
      clearTimeout(phase1);
      clearTimeout(phase2);
      clearTimeout(phase3);
      clearTimeout(showTimer);
      clearInterval(progressInterval);
      clearInterval(simInterval);
    };
  }, []);

  // Handle "try your own" search
  const handleTryYourOwn = () => {
    if (tryYourOwnQuery.trim()) {
      navigate(`/auth?mode=signup&asset=${encodeURIComponent(tryYourOwnQuery.trim())}`);
    } else {
      navigate('/auth?mode=signup');
    }
  };

  // Handle popular asset click in "try your own"
  const handlePopularClick = (symbol: string) => {
    navigate(`/auth?mode=signup&asset=${encodeURIComponent(symbol)}`);
  };

  return (
    <Layout>
      {/* Demo Header with tier visibility */}
      <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 border-b border-border">
        <div className="section-container py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground font-brand">
                    Live Demo
                  </h1>
                  <Badge className="bg-primary/20 text-primary">
                    <Play className="h-3 w-3 mr-1" />
                    10,000 Paths
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  This demo shows a full three-layer analysis. Layer 1: 10,000 GBM paths. Layer 2: Regime detection. Layer 3: AI explains, never predicts.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                Free: 5,000 paths | Paid: 10,000 paths
              </Badge>
              <Button size="lg" asChild className="shadow-lg">
                <Link to="/auth?mode=signup">
                  Analyze Your Trades (5 Free/Mo)
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container py-8">
        {/* Trade Summary Bar */}
        <Card className="mb-6 border-primary/20">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-sm text-muted-foreground">Asset</span>
                  <p className="font-bold text-lg">{analysis.input.asset}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Direction</span>
                  <p className="font-bold text-lg flex items-center gap-1">
                    {analysis.input.direction === 'long' ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-bullish" />
                        Long
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-bearish" />
                        Short
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Entry Price</span>
                  <p className="font-bold text-lg font-mono">{currencySymbol}{analysis.input.entryPrice}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Horizon</span>
                  <p className="font-bold text-lg">{analysis.input.timeHorizon}</p>
                </div>
              </div>
              
              <Badge variant="outline" className="bg-bullish/10 text-bullish border-bullish/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Live Market Data
              </Badge>
            </div>
          </CardContent>
        </Card>

        {showingResults ? (
          <div className="space-y-6">
            {/* Risk Snapshot - Above the fold key metrics */}
            <RiskSnapshot 
              analysis={analysis} 
              currencySymbol={currencySymbol}
            />

            {/* P&L Summary - Position economics */}
            <PnLSummary 
              analysis={analysis}
              shares={shares}
              currencySymbol={currencySymbol}
            />

            {/* Tail Risk Panel - Extreme scenarios */}
            <TailRiskPanel 
              scenarios={analysis.scenarios}
              expectedShortfall={analysis.riskMetrics.expectedShortfall}
              kurtosis={analysis.simulation.kurtosis}
              currencySymbol={currencySymbol}
              entryPrice={analysis.input.entryPrice}
            />

            {/* Scenario Regime Cards - Base/Bullish/Bearish */}
            <ScenarioRegimeCards 
              scenarios={analysis.scenarios}
              currencySymbol={currencySymbol}
              entryPrice={analysis.input.entryPrice}
              shares={shares}
            />

            {/* Return Distribution Chart */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">Return Distribution</h3>
              <ReturnDistributionChart 
                riskMetrics={analysis.riskMetrics}
                simulation={analysis.simulation}
              />
            </div>

            {/* Advanced Metrics - Collapsed by default */}
            <AdvancedMetrics 
              metrics={analysis.riskMetrics}
              kurtosis={analysis.simulation.kurtosis}
              skewness={analysis.simulation.skewness}
            />

            {/* Risk Interpretation - AI explanation */}
            <RiskInterpretation 
              analysis={analysis}
            />

            {/* Try Your Own Section */}
            <section className="py-6">
              <Card className="border-dashed border-2 border-border hover:border-primary/30 transition-colors">
                <CardContent className="py-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Ready to try your own assets?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Sign up free to analyze your own assets (5/month)
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                      <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Search for Apple, Tesla, Bitcoin..."
                          value={tryYourOwnQuery}
                          onChange={(e) => setTryYourOwnQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleTryYourOwn()}
                          className="pl-10"
                        />
                      </div>
                      <Button onClick={handleTryYourOwn} className="shrink-0">
                        Analyze Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="text-xs text-muted-foreground">Popular:</span>
                      {popularAssets.slice(0, 4).map((asset) => (
                        <button
                          key={asset.symbol}
                          onClick={() => handlePopularClick(asset.symbol)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border border-border/50 bg-muted/30 hover:bg-accent transition-colors"
                        >
                          <span>{asset.icon}</span>
                          <span>{asset.name}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ✓ 5 free analyses/month • ✓ Track assets • ✓ Get alerts • ✓ Build history
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* CTA Section */}
            <section className="py-8">
              <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/30">
                <CardContent className="py-8 text-center">
                  <h3 className="text-2xl font-bold mb-2 font-brand">
                    This is what you get for every trade.
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                    10,000 Monte Carlo simulations, institutional-grade risk metrics, 
                    and AI explanations—all in under 2 seconds.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" asChild className="px-8">
                      <Link to="/auth?mode=signup">
                        Analyze Your First Trade Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/pricing">
                        See Pricing
                        <ChevronRight className="ml-1 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    ✓ 5 free analyses/month • ✓ No credit card required
                  </p>
                </CardContent>
              </Card>
            </section>
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-6 max-w-md">
              {/* Animated icon */}
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto relative">
                <BarChart3 className="h-10 w-10 text-primary animate-pulse" />
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
              </div>
              
              {/* Phase indicator - three-layer architecture */}
              <div className="space-y-2">
                <p className="text-foreground font-medium">
                  {loadingPhase === 'fetching' && 'Layer 1: Fetching live market data...'}
                  {loadingPhase === 'simulating' && 'Layer 1: Running GBM stochastic simulation...'}
                  {loadingPhase === 'generating' && 'Layer 2: Detecting regime • Querying neural database...'}
                </p>
                <p className="text-sm text-muted-foreground font-mono">
                  {loadingPhase === 'simulating' 
                    ? `Scenario ${Math.min(simulationCount, 10000).toLocaleString()} of 10,000`
                    : loadingPhase === 'generating'
                    ? 'Layer 3: Preparing AI interpretation (explains, never predicts)...'
                    : 'Connecting to data providers...'}
                </p>
              </div>
              
              {/* Progress bar */}
              <div className="w-64 mx-auto">
                <Progress value={loadingProgress} className="h-2" />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Market Data</span>
                  <span>Simulation</span>
                  <span>AI Analysis</span>
                </div>
              </div>
              
              {/* Trust indicator */}
              <p className="text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 inline mr-1" />
                Powered by institutional-grade analytics
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Soft Signup Prompt - appears after viewing results */}
      {showSignupPrompt && !signupPromptDismissed && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <Card className="bg-card/95 backdrop-blur-md border-primary/30 shadow-xl">
            <CardContent className="py-4 px-6">
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">
                    Like what you see?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sign up to analyze your own trades
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" asChild>
                    <Link to="/auth?mode=signup">
                      Sign Up Free
                    </Link>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setSignupPromptDismissed(true)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
}
