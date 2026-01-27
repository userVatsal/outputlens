import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Market } from '@/types/trade';

export interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
  displaySymbol: string;
}

export interface SelectedAsset {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

interface UseAssetSearchOptions {
  debounceMs?: number;
  minChars?: number;
  limit?: number;
}

interface UseAssetSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isSearching: boolean;
  error: string | null;
  selectedAsset: SelectedAsset | null;
  selectAsset: (asset: SearchResult) => void;
  clearSelection: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function useAssetSearch(
  market: Market,
  options: UseAssetSearchOptions = {}
): UseAssetSearchReturn {
  const { debounceMs = 300, minChars = 1, limit = 8 } = options;
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchAssets = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minChars) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsSearching(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('search-symbols', {
        body: { query: searchQuery, market, limit }
      });

      if (fnError) {
        throw fnError;
      }

      if (data?.results && Array.isArray(data.results)) {
        setResults(data.results);
        setError(null); // Clear any previous error on success
        setIsOpen(data.results.length > 0);
      } else {
        setResults([]);
        setError(null); // Clear error even if no results
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return; // Ignore abort errors
      }
      console.error('Asset search error:', err);
      setError('Search failed. Try again.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [market, minChars, limit]);

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query || query.length < minChars) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      searchAssets(query);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchAssets, debounceMs, minChars]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const selectAsset = useCallback((asset: SearchResult) => {
    setSelectedAsset({
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type,
      exchange: asset.exchange,
    });
    setQuery(asset.name);
    setResults([]);
    setIsOpen(false);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedAsset(null);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }, []);

  // Clear selection when market changes
  useEffect(() => {
    clearSelection();
  }, [market, clearSelection]);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    selectedAsset,
    selectAsset,
    clearSelection,
    isOpen,
    setIsOpen,
  };
}