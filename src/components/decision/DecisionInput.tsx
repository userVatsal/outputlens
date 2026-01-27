import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AssetSearchInput } from '@/components/AssetSearchInput';
import { SelectedAsset } from '@/hooks/useAssetSearch';
import { EnhancedTradeInput } from '@/types/analysis';
import { cn } from '@/lib/utils';

interface DecisionInputProps {
  onSubmit: (input: EnhancedTradeInput) => void;
  isLoading?: boolean;
}

type TimeHorizon = '1d' | '1w' | '1m' | '3m';

const TIME_HORIZONS: { value: TimeHorizon; label: string; days: number }[] = [
  { value: '1d', label: '1 day', days: 1 },
  { value: '1w', label: '1 week', days: 7 },
  { value: '1m', label: '1 month', days: 30 },
  { value: '3m', label: '3 months', days: 90 },
];

function mapTimeHorizon(horizon: TimeHorizon): '1-3 days' | '3-7 days' | '7-30 days' {
  switch (horizon) {
    case '1d': return '1-3 days';
    case '1w': return '3-7 days';
    default: return '7-30 days';
  }
}

export function DecisionInput({ onSubmit, isLoading = false }: DecisionInputProps) {
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset | null>(null);
  const [direction, setDirection] = useState<'long' | 'short' | null>(null);
  const [capital, setCapital] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('1w');

  const handleAssetSelect = useCallback((asset: SelectedAsset | null) => {
    setSelectedAsset(asset);
    if (!asset) {
      setEntryPrice('');
      setDirection(null);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || direction === null || !entryPrice || !capital) return;

    const input: EnhancedTradeInput = {
      asset: selectedAsset.symbol,
      assetName: selectedAsset.name,
      direction,
      entryPrice: parseFloat(entryPrice),
      tradeDate: new Date(),
      timeHorizon: mapTimeHorizon(timeHorizon),
      market: 'US',
      entryDateTime: new Date(),
      exitDateTime: new Date(Date.now() + TIME_HORIZONS.find(t => t.value === timeHorizon)!.days * 24 * 60 * 60 * 1000),
      confidence: 5,
      positionSize: parseFloat(capital),
      positionType: 'dollars',
    };
    onSubmit(input);
  };

  const isValid = selectedAsset && direction !== null && entryPrice && capital && parseFloat(capital) > 0 && parseFloat(entryPrice) > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Asset */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Asset</Label>
        <AssetSearchInput 
          market="US" 
          onAssetSelect={handleAssetSelect} 
          disabled={isLoading} 
          selectedAsset={selectedAsset} 
        />
      </div>

      {/* Direction */}
      {selectedAsset && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Direction</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDirection('long')}
              disabled={isLoading}
              className={cn(
                "py-3 rounded-lg border text-sm font-medium transition-colors",
                direction === 'long'
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
              )}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setDirection('short')}
              disabled={isLoading}
              className={cn(
                "py-3 rounded-lg border text-sm font-medium transition-colors",
                direction === 'short'
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
              )}
            >
              Sell
            </button>
          </div>
        </div>
      )}

      {/* Price and Capital */}
      {selectedAsset && direction && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Price per share</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Current price"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="trading-input font-mono pl-7"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Capital at risk</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
              <Input
                type="number"
                min="1"
                placeholder="Amount to invest"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                className="trading-input font-mono pl-7 text-lg"
                disabled={isLoading}
              />
            </div>
            {capital && entryPrice && parseFloat(entryPrice) > 0 && (
              <p className="text-xs text-muted-foreground">
                ≈ {Math.floor(parseFloat(capital) / parseFloat(entryPrice))} shares
              </p>
            )}
          </div>
        </div>
      )}

      {/* Time horizon */}
      {selectedAsset && direction && capital && entryPrice && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Time horizon</Label>
          <div className="grid grid-cols-4 gap-2">
            {TIME_HORIZONS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTimeHorizon(t.value)}
                disabled={isLoading}
                className={cn(
                  "py-2 rounded-lg border text-xs font-medium transition-colors",
                  timeHorizon === t.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <Button 
        type="submit" 
        disabled={!isValid || isLoading} 
        className="w-full py-6 text-base font-medium"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          'Analyze downside risk'
        )}
      </Button>
    </form>
  );
}
