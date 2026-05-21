import { useEffect, useMemo, useRef, useState } from 'react';
import { runGBM } from '@/lib/engine/stochastic/gbm';

/**
 * Live Monte Carlo fan chart for the landing hero.
 * Reciprocity: runs 100 paths in-browser before any signup.
 * Paths draw left → right, percentile bands fill, median line draws last.
 */
export function MonteCarloHero({ ticker = 'AAPL', running = false }: { ticker?: string; running?: boolean }) {
  const [seed, setSeed] = useState(0);
  // Re-seed when ticker changes or when caller flags a new run
  useEffect(() => { setSeed(s => s + 1); }, [ticker, running]);

  const result = useMemo(() => runGBM({
    currentPrice: 100,
    volatility: 32,
    holdingPeriodDays: 60,
    drift: 0.06,
    paths: 120,
    seed: seed + ticker.length * 7,
  }), [seed, ticker]);

  // Re-simulate per-step paths for visualisation (small, cheap)
  const W = 720, H = 280, STEPS = 60;
  const pathsViz = useMemo(() => {
    const N = 80;
    const out: number[][] = [];
    const dailyVol = 0.32 / Math.sqrt(252);
    for (let p = 0; p < N; p++) {
      const series = [100];
      for (let t = 0; t < STEPS; t++) {
        const u1 = Math.random(), u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        series.push(series[series.length - 1] * Math.exp(-0.5 * dailyVol * dailyVol + dailyVol * z));
      }
      out.push(series);
    }
    return out;
  }, [seed, ticker]);

  const allFinals = pathsViz.map(p => p[p.length - 1]);
  const min = Math.min(...allFinals, 80);
  const max = Math.max(...allFinals, 120);
  const yFor = (v: number) => H - ((v - min) / (max - min)) * (H - 30) - 15;
  const xFor = (i: number) => (i / STEPS) * W;

  const toPath = (series: number[]) =>
    series.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)} ${yFor(v).toFixed(1)}`).join(' ');

  // Percentile band points
  const bandPoints = (lo: number, hi: number) => {
    const upper: string[] = [], lower: string[] = [];
    for (let i = 0; i <= STEPS; i++) {
      const col = pathsViz.map(p => p[i]).sort((a, b) => a - b);
      const loV = col[Math.floor(col.length * lo)];
      const hiV = col[Math.floor(col.length * hi)];
      upper.push(`${xFor(i).toFixed(1)},${yFor(hiV).toFixed(1)}`);
      lower.push(`${xFor(i).toFixed(1)},${yFor(loV).toFixed(1)}`);
    }
    return `M ${upper.join(' L ')} L ${lower.reverse().join(' L ')} Z`;
  };

  const medianSeries = useMemo(() => {
    const s: number[] = [];
    for (let i = 0; i <= STEPS; i++) {
      const col = pathsViz.map(p => p[i]).sort((a, b) => a - b);
      s.push(col[Math.floor(col.length / 2)]);
    }
    return s;
  }, [pathsViz]);

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
        <defs>
          <linearGradient id="band-outer" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.18" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="band-inner" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.32" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.10" />
          </linearGradient>
        </defs>

        {/* Outer 5–95% band */}
        <path d={bandPoints(0.05, 0.95)} fill="url(#band-outer)" className="animate-reveal-blur" style={{ animationDelay: '900ms' }} />
        {/* Inner 25–75% band */}
        <path d={bandPoints(0.25, 0.75)} fill="url(#band-inner)" className="animate-reveal-blur" style={{ animationDelay: '1100ms' }} />

        {/* Individual paths, staggered draw */}
        {pathsViz.slice(0, 80).map((p, i) => (
          <path
            key={i}
            d={toPath(p)}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="0.6"
            strokeOpacity="0.18"
            strokeLinecap="round"
            style={{
              strokeDasharray: 1200,
              strokeDashoffset: 1200,
              animation: `path-draw 900ms cubic-bezier(0.16,1,0.3,1) ${(i * 6) + 200}ms forwards`,
            }}
          />
        ))}

        {/* Median */}
        <path
          d={toPath(medianSeries)}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.8"
          strokeLinecap="round"
          style={{
            strokeDasharray: 1200, strokeDashoffset: 1200,
            animation: 'path-draw 700ms ease-out 1300ms forwards', opacity: 0.95,
          }}
        />
        {/* Median end dot */}
        <circle
          cx={xFor(STEPS)} cy={yFor(medianSeries[STEPS])} r="4"
          fill="hsl(var(--primary))"
          style={{ animation: 'reveal-blur 400ms ease-out 1900ms both' }}
        />
      </svg>

      {/* Footer caption */}
      <div className="mt-3 flex items-center justify-between text-data-sm text-muted-foreground">
        <span className="flex items-center gap-2"><span className="live-dot" /> 100 paths · GBM σ=32%</span>
        <span>{ticker} · 60d horizon</span>
      </div>

      {/* Stats from real GBM run */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="P50 Return"   value={`${result.medianReturn >= 0 ? '+' : ''}${result.medianReturn.toFixed(2)}%`} tone="neutral" />
        <Stat label="95% VaR"      value={`${result.percentiles.p5.toFixed(2)}%`} tone="loss" />
        <Stat label="Tail (P1)"    value={`${result.percentiles.p1.toFixed(2)}%`} tone="loss" />
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: 'neutral' | 'loss' | 'gain' }) {
  const color =
    tone === 'loss' ? 'text-destructive'
    : tone === 'gain' ? 'text-bullish'
    : 'text-foreground';
  return (
    <div className="rounded-md surface-elevated px-3 py-2">
      <div className="text-label">{label}</div>
      <div className={`text-data-sm ${color}`} style={{ fontSize: '1rem' }}>{value}</div>
    </div>
  );
}