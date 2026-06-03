import { useState, useCallback, useEffect } from 'react';
import { TrendingUp, TrendingDown, Loader2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { addDays, setHours, setMinutes } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { TradeDirection, TimeHorizon, Market, MARKETS } from '@/types/trade';
import { EnhancedTradeInput } from '@/types/analysis';
import { cn } from '@/lib/utils';
import { AssetSearchInput } from './AssetSearchInput';
import { DateTimePicker } from './DateTimePicker';
import { LivePriceIndicator } from './LivePriceIndicator';
import { SelectedAsset } from '@/hooks/useAssetSearch';

interface TradeInputFormProps {
  onSubmit: (input: EnhancedTradeInput) => void;
  isLoading?: boolean;
  initialAsset?: string;
  initialMarket?: 'US' | 'UK' | 'EU';
  initialDirection?: 'long' | 'short';
  initialAmount?: number;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] uppercase text-muted-foreground tracking-[0.08em] font-medium mb-2.5">
      {children}
    </div>
  );
}

function deriveTimeHorizon(entryDate: Date, exitDate: Date): TimeHorizon {
  const diffMs = exitDate.getTime() - entryDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 3) return '1-3 days';
  if (diffDays <= 7) return '3-7 days';
  return '7-30 days';
}

function getDefaultEntryTime(market: Market): Date {
  const now = new Date();
  const hours = market === 'US' ? 9 : market === 'UK' ? 8 : 9;
  const minutes = market === 'US' ? 30 : 0;
  return setMinutes(setHours(now, hours), minutes);
}

function getDefaultExitTime(market: Market, entryDate: Date): Date {
  const exit = addDays(entryDate, 7);
  const hours = market === 'US' ? 16 : market === 'UK' ? 16 : 17;
  const minutes = market === 'US' ? 0 : market === 'UK' ? 30 : 30;
  return setMinutes(setHours(exit, hours), minutes);
}

function setExitFromEntry(entry: Date, market: Market, days: number): Date {
  const exit = addDays(entry, days);
  const hours = market === 'US' ? 16 : market === 'UK' ? 16 : 17;
  const minutes = market === 'US' ? 0 : market === 'UK' ? 30 : 30;
  return setMinutes(setHours(exit, hours), minutes);
}

