import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DynamicScenarioSet, DynamicScenario } from '@/lib/scenarioEngine';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

interface ScenarioProbabilityChartProps {
  scenarios: DynamicScenarioSet;
  currencySymbol: string;
}

const COLORS = {
  base: 'hsl(var(--primary))',
  upside: 'hsl(var(--bullish))',
  downside: 'hsl(var(--caution))',
  tail: 'hsl(var(--bearish))'
};

function aggregateCategory(scenarios: DynamicScenario[]): { probability: number; avgReturn: number } {
  if (scenarios.length === 0) return { probability: 0, avgReturn: 0 };
  
  const rawTotal = scenarios.reduce((sum, s) => sum + s.probability, 0);
  // Normalize probability: if >1, it's already in percentage form
  const totalProbability = rawTotal > 1 ? rawTotal : rawTotal * 100;
  
  const weightedReturn = scenarios.reduce((sum, s) => {
    const avgReturn = (s.returnRangeMin + s.returnRangeMax) / 2;
    const prob = s.probability > 1 ? s.probability : s.probability * 100;
    return sum + avgReturn * prob;
  }, 0);
  
  return {
    probability: totalProbability,
    avgReturn: totalProbability > 0 ? weightedReturn / totalProbability : 0
  };
}

export function ScenarioProbabilityChart({ scenarios, currencySymbol }: ScenarioProbabilityChartProps) {
  const chartData = useMemo(() => {
    const base = aggregateCategory(scenarios.base);
    const upside = aggregateCategory(scenarios.upside);
    const downside = aggregateCategory(scenarios.downside);
    const tail = aggregateCategory(scenarios.tail);

    return [
      { 
        name: 'Base Case', 
        probability: base.probability, 
        avgReturn: base.avgReturn,
        fill: COLORS.base,
        description: 'Most likely outcome'
      },
      { 
        name: 'Upside', 
        probability: upside.probability, 
        avgReturn: upside.avgReturn,
        fill: COLORS.upside,
        description: 'Bullish scenarios'
      },
      { 
        name: 'Downside', 
        probability: downside.probability, 
        avgReturn: downside.avgReturn,
        fill: COLORS.downside,
        description: 'Bearish scenarios'
      },
      { 
        name: 'Tail Risk', 
        probability: tail.probability, 
        avgReturn: tail.avgReturn,
        fill: COLORS.tail,
        description: 'Extreme events'
      }
    ].filter(d => d.probability > 0);
  }, [scenarios]);

  const pieData = useMemo(() => 
    chartData.map(d => ({
      name: d.name,
      value: Math.round(d.probability * 100) / 100,
      fill: d.fill
    }))
  , [chartData]);

  const barData = useMemo(() => 
    chartData.map(d => ({
      name: d.name,
      'Expected Return': Math.round(d.avgReturn * 100) / 100,
      fill: d.fill
    }))
  , [chartData]);

  // Use a regular function to avoid forwardRef warning from Recharts
  const renderTooltip = (props: { active?: boolean; payload?: any[] }) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Probability: <span className="font-mono font-medium text-foreground">{data.value?.toFixed(1) || data.probability?.toFixed(1)}%</span>
          </p>
          {data['Expected Return'] !== undefined && (
            <p className="text-sm text-muted-foreground">
              Avg Return: <span className={`font-mono font-medium ${data['Expected Return'] >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                {data['Expected Return'] >= 0 ? '+' : ''}{data['Expected Return'].toFixed(2)}%
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="flex flex-wrap justify-center gap-4 mt-2">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-1.5">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Pie Chart - Probability Distribution */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Probability Distribution</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Likelihood of each scenario category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${value.toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={renderTooltip} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart - Expected Returns */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Expected Returns</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Average return by scenario category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis 
                  type="number" 
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={70}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip content={renderTooltip} />
                <Bar 
                  dataKey="Expected Return" 
                  radius={[0, 4, 4, 0]}
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
