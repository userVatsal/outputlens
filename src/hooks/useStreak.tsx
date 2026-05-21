import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Computes consecutive-day analysis streak from analysis_history.
// A day counts if user ran ≥1 analysis (UTC days). Streak = days back from today/yesterday.
export function useStreak() {
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      const { data } = await supabase
        .from('analysis_history')
        .select('created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(120);
      if (!active) return;
      const days = new Set<string>((data || []).map(r => new Date(r.created_at).toISOString().slice(0, 10)));
      let count = 0;
      const today = new Date();
      // allow today OR yesterday as anchor (so morning users don't lose streak)
      const cursor = new Date(today);
      if (!days.has(today.toISOString().slice(0, 10))) cursor.setUTCDate(cursor.getUTCDate() - 1);
      while (days.has(cursor.toISOString().slice(0, 10))) {
        count++;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      }
      setStreak(count);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return { streak, loading };
}