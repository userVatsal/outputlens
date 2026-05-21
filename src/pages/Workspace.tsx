import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { History, Loader2, BarChart3, FolderOpen, Activity, Zap, Sparkles } from 'lucide-react';
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
  PnLSummary,
  MonteCarloFanChart,
  ScenarioProbabilityDonut
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

// Loading animation — clean, minimal pipeline
function SimulationLoader({ asset }: { asset?: string }) {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const allLines = [
    `Fetching ${asset || 'asset'} live price data`,
    `Building volatility surface`,
    `Detecting market regime via HMM`,
    `Running 10,000 Monte Carlo paths`,
    `Calculating VaR and CVaR at 95%`,
    `Scoring tail risk scenarios`,
    `Preparing risk interpretation`,
    `Analysis complete`,
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
    }, 360);
    return () => clearInterval(interval);
  }, [asset]);

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-surface">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Risk engine running
          </span>
        </div>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{progress}%</span>
      </div>

      <div className="p-5 font-mono text-sm space-y-2 min-h-[240px]">
        {lines.map((line, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center gap-2 transition-all duration-300',
              i === allLines.length - 1 ? 'text-bullish' : 'text-foreground/80'
            )}
          >
            <span className={cn(
              'h-1.5 w-1.5 rounded-full',
              i === allLines.length - 1 ? 'bg-bullish' : 'bg-primary/60'
            )} />
            {line}
          </div>
        ))}
        {lines.length < allLines.length && (
          <div className="flex items-center gap-2 text-muted-foreground/60">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-pulse" />
            <span className="italic">working…</span>
          </div>
        )}
      </div>

      <div className="h-1 bg-elevated">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function Workspace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { analysis, submitTrade, clearAnalysis, isLoading: tradeLoading, isHistorical } = useTrade();
  const { usage, loading: usageLoading, canAnalyze, incrementUsage } = useUsage();
  useProfile();
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
      <div className="section-container py-6 lg:py-10">
        <div className="mx-auto w-full max-w-6xl space-y-6">

          {/* Page header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                  Risk Workspace
                </h1>
                <p className="text-sm text-muted-foreground">
                  Probabilistic analysis — Monte Carlo with live volatility.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full border border-bullish/20 bg-bullish/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-bullish sm:inline-flex">
                <Zap className="h-3 w-3" /> Live engine
              </span>

              {/* Mode toggle */}
              <div className="flex items-center rounded-md border border-border bg-elevated p-0.5">
                <button
                  type="button"
                  onClick={() => setMode('single')}
                  className={cn(
                    'flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium font-mono transition-all',
                    mode === 'single' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!canAccessPortfolio) { setShowPaywall(true); return; }
                    setMode('portfolio');
                    navigate('/portfolio');
                  }}
                  className={cn(
                    'flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium font-mono transition-all',
                    mode === 'portfolio' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  Portfolio
                  {!canAccessPortfolio && (
                    <span className="rounded bg-primary/15 px-1 py-0.5 text-[8px] font-bold text-primary">PRO</span>
                  )}
                </button>
              </div>

              <Button variant="outline" size="sm" asChild>
                <Link to="/history">
                  <History className="mr-2 h-4 w-4" />
                  History
                </Link>
              </Button>
            </div>
          </div>

          {!usageLoading && usage && <UsageIndicator usage={usage} />}

          {/* Main layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: Input panel */}
            <div className={cn('lg:col-span-5', analysis && 'lg:sticky lg:top-6 lg:self-start')}>
              <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <div>
                    <h2 className="font-display text-sm font-semibold text-foreground">
                      Position parameters
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      Market, asset, direction, entry &amp; horizon.
                    </p>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Step 01
                  </span>
                </div>
                <div className="p-5">
                  {!user && (
                    <div className="mb-4 flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                      <span>
                        Fill in your position and click{' '}
                        <strong className="text-foreground">Analyze Risk</strong> — you'll be
                        asked to sign in to run the full analysis.
                      </span>
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

            {/* Right: Results / Loader / Empty state */}
            <div className="lg:col-span-7">
              {tradeLoading && <SimulationLoader asset={currentAsset} />}

              {!analysis && !tradeLoading && (
                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/40 p-8 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Activity className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-foreground">
                    Awaiting position
                  </h3>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Enter a market, asset and direction on the left to run a 10,000-path
                    Monte Carlo simulation calibrated to live volatility.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                    <span className="rounded-full border border-border bg-elevated px-2.5 py-1">VaR 95%</span>
                    <span className="rounded-full border border-border bg-elevated px-2.5 py-1">Tail risk</span>
                    <span className="rounded-full border border-border bg-elevated px-2.5 py-1">Regime aware</span>
                  </div>
                </div>
              )}

              {analysis && !tradeLoading && (
                <div className="space-y-4">
                  {isHistorical && (
                    <div className="rounded-md border border-border bg-elevated px-4 py-2 text-xs text-muted-foreground font-mono">
                      Viewing historical analysis from{' '}
                      {new Date(analysis.analyzedAt).toLocaleDateString()}
                    </div>
                  )}
                  <RiskSnapshot analysis={analysis} currencySymbol={currencySymbol} />
                  <MonteCarloFanChart analysis={analysis} currencySymbol={currencySymbol} />
                  <PnLSummary analysis={analysis} shares={shares} currencySymbol={currencySymbol} />
                  <ScenarioProbabilityDonut analysis={analysis} />
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
