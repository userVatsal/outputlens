import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { History, Loader2, BarChart3, FolderOpen } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { TradeInputForm } from '@/components/TradeInputForm';
import { UsageIndicator } from '@/components/UsageIndicator';
import { PaywallModal } from '@/components/PaywallModal';
import { ReturnDistributionChart } from '@/components/ReturnDistributionChart';
import { 
  RiskSnapshot, 
  TailRiskPanel, 
  ScenarioRegimeCards, 
  RiskInterpretation, 
  ActionPanel,
  AdvancedMetrics,
  PnLSummary
} from '@/components/workspace';
import { investmentToShares } from '@/lib/positionCalculations';
import { supabase } from '@/integrations/supabase/client';
import { useTrade } from '@/hooks/useTrade';
import { useUsage } from '@/hooks/useUsage';
import { useProfile } from '@/hooks/useProfile';
import { usePlan } from '@/hooks/usePlan';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MARKETS } from '@/types/trade';
import { cn } from '@/lib/utils';

type WorkspaceMode = 'single' | 'portfolio';

export default function Workspace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { analysis, submitTrade, clearAnalysis, isLoading: tradeLoading, isHistorical } = useTrade();
  const { usage, loading: usageLoading, canAnalyze, incrementUsage } = useUsage();
  const { profile, loading: profileLoading } = useProfile();
  const { canAccessPortfolio } = usePlan();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [mode, setMode] = useState<WorkspaceMode>('single');

  // SEO: Set page-specific document title
  useEffect(() => {
    document.title = 'Risk Workspace - AI-Powered Scenario Analysis | OutputLens';
  }, []);

  useEffect(() => {
    // Check auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session) {
          navigate('/auth');
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/auth');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmitTrade = async (input: Parameters<typeof submitTrade>[0]) => {
    if (!canAnalyze) {
      setShowPaywall(true);
      return;
    }

    // Increment usage before submitting
    await incrementUsage();
    await submitTrade(input);
  };

  const handleNewAnalysis = () => {
    clearAnalysis();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const currencySymbol = analysis ? MARKETS[analysis.input.market].currencySymbol : '$';
  
  // Calculate shares for position display
  const shares = analysis 
    ? (analysis.input.positionType === 'dollars' && analysis.input.positionSize
        ? investmentToShares(analysis.input.positionSize, analysis.input.entryPrice)
        : (analysis.input.positionSize || 1))
    : 1;
  return (
    <Layout>
      <div className="section-container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Risk Workspace</h1>
              <p className="text-muted-foreground">
                AI-powered scenario analysis with Monte Carlo simulation
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Mode Toggle */}
              <div className="flex items-center rounded-lg border border-border bg-muted/30 p-1">
                <button
                  onClick={() => setMode('single')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                    mode === 'single' 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <BarChart3 className="h-4 w-4" />
                  Single Asset
                </button>
                <button
                  onClick={() => {
                    if (!canAccessPortfolio) {
                      setShowPaywall(true);
                      return;
                    }
                    setMode('portfolio');
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                    mode === 'portfolio' 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <FolderOpen className="h-4 w-4" />
                  Portfolio
                  {!canAccessPortfolio && (
                    <span className="text-[8px] px-1 py-0.5 bg-primary text-primary-foreground rounded ml-1">
                      PRO
                    </span>
                  )}
                </button>
              </div>
              
              <Button variant="outline" size="sm" asChild>
                <Link to="/history">
                  <History className="h-4 w-4 mr-2" />
                  History
                </Link>
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Input Form */}
            <div className={cn(
              "lg:col-span-5",
              analysis && "lg:sticky lg:top-8 lg:self-start"
            )}>
              {/* Usage Indicator */}
              {!usageLoading && usage && (
                <div className="mb-6">
                  <UsageIndicator usage={usage} />
                </div>
              )}

              {/* Form Card */}
              <div className="glass-card p-6">
                <TradeInputForm onSubmit={handleSubmitTrade} isLoading={tradeLoading} />
              </div>

              {/* Disclaimer */}
              <p className="text-center text-xs text-muted-foreground mt-6 max-w-sm mx-auto">
                Analysis uses Monte Carlo simulation with 10,000 paths. 
                Probabilities are derived from historical volatility. Not financial advice.
              </p>
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-7">
              {tradeLoading && (
                <div className="glass-card p-12 text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-lg font-semibold text-foreground">Running 10,000 simulations...</p>
                  <p className="text-sm text-muted-foreground mt-2">Calculating risk metrics and scenario probabilities</p>
                </div>
              )}

              {!analysis && !tradeLoading && (
                <div className="glass-card p-12 text-center border-2 border-dashed border-border">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-semibold text-foreground">Enter a trade to analyze</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Get probabilistic scenarios, risk metrics, and AI-powered interpretation
                  </p>
                </div>
              )}

              {analysis && !tradeLoading && (
                <div className="space-y-6">
                  {/* Historical View Badge */}
                  {isHistorical && (
                    <div className="bg-muted/50 border border-border rounded-lg px-4 py-2 text-sm text-muted-foreground">
                      📜 Viewing historical analysis from {new Date(analysis.analyzedAt).toLocaleDateString()}
                    </div>
                  )}

                  {/* Risk Snapshot - Above the fold */}
                  <RiskSnapshot analysis={analysis} currencySymbol={currencySymbol} />

                  {/* P&L Summary - Position economics */}
                  <PnLSummary 
                    analysis={analysis} 
                    shares={shares} 
                    currencySymbol={currencySymbol} 
                  />

                  {/* Tail Risk Panel - First-class, emphasized */}
                  <TailRiskPanel 
                    scenarios={analysis.scenarios}
                    expectedShortfall={analysis.riskMetrics.expectedShortfall}
                    kurtosis={analysis.simulation.kurtosis}
                    currencySymbol={currencySymbol}
                    entryPrice={analysis.input.entryPrice}
                  />

                  {/* Scenario Regime Cards */}
                  <ScenarioRegimeCards 
                    scenarios={analysis.scenarios}
                    currencySymbol={currencySymbol}
                    entryPrice={analysis.input.entryPrice}
                    shares={shares}
                  />

                  {/* Distribution Chart */}
                  <ReturnDistributionChart 
                    riskMetrics={analysis.riskMetrics}
                    simulation={analysis.simulation}
                  />

                  {/* Advanced Metrics - Collapsed by default */}
                  <AdvancedMetrics 
                    metrics={analysis.riskMetrics}
                    kurtosis={analysis.simulation.kurtosis}
                    skewness={analysis.simulation.skewness}
                  />

                  {/* AI Risk Interpretation */}
                  <RiskInterpretation analysis={analysis} />

                  {/* Action Panel */}
                  <ActionPanel 
                    analysis={analysis}
                    onNewAnalysis={handleNewAnalysis}
                    isHistorical={isHistorical}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Paywall Modal */}
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </Layout>
  );
}
