import { useState, useCallback, useMemo, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Globe, Loader2, Sliders, FileText, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { addDays, setHours, setMinutes } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

function StepIndicator({ step, current, completed }: { step: number; current: number; completed: boolean }) {
  const isActive = step === current;
  const isPast = step < current || completed;
  
  return (
    <div className={cn(
      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
      isPast && "bg-primary text-primary-foreground",
      isActive && !isPast && "bg-primary/20 text-primary border-2 border-primary",
      !isActive && !isPast && "bg-muted text-muted-foreground"
    )}>
      {isPast ? <Check className="h-4 w-4" /> : step}
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
  const [showMarketDetails, setShowMarketDetails] = useState(false);
  const [positionSize, setPositionSize] = useState(initialAmount ? String(initialAmount) : '100');
  const [positionType, setPositionType] = useState<'shares' | 'dollars'>(initialAmount ? 'dollars' : 'shares');

  const selectedMarket = MARKETS[market];

  useEffect(() => {
    setEntryDateTime(getDefaultEntryTime(market));
    setExitDateTime(getDefaultExitTime(market, getDefaultEntryTime(market)));
  }, [market]);

  const currentStep = useMemo(() => {
    if (!selectedAsset) return 1;
    if (direction === null) return 2;
    return 3;
  }, [selectedAsset, direction]);

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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress */}
      <div className="flex items-center justify-center gap-4">
        <StepIndicator step={1} current={currentStep} completed={!!selectedAsset} />
        <div className={cn("h-0.5 w-12 transition-colors", selectedAsset ? "bg-primary" : "bg-muted")} />
        <StepIndicator step={2} current={currentStep} completed={direction !== null && !!selectedAsset} />
        <div className={cn("h-0.5 w-12 transition-colors", direction !== null ? "bg-primary" : "bg-muted")} />
        <StepIndicator step={3} current={currentStep} completed={isValid as boolean} />
      </div>

      {/* Market (Collapsed) */}
      <div className="space-y-2">
        <button type="button" onClick={() => setShowMarketDetails(!showMarketDetails)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Globe className="h-4 w-4" />
          <span>Market: <strong className="text-foreground">{selectedMarket.name}</strong></span>
          {showMarketDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showMarketDetails && (
          <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50 animate-in fade-in slide-in-from-top-2">
            <Select value={market} onValueChange={(v) => setMarket(v as Market)} disabled={isLoading}>
              <SelectTrigger className="trading-input"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="US"><div className="flex items-center gap-2"><span>🇺🇸</span><span>US Market</span></div></SelectItem>
                <SelectItem value="UK"><div className="flex items-center gap-2"><span>🇬🇧</span><span>UK Market</span></div></SelectItem>
                <SelectItem value="EU"><div className="flex items-center gap-2"><span>🇪🇺</span><span>Europe</span></div></SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Step 1: Asset */}
      <AssetSearchInput market={market} onAssetSelect={handleAssetSelect} disabled={isLoading} selectedAsset={selectedAsset} />
      {selectedAsset && <LivePriceIndicator symbol={selectedAsset.symbol} market={market} currencySymbol={selectedMarket.currencySymbol} onUsePrice={handleUsePrice} />}

      {/* Step 2: Direction */}
      {selectedAsset && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
          <Label className="flex items-center gap-2 text-sm font-medium">Market Outlook</Label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setDirection('long')} disabled={isLoading} className={cn("flex flex-col items-center gap-2 rounded-lg border-2 px-4 py-4 font-medium transition-all", direction === 'long' ? "border-bullish bg-bullish/10 text-bullish" : "border-border bg-muted/30 text-muted-foreground hover:border-bullish/50")}>
              <TrendingUp className="h-6 w-6" /><span className="text-sm">Bullish View ↗</span>
            </button>
            <button type="button" onClick={() => setDirection('short')} disabled={isLoading} className={cn("flex flex-col items-center gap-2 rounded-lg border-2 px-4 py-4 font-medium transition-all", direction === 'short' ? "border-bearish bg-bearish/10 text-bearish" : "border-border bg-muted/30 text-muted-foreground hover:border-bearish/50")}>
              <TrendingDown className="h-6 w-6" /><span className="text-sm">Bearish View ↘</span>
            </button>
          </div>
          {direction && <p className="text-sm text-muted-foreground flex items-center gap-2"><Check className="h-4 w-4 text-bullish" />Position: <strong className="text-foreground">{selectedAsset.name}</strong> — <strong className={direction === 'long' ? 'text-bullish' : 'text-bearish'}>{direction === 'long' ? 'Bullish' : 'Bearish'}</strong> outlook.</p>}
        </div>
      )}

      {/* Step 3: Timing, Price & Position Size */}
      {selectedAsset && direction && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
          <DateTimePicker entryDateTime={entryDateTime} exitDateTime={exitDateTime} onEntryChange={setEntryDateTime} onExitChange={setExitDateTime} market={market} disabled={isLoading} />
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium"><DollarSign className="h-4 w-4 text-muted-foreground" />Price per share</Label>
            {priceAutoFilled && !showPriceOverride ? (
              <div className="flex items-center justify-between bg-muted/30 rounded-lg px-4 py-3 border border-border/50">
                <div className="flex items-center gap-2"><span className="text-lg font-mono font-medium">{selectedMarket.currencySymbol}{parseFloat(entryPrice).toLocaleString()}</span><span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Current market price</span></div>
                <button type="button" onClick={() => setShowPriceOverride(true)} className="text-xs text-primary hover:underline">Change</button>
              </div>
            ) : (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">{selectedMarket.currencySymbol}</span>
                <Input type="number" step="0.01" min="0" placeholder="0.00" value={entryPrice} onChange={(e) => { setEntryPrice(e.target.value); setPriceAutoFilled(false); }} className="trading-input font-mono text-lg pl-8" disabled={isLoading} />
              </div>
            )}
          </div>

          {/* Position Size Input */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Position size
            </Label>
            
            {/* Type Toggle */}
            <div className="flex items-center rounded-lg border border-border bg-muted/30 p-1 w-fit">
              <button
                type="button"
                onClick={() => setPositionType('shares')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  positionType === 'shares' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Shares
              </button>
              <button
                type="button"
                onClick={() => setPositionType('dollars')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  positionType === 'dollars' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {selectedMarket.currencySymbol} Amount
              </button>
            </div>

            {/* Quick Select Chips */}
            <div className="flex flex-wrap gap-2">
              {positionType === 'shares' ? (
                <>
                  {[10, 50, 100, 500].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setPositionSize(qty.toString())}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                        positionSize === qty.toString()
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-muted/30 text-muted-foreground border-border hover:border-primary/50"
                      )}
                    >
                      {qty} shares
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {[1000, 5000, 10000, 25000].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setPositionSize(amount.toString())}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                        positionSize === amount.toString()
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-muted/30 text-muted-foreground border-border hover:border-primary/50"
                      )}
                    >
                      {selectedMarket.currencySymbol}{amount.toLocaleString()}
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Custom Input */}
            <div className="relative">
              {positionType === 'dollars' && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
                  {selectedMarket.currencySymbol}
                </span>
              )}
              <Input
                type="number"
                min="1"
                placeholder={positionType === 'shares' ? 'Number of shares' : 'Investment amount'}
                value={positionSize}
                onChange={(e) => setPositionSize(e.target.value)}
                className={cn("trading-input font-mono", positionType === 'dollars' && "pl-8")}
                disabled={isLoading}
              />
              {positionType === 'shares' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  shares
                </span>
              )}
            </div>

            {/* Position Value Summary */}
            {entryPrice && positionSize && (
              <div className="text-sm text-muted-foreground bg-muted/20 rounded-lg px-3 py-2">
                {positionType === 'shares' ? (
                  <>
                    Total investment: <span className="font-mono font-medium text-foreground">
                      {selectedMarket.currencySymbol}{(parseFloat(positionSize) * parseFloat(entryPrice)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </>
                ) : (
                  <>
                    ≈ <span className="font-mono font-medium text-foreground">
                      {Math.floor(parseFloat(positionSize) / parseFloat(entryPrice))}
                    </span> shares
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Advanced */}
      {isValid && <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><Sliders className="h-4 w-4" />{showAdvanced ? 'Hide' : 'Show'} Advanced Options</button>}
      {showAdvanced && isValid && (
        <div className="space-y-6 p-4 rounded-lg bg-muted/30 border border-border/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between"><Label className="text-sm font-medium">How confident are you?</Label><span className={`text-sm font-medium ${confidenceColor}`}>{confidence}/10 ({confidenceLabel})</span></div>
            <Slider value={[confidence]} onValueChange={(v) => setConfidence(v[0])} min={1} max={10} step={1} disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium"><FileText className="h-4 w-4 text-muted-foreground" />Why do you think this? (Optional)</Label>
            <Textarea placeholder="e.g., Expecting positive earnings..." value={assumptions} onChange={(e) => setAssumptions(e.target.value)} className="trading-input min-h-[80px] resize-none" disabled={isLoading} maxLength={500} />
          </div>
        </div>
      )}

      <Button type="submit" disabled={!isValid || isLoading} className="w-full py-6 text-lg font-semibold">
        {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Analyzing 10,000 scenarios...</> : 'Analyze Risk & Scenarios'}
      </Button>
    </form>
  );
}