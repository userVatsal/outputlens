/**
 * Popular asset presets for quick selection
 * Organized by market with human-friendly names and icons
 */

import { Market } from '@/types/trade';

export interface PopularAsset {
  symbol: string;
  name: string;
  icon: string;
  type: 'stock' | 'etf' | 'crypto' | 'forex' | 'index';
}

export const POPULAR_ASSETS: Record<Market, PopularAsset[]> = {
  US: [
    { symbol: 'AAPL', name: 'Apple', icon: '🍎', type: 'stock' },
    { symbol: 'TSLA', name: 'Tesla', icon: '🚗', type: 'stock' },
    { symbol: 'NVDA', name: 'NVIDIA', icon: '🎮', type: 'stock' },
    { symbol: 'MSFT', name: 'Microsoft', icon: '💻', type: 'stock' },
    { symbol: 'SPY', name: 'S&P 500', icon: '📈', type: 'etf' },
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿', type: 'crypto' },
  ],
  UK: [
    { symbol: 'HSBA.L', name: 'HSBC', icon: '🏦', type: 'stock' },
    { symbol: 'BP.L', name: 'BP', icon: '⛽', type: 'stock' },
    { symbol: 'GSK.L', name: 'GSK', icon: '💊', type: 'stock' },
    { symbol: 'SHEL.L', name: 'Shell', icon: '🛢️', type: 'stock' },
    { symbol: 'AZN.L', name: 'AstraZeneca', icon: '🧬', type: 'stock' },
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿', type: 'crypto' },
  ],
  EU: [
    { symbol: 'SAP', name: 'SAP', icon: '💼', type: 'stock' },
    { symbol: 'ASML', name: 'ASML', icon: '🔬', type: 'stock' },
    { symbol: 'MC.PA', name: 'LVMH', icon: '👜', type: 'stock' },
    { symbol: 'SIE.DE', name: 'Siemens', icon: '⚡', type: 'stock' },
    { symbol: 'OR.PA', name: "L'Oréal", icon: '💄', type: 'stock' },
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿', type: 'crypto' },
  ],
};

/**
 * Get asset type badge color
 */
export function getAssetTypeBadgeColor(type: PopularAsset['type'] | string): string {
  const normalizedType = type.toLowerCase();
  switch (normalizedType) {
    case 'stock':
    case 'common stock':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'etf':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'crypto':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'forex':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'index':
      return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
    case 'reit':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'adr':
      return 'bg-teal-500/10 text-teal-500 border-teal-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

/**
 * Format asset type for display
 */
export function formatAssetType(type: string): string {
  switch (type.toLowerCase()) {
    case 'common stock':
    case 'stock':
      return 'Stock';
    case 'etf':
      return 'ETF';
    case 'crypto':
      return 'Crypto';
    case 'forex':
      return 'Forex';
    case 'index':
      return 'Index';
    case 'reit':
      return 'REIT';
    case 'adr':
      return 'ADR';
    default:
      return type;
  }
}
