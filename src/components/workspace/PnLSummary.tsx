import { TrendingUp, TrendingDown, Target, AlertTriangle, DollarSign } from 'lucide-react';
import { EnhancedTradeAnalysis } from '@/types/analysis';
import { 
  calculatePnL, 
  formatCurrencyWithSign, 
  formatCurrency, 
  formatPrice,
  calculatePriceTarget 
} from '@/lib/positionCalculations';
import { cn } from '@/lib/utils';

interface PnLSummaryProps {
  analysis: EnhancedTradeAnalysis;
  shares: number;
  currencySymbol: string;
}

export function PnLSummary({ analysis, shares, currencySymbol }: PnLSummaryProps) {
  const { input, riskMetrics, scenarios, simulation } = analysis;
  const entryPrice = input.entryPrice;
  const totalInvestment = shares * entryPrice;
  
  // Calculate key price levels
  const expectedReturn = simulation.meanReturn;
  const var95Return = -riskMetrics.valueAtRisk95;
  const cvarReturn = -riskMetrics.expectedShortfall;
  
  // Find best upside scenario return
  const bestUpside = scenarios.upside.length > 0 
    ? Math.max(...scenarios.upside.map(s => s.returnRangeMax))
    : expectedReturn;
  
  // Find worst downside scenario return  
  const worstDownside = scenarios.downside.length > 0
    ? Math.min(...scenarios.downside.map(s => s.returnRangeMin))
    : var95Return;
  
  // Calculate P&L for each level
  const expectedPnL = calculatePnL(entryPrice, expectedReturn, shares);
  const upsidePnL = calculatePnL(entryPrice, bestUpside, shares);
  const var95PnL = calculatePnL(entryPrice, var95Return, shares);
  const cvarPnL = calculatePnL(entryPrice, cvarReturn, shares);
  const downsidePnL = calculatePnL(entryPrice, worstDownside, shares);

  return (
    <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
      {/* Header */}
      <div className="bg-muted/30 px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Position Summary</h3>
          </div>
          <div className="text-right">
            <span className="text-sm text-muted-foreground">Total Investment</span>
            <div className="font-mono font-bold text-foreground">
              {formatCurrency(totalInvestment, currencySymbol)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <span>{shares} share{shares !== 1 ? 's' : ''}</span>
          <span>×</span>
          <span>{formatPrice(entryPrice, currencySymbol)}</span>
          <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
            {input.assetName || input.asset}
          </span>
        </div>
      </div>

      {/* P&L Levels */}
      <div className="p-5 space-y-4">
        {/* Expected Outcome */}
        <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium text-foreground">Expected Return</div>
              <div className="text-xs text-muted-foreground">Based on simulation mean</div>
            </div>
          </div>
          <div className="text-right">
            <div className={cn(
              "font-mono font-bold text-lg",
              expectedPnL.totalPnl >= 0 ? "text-bullish" : "text-bearish"
            )}>
              {formatCurrencyWithSign(expectedPnL.totalPnl, currencySymbol)}
            </div>
            <div className="text-xs text-muted-foreground">
              @ {formatPrice(expectedPnL.exitPrice, currencySymbol)}
            </div>
          </div>
        </div>

        {/* Upside / Downside Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Best Upside */}
          <div className="py-3 px-4 rounded-lg bg-bullish/5 border border-bullish/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-bullish" />
              <span className="text-xs font-medium text-muted-foreground">Best Upside</span>
            </div>
            <div className="font-mono font-bold text-bullish">
              {formatCurrencyWithSign(upsidePnL.totalPnl, currencySymbol)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              @ {formatPrice(upsidePnL.exitPrice, currencySymbol)}
            </div>
          </div>

          {/* Worst Downside */}
          <div className="py-3 px-4 rounded-lg bg-bearish/5 border border-bearish/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-bearish" />
              <span className="text-xs font-medium text-muted-foreground">Worst Downside</span>
            </div>
            <div className="font-mono font-bold text-bearish">
              {formatCurrencyWithSign(downsidePnL.totalPnl, currencySymbol)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              @ {formatPrice(downsidePnL.exitPrice, currencySymbol)}
            </div>
          </div>
        </div>

        {/* Risk Levels */}
        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <AlertTriangle className="h-3.5 w-3.5" />
            Risk Thresholds
          </div>
          
          {/* VaR 95% */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">95% VaR</span>
              <span className="text-xs text-muted-foreground ml-2">(5% chance of worse)</span>
            </div>
            <div className="font-mono text-caution">
              {formatCurrencyWithSign(var95PnL.totalPnl, currencySymbol)}
            </div>
          </div>

          {/* Expected Shortfall */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Expected Shortfall</span>
              <span className="text-xs text-muted-foreground ml-2">(avg of worst 5%)</span>
            </div>
            <div className="font-mono text-bearish">
              {formatCurrencyWithSign(cvarPnL.totalPnl, currencySymbol)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
