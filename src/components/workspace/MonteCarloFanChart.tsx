import { useMemo, useEffect, useState } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, ComposedChart
} from 'recharts';
import { Zap } from 'lucide-react';
import { EnhancedTradeAnalysis } from '@/types/analysis';

/**
 * Seeded PRNG so the chart is deterministic per render.
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number) {
  // Box–Muller
  const u = Math.max(1e-9, rand());
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

interface Props {
  analysis: EnhancedTradeAnalysis;
  currencySymbol: string;
}

/**
 * Animated Monte Carlo "fan" chart. Shows P5/P25/P50/P75/P95 envelopes
 * over time plus a sample of individual sim paths drawn as thin lines.
 */
export function MonteCarloFanChart({ analysis, currencySymbol }: Props) {
  const { input, simulation, riskMetrics } = analysis;
  const STEPS = 30;
  const SAMPLE_PATHS = 18;

  const { fan, paths, yDomain } = useMemo(() => {
    const entry = input.entryPrice;
    const horizonDays =
      input.timeHorizon === '1-3 days' ? 2 :
      input.timeHorizon === '3-7 days' ? 5 : 15;

    // Per-step volatility in % derived from total horizon stdDev.
    const sigmaTotal = simulation.stdDev / 100; // fractional return
    const muTotal = simulation.meanReturn / 100;
    const sigmaStep = sigmaTotal / Math.sqrt(STEPS);
    const muStep = muTotal / STEPS;

    const rand = mulberry32(42);

    // Generate N sample paths
    const N = 600;
    const allPaths: number[][] = [];
    for (let p = 0; p < N; p++) {
      const path: number[] = [entry];
      let price = entry;
      for (let s = 1; s <= STEPS; s++) {
        const shock = gaussian(rand);
        // GBM-ish step
        price = price * Math.exp(muStep - 0.5 * sigmaStep * sigmaStep + sigmaStep * shock);
        path.push(price);
      }
      allPaths.push(path);
    }

    // Per-step percentiles
    const fan: any[] = [];
    for (let s = 0; s <= STEPS; s++) {
      const slice = allPaths.map(p => p[s]).sort((a, b) => a - b);
      const pct = (q: number) => slice[Math.floor(q * (slice.length - 1))];
      fan.push({
        step: s,
        day: ((s / STEPS) * horizonDays).toFixed(1),
        p5: pct(0.05),
        p25: pct(0.25),
        p50: pct(0.5),
        p75: pct(0.75),
        p95: pct(0.95),
        // For stacked area: bands as deltas
        band95: pct(0.95) - pct(0.05),
        band50: pct(0.75) - pct(0.25),
        entry,
      });
    }

    // Pick a small visible sample for line overlay
    const paths = allPaths.slice(0, SAMPLE_PATHS).map((p, i) =>
      p.map((price, s) => ({ step: s, [`p${i}`]: price }))
    );

    // Merge sample paths into a single dataset keyed by step
    const merged: any[] = fan.map(row => ({ ...row }));
    paths.forEach((path, idx) => {
      path.forEach((pt, s) => {
        merged[s][`path${idx}`] = pt[`p${idx}`];
      });
    });

    const min = Math.min(...fan.map(r => r.p5));
    const max = Math.max(...fan.map(r => r.p95));
    const pad = (max - min) * 0.05;
    return { fan: merged, paths, yDomain: [min - pad, max + pad] };
  }, [input.entryPrice, input.timeHorizon, simulation.meanReturn, simulation.stdDev]);

  // animated reveal
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const DURATION = 1100;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setRevealed(eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [fan]);

  const visible = fan.slice(0, Math.max(2, Math.ceil(fan.length * revealed)));

  const isLong = input.direction === 'long';
  const fmtPrice = (v: number) => `${currencySymbol}${v.toFixed(2)}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const row = payload[0]?.payload;
    if (!row) return null;
    return (
      <div className="rounded-md border border-border bg-popover/95 backdrop-blur px-3 py-2 text-xs shadow-lg">
        <div className="font-mono text-muted-foreground mb-1">Day {row.day}</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono">
          <span className="text-muted-foreground">P95</span>
          <span className="text-bullish text-right">{fmtPrice(row.p95)}</span>
          <span className="text-muted-foreground">P75</span>
          <span className="text-right">{fmtPrice(row.p75)}</span>
          <span className="text-muted-foreground">Median</span>
          <span className="text-foreground text-right">{fmtPrice(row.p50)}</span>
          <span className="text-muted-foreground">P25</span>
          <span className="text-right">{fmtPrice(row.p25)}</span>
          <span className="text-muted-foreground">P5</span>
          <span className="text-destructive text-right">{fmtPrice(row.p5)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-surface overflow-hidden animate-fade-in p-5">
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-primary text-[14px] font-semibold">{input.asset}</span>
            <span className="text-[11px] text-muted-foreground font-mono">· {input.timeHorizon}</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Monte Carlo Fan ({simulation.paths.toLocaleString()} paths)
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm bg-primary/30" /> P5–P95
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm bg-primary/60" /> P25–P75
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-[2px] w-3 bg-primary" /> Median
          </span>
        </div>
      </div>

      <div className="h-[280px] sm:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={visible} margin={{ top: 12, right: 16, bottom: 8, left: 0 }}>
            <defs>
              <linearGradient id="fanOuter" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isLong ? 'hsl(var(--bullish))' : 'hsl(var(--bearish))'} stopOpacity={0.18} />
                <stop offset="100%" stopColor={isLong ? 'hsl(var(--bearish))' : 'hsl(var(--bullish))'} stopOpacity={0.18} />
              </linearGradient>
              <linearGradient id="fanInner" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={false}
              label={{ value: 'Days', position: 'insideBottom', offset: -2, fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              domain={yDomain as any}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(v) => `${currencySymbol}${Number(v).toFixed(0)}`}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeDasharray: '3 3', strokeOpacity: 0.5 }} />

            {/* Entry reference */}
            <ReferenceLine
              y={input.entryPrice}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              strokeOpacity={0.6}
              label={{ value: `Entry ${fmtPrice(input.entryPrice)}`, position: 'right', fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
            />

            {/* Outer band P5–P95 (stack: invisible p5 + delta band95) */}
            <Area dataKey="p5" stackId="outer" stroke="none" fill="transparent" isAnimationActive={false} />
            <Area dataKey="band95" stackId="outer" stroke="none" fill="url(#fanOuter)" isAnimationActive={false} />

            {/* Inner band P25–P75 */}
            <Area dataKey="p25" stackId="inner" stroke="none" fill="transparent" isAnimationActive={false} />
            <Area dataKey="band50" stackId="inner" stroke="none" fill="url(#fanInner)" isAnimationActive={false} />

            {/* Sample paths */}
            {Array.from({ length: SAMPLE_PATHS }).map((_, i) => (
              <Line
                key={i}
                type="monotone"
                dataKey={`path${i}`}
                stroke="hsl(var(--primary))"
                strokeOpacity={0.18}
                strokeWidth={1}
                dot={false}
                isAnimationActive={false}
              />
            ))}

            {/* Median line */}
            <Line
              type="monotone"
              dataKey="p50"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/40">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Expected</div>
          <div className={`mt-0.5 font-mono text-sm font-semibold tabular-nums ${riskMetrics.expectedReturn >= 0 ? 'text-bullish' : 'text-destructive'}`}>
            {riskMetrics.expectedReturn >= 0 ? '+' : ''}{riskMetrics.expectedReturn.toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1">
            <Zap className="h-3 w-3" /> VaR 95%
          </div>
          <div className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-destructive">
            −{riskMetrics.valueAtRisk95.toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Volatility</div>
          <div className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-foreground">
            ±{simulation.stdDev.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}