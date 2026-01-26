import { useState, useEffect } from 'react';
import { FolderPlus, Plus, Check, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSavedPortfolios, SavedPortfolio } from '@/hooks/useSavedPortfolios';
import { EnhancedTradeAnalysis } from '@/types/analysis';
import { cn } from '@/lib/utils';

interface AddToPortfolioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: EnhancedTradeAnalysis;
}

export function AddToPortfolioModal({ open, onOpenChange, analysis }: AddToPortfolioModalProps) {
  const { portfolios, isLoading, isSaving, createPortfolio, addAssetToPortfolio } = useSavedPortfolios();
  
  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('');
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [weight, setWeight] = useState(20);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setMode(portfolios.length > 0 ? 'select' : 'create');
      setSelectedPortfolioId(portfolios[0]?.id || '');
      setNewPortfolioName('');
      setWeight(20);
    }
  }, [open, portfolios]);

  const handleSubmit = async () => {
    let portfolioId = selectedPortfolioId;

    // Create new portfolio if in create mode
    if (mode === 'create') {
      if (!newPortfolioName.trim()) return;
      
      const newPortfolio = await createPortfolio(newPortfolioName.trim());
      if (!newPortfolio) return;
      
      portfolioId = newPortfolio.id;
    }

    if (!portfolioId) return;

    // Add asset to portfolio
    const success = await addAssetToPortfolio(portfolioId, {
      symbol: analysis.input.asset,
      assetName: analysis.input.assetName,
      market: analysis.input.market,
      direction: analysis.input.direction,
      weight,
      entryPrice: analysis.input.entryPrice,
    });

    if (success) {
      onOpenChange(false);
    }
  };

  const canSubmit = mode === 'create' 
    ? newPortfolioName.trim().length > 0 
    : selectedPortfolioId.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-primary" />
            Add to Portfolio
          </DialogTitle>
          <DialogDescription>
            Add <span className="font-mono font-semibold text-foreground">{analysis.input.asset}</span> to a saved portfolio for batch analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mode Selection */}
          {portfolios.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant={mode === 'select' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('select')}
                className="flex-1"
              >
                Existing Portfolio
              </Button>
              <Button
                variant={mode === 'create' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('create')}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Portfolio
              </Button>
            </div>
          )}

          {/* Portfolio Selection */}
          {mode === 'select' && portfolios.length > 0 && (
            <div className="space-y-3">
              <Label>Select Portfolio</Label>
              <RadioGroup
                value={selectedPortfolioId}
                onValueChange={setSelectedPortfolioId}
                className="space-y-2"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  portfolios.map((portfolio) => (
                    <label
                      key={portfolio.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedPortfolioId === portfolio.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value={portfolio.id} />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{portfolio.name}</p>
                        {portfolio.description && (
                          <p className="text-xs text-muted-foreground">{portfolio.description}</p>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </RadioGroup>
            </div>
          )}

          {/* Create New Portfolio */}
          {mode === 'create' && (
            <div className="space-y-3">
              <Label htmlFor="portfolio-name">Portfolio Name</Label>
              <Input
                id="portfolio-name"
                placeholder="e.g., Tech Growth, Hedged Portfolio"
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                maxLength={100}
              />
            </div>
          )}

          {/* Weight Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Asset Weight</Label>
              <span className="text-sm font-mono font-medium text-primary">{weight}%</span>
            </div>
            <Slider
              value={[weight]}
              onValueChange={(v) => setWeight(v[0])}
              min={5}
              max={100}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              This determines how much of your portfolio this asset represents.
            </p>
          </div>

          {/* Asset Preview */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Asset</span>
              <span className="font-mono font-medium">{analysis.input.asset}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Direction</span>
              <span className={cn(
                "font-medium",
                analysis.input.direction === 'long' ? "text-bullish" : "text-bearish"
              )}>
                {analysis.input.direction.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Entry Price</span>
              <span className="font-mono">${analysis.input.entryPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSaving}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Add to Portfolio
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
