import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlatformStats {
  totalAnalyses: number;
  totalUsers: number;
  analysesToday: number;
  analysesThisWeek: number;
  isLoading: boolean;
  error: string | null;
}

export function usePlatformStats(): PlatformStats {
  const [state, setState] = useState<PlatformStats>({
    totalAnalyses: 0,
    totalUsers: 0,
    analysesToday: 0,
    analysesThisWeek: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await (supabase as any).rpc('get_platform_stats');
        if (cancelled) return;
        if (error) throw error;
        const d = (data ?? {}) as Record<string, number>;
        setState({
          totalAnalyses: Number(d.total_analyses ?? 0),
          totalUsers: Number(d.total_users ?? 0),
          analysesToday: Number(d.analyses_today ?? 0),
          analysesThisWeek: Number(d.analyses_this_week ?? 0),
          isLoading: false,
          error: null,
        });
      } catch (e: any) {
        if (cancelled) return;
        setState((s) => ({ ...s, isLoading: false, error: e?.message ?? 'failed' }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}