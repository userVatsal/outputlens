import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AppSidebar } from './AppSidebar';
import { AppTopBar } from './AppTopBar';
import { AIFeedPanel } from './AIFeedPanel';

interface AppShellProps {
  children: ReactNode;
  requireAuth?: boolean; // when false, allows guest access (e.g. /workspace guest mode)
}

export function AppShell({ children, requireAuth = true }: AppShellProps) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(!requireAuth);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('ol_sidebar_collapsed') === '1';
  });
  const [feedCollapsed, setFeedCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('ol_feed_collapsed') === '1';
  });

  useEffect(() => {
    localStorage.setItem('ol_sidebar_collapsed', sidebarCollapsed ? '1' : '0');
  }, [sidebarCollapsed]);
  useEffect(() => {
    localStorage.setItem('ol_feed_collapsed', feedCollapsed ? '1' : '0');
  }, [feedCollapsed]);

  useEffect(() => {
    if (!requireAuth) return;
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (!session) { navigate('/auth'); return; }
      setReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) navigate('/');
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [navigate, requireAuth]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const sidebarWidth = sidebarCollapsed ? 64 : 240;
  const feedWidth = feedCollapsed ? 0 : 320;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
      <AppTopBar sidebarWidth={sidebarWidth} />
      <AIFeedPanel collapsed={feedCollapsed} onToggle={() => setFeedCollapsed(c => !c)} />

      <main
        className="min-h-screen pt-14 transition-[padding] duration-200"
        style={{
          paddingLeft: sidebarWidth,
          paddingRight: feedWidth,
        }}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}