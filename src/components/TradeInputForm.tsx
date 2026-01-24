import { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, DollarSign, BarChart3, Globe, Loader2, CalendarIcon, Sliders, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TradeDirection, TimeHorizon, Market, MARKETS } from '@/types/trade';
import { EnhancedTradeInput } from '@/types/analysis';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface TradeInputFormProps {
  onSubmit: (input: EnhancedTradeInput) => void;
  isLoading?: boolean;
}

export function TradeInputForm({ onSubmit, isLoading = false }: TradeInputFormProps) {
  const { t, formatDate } = useLanguage();
  const [asset, setAsset] = useState('');
  const [direction, setDirection] = useState<TradeDirection>('long');
  const [entryPrice, setEntryPrice] = useState('');
  const [tradeDate, setTradeDate] = useState<Date>(new Date());
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('3-7 days');
  const [market, setMarket] = useState<Market>('US');
  const [confidence, setConfidence] = useState(5);
  const [assumptions, setAssumptions] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedMarket = MARKETS[market];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const input: EnhancedTradeInput = {
      asset: asset.toUpperCase().trim(),
      direction,
      entryPrice: parseFloat(entryPrice),
      tradeDate,
      timeHorizon,
      market,
      confidence,
      assumptions: assumptions.trim() || undefined,
    };
    
    onSubmit(input);
  };

  const isValid = asset.trim() !== '' && entryPrice !== '' && parseFloat(entryPrice) > 0;

  const confidenceLabel = confidence <= 3 ? 'Low' : confidence <= 6 ? 'Medium' : 'High';
  const confidenceColor = confidence <= 3 ? 'text-bearish' : confidence <= 6 ? 'text-yellow-500' : 'text-bullish';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Market Selection */}
      <div className="space-y-2">
        <Label htmlFor="market" className="flex items-center gap-2 text-sm font-medium">
          <Globe className="h-4 w-4 text-muted-foreground" />
          Market
        </Label>
        <Select value={market} onValueChange={(v) => setMarket(v as Market)} disabled={isLoading}>
          <SelectTrigger className="trading-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="US">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇺🇸</span>
                <span>US Market (NYSE/NASDAQ)</span>
              </div>
            </SelectItem>
            <SelectItem value="UK">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇬🇧</span>
                <span>UK Market (LSE)</span>
              </div>
            </SelectItem>
            <SelectItem value="EU">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇪🇺</span>
                <span>Europe (Euronext/DAX)</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 space-y-1">
          <div className="flex justify-between">
            <span>Trading Hours:</span>
            <span className="font-mono">{selectedMarket.tradingHours} {selectedMarket.timezone}</span>
          </div>
          <div className="flex justify-between">
            <span>Currency:</span>
            <span className="font-mono">{selectedMarket.currency} ({selectedMarket.currencySymbol})</span>
          </div>
          <div className="flex justify-between">
            <span>Central Bank:</span>
            <span>{selectedMarket.centralBank}</span>
          </div>
        </div>
      </div>

      {/* Asset Name */}
      <div className="space-y-2">
        <Label htmlFor="asset" className="flex items-center gap-2 text-sm font-medium">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Asset Name
        </Label>
        <Input
          id="asset"
          type="text"
          placeholder={market === 'US' ? 'e.g. SPY, AAPL, BTC, EUR/USD' : market === 'UK' ? 'e.g. FTSE, HSBA, BP' : 'e.g. DAX, SAP, ASML'}
          value={asset}
          onChange={(e) => setAsset(e.target.value)}
          className="trading-input font-mono text-lg"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Supports stocks, ETFs, indices, crypto (BTC, ETH), and forex (EUR/USD)
        </p>
      </div>

      {/* Trade Direction */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          {direction === 'long' ? (
            <TrendingUp className="h-4 w-4 text-bullish" />
          ) : (
            <TrendingDown className="h-4 w-4 text-bearish" />
          )}
          Trade Direction
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDirection('long')}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-medium transition-all disabled:opacity-50 ${
              direction === 'long'
                ? 'border-bullish bg-bullish/10 text-bullish'
                : 'border-border bg-muted/30 text-muted-foreground hover:border-bullish/50'
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            Long
          </button>
          <button
            type="button"
            onClick={() => setDirection('short')}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-medium transition-all disabled:opacity-50 ${
              direction === 'short'
                ? 'border-bearish bg-bearish/10 text-bearish'
                : 'border-border bg-muted/30 text-muted-foreground hover:border-bearish/50'
            }`}
          >
            <TrendingDown className="h-5 w-5" />
            Short
          </button>
        </div>
      </div>

      {/* Entry Price */}
      <div className="space-y-2">
        <Label htmlFor="entryPrice" className="flex items-center gap-2 text-sm font-medium">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          {t('entryPrice')} ({selectedMarket.currencySymbol})
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
            {selectedMarket.currencySymbol}
          </span>
          <Input
            id="entryPrice"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            className="trading-input font-mono text-lg pl-8"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Trade Date */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          {t('tradeDate')}
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={isLoading}
              className={cn(
                "w-full justify-start text-left font-normal trading-input",
                !tradeDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {tradeDate ? formatDate(tradeDate) : <span>{t('selectDate')}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-background border" align="start">
            <Calendar
              mode="single"
              selected={tradeDate}
              onSelect={(date) => date && setTradeDate(date)}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Horizon */}
      <div className="space-y-2">
        <Label htmlFor="timeHorizon" className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {t('timeHorizon')}
        </Label>
        <Select value={timeHorizon} onValueChange={(v) => setTimeHorizon(v as TimeHorizon)} disabled={isLoading}>
          <SelectTrigger className="trading-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-3 days">1–3 days</SelectItem>
            <SelectItem value="3-7 days">3–7 days</SelectItem>
            <SelectItem value="7-30 days">7–30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advanced Options Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Sliders className="h-4 w-4" />
        {showAdvanced ? 'Hide' : 'Show'} Advanced Options
      </button>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-6 p-4 rounded-lg bg-muted/30 border border-border/50">
          {/* Confidence Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Sliders className="h-4 w-4 text-muted-foreground" />
                Confidence Level
              </Label>
              <span className={`text-sm font-medium ${confidenceColor}`}>
                {confidence}/10 ({confidenceLabel})
              </span>
            </div>
            <Slider
              value={[confidence]}
              onValueChange={(v) => setConfidence(v[0])}
              min={1}
              max={10}
              step={1}
              disabled={isLoading}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Higher confidence narrows the base case probability and reduces tail risk weights.
            </p>
          </div>

          {/* Assumptions / Thesis */}
          <div className="space-y-2">
            <Label htmlFor="assumptions" className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Trade Thesis (Optional)
            </Label>
            <Textarea
              id="assumptions"
              placeholder="e.g., Expecting positive earnings guidance, Fed likely to pause rate hikes..."
              value={assumptions}
              onChange={(e) => setAssumptions(e.target.value)}
              className="trading-input min-h-[80px] resize-none"
              disabled={isLoading}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              Your thesis will be incorporated into the AI explanation.
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full py-6 text-lg font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Running Monte Carlo Simulation...
          </>
        ) : (
          t('evaluateTrade')
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Analysis uses 10,000 Monte Carlo paths with live market volatility when available.
      </p>
    </form>
  );
}