export function TradeInputForm({ onSubmit, isLoading = false, initialAsset, initialMarket, initialDirection, initialAmount }: TradeInputFormProps) {
  const [market, setMarket] = useState<Market>(initialMarket ?? 'US');
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset | null>(
    initialAsset ? { symbol: initialAsset, name: initialAsset, type: 'stock', exchange: 'US' } : null
  );
  const [direction, setDirection] = useState<TradeDirection | null>(initialDirection ?? null);
  const [entryPrice, setEntryPrice] = useState('');
  const [priceAutoFilled, setPriceAutoFilled] = useState(false);
  const [showPriceOverride, setShowPriceOverride] = useState(false);
  const [entryDateTime, setEntryDateTime] = useState<Date>(() => getDefaultEntryTime(initialMarket ?? 'US'));
  const [exitDateTime, setExitDateTime] = useState<Date>(() => getDefaultExitTime(initialMarket ?? 'US', getDefaultEntryTime(initialMarket ?? 'US')));
  const [confidence, setConfidence] = useState(5);
  const [assumptions, setAssumptions] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [positionSize, setPositionSize] = useState(initialAmount ? String(initialAmount) : '100');
  const [positionType, setPositionType] = useState<'shares' | 'dollars'>(initialAmount ? 'dollars' : 'shares');

  const selectedMarket = MARKETS[market];

  useEffect(() => {
    setEntryDateTime(getDefaultEntryTime(market));
    setExitDateTime(getDefaultExitTime(market, getDefaultEntryTime(market)));
  }, [market]);

  const handleAssetSelect = useCallback((asset: SelectedAsset | null) => {
    setSelectedAsset(asset);
    if (!asset) {
      setEntryPrice('');
      setPriceAutoFilled(false);
      setDirection(null);
    }
  }, []);

  const handleUsePrice = useCallback((price: number) => {
    setEntryPrice(price.toString());
    setPriceAutoFilled(true);
    setShowPriceOverride(false);
  }, []);

  const applyHorizonPreset = (days: number) => {
    setExitDateTime(setExitFromEntry(entryDateTime, market, days));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || direction === null || !entryPrice) return;
    
    const input: EnhancedTradeInput = {
      asset: selectedAsset.symbol,
      assetName: selectedAsset.name,
      direction,
      entryPrice: parseFloat(entryPrice),
      tradeDate: entryDateTime,
      timeHorizon: deriveTimeHorizon(entryDateTime, exitDateTime),
      market,
      entryDateTime,
      exitDateTime,
      confidence,
      assumptions: assumptions.trim() || undefined,
      positionSize: parseFloat(positionSize) || 100,
      positionType,
    };
    onSubmit(input);
  };

  const isValid = selectedAsset && direction !== null && entryPrice !== '' && parseFloat(entryPrice) > 0;
  const confidenceLabel = confidence <= 3 ? 'Low' : confidence <= 6 ? 'Medium' : 'High';
  const confidenceColor = confidence <= 3 ? 'text-bearish' : confidence <= 6 ? 'text-yellow-500' : 'text-bullish';

  const markets: { value: Market; label: string }[] = [
    { value: 'US', label: 'US' },
    { value: 'UK', label: 'UK' },
    { value: 'EU', label: 'EU' },
  ];

  const horizonPresets = [
    { label: '1W', days: 7 },
    { label: '1M', days: 30 },
    { label: '3M', days: 90 },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-surface border border-border/50 p-6 space-y-6"
    >
      {/* Asset */}
      <div>
        <SectionLabel>Asset</SectionLabel>
        <div className="rounded-xl border border-border/50 bg-elevated focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)] transition-all min-h-[48px]">
          <AssetSearchInput
            market={market}
            onAssetSelect={handleAssetSelect}
            disabled={isLoading}
            selectedAsset={selectedAsset}
          />
        </div>
        {selectedAsset && (
          <div className="mt-2 inline-flex items-center bg-elevated border border-border/50 rounded-lg px-3 py-1.5 font-mono text-[13px]">
            <LivePriceIndicator
              symbol={selectedAsset.symbol}
              market={market}
              currencySymbol={selectedMarket.currencySymbol}
              onUsePrice={handleUsePrice}
            />
          </div>
        )}
      </div>

      {/* Direction */}
      <div>
        <SectionLabel>Direction</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDirection('long')}
            disabled={isLoading}
            className={cn(
              'h-12 flex-1 rounded-xl font-semibold text-[14px] cursor-pointer transition-all inline-flex items-center justify-center gap-2 border',
              direction === 'long'
                ? 'border-bullish/30 bg-bullish/[0.06] text-bullish'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80'
            )}
          >
            <TrendingUp className="h-4 w-4" /> LONG
          </button>
          <button
            type="button"
            onClick={() => setDirection('short')}
            disabled={isLoading}
            className={cn(
              'h-12 flex-1 rounded-xl font-semibold text-[14px] cursor-pointer transition-all inline-flex items-center justify-center gap-2 border',
              direction === 'short'
                ? 'border-bearish/30 bg-bearish/[0.06] text-bearish'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80'
            )}
          >
            <TrendingDown className="h-4 w-4" /> SHORT
          </button>
        </div>
      </div>

      {/* Market */}
      <div>
        <SectionLabel>Market</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {markets.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMarket(m.value)}
              disabled={isLoading}
              className={cn(
                'rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all',
                market === m.value
                  ? 'bg-primary/10 border border-primary/20 text-primary'
                  : 'border border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Position Size */}
      <div>
        <SectionLabel>Position Size</SectionLabel>
        <div className="flex gap-1 mb-2.5">
          <button
            type="button"
            onClick={() => setPositionType('dollars')}
            className={cn(
              'rounded-lg px-3 py-1 text-[12px] font-medium transition-all',
              positionType === 'dollars'
                ? 'bg-elevated text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {selectedMarket.currencySymbol} Amount
          </button>
          <button
            type="button"
            onClick={() => setPositionType('shares')}
            className={cn(
              'rounded-lg px-3 py-1 text-[12px] font-medium transition-all',
              positionType === 'shares'
                ? 'bg-elevated text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Shares
          </button>
        </div>
        <div className="relative">
          {positionType === 'dollars' && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-[14px]">
              {selectedMarket.currencySymbol}
            </span>
          )}
          <Input
            type="number"
            min="1"
            placeholder={positionType === 'shares' ? 'Number of shares' : 'Investment amount'}
            value={positionSize}
            onChange={(e) => setPositionSize(e.target.value)}
            disabled={isLoading}
            className={cn(
              'h-12 rounded-xl bg-elevated border border-border/50 focus:border-primary/40 px-4 font-mono text-[16px] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]',
              positionType === 'dollars' && 'pl-8'
            )}
          />
        </div>
      </div>

      {/* Time Horizon */}
      <div>
        <SectionLabel>Time Horizon</SectionLabel>
        <div className="flex gap-1.5 mb-3">
          {horizonPresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyHorizonPreset(preset.days)}
              disabled={isLoading}
              className="rounded-lg px-3 py-1 text-[12px] text-muted-foreground border border-border hover:border-primary/20 hover:text-primary transition-all"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <DateTimePicker
          entryDateTime={entryDateTime}
          exitDateTime={exitDateTime}
          onEntryChange={setEntryDateTime}
          onExitChange={setExitDateTime}
          market={market}
          disabled={isLoading}
        />
      </div>

      {/* Entry Price */}
      <div>
        <SectionLabel>Entry Price</SectionLabel>
        {priceAutoFilled && !showPriceOverride ? (
          <div className="flex items-center justify-between bg-elevated rounded-xl px-4 h-12 border border-border/50">
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium text-[16px] text-foreground">
                {selectedMarket.currencySymbol}{parseFloat(entryPrice).toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-bullish bg-bullish/10 border border-bullish/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-bullish animate-pulse" />
                Live
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowPriceOverride(true)}
              className="text-[12px] text-primary hover:underline"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-[14px]">
              {selectedMarket.currencySymbol}
            </span>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={entryPrice}
              onChange={(e) => { setEntryPrice(e.target.value); setPriceAutoFilled(false); }}
              disabled={isLoading}
              className="h-12 rounded-xl bg-elevated border border-border/50 focus:border-primary/40 px-4 pl-8 font-mono text-[16px] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
            />
          </div>
        )}
      </div>

      {/* Advanced */}
      {isValid && (
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-[12px] text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1.5 underline-offset-2 hover:underline"
        >
          {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {showAdvanced ? 'Hide' : 'Show'} advanced options
        </button>
      )}
      {showAdvanced && isValid && (
        <div className="space-y-5 p-4 rounded-xl bg-elevated/50 border border-border/40">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-foreground">Confidence</span>
              <span className={cn('text-[12px] font-medium font-mono', confidenceColor)}>
                {confidence}/10 · {confidenceLabel}
              </span>
            </div>
            <Slider
              value={[confidence]}
              onValueChange={(v) => setConfidence(v[0])}
              min={1}
              max={10}
              step={1}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <span className="text-[12px] font-medium text-foreground flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Thesis (optional)
            </span>
            <Textarea
              placeholder="e.g., Expecting positive earnings reaction…"
              value={assumptions}
              onChange={(e) => setAssumptions(e.target.value)}
              disabled={isLoading}
              maxLength={500}
              className="min-h-[80px] resize-none rounded-xl bg-surface border border-border/50 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid || isLoading}
        className={cn(
          'w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-bold text-[16px] shadow-[0_4px_20px_hsl(var(--primary)/0.35)] transition-all',
          'hover:brightness-110 hover:shadow-[0_4px_28px_hsl(var(--primary)/0.45)]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100'
        )}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Running 10,000 simulations…
          </span>
        ) : (
          'Run 10,000 Simulations →'
        )}
      </button>
    </form>
  );
}