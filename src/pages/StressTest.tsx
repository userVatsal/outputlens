import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AssetSearchInput } from '@/components/AssetSearchInput';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useMarketData } from '@/hooks/useMarketData';
import { runMonteCarloSimulation, runScenarioAnalysis, parseHorizonToDays, SimulationResult } from '@/lib/scenarioEngine';
import { TimeHorizon, Market } from '@/types/trade';
import { ScenarioColumn, ScenarioKind } from '@/components/stress/ScenarioColumn';
import { useJournal } from '@/hooks/useJournal';
import { cn } from '@/lib/utils';
import { ChevronDown, FlaskConical, Loader2 } from 'lucide-react';

interface ScenarioParams { drift: number; volMult: number; }

const DEFAULTS: Record<ScenarioKind, ScenarioParams> = {
  bull: { drift: 18, volMult: 0.75 },
  base: { drift: 7,  volMult: 1.0  },
  bear: { drift: -12, volMult: 1.5 },
};

interface ScenarioResult {
  sim: SimulationResult;
  winProb: number;
  var95: number;
  expReturn: number;
}

const HORIZONS: { id: TimeHorizon; label: string }[] = [
  { id: '1-3 days', label: '1W' },
  { id: '3-7 days', label: '2W' },
  { id: '7-30 days', label: '1M' },
  { id: '7-30 days', label: '3M' },
];

