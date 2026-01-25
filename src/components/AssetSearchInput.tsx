import { useRef, useEffect, useState, KeyboardEvent } from 'react';
import { Search, X, Loader2, Check, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Market } from '@/types/trade';
import { useAssetSearch, SearchResult, SelectedAsset } from '@/hooks/useAssetSearch';
import { POPULAR_ASSETS, PopularAsset, getAssetTypeBadgeColor, formatAssetType } from '@/lib/popularAssets';

interface AssetSearchInputProps {
  market: Market;
  onAssetSelect: (asset: SelectedAsset | null) => void;
  disabled?: boolean;
  selectedAsset?: SelectedAsset | null;
}

export function AssetSearchInput({
  market,
  onAssetSelect,
  disabled = false,
  selectedAsset: externalSelectedAsset,
}: AssetSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const {
    query,
    setQuery,
    results,
    isSearching,
    error,
    selectedAsset: internalSelectedAsset,
    selectAsset,
    clearSelection,
    isOpen,
    setIsOpen,
  } = useAssetSearch(market);

  const selectedAsset = externalSelectedAsset || internalSelectedAsset;
  const popularAssets = POPULAR_ASSETS[market] || POPULAR_ASSETS.US;

  // Handle asset selection
  const handleSelect = (asset: SearchResult) => {
    selectAsset(asset);
    onAssetSelect({
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type,
      exchange: asset.exchange,
    });
  };

  // Handle popular asset click
  const handlePopularClick = (popular: PopularAsset) => {
    const asset: SearchResult = {
      symbol: popular.symbol,
      name: popular.name,
      type: formatAssetType(popular.type),
      exchange: popular.type === 'crypto' ? 'Crypto' : market === 'US' ? 'NASDAQ' : 'Exchange',
      displaySymbol: popular.symbol,
    };
    handleSelect(asset);
  };

  // Handle clear
  const handleClear = () => {
    clearSelection();
    onAssetSelect(null);
    inputRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  // Reset highlight when results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [results]);

  return (
    <div className="space-y-3">
      {/* Label */}
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Search className="h-4 w-4 text-muted-foreground" />
        What are you thinking about trading?
      </Label>

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search for a company, stock, or crypto..."
            value={selectedAsset ? `${selectedAsset.name} (${selectedAsset.symbol})` : query}
            onChange={(e) => {
              if (selectedAsset) {
                clearSelection();
                onAssetSelect(null);
              }
              setQuery(e.target.value);
            }}
            onFocus={() => {
              if (!selectedAsset && query.length > 0) {
                setIsOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={cn(
              "pl-10 pr-10 py-3 text-base trading-input",
              selectedAsset && "bg-muted/50 border-primary/30"
            )}
          />
          {/* Status indicator */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isSearching && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {selectedAsset && !isSearching && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            {error && !isSearching && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </div>
        </div>

        {/* Dropdown Results */}
        {isOpen && results.length > 0 && !selectedAsset && (
          <div
            ref={dropdownRef}
            className="absolute z-50 mt-2 w-full rounded-lg border bg-popover shadow-lg overflow-hidden"
          >
            {results.map((result, index) => (
              <button
                key={`${result.symbol}-${result.exchange}`}
                type="button"
                onClick={() => handleSelect(result)}
                className={cn(
                  "w-full px-4 py-3 text-left flex items-center justify-between gap-3 transition-colors",
                  highlightedIndex === index
                    ? "bg-accent"
                    : "hover:bg-accent/50"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {result.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {result.symbol} · {result.exchange}
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "shrink-0 text-xs",
                    getAssetTypeBadgeColor(result.type.toLowerCase())
                  )}
                >
                  {formatAssetType(result.type)}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground">
        Just type a company or asset — we'll handle the rest.
      </p>

      {/* Selected Asset Confirmation */}
      {selectedAsset && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
          <Check className="h-4 w-4 text-bullish" />
          <span>
            Analyzing <strong className="text-foreground">{selectedAsset.name}</strong>
            <span className="ml-1">({selectedAsset.symbol})</span>
          </span>
        </div>
      )}

      {/* Popular Presets */}
      {!selectedAsset && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Popular:</p>
          <div className="flex flex-wrap gap-2">
            {popularAssets.map((asset) => (
              <button
                key={asset.symbol}
                type="button"
                onClick={() => handlePopularClick(asset)}
                disabled={disabled}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                  "text-sm font-medium transition-all",
                  "border border-border/50 bg-muted/30",
                  "hover:bg-accent hover:border-accent",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <span>{asset.icon}</span>
                <span>{asset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message - only show when there are no results */}
      {error && results.length === 0 && !isSearching && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}