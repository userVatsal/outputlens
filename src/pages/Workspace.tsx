import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, BarChart3, FolderOpen } from 'lucide-react';
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
    <div className="rounded-2xl overflow-hidden border border-border/50 bg-surface relative animate-result-reveal">
      {/* Scan-line sweep effect */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          height: '60px',
          background: 'linear-gradient(180deg, transparent 0%, hsl(189 100% 50% / 0.06) 50%, transparent 100%)',
          animation: 'scan-line 2.4s cubic-bezier(0.4,0,0.2,1) infinite',
        }}
      />
      <div className="flex items-center justify-between bg-elevated px-5 py-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <span className="dot-live" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Risk engine running
          </span>
        </div>
        <span className="font-mono text-[11px] tabular-nums text-primary">{progress}%</span>
      </div>

      <div className="p-5 font-mono text-[13px] space-y-2.5 min-h-[220px]">
        {lines.map((line, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center gap-2 animate-fade-up',
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
            <span className="animate-terminal-cursor font-mono text-primary">▊</span>
          </div>
        )}
      </div>

      <div className="h-0.5 bg-elevated">
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

  const hasResults = !!analysis || tradeLoading;

  return (
    <AppShell>
      <div className="section-container py-6 lg:py-8">
        <div className="mx-auto w-full max-w-[1440px] space-y-5">

          {/* Slim breadcrumb header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[15px]">
              <span className="text-foreground font-semibold">Risk Workspace</span>
              {analysis && (
                <>
                  <span className="text-muted-foreground/40">/</span>
                  <span className="font-mono text-primary">{analysis.input.asset}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('single')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border border-border h-8 px-3 text-[12px] font-medium transition-all',
                  mode === 'single' ? 'bg-elevated text-foreground' : 'text-muted-foreground hover:text-foreground'
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
                  'inline-flex items-center gap-1.5 rounded-lg border border-border h-8 px-3 text-[12px] font-medium transition-all',
                  mode === 'portfolio' ? 'bg-elevated text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <FolderOpen className="h-3.5 w-3.5" />
                Portfolio
                {!canAccessPortfolio && (
                  <span className="ml-1 rounded bg-primary/15 px-1 py-0.5 text-[8px] font-bold text-primary leading-none">PRO</span>
                )}
              </button>
            </div>
          </div>

          {!usageLoading && usage && <UsageIndicator usage={usage} />}

          {/* Main layout — centered when no results, split when results exist */}
          {!hasResults ? (
            <div className="mx-auto w-full max-w-[640px]">
              <TradeInputForm
                onSubmit={handleSubmitTrade}
                isLoading={tradeLoading}
                initialAsset={urlAsset}
                initialMarket={urlMarket as 'US' | 'UK' | 'EU' | undefined}
                initialDirection={urlDirection as 'long' | 'short' | undefined}
                initialAmount={urlAmount ? Number(urlAmount) : undefined}
              />
            </div>
          ) : (
            <div className="flex gap-5">
              {/* Left column — fixed 420px */}
              <div className="w-[420px] flex-shrink-0 hidden lg:block">
                <div className="lg:sticky lg:top-6">
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

              {/* Mobile form */}
              <div className="block lg:hidden w-full">
                <TradeInputForm
                  onSubmit={handleSubmitTrade}
                  isLoading={tradeLoading}
                  initialAsset={urlAsset}
                  initialMarket={urlMarket as 'US' | 'UK' | 'EU' | undefined}
                  initialDirection={urlDirection as 'long' | 'short' | undefined}
                  initialAmount={urlAmount ? Number(urlAmount) : undefined}
                />
              </div>

              {/* Right column — results, slides in */}
              <div
                key={analysis?.analyzedAt ?? 'loading'}
                className="flex-1 min-w-0 animate-[slideInRight_300ms_ease-out]"
                style={{
                  animation: 'workspaceSlideIn 300ms ease-out',
                }}
              >
                {tradeLoading && <SimulationLoader asset={currentAsset} />}

                {analysis && !tradeLoading && (
                  <div className="space-y-4 animate-result-reveal">
                    {isHistorical && (
                      <div className="rounded-xl bg-surface border border-border/50 px-4 py-2 text-[12px] text-muted-foreground font-mono">
                        Viewing historical analysis from{' '}
                        {new Date(analysis.analyzedAt).toLocaleDateString()}
                      </div>
                    )}

                    {/* Monte Carlo — full width */}
                    <div className="animate-result-reveal" style={{ animationDelay: '0ms' }}>
                      <MonteCarloFanChart analysis={analysis} currencySymbol={currencySymbol} />
                    </div>

                    {/* Risk snapshot — 4 KPI cards */}
                    <div className="animate-result-reveal" style={{ animationDelay: '100ms' }}>
                      <RiskSnapshot analysis={analysis} currencySymbol={currencySymbol} />
                    </div>

                    {/* Tail risk + Scenarios */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-result-reveal" style={{ animationDelay: '200ms' }}>
                      <TailRiskPanel
                        scenarios={analysis.scenarios}
                        expectedShortfall={analysis.riskMetrics.expectedShortfall}
                        kurtosis={analysis.simulation.kurtosis}
                        currencySymbol={currencySymbol}
                        entryPrice={analysis.input.entryPrice}
                      />
                      <ScenarioProbabilityDonut analysis={analysis} />
                    </div>

                    <ScenarioRegimeCards
                      scenarios={analysis.scenarios}
                      currencySymbol={currencySymbol}
                      entryPrice={analysis.input.entryPrice}
                      shares={shares}
                    />

                    <PnLSummary analysis={analysis} shares={shares} currencySymbol={currencySymbol} />

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
          )}
        </div>
      </div>

      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </AppShell>
  );
}
