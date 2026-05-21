import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Unread = read_at is null AND dismissed_at is null
export function useAlertsCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { if (active) setCount(0); return; }
      const { count: c } = await supabase
        .from('risk_alerts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .is('read_at', null)
        .is('dismissed_at', null);
      if (active) setCount(c || 0);
    };
    load();
    const channel = supabase
      .channel('risk-alerts-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'risk_alerts' }, load)
      .subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, []);

  return count;
}