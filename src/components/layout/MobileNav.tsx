import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, Bell, LayoutGrid, Sparkles, Briefcase, MoreHorizontal,
  History, Radio, Star, Network, Wand2, Calculator, Grid3x3, LogOut, User,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAlertsCount } from '@/hooks/useAlertsCount';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';

const MORE = [
  { to: '/history', label: 'Simulation History', icon: History },
  { to: '/scenarios', label: 'Saved Scenarios', icon: Star },
  { to: '/regime', label: 'Regime Monitor', icon: Radio },
  { to: '/tracked-assets', label: 'Market Heatmap', icon: Grid3x3 },
  { to: '/workspace?tool=var', label: 'VaR Calculator', icon: Calculator },
  { to: '/workspace?tool=correlation', label: 'Correlation Matrix', icon: Network },
  { to: '/scenarios?new=1', label: 'Scenario Builder', icon: Wand2 },
  { to: '/account', label: 'Account', icon: User },
];

type Tab = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; alerts?: boolean };
const TABS: Tab[] = [
  { to: '/dashboard', label: 'Home', icon: LayoutGrid },
  { to: '/workspace', label: 'Simulate', icon: Sparkles },
  { to: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { to: '/alerts', label: 'Alerts', icon: Bell, alerts: true },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const alertsCount = useAlertsCount();
  const { profile } = useProfile();

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const initials = (profile?.display_name || profile?.full_name || 'U')
    .split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <>
      {/* Top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-surface border-b border-border flex items-center px-4">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="p-2 -ml-2 text-foreground">
          <Menu className="h-6 w-6" />
        </button>
        <Link to="/dashboard" className="flex-1 text-center font-display text-base font-bold tracking-tight">
          <span className="text-foreground">Output</span><span className="text-primary">Lens</span>
        </Link>
        <Link to="/alerts" className="relative p-2 -mr-2 text-foreground" aria-label="Alerts">
          <Bell className="h-5 w-5" />
          {alertsCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-mono font-bold leading-4 text-center"
              style={{ background: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}
            >{alertsCount > 9 ? '9+' : alertsCount}</span>
          )}
        </Link>
        <Link to="/account" className="ml-1 flex items-center justify-center w-8 h-8 rounded-full bg-elevated border border-border" aria-label="Account">
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            : <span className="font-display font-semibold text-[11px] text-foreground">{initials}</span>}
        </Link>
      </header>

      {/* Slide-down full-screen overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={() => setOpen(false)} />
          <div className="relative bg-surface w-[88%] max-w-[320px] h-full overflow-y-auto animate-slide-up">
            <div className="h-14 flex items-center justify-between px-4 border-b border-border">
              <span className="font-display text-base font-bold tracking-tight">
                <span className="text-foreground">Output</span><span className="text-primary">Lens</span>
              </span>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-2 -mr-2"><X className="h-5 w-5" /></button>
            </div>
            <Link
              to="/workspace"
              className="mx-4 mt-4 flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground font-semibold text-sm min-h-[44px] px-4"
            >
              <Sparkles className="h-4 w-4" /> New Simulation
            </Link>
            <nav className="px-2 mt-4 pb-6">
              {TABS.map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 h-12 rounded-md text-sm transition-colors',
                    isActive ? 'bg-elevated text-foreground font-medium' : 'text-muted-foreground hover:bg-elevated/60 hover:text-foreground',
                  )}
                >
                  <t.icon className="h-4 w-4" /><span>{t.label}</span>
                </NavLink>
              ))}
              <div className="px-3 mt-4 mb-2 text-[10px] font-semibold uppercase text-muted-foreground" style={{ letterSpacing: '0.1em' }}>More</div>
              {MORE.map((m) => (
                <NavLink
                  key={m.to}
                  to={m.to}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 h-12 rounded-md text-sm transition-colors',
                    isActive ? 'bg-elevated text-foreground font-medium' : 'text-muted-foreground hover:bg-elevated/60 hover:text-foreground',
                  )}
                >
                  <m.icon className="h-4 w-4" /><span>{m.label}</span>
                </NavLink>
              ))}
              <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 h-12 rounded-md text-sm text-muted-foreground hover:bg-elevated/60 hover:text-foreground transition-colors mt-2 border-t border-border pt-4">
                <LogOut className="h-4 w-4" /><span>Sign out</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border h-[60px] flex items-stretch"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {TABS.map((t) => {
          const active = pathname.startsWith(t.to);
          return (
            <Link
              key={t.to}
              to={t.to}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] relative',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <t.icon className="h-5 w-5" />
              {active && <span>{t.label}</span>}
              {t.alerts && alertsCount > 0 && (
                <span
                  className="absolute top-2 right-[28%] min-w-[16px] h-4 px-1 rounded-full text-[10px] font-mono font-bold leading-4 text-center"
                  style={{ background: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}
                >{alertsCount > 9 ? '9+' : alertsCount}</span>
              )}
            </Link>
          );
        })}
        <Link
          to="/account"
          className={cn('flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px]', pathname === '/account' ? 'text-primary' : 'text-muted-foreground')}
        >
          <MoreHorizontal className="h-5 w-5" />
          {pathname === '/account' && <span>More</span>}
        </Link>
      </nav>
    </>
  );
}