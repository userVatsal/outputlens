/**
 * Asset Classification Utility
 * Detects asset type and routes to appropriate data provider
 */

export type AssetType = 'stock' | 'crypto' | 'forex' | 'index' | 'unknown';
export type DataProvider = 'finnhub' | 'coingecko' | 'twelvedata';

export interface AssetClassification {
  type: AssetType;
  provider: DataProvider;
  normalizedSymbol: string;
  displaySymbol: string;
}

// Common crypto symbols (top 100 by market cap + common ones)
const CRYPTO_SYMBOLS = new Set([
  'BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'USDC', 'ADA', 'AVAX', 'DOGE',
  'DOT', 'TRX', 'LINK', 'MATIC', 'SHIB', 'TON', 'DAI', 'LTC', 'BCH', 'ATOM',
  'UNI', 'XLM', 'XMR', 'ETC', 'OKB', 'FIL', 'HBAR', 'APT', 'ARB', 'CRO',
  'VET', 'MKR', 'NEAR', 'OP', 'AAVE', 'GRT', 'QNT', 'ALGO', 'FTM', 'EOS',
  'SAND', 'MANA', 'THETA', 'AXS', 'XTZ', 'EGLD', 'IOTA', 'CAKE', 'NEO', 'FLOW',
  'CHZ', 'KLAY', 'ZEC', 'BTT', 'PEPE', 'FLOKI', 'WIF', 'BONK', 'RENDER', 'INJ',
  'SUI', 'SEI', 'TIA', 'JUP', 'PYTH', 'WLD', 'STRK', 'BLUR', 'IMX', 'APE',
  'BITCOIN', 'ETHEREUM', 'RIPPLE', 'CARDANO', 'SOLANA', 'DOGECOIN', 'POLKADOT'
]);

// Common forex pairs
const FOREX_PAIRS = new Set([
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
  'EURGBP', 'EURJPY', 'GBPJPY', 'AUDJPY', 'CADJPY', 'CHFJPY', 'EURAUD',
  'EURCAD', 'EURCHF', 'GBPAUD', 'GBPCAD', 'GBPCHF', 'AUDCAD', 'AUDCHF',
  'AUDNZD', 'CADCHF', 'NZDCAD', 'NZDCHF', 'EUR/USD', 'GBP/USD', 'USD/JPY'
]);

// Major stock indices
const INDEX_SYMBOLS = new Set([
  'SPX', 'SPY', 'QQQ', 'DJI', 'DJIA', 'IXIC', 'NDX', 'RUT', 'VIX',
  'FTSE', 'UKX', 'DAX', 'CAC', 'STOXX', 'NIKKEI', 'N225', 'HSI',
  '^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX', '^FTSE', '^GDAXI', '^FCHI'
]);

// Currency codes for forex detection
const CURRENCY_CODES = new Set([
  'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'CNY', 'HKD',
  'SGD', 'SEK', 'NOK', 'DKK', 'ZAR', 'MXN', 'BRL', 'INR', 'KRW', 'RUB'
]);

/**
 * Normalize symbol for API calls
 */
function normalizeSymbol(symbol: string): string {
  return symbol
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .trim();
}

/**
 * Check if symbol looks like a forex pair
 */
function isForexPair(symbol: string): boolean {
  const normalized = normalizeSymbol(symbol);
  
  // Direct match
  if (FOREX_PAIRS.has(normalized) || FOREX_PAIRS.has(symbol.toUpperCase())) {
    return true;
  }
  
  // Check if it's a 6-char combination of two currency codes
  if (normalized.length === 6) {
    const base = normalized.slice(0, 3);
    const quote = normalized.slice(3, 6);
    return CURRENCY_CODES.has(base) && CURRENCY_CODES.has(quote);
  }
  
  return false;
}

/**
 * Check if symbol is a cryptocurrency
 */
function isCrypto(symbol: string): boolean {
  const normalized = normalizeSymbol(symbol);
  
  // Direct match
  if (CRYPTO_SYMBOLS.has(normalized)) {
    return true;
  }
  
  // Check common suffixes (BTCUSD, ETHUSD, etc.)
  const withoutUsd = normalized.replace(/USD$/, '');
  if (CRYPTO_SYMBOLS.has(withoutUsd)) {
    return true;
  }
  
  return false;
}

/**
 * Check if symbol is an index
 */
function isIndex(symbol: string): boolean {
  const normalized = normalizeSymbol(symbol);
  return INDEX_SYMBOLS.has(normalized) || INDEX_SYMBOLS.has(symbol.toUpperCase());
}

/**
 * Classify an asset and determine the best data provider
 * Note: Finnhub free tier only supports US stocks - non-US markets use Twelve Data
 */
