import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { History, Loader2, BarChart3, FolderOpen, Terminal } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
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
import { useRef } from 'react';

type WorkspaceMode = 'single' | 'portfolio';

// Terminal loading animation component
function TerminalLoader({ asset }: { asset?: string }) {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const allLines = [
    `> Fetching ${asset || 'asset'} live price data...`,
    `> Building volatility surface...`,
    `> Detecting market regime via HMM...`,
    `> Running 10,000 Monte Carlo paths...`,
    `> Calculating VaR and CVaR at 95% confidence...`,
    `> Scoring tail risk scenarios...`,
    `> Preparing AI interpretation...`,
    `✓ Analysis complete.`,
  ];

  useEffect(() => {
    setLines([]);
    setProgress(0);
    let i = 0;
    const interval = setInterval(() => {
      if (i < allLines.length) {
        setLines(prev => [...prev, allLines[i]]);
        setProgress(Math.round(((i + 1) / allLines.length) * 100));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 380);
    return () => clearInterval(interval);
  }, [asset]);

  return (
    <div className="rounded-lg overflow-hidden border border-border" style={{ backgroundColor: 'hsl(var(--brand-navy))' }}>
      {/* Terminal chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <span className="w-3 h-3 rounded-full bg-red-400/70" />
        <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
        <span className="w-3 h-3 rounded-full bg-green-400/70" />
        <span className="ml-3 text-white/40 text-xs font-mono">outputlens-risk-engine</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-mono text-white/40">RUNNING</span>
        </div>
      </div>

      {/* Terminal output */}
      <div className="p-5 font-mono text-sm space-y-1.5 min-h-[220px]">
        {lines.map((line, i) => (
          <div
            key={i}
            className={cn(
              'transition-all duration-300',
              line.startsWith('✓') ? 'text-green-400' : 'text-white/70'
            )}
          >
            {line}
          </div>
        ))}
        {lines.length < allLines.length && (
          <span className="inline-block w-2 h-4 bg-white/70 animate-pulse ml-0.5" />
        )}
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Progress</span>
          <span className="text-[10px] font-mono text-white/50">{progress}%</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

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
  const [currentAsset, setCurrentAsset] = useState<string>('');

  // Pre-fill params from URL (for landing page "Run Analysis" flow)
  const urlAsset = searchParams.get('asset') ?? undefined;
  const urlMarket = searchParams.get('market') ?? undefined;
  const urlDirection = searchParams.get('direction') ?? undefined;
  const urlAmount = searchParams.get('amount') ?? undefined;
  const urlHorizon = searchParams.get('horizon') ?? undefined;

  useEffect(() => {
    document.title = 'Risk Workspace - Probabilistic Analysis | OutputLens';
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmitTrade = async (input: Parameters<typeof submitTrade>[0]) => {
    // Gate on auth — redirect to login if not signed in
    if (!user) {
      navigate('/auth?redirect=/workspace');
      return;
    }
    if (!canAnalyze) { setShowPaywall(true); return; }
    setCurrentAsset(input.asset || '');
    await incrementUsage();
    await submitTrade(input);
  };

  const handleNewAnalysis = () => clearAnalysis();

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  const currencySymbol = analysis ? MARKETS[analysis.input.market].currencySymbol : '$';
  const shares = analysis
    ? (analysis.input.positionType === 'dollars' && analysis.input.positionSize
      ? investmentToShares(analysis.input.positionSize, analysis.input.entryPrice)
      : (analysis.input.positionSize || 1))
    : 1;

  return (
    <AppShell>
      <div className="section-container py-6">
        <div className="max-w-6xl mx-auto">

          {/* Page header bar */}
          <div
            className="flex items-center justify-between px-5 py-3 rounded-lg mb-6 border border-white/10"
            style={{ backgroundColor: 'hsl(var(--brand-navy))' }}
          >
            <div className="flex items-center gap-3">
              <Terminal className="h-4 w-4 text-white/60" />
              <span className="font-mono text-sm font-bold text-white tracking-wider uppercase">Risk Workspace</span>
              <div className="flex items-center gap-1.5 ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Live</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Mode toggle */}
              <div className="flex items-center rounded border border-white/10 bg-white/5 p-0.5">
                <button
                  onClick={() => setMode('single')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all font-mono',
                    mode === 'single' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
                  )}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Single
                </button>
                <button
                  onClick={() => {
                    if (!canAccessPortfolio) { setShowPaywall(true); return; }
                    setMode('portfolio');
                  }}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all font-mono',
                    mode === 'portfolio' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
                  )}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  Portfolio
                  {!canAccessPortfolio && (
                    <span className="text-[8px] px-1 py-0.5 bg-primary text-primary-foreground rounded font-bold">PRO</span>
                  )}
                </button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-white/60 hover:text-white hover:bg-white/10 h-7 text-xs"
              >
                <Link to="/history">
                  <History className="h-3.5 w-3.5 mr-1.5" />
                  History
                </Link>
              </Button>
            </div>
          </div>

          {/* Main layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Input panel */}
            <div className={cn('lg:col-span-5', analysis && 'lg:sticky lg:top-6 lg:self-start')}>
              {/* Usage bar */}
              {!usageLoading && usage && (
                <div className="mb-4">
                  <UsageIndicator usage={usage} />
                </div>
              )}

              {/* Input form */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div
                  className="px-4 py-2.5 border-b border-white/10"
                  style={{ backgroundColor: 'hsl(var(--brand-navy))' }}
                >
                  <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">
                    Position Parameters
                  </span>
                </div>
                <div className="p-5 bg-card">
                  {!user && (
                    <div className="mb-4 flex items-center gap-2 rounded border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
                      <span>👋</span>
                      <span>Fill in your position below and click <strong className="text-foreground">Analyze Risk</strong> — you'll be asked to sign in to run the full analysis.</span>
                    </div>
                  )}
                  <TradeInputForm
                    onSubmit={handleSubmitTrade}
                    isLoading={tradeLoading}
                    initialAsset={urlAsset}
                    initialMarket={urlMarket as 'US' | 'UK' | 'EU' | undefined}
                    initialDirection={urlDirection as 'long' | 'short' | undefined}
                    initialAmount={urlAmount ? Number(urlAmount) : undefined}
                  />
                </div>
              </div>
            </div>

            {/* Right: Results */}
            <div className="lg:col-span-7">
              {/* Loading state */}
              {tradeLoading && <TerminalLoader asset={currentAsset} />}

              {/* Empty state */}
              {!analysis && !tradeLoading && (
                <div
                  className="rounded-lg overflow-hidden border border-border min-h-[300px] flex flex-col"
                  style={{ backgroundColor: 'hsl(var(--brand-navy))' }}
                >
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                    <span className="w-3 h-3 rounded-full bg-white/20" />
                    <span className="w-3 h-3 rounded-full bg-white/20" />
                    <span className="w-3 h-3 rounded-full bg-white/20" />
                    <span className="ml-3 text-white/40 text-xs font-mono">outputlens-risk-engine</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center px-8 py-12">
                    <div className="font-mono text-white/40 text-sm space-y-1">
                      <div>&gt; Waiting for input...</div>
                      <div className="flex items-center gap-0.5">
                        <span>&gt; </span>
                        <span className="inline-block w-2 h-4 bg-white/40 animate-pulse ml-0.5" />
                      </div>
                    </div>
                    <p className="text-white/20 text-xs font-mono mt-6">
                      Enter position parameters on the left to run probabilistic risk analysis.
                    </p>
                  </div>
                </div>
              )}

              {/* Results */}
              {analysis && !tradeLoading && (
                <div className="space-y-4">
                  {isHistorical && (
                    <div className="bg-muted/50 border border-border rounded px-4 py-2 text-xs text-muted-foreground font-mono">
                      📜 Viewing historical analysis from {new Date(analysis.analyzedAt).toLocaleDateString()}
                    </div>
                  )}
                  <RiskSnapshot analysis={analysis} currencySymbol={currencySymbol} />
                  <PnLSummary analysis={analysis} shares={shares} currencySymbol={currencySymbol} />
                  <TailRiskPanel
                    scenarios={analysis.scenarios}
                    expectedShortfall={analysis.riskMetrics.expectedShortfall}
                    kurtosis={analysis.simulation.kurtosis}
                    currencySymbol={currencySymbol}
                    entryPrice={analysis.input.entryPrice}
                  />
                  <ScenarioRegimeCards
                    scenarios={analysis.scenarios}
                    currencySymbol={currencySymbol}
                    entryPrice={analysis.input.entryPrice}
                    shares={shares}
                  />
                  <ReturnDistributionChart riskMetrics={analysis.riskMetrics} simulation={analysis.simulation} />
                  <AdvancedMetrics
                    metrics={analysis.riskMetrics}
                    kurtosis={analysis.simulation.kurtosis}
                    skewness={analysis.simulation.skewness}
                  />
                  <RiskInterpretation analysis={analysis} />
                  <ActionPanel analysis={analysis} onNewAnalysis={handleNewAnalysis} isHistorical={isHistorical} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </AppShell>
  );
}
