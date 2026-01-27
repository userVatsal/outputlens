import { TradeAnalysis, RiskLevel } from '@/types/trade';
import { TrendingUp, TrendingDown, AlertTriangle, Shield, ShieldAlert, ShieldX } from 'lucide-react';

interface RiskSummaryProps {
  analysis: TradeAnalysis;
}

function RiskIcon({ level }: { level: RiskLevel }) {
  switch (level) {
    case 'Low':
      return <Shield className="h-6 w-6 text-bullish" />;
    case 'Medium':
      return <ShieldAlert className="h-6 w-6 text-caution" />;
    case 'High':
      return <ShieldX className="h-6 w-6 text-bearish" />;
  }
}

function formatReturn(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function RiskSummary({ analysis }: RiskSummaryProps) {
  const { bestCase, worstCase, overallRisk } = analysis;
  
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Best Case */}
      <div className="glass-card p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <TrendingUp className="h-4 w-4 text-bullish" />
          Best Case Scenario
        </div>
        <div className="font-semibold text-foreground">{bestCase.scenario.name}</div>
        <div className="font-mono text-lg text-bullish">
          {formatReturn(bestCase.returnMax)}
        </div>
      </div>

      {/* Worst Case */}
      <div className="glass-card p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <TrendingDown className="h-4 w-4 text-bearish" />
          Worst Case Scenario
        </div>
        <div className="font-semibold text-foreground">{worstCase.scenario.name}</div>
        <div className="font-mono text-lg text-bearish">
          {formatReturn(worstCase.returnMin)}
        </div>
      </div>

      {/* Overall Risk */}
      <div className="glass-card p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <AlertTriangle className="h-4 w-4 text-caution" />
          Overall Risk Rating
        </div>
        <div className="flex items-center gap-3">
          <RiskIcon level={overallRisk} />
          <span className={`text-xl font-bold ${
            overallRisk === 'Low' ? 'text-bullish' :
            overallRisk === 'Medium' ? 'text-caution' : 'text-bearish'
          }`}>
            {overallRisk}
          </span>
        </div>
      </div>
    </div>
  );
}
