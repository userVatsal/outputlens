import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  YAxis,
} from 'recharts';

/**
 * Animated Monte Carlo fan chart for the hero.
 * Generates 5 percentile bands (P5, P25, P50, P75, P95)
 * with deterministic curving paths.
 */
export function FanChart({ height = 380 }: { height?: number }) {
  const data = useMemo(() => {
    const N = 60;
    const out: Array<{
      x: number;
      p5: number;
      p10: number;
      p25: number;
      p50: number;
      p75: number;
      p90: number;
      p95: number;
    }> = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      // Drift with growing variance (square-root-of-time fan opening)
      const drift = 100 + t * 18;
      const spread = 3 + Math.sqrt(t) * 30;
      const wiggle =
        Math.sin(t * 6.2) * 1.2 +
        Math.cos(t * 3.1) * 0.6 +
        Math.sin(t * 11) * 0.3;
      const p50 = drift + wiggle;
      out.push({
        x: i,
        p50,
        p25: p50 - spread * 0.45,
        p75: p50 + spread * 0.5,
        p10: p50 - spread * 0.8,
        p90: p50 + spread * 0.9,
        p5: p50 - spread,
        p95: p50 + spread * 1.1,
      });
    }
    return out;
  }, []);

  const start = data[0]?.p50 ?? 100;
  const last = data[data.length - 1];

  return (
    <div
      style={{ width: '100%', height }}
      className="animate-fade-in relative"
    >
      {/* corner ticker labels */}
      <div className="absolute top-2 left-3 z-10 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        Monte Carlo · 10,000 paths
      </div>
      <div className="absolute top-2 right-3 z-10 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
        T+30d
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 28, right: 56, bottom: 20, left: 8 }}
        >
          <defs>
            <linearGradient id="fanOuter" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.18} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fanMid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.28} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.08} />
            </linearGradient>
            <linearGradient id="fanInner" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.42} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.14} />
            </linearGradient>
            <linearGradient id="medianStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--primary-glow))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={1} />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="hsl(var(--border))"
            strokeOpacity={0.18}
            strokeDasharray="2 4"
            vertical={false}
          />
          <YAxis hide domain={['dataMin - 6', 'dataMax + 6']} />

          <ReferenceLine
            y={start}
            stroke="hsl(var(--foreground) / 0.25)"
            strokeDasharray="3 3"
            label={{
              value: 'Entry',
              position: 'insideLeft',
              fill: 'hsl(var(--foreground) / 0.4)',
              fontSize: 10,
              fontFamily: 'var(--font-mono, monospace)',
              offset: 6,
            }}
          />

          {/* P5–P95 outer */}
          <Area
            type="monotone"
            dataKey={(d: any) => [d.p5, d.p95]}
            stroke="none"
            fill="url(#fanOuter)"
            isAnimationActive
            animationDuration={1100}
          />
          {/* P10–P90 */}
          <Area
            type="monotone"
            dataKey={(d: any) => [d.p10, d.p90]}
            stroke="none"
            fill="url(#fanMid)"
            isAnimationActive
            animationDuration={1100}
            animationBegin={120}
          />
          {/* P25–P75 inner */}
          <Area
            type="monotone"
            dataKey={(d: any) => [d.p25, d.p75]}
            stroke="none"
            fill="url(#fanInner)"
            isAnimationActive
            animationDuration={1100}
            animationBegin={240}
          />

          {/* P95 dashed edge */}
          <Line
            type="monotone"
            dataKey="p95"
            stroke="hsl(var(--bullish) / 0.55)"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            isAnimationActive
            animationDuration={1400}
          />
          {/* P5 dashed edge */}
          <Line
            type="monotone"
            dataKey="p5"
            stroke="hsl(var(--bearish) / 0.6)"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            isAnimationActive
            animationDuration={1400}
          />
          {/* P50 median */}
          <Line
            type="monotone"
            dataKey="p50"
            stroke="url(#medianStroke)"
            strokeWidth={2.25}
            dot={false}
            isAnimationActive
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* end-point chips */}
      {last && (
        <div className="pointer-events-none absolute right-1 top-0 h-full hidden sm:flex flex-col justify-between py-6 font-mono text-[10px]">
          <span className="rounded bg-bullish/10 text-bullish px-1.5 py-0.5 border border-bullish/20">
            P95 +{(((last.p95 - start) / start) * 100).toFixed(1)}%
          </span>
          <span className="rounded bg-primary/10 text-primary px-1.5 py-0.5 border border-primary/20">
            P50 +{(((last.p50 - start) / start) * 100).toFixed(1)}%
          </span>
          <span className="rounded bg-bearish/10 text-bearish px-1.5 py-0.5 border border-bearish/20">
            P5 {(((last.p5 - start) / start) * 100).toFixed(1)}%
          </span>
        </div>
      )}

      {/* animated scan line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-6 left-2 right-14 overflow-hidden"
      >
        <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent animate-scan-line" />
      </div>
    </div>
  );
}