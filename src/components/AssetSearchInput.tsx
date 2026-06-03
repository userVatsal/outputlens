import { useRef, useEffect, useState, useMemo, KeyboardEvent } from 'react';
import { Search, X, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Market } from '@/types/trade';
import { useAssetSearch, SearchResult, SelectedAsset } from '@/hooks/useAssetSearch';
import { POPULAR_ASSETS, PopularAsset, formatAssetType } from '@/lib/popularAssets';

function typeTone(type: string): { badge: string; iconBg: string } {
  switch ((type || '').toLowerCase()) {
    case 'etf':
      return { badge: 'text-accent', iconBg: 'bg-accent/8 text-accent' };
    case 'crypto':
      return { badge: 'text-caution', iconBg: 'bg-caution/8 text-caution' };
    case 'forex':
      return { badge: 'text-bullish', iconBg: 'bg-bullish/8 text-bullish' };
    case 'index':
      return { badge: 'text-bullish', iconBg: 'bg-bullish/8 text-bullish' };
    default:
      return { badge: 'text-primary', iconBg: 'bg-primary/8 text-primary' };
  }
}

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
  const sectors = useMemo(() => {
    const seen = new Set<string>();
    popularAssets.forEach(a => seen.add(a.sector));
    return ['All', ...Array.from(seen)];
  }, [popularAssets]);
  const [activeSector, setActiveSector] = useState<string>('All');
  const filteredPopular = activeSector === 'All'
    ? popularAssets
    : popularAssets.filter(a => a.sector === activeSector);

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
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Search className="h-4 w-4 text-muted-foreground" />
        What are you thinking about trading?
      </Label>

      {/* Selected asset pill (replaces the input when chosen) */}
      {selectedAsset ? (
        (() => {
          const popularMatch = popularAssets.find(p => p.symbol.toUpperCase() === selectedAsset.symbol.toUpperCase());
          return (
            <div className="bg-elevated border border-primary/20 rounded-xl h-12 px-4 flex items-center gap-3">
              {popularMatch && <span className="text-[18px]">{popularMatch.icon}</span>}
              <span className="text-[14px] text-foreground truncate">{selectedAsset.name}</span>
              <span className="font-mono text-[13px] text-primary ml-auto">{selectedAsset.symbol}</span>
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear selection"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })()
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search any stock, ETF, index, crypto…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (query.length > 0) setIsOpen(true); }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="pl-10 pr-10 h-12 text-base bg-elevated border-border/50 rounded-xl"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {error && !isSearching && <AlertCircle className="h-4 w-4 text-destructive" />}
          </div>

          {/* Dropdown results */}
          {isOpen && (results.length > 0 || isSearching) && (
            <div
              ref={dropdownRef}
              className="absolute z-50 mt-2 w-full rounded-xl border border-border/50 bg-popover shadow-lg overflow-hidden"
            >
              {isSearching && results.length === 0 ? (
                <div className="p-2 space-y-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="h-11 rounded-lg bg-elevated/60 animate-pulse" />
                  ))}
                </div>
              ) : (
                results.map((result, index) => {
                  const tone = typeTone(result.type);
                  return (
                    <button
                      key={`${result.symbol}-${result.exchange}-${index}`}
                      type="button"
                      onClick={() => handleSelect(result)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                        highlightedIndex === index ? 'bg-elevated' : 'hover:bg-elevated'
                      )}
                    >
                      <span className={cn('rounded-md w-8 h-8 flex items-center justify-center text-[11px] font-mono font-bold uppercase', tone.iconBg)}>
                        {formatAssetType(result.type).slice(0, 3)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] text-foreground truncate">{result.name}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{result.exchange}</div>
                      </div>
                      <span className="font-mono font-semibold text-[13px] text-primary">{result.symbol}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Popular assets — sector tabs + cards. Hide while typing or after a selection */}
      {!selectedAsset && query.length === 0 && (
        <div className="space-y-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {sectors.map(s => {
              const active = s === activeSector;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setActiveSector(s)}
                  className={cn(
                    'whitespace-nowrap text-[12px] rounded-lg px-3 py-1.5 transition-all border',
                    active
                      ? 'bg-primary/10 border-primary/20 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground border-transparent hover:border-border/40'
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {filteredPopular.map(asset => {
              const tone = typeTone(asset.type);
              return (
                <button
                  key={asset.symbol}
                  type="button"
                  onClick={() => handlePopularClick(asset)}
                  disabled={disabled}
                  className="relative flex-shrink-0 rounded-xl border border-border/50 bg-elevated/50 hover:bg-elevated hover:border-primary/20 transition-all cursor-pointer p-3 flex flex-col gap-1.5 min-w-[88px] text-left disabled:opacity-50"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[18px] leading-none">{asset.icon}</span>
                    <span className={cn('text-[9px] uppercase font-mono font-semibold', tone.badge)}>
                      {asset.type}
                    </span>
                  </div>
                  <div className="font-mono font-semibold text-[13px] text-foreground">{asset.symbol.replace('-USD', '').replace('=X', '')}</div>
                  <div className="text-[10px] text-muted-foreground truncate max-w-[80px]">{asset.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && results.length === 0 && !isSearching && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}