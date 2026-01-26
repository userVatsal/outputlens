import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SavedPortfolio {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  time_horizon: string;
  is_default: boolean;
  last_analyzed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioAssetRow {
  id: string;
  portfolio_id: string;
  user_id: string;
  symbol: string;
  asset_name: string | null;
  market: string;
  direction: string;
  weight: number;
  entry_price: number | null;
  created_at: string;
}

export interface AddAssetInput {
  symbol: string;
  assetName?: string;
  market: string;
  direction: string;
  weight: number;
  entryPrice?: number;
}

// Helper functions for typed queries until types are regenerated
async function queryTable<T>(
  tableName: string,
  query: {
    select?: string;
    eq?: [string, string | number | boolean][];
    order?: [string, { ascending: boolean }];
    limit?: number;
  }
): Promise<{ data: T[] | null; error: Error | null }> {
  try {
    let builder = (supabase as any).from(tableName).select(query.select || '*');

    if (query.eq) {
      for (const [col, val] of query.eq) {
        builder = builder.eq(col, val);
      }
    }

    if (query.order) {
      builder = builder.order(query.order[0], query.order[1]);
    }

    if (query.limit) {
      builder = builder.limit(query.limit);
    }

    const result = await builder;
    return { data: result.data as T[], error: result.error };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

async function insertRow<T>(
  tableName: string,
  row: Partial<T>,
  options?: { returning?: boolean; onConflict?: string }
): Promise<{ data: T | null; error: Error | null }> {
  try {
    let builder = (supabase as any).from(tableName);

    if (options?.onConflict) {
      builder = builder.upsert(row, { onConflict: options.onConflict, ignoreDuplicates: false });
    } else {
      builder = builder.insert(row);
    }

    if (options?.returning !== false) {
      builder = builder.select().single();
    }

    const result = await builder;
    return { data: result.data as T, error: result.error };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

async function updateRow(
  tableName: string,
  id: string,
  updates: Record<string, unknown>
): Promise<{ error: Error | null }> {
  try {
    const result = await (supabase as any).from(tableName).update(updates).eq('id', id);
    return { error: result.error };
  } catch (err) {
    return { error: err as Error };
  }
}

async function deleteRow(
  tableName: string,
  id: string
): Promise<{ error: Error | null }> {
  try {
    const result = await (supabase as any).from(tableName).delete().eq('id', id);
    return { error: result.error };
  } catch (err) {
    return { error: err as Error };
  }
}

export function useSavedPortfolios() {
  const [portfolios, setPortfolios] = useState<SavedPortfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchPortfolios = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setPortfolios([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await queryTable<SavedPortfolio>('saved_portfolios', {
        select: '*',
        eq: [['user_id', session.user.id]],
        order: ['created_at', { ascending: false }],
      });

      if (error) throw error;
      setPortfolios(data || []);
    } catch (err) {
      console.error('Error fetching portfolios:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolios();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchPortfolios();
    });

    return () => subscription.unsubscribe();
  }, [fetchPortfolios]);

  const createPortfolio = async (
    name: string,
    description?: string,
    timeHorizon?: string
  ): Promise<SavedPortfolio | null> => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to create portfolios.',
          variant: 'destructive',
        });
        return null;
      }

      const { data, error } = await insertRow<SavedPortfolio>('saved_portfolios', {
        user_id: session.user.id,
        name,
        description: description || null,
        time_horizon: timeHorizon || '3-7 days',
      }, { returning: true });

      if (error) throw error;

      toast({
        title: 'Portfolio Created',
        description: `"${name}" has been created.`,
      });

      await fetchPortfolios();
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error creating portfolio:', err);
      toast({
        title: 'Creation Failed',
        description: errorMessage.includes('duplicate') 
          ? 'A portfolio with this name already exists.' 
          : errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const addAssetToPortfolio = async (
    portfolioId: string,
    asset: AddAssetInput
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to add assets.',
          variant: 'destructive',
        });
        return false;
      }

      const { error } = await insertRow<PortfolioAssetRow>('portfolio_assets', {
        portfolio_id: portfolioId,
        user_id: session.user.id,
        symbol: asset.symbol,
        asset_name: asset.assetName || null,
        market: asset.market,
        direction: asset.direction,
        weight: asset.weight,
        entry_price: asset.entryPrice || null,
      }, { onConflict: 'portfolio_id,symbol,market' });

      if (error) throw error;

      toast({
        title: 'Asset Added',
        description: `${asset.symbol} added to portfolio.`,
      });

      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error adding asset:', err);
      toast({
        title: 'Failed to Add Asset',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const getPortfolioAssets = async (portfolioId: string): Promise<PortfolioAssetRow[]> => {
    try {
      const { data, error } = await queryTable<PortfolioAssetRow>('portfolio_assets', {
        select: '*',
        eq: [['portfolio_id', portfolioId]],
        order: ['created_at', { ascending: true }],
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching portfolio assets:', err);
      return [];
    }
  };

  const removeAssetFromPortfolio = async (assetId: string): Promise<boolean> => {
    try {
      const { error } = await deleteRow('portfolio_assets', assetId);
      if (error) throw error;

      toast({
        title: 'Asset Removed',
        description: 'Asset removed from portfolio.',
      });
      return true;
    } catch (err) {
      console.error('Error removing asset:', err);
      return false;
    }
  };

  const updateAssetWeight = async (assetId: string, weight: number): Promise<boolean> => {
    try {
      const { error } = await updateRow('portfolio_assets', assetId, { weight });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error updating weight:', err);
      return false;
    }
  };

  const deletePortfolio = async (id: string): Promise<boolean> => {
    try {
      const { error } = await deleteRow('saved_portfolios', id);
      if (error) throw error;

      toast({
        title: 'Portfolio Deleted',
        description: 'Portfolio and all assets removed.',
      });

      await fetchPortfolios();
      return true;
    } catch (err) {
      console.error('Error deleting portfolio:', err);
      return false;
    }
  };

  const updatePortfolio = async (
    id: string,
    updates: Partial<Pick<SavedPortfolio, 'name' | 'description' | 'time_horizon' | 'is_default'>>
  ): Promise<boolean> => {
    try {
      const { error } = await updateRow('saved_portfolios', id, updates);
      if (error) throw error;

      await fetchPortfolios();
      return true;
    } catch (err) {
      console.error('Error updating portfolio:', err);
      return false;
    }
  };

  return {
    portfolios,
    isLoading,
    isSaving,
    createPortfolio,
    addAssetToPortfolio,
    getPortfolioAssets,
    removeAssetFromPortfolio,
    updateAssetWeight,
    deletePortfolio,
    updatePortfolio,
    refresh: fetchPortfolios,
  };
}
