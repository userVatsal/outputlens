/**
 * Position and P&L Calculation Utilities
 */

export interface PnLResult {
  exitPrice: number;
  pnlPerShare: number;
  totalPnl: number;
  pnlPercent: number;
}

/**
 * Calculate P&L for a given return percentage and position
 */
export function calculatePnL(
  entryPrice: number, 
  returnPercent: number, 
  shares: number
): PnLResult {
  const exitPrice = entryPrice * (1 + returnPercent / 100);
  const pnlPerShare = exitPrice - entryPrice;
  const totalPnl = pnlPerShare * shares;
  return { 
    exitPrice, 
    pnlPerShare, 
    totalPnl, 
    pnlPercent: returnPercent 
  };
}

/**
 * Calculate number of shares from investment amount
 */
export function sharesToInvestment(shares: number, pricePerShare: number): number {
  return shares * pricePerShare;
}

/**
 * Calculate shares from investment amount
 */
export function investmentToShares(investmentAmount: number, pricePerShare: number): number {
  return Math.floor(investmentAmount / pricePerShare);
}

/**
 * Format currency with sign (+ for profit, - for loss)
 */
export function formatCurrencyWithSign(
  amount: number, 
  symbol: string = '$',
  options?: { compact?: boolean }
): string {
  const absAmount = Math.abs(amount);
  
  let formatted: string;
  if (options?.compact && absAmount >= 1000) {
    if (absAmount >= 1000000) {
      formatted = (absAmount / 1000000).toFixed(2) + 'M';
    } else {
      formatted = (absAmount / 1000).toFixed(1) + 'K';
    }
  } else {
    formatted = absAmount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }
  
  const sign = amount >= 0 ? '+' : '-';
  return `${sign}${symbol}${formatted}`;
}

/**
 * Format currency without sign
 */
export function formatCurrency(
  amount: number, 
  symbol: string = '$'
): string {
  return `${symbol}${amount.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

/**
 * Calculate price target from return percentage
 */
export function calculatePriceTarget(entryPrice: number, returnPercent: number): number {
  return entryPrice * (1 + returnPercent / 100);
}

/**
 * Calculate price range from return range
 */
export function calculatePriceRange(
  entryPrice: number, 
  returnMin: number, 
  returnMax: number
): { priceMin: number; priceMax: number } {
  return {
    priceMin: calculatePriceTarget(entryPrice, returnMin),
    priceMax: calculatePriceTarget(entryPrice, returnMax)
  };
}

/**
 * Format price with currency symbol
 */
export function formatPrice(price: number, symbol: string = '$'): string {
  return `${symbol}${price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}
