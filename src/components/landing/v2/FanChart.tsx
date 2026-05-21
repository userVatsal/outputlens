import { useMemo } from 'react';
import { Area, AreaChart, Line, ResponsiveContainer, YAxis } from 'recharts';

/**
 * Animated Monte Carlo fan chart for the hero.
 * Generates 5 percentile bands (P5, P25, P50, P75, P95)
 * with deterministic curving paths.
 */
export function FanChart({ height = 380 }: { height?: number }) {
  const data = useMemo(() => {
    const N = 50;
    const out: Array<{ x: number; p5: number; p25: number; p50: number; p75: number; p95: number; lo: number; mid: number; hi: number }> = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      // Slight upward drift with growing variance (fan opens to right)
      const drift = 100 + t * 16;
      const spread = 4 + t * 28;
      const wiggle = Math.sin(t * 6.2) * 1.4 + Math.cos(t * 3.1) * 0.8;
      const p50 = drift + wiggle;
      const p25 = p50 - spread * 0.45;
      const p75 = p50 + spread * 0.5;
      const p5 = p50 - spread;
      const p95 = p50 + spread * 1.1;
      out.push({
        x: i,
        p5, p25, p50, p75, p95,
        lo: p5,
        mid: p25,
        hi: p75,
      });
    }
    return out;
  }, []);

  return (
    <div style={{ width: '100%', height }} className="animate-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <YAxis hide domain={['dataMin - 4', 'dataMax + 4']} />
          {/* P5-P95 outer band (ranged area) */}
          <Area
            type="monotone"
            dataKey={(d: any) => [d.p5, d.p95]}
            stroke="none"
            fill="hsl(189 100% 50% / 0.06)"
            isAnimationActive
            animationDuration={900}
          />
          {/* P25-P75 inner band */}
          <Area
            type="monotone"
            dataKey={(d: any) => [d.p25, d.p75]}
            stroke="none"
            fill="hsl(189 100% 50% / 0.12)"
            isAnimationActive
            animationDuration={1000}
          />
          {/* P50 median */}
          <Line
            type="monotone"
            dataKey="p50"
            stroke="hsl(189 100% 50%)"
            strokeWidth={2}
            dot={false}
            isAnimationActive
            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}