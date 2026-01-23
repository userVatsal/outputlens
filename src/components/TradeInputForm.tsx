import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Clock, DollarSign, BarChart3, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TradeDirection, TimeHorizon, TradeInput, Market, MARKETS } from '@/types/trade';

interface TradeInputFormProps {
  onSubmit: (input: TradeInput) => void;
}

export function TradeInputForm({ onSubmit }: TradeInputFormProps) {
  const [asset, setAsset] = useState('');
  const [direction, setDirection] = useState<TradeDirection>('long');
  const [entryPrice, setEntryPrice] = useState('');
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('3-7 days');
  const [market, setMarket] = useState<Market>('US');
  const navigate = useNavigate();

  const selectedMarket = MARKETS[market];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const input: TradeInput = {
      asset: asset.toUpperCase().trim(),
      direction,
      entryPrice: parseFloat(entryPrice),
      timeHorizon,
      market,
    };
    
    onSubmit(input);
    navigate('/results');
  };

  const isValid = asset.trim() !== '' && entryPrice !== '' && parseFloat(entryPrice) > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Market Selection */}
      <div className="space-y-2">
        <Label htmlFor="market" className="flex items-center gap-2 text-sm font-medium">
          <Globe className="h-4 w-4 text-muted-foreground" />
          Market
        </Label>
        <Select value={market} onValueChange={(v) => setMarket(v as Market)}>
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
          placeholder={market === 'US' ? 'e.g. SPY, AAPL, TSLA' : market === 'UK' ? 'e.g. FTSE, HSBA, BP' : 'e.g. DAX, SAP, ASML'}
          value={asset}
          onChange={(e) => setAsset(e.target.value)}
          className="trading-input font-mono text-lg"
        />
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
            className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-medium transition-all ${
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
            className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-medium transition-all ${
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
          Entry Price ({selectedMarket.currencySymbol})
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
          />
        </div>
      </div>

      {/* Time Horizon */}
      <div className="space-y-2">
        <Label htmlFor="timeHorizon" className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Time Horizon
        </Label>
        <Select value={timeHorizon} onValueChange={(v) => setTimeHorizon(v as TimeHorizon)}>
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

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isValid}
        className="w-full py-6 text-lg font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
      >
        Evaluate Trade
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        This tool provides scenario analysis only. Not financial advice.
      </p>
    </form>
  );
}
