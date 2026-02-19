import { TrendingUp, TrendingDown, Target, AlertTriangle, DollarSign } from 'lucide-react';
import { EnhancedTradeAnalysis } from '@/types/analysis';
import {
  calculatePnL,
  formatCurrencyWithSign,
  formatCurrency,
  formatPrice,
} from '@/lib/positionCalculations';
import { cn } from '@/lib/utils';

interface PnLSummaryProps {
  analysis: EnhancedTradeAnalysis;
  shares: number;
  currencySymbol: string;
}

interface LedgerRowProps {
  label: string;
  sub?: string;
  pnl: number;
  pct: number;
  price: number;
  currencySymbol: string;
  highlight?: boolean;
  dimmed?: boolean;
}

function LedgerRow({ label, sub, pnl, pct, price, currencySymbol, highlight, dimmed }: LedgerRowProps) {
  const isPositive = pnl >= 0;
  return (
    <div className={cn(
      'grid grid-cols-3 gap-2 px-4 py-2.5 text-sm items-center',
      highlight && 'bg-primary/5 border-l-2 border-primary',
      dimmed && 'opacity-70',
    )}>
      <div>
        <div className="text-foreground font-medium">{label}</div>
        {sub && <div className="text-[10px] text-muted-foreground font-mono">{sub}</div>}
      </div>
      <div className={cn('font-mono font-bold text-right', isPositive ? 'text-bullish' : 'text-destructive')}>
        {formatCurrencyWithSign(pnl, currencySymbol)}
      </div>
      <div className="text-right">
        <div className={cn('font-mono text-xs', isPositive ? 'text-bullish' : 'text-destructive')}>
          {isPositive ? '+' : ''}{pct.toFixed(1)}%
        </div>
        <div className="text-[10px] text-muted-foreground font-mono">@ {formatPrice(price, currencySymbol)}</div>
      </div>
    </div>
  );
}

export function PnLSummary({ analysis, shares, currencySymbol }: PnLSummaryProps) {
  const { input, riskMetrics, scenarios, simulation } = analysis;
  const entryPrice = input.entryPrice;
  const totalInvestment = shares * entryPrice;

  const expectedReturn = simulation.meanReturn;
  const var95Return = -riskMetrics.valueAtRisk95;
  const cvarReturn = -riskMetrics.expectedShortfall;

  const bestUpside = scenarios.upside.length > 0
    ? Math.max(...scenarios.upside.map(s => s.returnRangeMax))
    : expectedReturn;

  const worstDownside = scenarios.downside.length > 0
    ? Math.min(...scenarios.downside.map(s => s.returnRangeMin))
    : var95Return;

  const expectedPnL = calculatePnL(entryPrice, expectedReturn, shares);
  const upsidePnL = calculatePnL(entryPrice, bestUpside, shares);
  const var95PnL = calculatePnL(entryPrice, var95Return, shares);
  const cvarPnL = calculatePnL(entryPrice, cvarReturn, shares);
  const downsidePnL = calculatePnL(entryPrice, worstDownside, shares);

  return (
    <div className="rounded-lg overflow-hidden border border-border mb-4">
      {/* Dark header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b border-white/10"
        style={{ backgroundColor: 'hsl(var(--brand-navy))' }}
      >
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-white/60" />
          <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">Position Summary</span>
        </div>
        <div className="text-right">
          <span className="font-mono font-bold text-white text-sm">{formatCurrency(totalInvestment, currencySymbol)}</span>
          <span className="text-[10px] text-white/40 font-mono ml-2">
            {shares} share{shares !== 1 ? 's' : ''} × {formatPrice(entryPrice, currencySymbol)}
          </span>
        </div>
      </div>

      {/* Ledger table */}
      <div className="bg-card divide-y divide-border/50">
        {/* Column headers */}
        <div className="grid grid-cols-3 gap-2 px-4 py-2 bg-muted/30">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Scenario</span>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-right">P&L</span>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-right">Return / Price</span>
        </div>

        <LedgerRow
          label="Expected Return"
          sub="Simulation mean"
          pnl={expectedPnL.totalPnl}
          pct={expectedReturn}
          price={expectedPnL.exitPrice}
          currencySymbol={currencySymbol}
          highlight
        />
        <LedgerRow
          label="Best Upside"
          sub="Bull scenario max"
          pnl={upsidePnL.totalPnl}
          pct={bestUpside}
          price={upsidePnL.exitPrice}
          currencySymbol={currencySymbol}
        />
        <LedgerRow
          label="Worst Downside"
          sub="Bear scenario min"
          pnl={downsidePnL.totalPnl}
          pct={worstDownside}
          price={downsidePnL.exitPrice}
          currencySymbol={currencySymbol}
        />

        {/* Risk section divider */}
        <div className="px-4 py-2 bg-muted/20">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            <AlertTriangle className="h-3 w-3" />
            Risk Thresholds
          </div>
        </div>

        <LedgerRow
          label="VaR 95%"
          sub="5% chance of worse"
          pnl={var95PnL.totalPnl}
          pct={var95Return}
          price={var95PnL.exitPrice}
          currencySymbol={currencySymbol}
          dimmed
        />
        <LedgerRow
          label="Expected Shortfall"
          sub="Avg of worst 5%"
          pnl={cvarPnL.totalPnl}
          pct={cvarReturn}
          price={cvarPnL.exitPrice}
          currencySymbol={currencySymbol}
          dimmed
        />
      </div>
    </div>
  );
}
