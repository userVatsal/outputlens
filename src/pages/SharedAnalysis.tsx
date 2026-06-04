import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { EnhancedTradeAnalysis } from '@/types/analysis';

function setMeta(name: string, content: string, property = false) {
  const sel = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(sel);
  if (!el) {
    el = document.createElement('meta');
    if (property) el.setAttribute('property', name);
    else el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.content = content;
}

export default function SharedAnalysis() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<EnhancedTradeAnalysis | null>(null);
  const [createdAt, setCreatedAt] = useState<string>('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from('analysis_history')
        .select('id, created_at, results, is_public')
        .eq('id', id)
        .eq('is_public', true)
        .maybeSingle();
      if (error || !data || !data.results) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const a = data.results as unknown as EnhancedTradeAnalysis;
      setAnalysis(a);
      setCreatedAt(data.created_at as string);
      setLoading(false);

      const sym = a.input?.asset ?? 'Asset';
      const dir = (a.input?.direction ?? '').toUpperCase();
      const winProb = a.riskMetrics?.probabilityOfProfit?.toFixed(1) ?? '—';
      const v = a.riskMetrics?.valueAtRisk95?.toFixed(2) ?? '—';
      const exp = a.riskMetrics?.expectedReturn?.toFixed(2) ?? '—';
      const title = `${sym} Risk Analysis — OutputLens`;
      const ogTitle = `${sym} ${dir} · ${winProb}% win probability`;
      const ogDesc = `VaR 95%: ${v}% · Expected return: ${exp}% · Analysed with 10,000 Monte Carlo paths on OutputLens`;
      document.title = title;
      setMeta('description', ogDesc);
      setMeta('og:title', ogTitle, true);
      setMeta('og:description', ogDesc, true);
      setMeta('og:image', 'https://outputlens.com/og-image.png', true);
      setMeta('twitter:card', 'summary_large_image');
      setMeta('twitter:title', ogTitle);
      setMeta('twitter:description', ogDesc);
    })();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-mono text-sm">Loading analysis…</div>;
  }

  if (notFound || !analysis) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="font-mono text-[11px] text-muted-foreground uppercase" style={{ letterSpacing: '0.15em' }}>404</div>
        <h1 className="font-display font-bold text-[28px] text-foreground mt-3">This analysis is private or doesn't exist.</h1>
        <Link to="/" className="mt-6 bg-primary text-primary-foreground rounded-lg px-5 h-10 inline-flex items-center text-[13px] font-semibold">Back to OutputLens</Link>
      </div>
    );
  }

  const { input, riskMetrics, simulation, scenarios } = analysis;
  const dir = (input.direction ?? '').toUpperCase();
  const isLong = dir === 'LONG';
  const dirColor = isLong ? 'text-bullish' : 'text-bearish';

  const percentiles = simulation?.percentiles ?? ({} as any);
  const rows = [
    { k: 'P95 (Best 5%)', v: percentiles.p95 },
    { k: 'P75', v: percentiles.p75 },
    { k: 'P50 (Median)', v: percentiles.p50 },
    { k: 'P25', v: percentiles.p25 },
    { k: 'P5 (Worst 5%)', v: percentiles.p5 },
  ].filter((r) => typeof r.v === 'number');

  const skewness = (simulation as any)?.skewness ?? 0;
  const kurtosis = (simulation as any)?.kurtosis ?? 0;
  const skewLabel = skewness > 0.3 ? 'right-skewed' : skewness < -0.3 ? 'left-skewed' : 'symmetric';
  const tailLabel = kurtosis > 1 ? 'fat tails' : 'thin tails';

  const allScenarios = [
    ...(scenarios?.base ?? []),
    ...(scenarios?.upside ?? []),
    ...(scenarios?.downside ?? []),
    ...(scenarios?.tail ?? []),
  ]
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 6);

  const created = createdAt ? new Date(createdAt) : new Date();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="h-14 border-b border-border/40 bg-background/80 backdrop-blur-xl fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="block w-1.5 h-1.5 bg-primary rounded-sm" aria-hidden />
          <span className="font-display font-bold tracking-tight"><span className="text-foreground">Output</span><span className="text-primary">Lens</span></span>
          <span className="text-[11px] font-mono text-muted-foreground ml-3">Shared Analysis</span>
        </Link>
        <Link to="/auth?mode=signup" className="bg-primary text-primary-foreground rounded-lg px-4 h-9 text-[13px] font-semibold inline-flex items-center">
          Analyse your own →
        </Link>
      </nav>

      {/* Header */}
      <div className="pt-20 pb-8 max-w-[860px] mx-auto px-6">
        <div className="font-mono text-[11px] text-muted-foreground">OutputLens / Shared Analysis / {input.asset}</div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="font-mono font-bold text-[36px] text-foreground leading-none">{input.asset}</span>
          <span className={`rounded-xl px-4 py-2 font-mono font-semibold text-[14px] border ${isLong ? 'border-bullish/30 bg-bullish/10' : 'border-bearish/30 bg-bearish/10'} ${dirColor}`}>{dir}</span>
          {input.market && <span className="text-[13px] text-muted-foreground">{input.market}</span>}
          <span className="font-mono text-[16px] text-muted-foreground">@ {input.entryPrice?.toLocaleString()}</span>
        </div>
        <p className="font-mono text-[11px] text-muted-foreground mt-2">
          Analysed on {created.toLocaleDateString('en-GB')} at {created.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Results */}
      <div className="max-w-[860px] mx-auto px-6 pb-20 space-y-5">
        {/* Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { l: 'Win Probability', v: `${riskMetrics.probabilityOfProfit?.toFixed(1)}%`, c: 'text-bullish' },
            { l: 'VaR 95%', v: `${riskMetrics.valueAtRisk95?.toFixed(2)}%`, c: 'text-bearish' },
            { l: 'Expected Return', v: `${riskMetrics.expectedReturn?.toFixed(2)}%`, c: riskMetrics.expectedReturn >= 0 ? 'text-bullish' : 'text-bearish' },
            { l: 'Risk Score', v: `${riskMetrics.riskScore}/10`, c: 'text-foreground' },
          ].map((m) => (
            <div key={m.l} className="rounded-xl bg-surface border border-border/50 p-5">
              <div className={`font-mono font-bold text-[32px] tabular-nums ${m.c}`}>{m.v}</div>
              <div className="text-[11px] uppercase text-muted-foreground mt-1" style={{ letterSpacing: '0.08em' }}>{m.l}</div>
            </div>
          ))}
        </div>

        {/* Distribution */}
        <div className="bg-surface border border-border/50 rounded-2xl p-6">
          <h3 className="text-[13px] font-semibold text-foreground">Return Distribution (10,000 paths)</h3>
          <div className="mt-4 space-y-3">
            {rows.map((r) => {
              const positive = (r.v as number) >= 0;
              const widthPct = Math.min(100, (Math.abs(r.v as number) / 40) * 100);
              return (
                <div key={r.k}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[12px] text-muted-foreground">{r.k}</span>
                    <span className={`font-mono font-semibold text-[16px] ${positive ? 'text-bullish' : 'text-bearish'}`}>
                      {positive ? '+' : ''}{(r.v as number).toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-1.5 mt-1.5 bg-elevated/40 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${positive ? 'bg-bullish' : 'bg-bearish'}`} style={{ width: `${widthPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[13px] text-muted-foreground mt-5">
            Distribution is {skewLabel} with {tailLabel} ({kurtosis.toFixed(2)} excess kurtosis).
          </p>
        </div>

        {/* Scenarios */}
        {allScenarios.length > 0 && (
          <div className="bg-surface border border-border/50 rounded-2xl p-6">
            <h3 className="text-[13px] font-semibold text-foreground">Scenario Analysis</h3>
            <div className="mt-3">
              {allScenarios.map((s, i) => (
                <div key={i} className="bg-elevated/30 rounded-xl px-4 py-3 mb-2 flex items-center justify-between flex-wrap gap-2">
                  <div className="font-medium text-[13px] text-foreground">{s.name}</div>
                  <div className="font-mono text-[12px] text-muted-foreground">
                    {(s.probability * 100).toFixed(1)}% · {s.returnRangeMin.toFixed(1)}% to {s.returnRangeMax >= 0 ? '+' : ''}{s.returnRangeMax.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Conversion strip */}
      <section className="bg-surface border-y border-border/50 py-12 text-center px-6">
        <h2 className="font-display font-bold text-[24px] text-foreground">This analysis was created with OutputLens.</h2>
        <p className="text-[15px] text-muted-foreground mt-2 max-w-[400px] mx-auto">Run 10,000 Monte Carlo simulations on any asset. Free to start.</p>
        <Link
          to="/auth?mode=signup"
          className="bg-primary text-primary-foreground font-bold rounded-xl px-8 h-[50px] text-[15px] mt-6 inline-flex items-center shadow-[0_4px_20px_hsl(var(--primary)/0.35)]"
        >
          Start Free →
        </Link>
        <div className="flex flex-wrap gap-6 justify-center mt-4 text-[12px] text-muted-foreground font-mono">
          <span>✓ No credit card</span>
          <span>✓ First simulation free</span>
          <span>✓ Not financial advice</span>
        </div>
      </section>
    </div>
  );
}