/**
 * Popular asset presets for quick selection
 * Organized by market with human-friendly names and icons
 */

export interface PopularAsset {
  symbol: string;
  name: string;
  icon: string;
  type: 'stock' | 'etf' | 'crypto' | 'forex' | 'index';
  sector: string;
}

export const POPULAR_ASSETS: Record<string, PopularAsset[]> = {
  US: [
    { symbol: 'AAPL',  name: 'Apple',     icon: '🍎', type: 'stock', sector: 'Tech' },
    { symbol: 'MSFT',  name: 'Microsoft', icon: '🪟', type: 'stock', sector: 'Tech' },
    { symbol: 'NVDA',  name: 'NVIDIA',    icon: '⚡', type: 'stock', sector: 'Tech' },
    { symbol: 'GOOGL', name: 'Alphabet',  icon: '🔍', type: 'stock', sector: 'Tech' },
    { symbol: 'AMZN',  name: 'Amazon',    icon: '📦', type: 'stock', sector: 'Tech' },
    { symbol: 'META',  name: 'Meta',      icon: '👤', type: 'stock', sector: 'Tech' },
    { symbol: 'TSLA',  name: 'Tesla',     icon: '🚗', type: 'stock', sector: 'Auto' },
    { symbol: 'JPM',   name: 'JPMorgan',  icon: '🏦', type: 'stock', sector: 'Finance' },
    { symbol: 'GS',    name: 'Goldman',   icon: '💼', type: 'stock', sector: 'Finance' },
    { symbol: 'V',     name: 'Visa',      icon: '💳', type: 'stock', sector: 'Finance' },
    { symbol: 'SPY',   name: 'S&P 500',    icon: '📈', type: 'etf',   sector: 'Index' },
    { symbol: 'QQQ',   name: 'Nasdaq 100', icon: '💹', type: 'etf',   sector: 'Index' },
    { symbol: 'IWM',   name: 'Russell 2K', icon: '📊', type: 'etf',   sector: 'Index' },
    { symbol: 'GLD',   name: 'Gold',       icon: '🥇', type: 'etf',   sector: 'Commodity' },
    { symbol: 'BTC-USD', name: 'Bitcoin',  icon: '₿', type: 'crypto', sector: 'Crypto' },
    { symbol: 'ETH-USD', name: 'Ethereum', icon: '⟠', type: 'crypto', sector: 'Crypto' },
    { symbol: 'SOL-USD', name: 'Solana',   icon: '◎', type: 'crypto', sector: 'Crypto' },
  ],
  UK: [
    { symbol: 'HSBA.L',  name: 'HSBC',        icon: '🏦', type: 'stock', sector: 'Finance' },
    { symbol: 'BP.L',    name: 'BP',          icon: '⛽', type: 'stock', sector: 'Energy' },
    { symbol: 'SHEL.L',  name: 'Shell',       icon: '🛢️', type: 'stock', sector: 'Energy' },
    { symbol: 'AZN.L',   name: 'AstraZeneca', icon: '🧬', type: 'stock', sector: 'Pharma' },
    { symbol: 'GSK.L',   name: 'GSK',         icon: '💊', type: 'stock', sector: 'Pharma' },
    { symbol: 'ULVR.L',  name: 'Unilever',    icon: '🧴', type: 'stock', sector: 'Consumer' },
    { symbol: 'RIO.L',   name: 'Rio Tinto',   icon: '⛏️', type: 'stock', sector: 'Mining' },
    { symbol: 'LSEG.L',  name: 'LSEG',        icon: '🏛️', type: 'stock', sector: 'Finance' },
    { symbol: 'BTC-USD', name: 'Bitcoin',     icon: '₿', type: 'crypto', sector: 'Crypto' },
    { symbol: 'ETH-USD', name: 'Ethereum',    icon: '⟠', type: 'crypto', sector: 'Crypto' },
  ],
  EU: [
    { symbol: 'SAP.DE',  name: 'SAP',     icon: '💼', type: 'stock', sector: 'Tech' },
    { symbol: 'ASML.AS', name: 'ASML',    icon: '🔬', type: 'stock', sector: 'Tech' },
    { symbol: 'SIE.DE',  name: 'Siemens', icon: '⚡', type: 'stock', sector: 'Industrial' },
    { symbol: 'OR.PA',   name: "L'Oréal", icon: '💄', type: 'stock', sector: 'Consumer' },
    { symbol: 'MC.PA',   name: 'LVMH',    icon: '👜', type: 'stock', sector: 'Luxury' },
    { symbol: 'AIR.PA',  name: 'Airbus',  icon: '✈️', type: 'stock', sector: 'Aerospace' },
    { symbol: 'BAS.DE',  name: 'BASF',    icon: '🧪', type: 'stock', sector: 'Chemical' },
    { symbol: 'ALV.DE',  name: 'Allianz', icon: '🛡️', type: 'stock', sector: 'Finance' },
    { symbol: 'BTC-USD', name: 'Bitcoin', icon: '₿', type: 'crypto', sector: 'Crypto' },
    { symbol: 'ETH-USD', name: 'Ethereum', icon: '⟠', type: 'crypto', sector: 'Crypto' },
  ],
  Crypto: [
    { symbol: 'BTC-USD',  name: 'Bitcoin',   icon: '₿', type: 'crypto', sector: 'L1' },
    { symbol: 'ETH-USD',  name: 'Ethereum',  icon: '⟠', type: 'crypto', sector: 'L1' },
    { symbol: 'SOL-USD',  name: 'Solana',    icon: '◎', type: 'crypto', sector: 'L1' },
    { symbol: 'BNB-USD',  name: 'BNB',       icon: '🔶', type: 'crypto', sector: 'Exchange' },
    { symbol: 'XRP-USD',  name: 'XRP',       icon: '💧', type: 'crypto', sector: 'Payment' },
    { symbol: 'DOGE-USD', name: 'Dogecoin',  icon: '🐕', type: 'crypto', sector: 'Meme' },
    { symbol: 'AVAX-USD', name: 'Avalanche', icon: '🔺', type: 'crypto', sector: 'L1' },
    { symbol: 'LINK-USD', name: 'Chainlink', icon: '🔗', type: 'crypto', sector: 'Oracle' },
    { symbol: 'ADA-USD',  name: 'Cardano',   icon: '💙', type: 'crypto', sector: 'L1' },
    { symbol: 'DOT-USD',  name: 'Polkadot',  icon: '🔴', type: 'crypto', sector: 'L0' },
  ],
  Forex: [
    { symbol: 'EURUSD=X', name: 'EUR/USD', icon: '🇪🇺', type: 'forex', sector: 'Major' },
    { symbol: 'GBPUSD=X', name: 'GBP/USD', icon: '🇬🇧', type: 'forex', sector: 'Major' },
    { symbol: 'USDJPY=X', name: 'USD/JPY', icon: '🇯🇵', type: 'forex', sector: 'Major' },
    { symbol: 'USDCHF=X', name: 'USD/CHF', icon: '🇨🇭', type: 'forex', sector: 'Major' },
    { symbol: 'AUDUSD=X', name: 'AUD/USD', icon: '🇦🇺', type: 'forex', sector: 'Major' },
    { symbol: 'USDCAD=X', name: 'USD/CAD', icon: '🇨🇦', type: 'forex', sector: 'Major' },
    { symbol: 'GBPEUR=X', name: 'GBP/EUR', icon: '🇬🇧', type: 'forex', sector: 'Cross' },
    { symbol: 'USDINR=X', name: 'USD/INR', icon: '🇮🇳', type: 'forex', sector: 'EM' },
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
