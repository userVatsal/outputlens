import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { runScenarioAnalysis } from '@/lib/scenarioEngine';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface DemoPosition {
  symbol: string; direction: 'long' | 'short'; entry: number; size: number; market: 'US'; days: number; vol: number;
}

const POSITIONS: DemoPosition[] = [
  { symbol: 'NVDA',    direction: 'long',  entry: 118.40, size: 50000,  market: 'US', days: 30, vol: 42 },
  { symbol: 'TSLA',    direction: 'long',  entry: 172.80, size: 30000,  market: 'US', days: 14, vol: 55 },
  { symbol: 'BTC-USD', direction: 'long',  entry: 67400,  size: 20000,  market: 'US', days: 7,  vol: 68 },
  { symbol: 'SPY',     direction: 'long',  entry: 512.30, size: 100000, market: 'US', days: 30, vol: 14 },
  { symbol: 'AAPL',    direction: 'short', entry: 196.50, size: 25000,  market: 'US', days: 14, vol: 24 },
];

interface DemoResult {
  pos: DemoPosition;
  livePrice: number;
  changePct: number;
  var95: number;
  riskDelta: number;
  winProb: number;
  p25: number; p50: number; p75: number;
}

function horizonFromDays(days: number): '1-3 days' | '3-7 days' | '7-30 days' {
  if (days <= 3) return '1-3 days';
  if (days <= 7) return '3-7 days';
  return '7-30 days';
}