export default function StressTest() {
  const navigate = useNavigate();
  const [asset, setAsset] = useState<{ symbol: string; name: string } | null>(null);
  const [market] = useState<Market>('US');
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [positionSize, setPositionSize] = useState<string>('10000');
  const [horizonIdx, setHorizonIdx] = useState(2);
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [params, setParams] = useState({ ...DEFAULTS });
  const [results, setResults] = useState<Record<ScenarioKind, ScenarioResult> | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<Record<ScenarioKind, 'wait' | 'run' | 'done'>>({ bull: 'wait', base: 'wait', bear: 'wait' });
  const { fetchMarketData } = useMarketData();
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [liveVol, setLiveVol] = useState<number | null>(null);
  const { addEntry } = useJournal();

  useEffect(() => { document.title = 'Stress Test | OutputLens'; }, []);

  useEffect(() => {
    if (!asset) return;
    (async () => {
      const d = await fetchMarketData(asset.symbol, market);
      if (d?.price) { setLivePrice(d.price); setEntryPrice(d.price.toFixed(2)); }
      if (d?.volatility) setLiveVol(d.volatility);
    })();
  }, [asset, market, fetchMarketData]);

  const runOne = async (kind: ScenarioKind, vol: number, ep: number, horizon: TimeHorizon): Promise<ScenarioResult> => {
    setProgress(p => ({ ...p, [kind]: 'run' }));
    await new Promise(r => setTimeout(r, 80 + Math.random() * 80));
    const days = parseHorizonToDays(horizon);
    const sim = runMonteCarloSimulation({
      currentPrice: ep,
      volatility: vol * params[kind].volMult,
      holdingPeriodDays: days,
      drift: params[kind].drift / 100,
      simulations: 10000,
    });
    const dirMult = direction === 'short' ? -1 : 1;
    const returns = sim.returns.map(r => r * dirMult);
    const winProb = (returns.filter(r => r > 0).length / returns.length) * 100;
    const sortedDir = [...returns].sort((a, b) => a - b);
    const var95Idx = Math.floor(0.05 * sortedDir.length);
    const var95 = Math.abs(sortedDir[var95Idx] || 0);
    const expReturn = returns.reduce((s, r) => s + r, 0) / returns.length;
    // Re-adjust sim percentiles for direction
    const flipped: SimulationResult = direction === 'short'
      ? { ...sim, percentiles: {
          p1: -sim.percentiles.p99, p5: -sim.percentiles.p95, p10: -sim.percentiles.p90,
          p25: -sim.percentiles.p75, p50: -sim.percentiles.p50, p75: -sim.percentiles.p25,
          p90: -sim.percentiles.p10, p95: -sim.percentiles.p5, p99: -sim.percentiles.p1,
        }, meanReturn: -sim.meanReturn, medianReturn: -sim.medianReturn, skewness: -sim.skewness }
      : sim;
    setProgress(p => ({ ...p, [kind]: 'done' }));
    return { sim: flipped, winProb, var95, expReturn };
  };

  const handleRun = async () => {
    if (!asset || !entryPrice) return;
    setRunning(true);
    setResults(null);
    setProgress({ bull: 'wait', base: 'wait', bear: 'wait' });
    const ep = Number(entryPrice);
    const vol = liveVol || 25;
    const horizon = HORIZONS[horizonIdx].id;
    try {
      const [bull, base, bear] = await Promise.all([
        runOne('bull', vol, ep, horizon),
        runOne('base', vol, ep, horizon),
        runOne('bear', vol, ep, horizon),
      ]);
      setResults({ bull, base, bear });
    } finally {
      setRunning(false);
    }
  };

  const logPreTrade = async () => {
    if (!asset || !results || !entryPrice) return;
    await addEntry({
      asset: asset.symbol,
      direction,
      entry_price: Number(entryPrice),
      position_size: positionSize ? Number(positionSize) : null,
      var95_at_entry: results.base.var95,
      win_prob_at_entry: results.base.winProb,
      expected_return_at_entry: results.base.expReturn,
      thesis: `Pre-trade stress test (Bull/Base/Bear regimes)`,
    });
    navigate('/journal');
  };

  // Comparison metric bar widths (normalised to 100%)
  const compareBar = (vals: number[]) => {
    const max = Math.max(...vals.map(Math.abs), 1);
    return vals.map(v => (Math.abs(v) / max) * 100);
  };

  let insight = 'Distribution is relatively stable across regimes.';
  if (results) {
    if (results.bear.winProb < 35) insight = `In a bear scenario, this position has a ${results.bear.winProb.toFixed(0)}% chance of profit. Consider position sizing.`;
    else if (results.bull.expReturn > 3 * Math.max(0.01, results.base.expReturn)) insight = 'Upside is heavily regime-dependent. High-conviction bet.';
    else if (Math.max(results.bull.var95, results.bear.var95) > 2 * results.base.var95) insight = 'Distribution is highly volatile across regimes.';
  }

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto pb-12">
        <div className="max-w-[640px] mx-auto bg-surface border border-border/50 rounded-2xl p-6">
          <span className="font-mono text-[11px] text-primary uppercase tracking-[0.15em] flex items-center gap-1.5">
            <FlaskConical className="h-3.5 w-3.5" /> STRESS TEST
          </span>
          <h1 className="font-display font-bold text-[24px] mt-1">Pre-Trade Scenario Analysis</h1>
          <p className="text-[13px] text-muted-foreground mt-1">See your position under Bull, Base, and Bear regimes simultaneously.</p>

          <div className="space-y-4 mt-6">
            <AssetSearchInput
              market={market}
              onAssetSelect={(a) => a && setAsset({ symbol: a.symbol, name: a.name })}
              selectedAsset={asset as any}
            />

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-[14px]">$</span>
              <Input
                type="number"
                value={positionSize}
                onChange={(e) => setPositionSize(e.target.value)}
                placeholder="Position size"
                className="pl-7 h-12 rounded-xl bg-elevated font-mono text-[16px]"
              />
            </div>

            <div className="flex gap-2">
              {(['long', 'short'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDirection(d)}
                  className={cn(
                    'flex-1 h-10 rounded-xl font-mono text-[12px] font-semibold uppercase border transition-all',
                    direction === d
                      ? d === 'long'
                        ? 'bg-bullish/15 border-bullish/30 text-bullish'
                        : 'bg-bearish/15 border-bearish/30 text-bearish'
                      : 'bg-elevated border-border/40 text-muted-foreground'
                  )}
                >{d}</button>
              ))}
            </div>

            <div className="flex gap-1.5">
              {HORIZONS.map((h, i) => (
                <button
                  key={h.label}
                  onClick={() => setHorizonIdx(i)}
                  className={cn(
                    'rounded-xl border px-4 h-9 text-[13px] font-mono cursor-pointer transition-all',
                    horizonIdx === i
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'border-border/50 text-muted-foreground hover:text-foreground'
                  )}
                >{h.label}</button>
              ))}
            </div>

            <Input
              type="number"
              step="0.01"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              placeholder="Entry price"
              className="h-12 font-mono rounded-xl bg-elevated text-[16px]"
            />

            <button
              onClick={() => setShowAdvanced(s => !s)}
              className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1 hover:underline underline-offset-2"
            >
              Advanced: adjust scenario parameters
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', showAdvanced && 'rotate-180')} />
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-3 gap-3 pt-2">
                {(['bull', 'base', 'bear'] as const).map(k => {
                  const tone = k === 'bull' ? 'text-bullish' : k === 'bear' ? 'text-bearish' : 'text-primary';
                  return (
                    <div key={k} className="rounded-xl border border-border/50 p-3 bg-elevated/40">
                      <div className={cn('font-mono text-[11px] font-bold uppercase mb-3', tone)}>{k}</div>
                      <Label className="text-[10px] uppercase font-mono text-muted-foreground">Drift</Label>
                      <div className="flex items-center gap-2 mb-3">
                        <Slider min={-30} max={30} step={1} value={[params[k].drift]} onValueChange={(v) => setParams(p => ({ ...p, [k]: { ...p[k], drift: v[0] } }))} className="flex-1" />
                        <span className="font-mono text-[11px] tabular-nums w-10 text-right">{params[k].drift}%</span>
                      </div>
                      <Label className="text-[10px] uppercase font-mono text-muted-foreground">Vol mult</Label>
                      <div className="flex items-center gap-2">
                        <Slider min={0.5} max={2.0} step={0.1} value={[params[k].volMult]} onValueChange={(v) => setParams(p => ({ ...p, [k]: { ...p[k], volMult: v[0] } }))} className="flex-1" />
                        <span className="font-mono text-[11px] tabular-nums w-10 text-right">{params[k].volMult.toFixed(1)}×</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!running ? (
              <button
                onClick={handleRun}
                disabled={!asset || !entryPrice}
                className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-bold text-[16px] disabled:opacity-50 hover:brightness-110 transition-all"
                style={{ boxShadow: '0 4px 20px hsl(var(--primary) / 0.35)' }}
              >
                Run 3 Scenarios →
              </button>
            ) : (
              <div className="rounded-xl bg-elevated/60 border border-border/40 p-4 space-y-1.5">
                {(['bull', 'base', 'bear'] as const).map(k => (
                  <div
                    key={k}
                    className={cn(
                      'font-mono text-[13px] flex items-center gap-2',
                      progress[k] === 'done' ? 'text-bullish' : 'text-muted-foreground'
                    )}
                  >
                    ▸ Running {k.charAt(0).toUpperCase() + k.slice(1)} scenario (10,000 paths)…
                    {progress[k] === 'done' && ' ✓'}
                    {progress[k] === 'run' && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {results && asset && (
          <div className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {(['bull', 'base', 'bear'] as const).map(k => (
                <ScenarioColumn
                  key={k}
                  data={{
                    kind: k,
                    driftLabel: `${params[k].drift > 0 ? '+' : ''}${params[k].drift}%/yr`,
                    volLabel: `${params[k].volMult.toFixed(2)}× vol`,
                    result: results[k].sim,
                    winProb: results[k].winProb,
                    var95: results[k].var95,
                    expReturn: results[k].expReturn,
                    positionSize: positionSize ? Number(positionSize) : null,
                    asset: asset.symbol,
                  }}
                />
              ))}
            </div>

            <div className="bg-elevated/40 border border-border/40 rounded-xl p-5 mt-4">
              <h3 className="text-[13px] font-semibold text-foreground">Scenario Comparison</h3>
              <div className="space-y-3 mt-4">
                {[
                  { label: 'Win Prob', vals: [results.bull.winProb, results.base.winProb, results.bear.winProb], suffix: '%' },
                  { label: 'VaR 95%', vals: [results.bull.var95, results.base.var95, results.bear.var95], suffix: '%' },
                  { label: 'Exp Return', vals: [results.bull.expReturn, results.base.expReturn, results.bear.expReturn], suffix: '%' },
                ].map(row => {
                  const widths = compareBar(row.vals);
                  return (
                    <div key={row.label}>
                      <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground mb-1">
                        <span>{row.label}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {(['bull', 'base', 'bear'] as const).map((k, i) => {
                          const bg = k === 'bull' ? 'bg-bullish' : k === 'bear' ? 'bg-bearish' : 'bg-primary';
                          return (
                            <div key={k} className="flex items-center gap-2">
                              <div className="flex-1 h-2 rounded-full bg-elevated overflow-hidden">
                                <div className={cn('h-full rounded-full', bg)} style={{ width: `${widths[i]}%` }} />
                              </div>
                              <span className="font-mono text-[11px] tabular-nums w-12 text-right">{row.vals[i].toFixed(1)}{row.suffix}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[13px] text-muted-foreground italic mt-3">{insight}</p>
            </div>

            <div className="text-center mt-6">
              <button onClick={logPreTrade} className="text-primary text-[13px] hover:underline">
                Log this as a journal entry →
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}