export function classifyAsset(symbol: string, market: string = 'US'): AssetClassification {
  const normalized = normalizeSymbol(symbol);
  const display = symbol.toUpperCase().trim();
  
  // Check crypto first (most distinctive)
  if (isCrypto(symbol)) {
    // CoinGecko uses lowercase ids
    const cryptoId = normalized.replace(/USD$/, '').toLowerCase();
    return {
      type: 'crypto',
      provider: 'coingecko',
      normalizedSymbol: cryptoId,
      displaySymbol: display
    };
  }
  
  // Check forex
  if (isForexPair(symbol)) {
    // Twelve Data format: EUR/USD
    const forexSymbol = normalized.length === 6 
      ? `${normalized.slice(0, 3)}/${normalized.slice(3, 6)}`
      : symbol.toUpperCase();
    return {
      type: 'forex',
      provider: 'twelvedata',
      normalizedSymbol: forexSymbol,
      displaySymbol: display
    };
  }
  
  // Check indices
  if (isIndex(symbol)) {
    // Use Twelve Data for non-US indices, Finnhub for US
    const provider = market === 'US' ? 'finnhub' : 'twelvedata';
    return {
      type: 'index',
      provider,
      normalizedSymbol: normalized,
      displaySymbol: display
    };
  }
  
  // For stocks: Finnhub free tier only supports US stocks
  // Route UK, EU, Asia markets to Twelve Data
  if (market !== 'US' && market !== 'Crypto') {
    return {
      type: 'stock',
      provider: 'twelvedata',
      normalizedSymbol: formatTwelveDataSymbol(symbol, market),
      displaySymbol: display
    };
  }
  
  // Default to stock via Finnhub (US market)
  return {
    type: 'stock',
    provider: 'finnhub',
    normalizedSymbol: normalized,
    displaySymbol: display
  };
}

/**
 * Format symbol for Twelve Data API based on market
 */
export function formatTwelveDataSymbol(symbol: string, market: string): string {
  // Clean the symbol - remove common exchange suffixes first
  let cleaned = symbol.toUpperCase().trim();
  
  // Remove common exchange suffixes that might be in the input
  cleaned = cleaned.replace(/\.(L|LN|LSE)$/i, ''); // UK suffixes
  cleaned = cleaned.replace(/\.(DE|XETR|F)$/i, ''); // German suffixes
  cleaned = cleaned.replace(/\.(T|TYO|TSE)$/i, ''); // Tokyo suffixes
  cleaned = cleaned.replace(/\.(PA|EUR)$/i, ''); // Paris/Euro suffixes
  
  // Remove any remaining non-alphanumeric characters
  cleaned = cleaned.replace(/[^A-Z0-9]/g, '');
  
  switch (market) {
    case 'UK':
      // London Stock Exchange - Twelve Data uses symbol:exchange format
      return `${cleaned}:LSE`;
    case 'EU':
      // European exchanges - try Frankfurt (XETR) by default
      return `${cleaned}:XETR`;
    case 'Asia':
      // Default to Tokyo Stock Exchange  
      return `${cleaned}:TSE`;
    default:
      return cleaned;
  }
}

/**
 * Get CoinGecko ID from symbol
 * Maps common symbols to their CoinGecko API IDs
 */
export function getCoinGeckoId(symbol: string): string {
  const symbolMap: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'USDT': 'tether',
    'BNB': 'binancecoin',
    'SOL': 'solana',
    'XRP': 'ripple',
    'USDC': 'usd-coin',
    'ADA': 'cardano',
    'AVAX': 'avalanche-2',
    'DOGE': 'dogecoin',
    'DOT': 'polkadot',
    'TRX': 'tron',
    'LINK': 'chainlink',
    'MATIC': 'matic-network',
    'SHIB': 'shiba-inu',
    'TON': 'the-open-network',
    'DAI': 'dai',
    'LTC': 'litecoin',
    'BCH': 'bitcoin-cash',
    'ATOM': 'cosmos',
    'UNI': 'uniswap',
    'XLM': 'stellar',
    'XMR': 'monero',
    'ETC': 'ethereum-classic',
    'NEAR': 'near',
    'ARB': 'arbitrum',
    'OP': 'optimism',
    'AAVE': 'aave',
    'GRT': 'the-graph',
    'FTM': 'fantom',
    'SAND': 'the-sandbox',
    'MANA': 'decentraland',
    'AXS': 'axie-infinity',
    'APE': 'apecoin',
    'PEPE': 'pepe',
    'WIF': 'dogwifcoin',
    'BONK': 'bonk',
    'SUI': 'sui',
    'SEI': 'sei-network',
    'TIA': 'celestia',
    'JUP': 'jupiter-exchange-solana',
    'INJ': 'injective-protocol',
    'RENDER': 'render-token',
    'IMX': 'immutable-x'
  };
  
  const normalized = symbol.toUpperCase().replace(/USD$/, '');
  return symbolMap[normalized] || normalized.toLowerCase();
}

/**
 * Format symbol for Finnhub API based on market
 * Note: Finnhub free tier only supports US stocks
 */
export function formatFinnhubSymbol(symbol: string, market: string): string {
  const normalized = normalizeSymbol(symbol);
  
  // Finnhub free tier only supports US - other markets should use Twelve Data
  // This function is kept for backwards compatibility
  switch (market) {
    case 'UK':
      // London Stock Exchange suffix (requires paid Finnhub plan)
      return `${normalized}.L`;
    case 'EU':
      return normalized;
    case 'US':
    default:
      return normalized;
  }
}