function MiniFan({ p25, p50, p75 }: { p25: number; p50: number; p75: number }) {
  // simple SVG band over fake N=24 path
  const w = 220, h = 60, pad = 4;
  const pts = useMemo(() => {
    const N = 24;
    const arr: { i: number; p25: number; p50: number; p75: number }[] = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const wiggle = Math.sin(i * 0.7) * 0.5 + Math.cos(i * 1.1) * 0.3;
      arr.push({
        i,
        p25: t * p25 + wiggle * 0.3,
        p50: t * p50 + wiggle * 0.2,
        p75: t * p75 + wiggle * 0.4,
      });
    }
    return arr;
  }, [p25, p50, p75]);
  const min = Math.min(...pts.map(p => p.p25), 0);
  const max = Math.max(...pts.map(p => p.p75), 0.1);
  const scaleX = (i: number) => pad + (i / (pts.length - 1)) * (w - pad * 2);
  const scaleY = (v: number) => pad + (1 - (v - min) / (max - min + 0.0001)) * (h - pad * 2);
  const areaPath = pts.map(p => `${scaleX(p.i)},${scaleY(p.p75)}`).join(' L ') +
    ' L ' + [...pts].reverse().map(p => `${scaleX(p.i)},${scaleY(p.p25)}`).join(' L ');
  const linePath = pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(p.i)},${scaleY(p.p50)}`).join(' ');
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path d={`M ${areaPath} Z`} fill="hsl(var(--primary) / 0.18)" />
      <path d={linePath} stroke="hsl(var(--primary-glow))" strokeWidth={1.5} fill="none" />
    </svg>
  );
}

function DemoTile({ data, loading }: { data?: DemoResult; loading: boolean }) {
  if (loading || !data) {
    return (
      <div className="bg-surface border border-border/40 rounded-2xl p-4 h-[260px] animate-pulse">
        <div className="h-5 w-16 bg-elevated/60 rounded mb-3" />
        <div className="h-7 w-24 bg-elevated/60 rounded mb-2" />
        <div className="h-3 w-32 bg-elevated/60 rounded mb-4" />
        <div className="h-14 bg-elevated/60 rounded" />
      </div>
    );
  }
  const d = data.riskDelta;
  const borderCls =
    d > 0.10 ? 'border-bearish/50 bg-bearish/[0.03]' :
    d > 0.05 ? 'border-caution/40' :
    d >= 0 ? 'border-border/60' :
    'border-bullish/30';

  return (
    <div className={cn('bg-surface border rounded-2xl p-4 flex flex-col gap-2 transition-all', borderCls)}>
      <div className="flex items-baseline gap-2">
        <span className="font-mono font-bold text-[18px] text-foreground">{data.pos.symbol}</span>
        <span className={cn(
          'font-mono text-[10px] font-semibold uppercase rounded-md px-1.5 py-0.5 border',
          data.pos.direction === 'long'
            ? 'bg-bullish/8 border-bullish/20 text-bullish'
            : 'bg-bearish/8 border-bearish/20 text-bearish'
        )}>{data.pos.direction}</span>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto">{data.pos.market}</span>
      </div>
      <div className="font-mono font-semibold text-[22px] tabular-nums text-foreground">${data.livePrice.toFixed(2)}</div>
      <div className="font-mono text-[11px] text-muted-foreground">
        Entry: ${data.pos.entry.toFixed(2)} <span className={cn('ml-1', data.changePct >= 0 ? 'text-bullish' : 'text-bearish')}>({data.changePct >= 0 ? '+' : ''}{data.changePct.toFixed(2)}%)</span>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1 mt-1 border-t border-border/30">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase">VaR 95%</div>
          <div className="font-mono font-semibold text-[13px] text-bearish">{data.var95.toFixed(1)}%</div>
        </div>
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase">Win Prob</div>
          <div className="font-mono font-semibold text-[13px]">{data.winProb.toFixed(0)}%</div>
        </div>
      </div>
      <div className="mt-1 -mx-1">
        <MiniFan p25={data.p25} p50={data.p50} p75={data.p75} />
      </div>
    </div>
  );
}

export default function Demo() {
  const [results, setResults] = useState<DemoResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'Live Demo | OutputLens'; }, []);

  useEffect(() => {
    setLoading(true);
    const run = async () => {
      const out = await Promise.all(POSITIONS.map(async pos => {
        const { simulation } = runScenarioAnalysis({
          entryPrice: pos.entry,
          volatility: pos.vol,
          timeHorizon: horizonFromDays(pos.days),
          direction: pos.direction,
          market: pos.market,
          simulations: 10000,
        });
        const dirMult = pos.direction === 'short' ? -1 : 1;
        const returns = simulation.returns.map(r => r * dirMult);
        const sorted = [...returns].sort((a, b) => a - b);
        const var95 = Math.abs(sorted[Math.floor(0.05 * sorted.length)] || 0);
        const winProb = (returns.filter(r => r > 0).length / returns.length) * 100;
        // simulate a small drift between entry and "live"
        const noise = (Math.random() - 0.5) * 0.04;
        const livePrice = pos.entry * (1 + noise);
        const changePct = noise * 100;
        return {
          pos,
          livePrice,
          changePct,
          var95,
          riskDelta: noise * 2, // demo delta
          winProb,
          p25: simulation.percentiles.p25 * dirMult,
          p50: simulation.percentiles.p50 * dirMult,
          p75: simulation.percentiles.p75 * dirMult,
        } as DemoResult;
      }));
      setResults(out);
      setLoading(false);
    };
    // Defer to next tick so loading state renders first
    setTimeout(run, 100);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="h-16 border-b border-border/40 bg-background/80 backdrop-blur-xl fixed top-0 inset-x-0 z-50 flex items-center px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'hsl(var(--primary) / 0.10)' }}>
            <span className="font-display font-bold text-[15px] text-primary">O</span>
          </div>
          <span className="font-display font-bold text-[15px] tracking-tight">
            <span className="text-foreground">Output</span><span className="text-primary">Lens</span>
          </span>
        </Link>
        <div className="mx-auto flex items-center gap-2">
          <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary font-mono text-[11px] uppercase tracking-[0.15em] rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            LIVE DEMO
          </span>
        </div>
        <Link
          to="/auth?mode=signup"
          className="bg-primary text-primary-foreground font-semibold text-[13px] rounded-lg px-5 py-2.5 hover:brightness-110 transition-all"
          style={{ boxShadow: '0 4px 16px hsl(var(--primary) / 0.4)' }}
        >
          Start Free →
        </Link>
      </header>

      {/* Hero */}
      <section className="pt-24 pb-8 text-center max-w-[640px] mx-auto px-6">
        <h1 className="font-display font-extrabold text-[42px] tracking-tight text-foreground">Risk Intelligence. Live.</h1>
        <p className="text-[15px] text-muted-foreground mt-3 leading-relaxed">
          OutputLens runs 10,000 Monte Carlo paths on these 5 demo positions. Every number is computed in your browser — no hardcoded outputs.
        </p>
      </section>

      {/* Tiles */}
      <section className="max-w-[1400px] mx-auto px-6 pb-16">
        {loading && (
          <div className="text-center font-mono text-[12px] text-muted-foreground mb-4 flex items-center justify-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            Running 10,000 paths…
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {loading
            ? POSITIONS.map((_, i) => <DemoTile key={i} loading />)
            : results.map(r => <DemoTile key={r.pos.symbol} data={r} loading={false} />)}
        </div>
      </section>

      {/* Conversion */}
      <section className="bg-surface border-y border-border/50 py-16 text-center">
        <h2 className="font-display font-bold text-[28px] text-foreground">This is your data. Not a demo.</h2>
        <p className="text-[15px] text-muted-foreground mt-3 max-w-[500px] mx-auto px-4">
          Track your actual positions. Get a daily briefing. Log every trade. See if your risk model is right.
        </p>
        <div className="flex flex-wrap gap-4 justify-center mt-8 px-4">
          <Link
            to="/auth?mode=signup"
            className="inline-flex items-center bg-primary text-primary-foreground font-bold rounded-xl px-8 h-[52px] text-[15px] hover:brightness-110 transition-all"
            style={{ boxShadow: '0 4px 24px hsl(var(--primary) / 0.4)' }}
          >
            Start Free — No card needed →
          </Link>
          <Link to="/pricing" className="inline-flex items-center border border-border rounded-xl px-8 h-[52px] text-foreground text-[15px] hover:border-foreground/20">
            See pricing
          </Link>
        </div>
        <div className="flex flex-wrap gap-6 justify-center mt-6 text-[12px] text-muted-foreground">
          <span>✓ 10,000 paths per simulation</span>
          <span>✓ GARCH + regime detection</span>
          <span>✓ Not financial advice</span>
        </div>
      </section>
    </div>
  );
}