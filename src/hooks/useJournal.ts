import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface JournalEntry {
  id: string;
  user_id: string;
  asset: string;
  market: string;
  direction: 'long' | 'short';
  entry_price: number;
  position_size: number | null;
  position_size_type: string | null;
  entry_date: string;
  exit_date: string | null;
  exit_price: number | null;
  status: 'open' | 'closed' | 'cancelled';
  var95_at_entry: number | null;
  win_prob_at_entry: number | null;
  expected_return_at_entry: number | null;
  risk_score_at_entry: number | null;
  regime_at_entry: string | null;
  actual_return_pct: number | null;
  actual_pnl: number | null;
  thesis: string | null;
  notes: string | null;
  analysis_id: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface NewJournalEntry {
  asset: string;
  market?: string;
  direction: 'long' | 'short';
  entry_price: number;
  position_size?: number | null;
  entry_date?: string;
  thesis?: string | null;
  var95_at_entry?: number | null;
  win_prob_at_entry?: number | null;
  expected_return_at_entry?: number | null;
  risk_score_at_entry?: number | null;
  regime_at_entry?: string | null;
  analysis_id?: string | null;
}

export interface JournalStats {
  totalTrades: number;
  winRate: number;       // 0..1
  avgWin: number;        // % positive
  avgLoss: number;       // % negative (negative number)
  modelAccuracy: number; // 0..1 — share of trades within VaR bounds
  expectancy: number;    // % per trade
  totalPnL: number;      // sum of actual_pnl ($)
  wins: number;
  losses: number;
  bestTrade: JournalEntry | null;
  worstTrade: JournalEntry | null;
}

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchEntries = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setEntries([]);
        setIsLoading(false);
        return;
      }
      const { data, error } = await (supabase as any)
        .from('journal_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .order('entry_date', { ascending: false });
      if (error) throw error;
      setEntries((data as JournalEntry[]) || []);
    } catch (err) {
      console.error('Error fetching journal:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => fetchEntries());
    return () => subscription.unsubscribe();
  }, [fetchEntries]);

  const addEntry = async (input: NewJournalEntry): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: 'Sign in required', variant: 'destructive' });
        return false;
      }
      const row = {
        user_id: session.user.id,
        asset: input.asset.toUpperCase(),
        market: input.market || 'US',
        direction: input.direction,
        entry_price: input.entry_price,
        position_size: input.position_size ?? null,
        position_size_type: 'dollars',
        entry_date: input.entry_date || new Date().toISOString(),
        status: 'open',
        thesis: input.thesis ?? null,
        var95_at_entry: input.var95_at_entry ?? null,
        win_prob_at_entry: input.win_prob_at_entry ?? null,
        expected_return_at_entry: input.expected_return_at_entry ?? null,
        risk_score_at_entry: input.risk_score_at_entry ?? null,
        regime_at_entry: input.regime_at_entry ?? null,
        analysis_id: input.analysis_id ?? null,
      };
      const { error } = await (supabase as any).from('journal_entries').insert(row);
      if (error) throw error;
      toast({ title: 'Trade logged', description: `${row.asset} ${row.direction.toUpperCase()} added to journal.` });
      await fetchEntries();
      return true;
    } catch (err) {
      console.error('addEntry failed', err);
      toast({ title: 'Could not log trade', variant: 'destructive' });
      return false;
    }
  };

  const closeEntry = async (id: string, exitPrice: number, exitDate: string, notes?: string): Promise<boolean> => {
    try {
      const entry = entries.find(e => e.id === id);
      if (!entry) return false;
      const dirMult = entry.direction === 'short' ? -1 : 1;
      const actualReturnPct = ((exitPrice - entry.entry_price) / entry.entry_price) * 100 * dirMult;
      const actualPnl = entry.position_size != null
        ? entry.position_size * (actualReturnPct / 100)
        : null;
      const { error } = await (supabase as any)
        .from('journal_entries')
        .update({
          exit_price: exitPrice,
          exit_date: exitDate,
          status: 'closed',
          actual_return_pct: actualReturnPct,
          actual_pnl: actualPnl,
          notes: notes ?? entry.notes,
        })
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Trade closed', description: `${entry.asset} closed at ${exitPrice}.` });
      await fetchEntries();
      return true;
    } catch (err) {
      console.error('closeEntry failed', err);
      toast({ title: 'Could not close trade', variant: 'destructive' });
      return false;
    }
  };

  const deleteEntry = async (id: string): Promise<boolean> => {
    try {
      const { error } = await (supabase as any).from('journal_entries').delete().eq('id', id);
      if (error) throw error;
      await fetchEntries();
      return true;
    } catch (err) {
      console.error('deleteEntry failed', err);
      return false;
    }
  };

  const openEntries = useMemo(() => entries.filter(e => e.status === 'open'), [entries]);
  const closedEntries = useMemo(() => entries.filter(e => e.status === 'closed'), [entries]);

  const stats: JournalStats = useMemo(() => {
    const closed = closedEntries.filter(e => e.actual_return_pct != null);
    const total = closed.length;
    const wins = closed.filter(e => (e.actual_return_pct ?? 0) > 0);
    const losses = closed.filter(e => (e.actual_return_pct ?? 0) <= 0);
    const winRate = total > 0 ? wins.length / total : 0;
    const avgWin = wins.length > 0
      ? wins.reduce((s, e) => s + (e.actual_return_pct ?? 0), 0) / wins.length
      : 0;
    const avgLoss = losses.length > 0
      ? losses.reduce((s, e) => s + (e.actual_return_pct ?? 0), 0) / losses.length
      : 0;
    const withinVar = closed.filter(e => {
      if (e.var95_at_entry == null) return false;
      // var95_at_entry stored as % (e.g. -8 means -8%). Use absolute bound.
      const bound = -Math.abs(e.var95_at_entry);
      return (e.actual_return_pct ?? 0) >= bound;
    });
    const modelAccuracy = total > 0 ? withinVar.length / total : 0;
    const expectancy = (winRate * avgWin) + ((1 - winRate) * avgLoss);
    const totalPnL = closed.reduce((s, e) => s + (e.actual_pnl ?? 0), 0);
    const best = closed.reduce<JournalEntry | null>((b, e) =>
      (!b || (e.actual_return_pct ?? -Infinity) > (b.actual_return_pct ?? -Infinity)) ? e : b, null);
    const worst = closed.reduce<JournalEntry | null>((w, e) =>
      (!w || (e.actual_return_pct ?? Infinity) < (w.actual_return_pct ?? Infinity)) ? e : w, null);
    return {
      totalTrades: total,
      winRate,
      avgWin,
      avgLoss,
      modelAccuracy,
      expectancy,
      totalPnL,
      wins: wins.length,
      losses: losses.length,
      bestTrade: best,
      worstTrade: worst,
    };
  }, [closedEntries]);

  return {
    entries, openEntries, closedEntries, isLoading,
    addEntry, closeEntry, deleteEntry, stats, refresh: fetchEntries,
  };
}