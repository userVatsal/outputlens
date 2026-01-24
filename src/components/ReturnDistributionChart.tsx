/**
 * Return Distribution Chart Component
 * Visualizes Monte Carlo simulation results with VaR lines
 */

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { AdvancedRiskMetrics } from '@/lib/riskMetrics';

interface ReturnDistributionChartProps {
  returns?: number[];
  riskMetrics: AdvancedRiskMetrics;
  simulation: {
    meanReturn: number;
    medianReturn: number;
    stdDev: number;
    skewness: number;
    kurtosis: number;
  };
}

export function ReturnDistributionChart({ 
  returns, 
  riskMetrics,
  simulation 
}: ReturnDistributionChartProps) {
  // Generate histogram data from simulation stats if returns not provided
  const histogramData = useMemo(() => {
    const mean = simulation.meanReturn;
    const stdDev = simulation.stdDev;
    const skew = simulation.skewness;
    
    // Generate synthetic distribution curve
    const bins = 50;
    const minReturn = mean - 4 * stdDev;
    const maxReturn = mean + 4 * stdDev;
    const binWidth = (maxReturn - minReturn) / bins;
    
    const data = [];
    for (let i = 0; i < bins; i++) {
      const x = minReturn + (i + 0.5) * binWidth;
      
      // Normal distribution with skew adjustment
      const z = (x - mean) / stdDev;
      let density = Math.exp(-0.5 * z * z) / (stdDev * Math.sqrt(2 * Math.PI));
      
      // Apply skewness adjustment
      if (skew !== 0) {
        const skewFactor = 1 + skew * z * (z * z - 1) / 6;
        density *= Math.max(0.1, skewFactor);
      }
      
      data.push({
        return: x,
        density: density * 100,
        label: `${x >= 0 ? '+' : ''}${x.toFixed(1)}%`
      });
    }
    
    return data;
  }, [simulation]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-popover border border-border rounded-lg p-2 shadow-lg text-xs">
        <p className="font-mono font-medium">{data.label}</p>
        <p className="text-muted-foreground">Probability density</p>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Return Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="distributionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="return" 
                tickFormatter={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(0)}%`}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              
              {/* VaR 95% line */}
              <ReferenceLine 
                x={-riskMetrics.valueAtRisk95} 
                stroke="hsl(var(--bearish))" 
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{ 
                  value: 'VaR 95%', 
                  position: 'top',
                  fontSize: 10,
                  fill: 'hsl(var(--bearish))'
                }}
              />
              
              {/* Mean line */}
              <ReferenceLine 
                x={simulation.meanReturn} 
                stroke="hsl(var(--foreground))" 
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{ 
                  value: 'Mean', 
                  position: 'top',
                  fontSize: 10,
                  fill: 'hsl(var(--foreground))'
                }}
              />
              
              {/* Zero line */}
              <ReferenceLine 
                x={0} 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={1}
              />
              
              <Area
                type="monotone"
                dataKey="density"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#distributionGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Distribution stats */}
        <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/50">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Mean Return</p>
            <p className={`text-sm font-mono font-semibold ${
              simulation.meanReturn >= 0 ? 'text-bullish' : 'text-bearish'
            }`}>
              {simulation.meanReturn >= 0 ? '+' : ''}{simulation.meanReturn.toFixed(2)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Std Dev</p>
            <p className="text-sm font-mono font-semibold text-foreground">
              ±{simulation.stdDev.toFixed(2)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Skewness</p>
            <p className="text-sm font-mono font-semibold text-foreground">
              {simulation.skewness.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Kurtosis</p>
            <p className="text-sm font-mono font-semibold text-foreground">
              {simulation.kurtosis.toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
