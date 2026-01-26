import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EnhancedTradeAnalysis } from '@/types/analysis';

export interface TrackedAsset {
  id: string;
  user_id: string;
  symbol: string;
  asset_name: string | null;
  market: string;
  direction: string;
  entry_price: number;
  position_size: number | null;
  position_type: string | null;
  track_frequency: 'daily' | 'weekly' | 'monthly';
  alert_on_risk_change: boolean;
  risk_threshold_delta: number;
  risk_score_at_track: number | null;
  win_prob_at_track: number | null;
  var95_at_track: number | null;
  tail_risk_at_track: number | null;
  current_risk_score: number | null;
  current_win_prob: number | null;
  current_var95: number | null;
  current_tail_risk: number | null;
  last_analysis_at: string | null;
  risk_delta: number | null;
  status: 'active' | 'paused' | 'closed';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RiskAlert {
  id: string;
  user_id: string;
  tracked_asset_id: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical';
  previous_value: number | null;
  current_value: number | null;
  delta: number | null;
  message: string;
  read_at: string | null;
  dismissed_at: string | null;
  created_at: string;
}

export interface TrackAssetInput {
  analysis: EnhancedTradeAnalysis;
  frequency: 'daily' | 'weekly' | 'monthly';
  thresholdDelta: number;
  alertOnChange: boolean;
  notes?: string;
}

// Helper to make typed queries until types are regenerated
async function queryTable<T>(
  tableName: string, 
  query: { 
    select?: string;
    eq?: [string, string | number | boolean][];
    is?: [string, null][];
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
    
    if (query.is) {
      for (const [col, val] of query.is) {
        builder = builder.is(col, val);
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

async function insertRow<T>(tableName: string, row: Partial<T>, options?: { onConflict?: string }): Promise<{ error: Error | null }> {
  try {
    let builder = (supabase as any).from(tableName);
    if (options?.onConflict) {
      builder = builder.upsert(row, { onConflict: options.onConflict, ignoreDuplicates: false });
    } else {
      builder = builder.insert(row);
    }
    const result = await builder;
    return { error: result.error };
  } catch (err) {
    return { error: err as Error };
  }
}

async function updateRow(tableName: string, id: string, updates: Record<string, unknown>): Promise<{ error: Error | null }> {
  try {
    const result = await (supabase as any).from(tableName).update(updates).eq('id', id);
    return { error: result.error };
  } catch (err) {
    return { error: err as Error };
  }
}

async function deleteRow(tableName: string, id: string): Promise<{ error: Error | null }> {
  try {
    const result = await (supabase as any).from(tableName).delete().eq('id', id);
    return { error: result.error };
  } catch (err) {
    return { error: err as Error };
  }
}

export function useTrackedAssets() {
  const [trackedAssets, setTrackedAssets] = useState<TrackedAsset[]>([]);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const { toast } = useToast();

  const fetchTrackedAssets = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setTrackedAssets([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await queryTable<TrackedAsset>('tracked_assets', {
        select: '*',
        eq: [['user_id', session.user.id]],
        order: ['created_at', { ascending: false }],
      });

      if (error) throw error;
      setTrackedAssets(data || []);
    } catch (err) {
      console.error('Error fetching tracked assets:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAlerts([]);
        return;
      }

      const { data, error } = await queryTable<RiskAlert>('risk_alerts', {
        select: '*',
        eq: [['user_id', session.user.id]],
        is: [['dismissed_at', null]],
        order: ['created_at', { ascending: false }],
        limit: 50,
      });

      if (error) throw error;
      setAlerts(data || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  }, []);

  useEffect(() => {
    fetchTrackedAssets();
    fetchAlerts();

    // Subscribe to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchTrackedAssets();
      fetchAlerts();
    });

    return () => subscription.unsubscribe();
  }, [fetchTrackedAssets, fetchAlerts]);

  const trackAsset = async (input: TrackAssetInput): Promise<boolean> => {
    setIsTracking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Sign in required",
          description: "Please sign in to track assets.",
          variant: "destructive",
        });
        return false;
      }

      const { analysis, frequency, thresholdDelta, alertOnChange, notes } = input;

      const trackedAsset = {
        user_id: session.user.id,
        symbol: analysis.input.asset,
        asset_name: analysis.input.assetName || null,
        market: analysis.input.market,
        direction: analysis.input.direction,
        entry_price: analysis.input.entryPrice,
        position_size: analysis.input.positionSize || null,
        position_type: analysis.input.positionType || null,
        track_frequency: frequency,
        alert_on_risk_change: alertOnChange,
        risk_threshold_delta: thresholdDelta,
        risk_score_at_track: analysis.riskMetrics.riskScore,
        win_prob_at_track: analysis.riskMetrics.probabilityOfProfit,
        var95_at_track: analysis.riskMetrics.valueAtRisk95,
        tail_risk_at_track: analysis.riskMetrics.expectedShortfall,
        current_risk_score: analysis.riskMetrics.riskScore,
        current_win_prob: analysis.riskMetrics.probabilityOfProfit,
        current_var95: analysis.riskMetrics.valueAtRisk95,
        current_tail_risk: analysis.riskMetrics.expectedShortfall,
        last_analysis_at: new Date().toISOString(),
        risk_delta: 0,
        status: 'active' as const,
        notes: notes || null,
      };

      const { error } = await insertRow<TrackedAsset>('tracked_assets', trackedAsset, {
        onConflict: 'user_id,symbol,market',
      });

      if (error) throw error;

      toast({
        title: "Asset Tracked",
        description: `Now monitoring ${analysis.input.asset} ${frequency}.`,
      });

      await fetchTrackedAssets();
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error tracking asset:', err);
      toast({
        title: "Tracking Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsTracking(false);
    }
  };

  const untrackAsset = async (id: string): Promise<boolean> => {
    try {
      const { error } = await deleteRow('tracked_assets', id);

      if (error) throw error;

      toast({
        title: "Asset Untracked",
        description: "Risk monitoring stopped for this asset.",
      });

      await fetchTrackedAssets();
      return true;
    } catch (err) {
      console.error('Error untracking asset:', err);
      return false;
    }
  };

  const updateTrackSettings = async (
    id: string, 
    settings: Partial<Pick<TrackedAsset, 'track_frequency' | 'risk_threshold_delta' | 'alert_on_risk_change' | 'status' | 'notes'>>
  ): Promise<boolean> => {
    try {
      const { error } = await updateRow('tracked_assets', id, {
        ...settings,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      await fetchTrackedAssets();
      return true;
    } catch (err) {
      console.error('Error updating track settings:', err);
      return false;
    }
  };

  const markAlertRead = async (alertId: string): Promise<void> => {
    try {
      await updateRow('risk_alerts', alertId, { read_at: new Date().toISOString() });
      await fetchAlerts();
    } catch (err) {
      console.error('Error marking alert read:', err);
    }
  };

  const dismissAlert = async (alertId: string): Promise<void> => {
    try {
      await updateRow('risk_alerts', alertId, { dismissed_at: new Date().toISOString() });
      await fetchAlerts();
    } catch (err) {
      console.error('Error dismissing alert:', err);
    }
  };

  const isAssetTracked = useCallback((symbol: string, market: string): TrackedAsset | undefined => {
    return trackedAssets.find(
      asset => asset.symbol === symbol && asset.market === market && asset.status === 'active'
    );
  }, [trackedAssets]);

  const unreadAlertCount = alerts.filter(a => !a.read_at).length;

  return {
    trackedAssets,
    alerts,
    unreadAlertCount,
    isLoading,
    isTracking,
    trackAsset,
    untrackAsset,
    updateTrackSettings,
    markAlertRead,
    dismissAlert,
    isAssetTracked,
    refresh: () => {
      fetchTrackedAssets();
      fetchAlerts();
    },
  };
}
