import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Sparkles, LayoutGrid, Briefcase, History, Star,
  Radio, Bell, Grid3x3, Calculator, Network, Wand2,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { useStreak } from '@/hooks/useStreak';
import { useAlertsCount } from '@/hooks/useAlertsCount';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';

const groups = [
  {
    label: 'Workspace',
    items: [
      { to: '/dashboard',       label: 'Dashboard',          icon: LayoutGrid },
      { to: '/portfolio',       label: 'My Portfolios',      icon: Briefcase },
      { to: '/history',         label: 'Simulation History', icon: History },
      { to: '/scenarios',       label: 'Saved Scenarios',    icon: Star },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/regime', label: 'Regime Monitor', icon: Radio,    live: true },
      { to: '/alerts', label: 'Risk Alerts',    icon: Bell,     alerts: true },
      { to: '/tracked-assets', label: 'Market Heatmap', icon: Grid3x3 },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/var',                        label: 'VaR Calculator',    icon: Calculator },
      { to: '/workspace?tool=correlation', label: 'Correlation Matrix', icon: Network },
      { to: '/scenarios?new=1',            label: 'Scenario Builder',   icon: Wand2 },
    ],
  },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: Props) {
  const { pathname } = useLocation();
  const { streak } = useStreak();
  const alertsCount = useAlertsCount();
  const { profile } = useProfile();
  const displayName = profile?.display_name || profile?.full_name || 'Account';
  const initials = displayName.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col fixed top-0 left-0 h-screen z-40 border-r border-border/40 bg-surface transition-[width] duration-200',
        collapsed ? 'w-[60px]' : 'w-[248px]',
      )}
    >
      {/* Brand */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-border/40">
        <Link to="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: 'hsl(var(--primary) / 0.10)' }}
          >
            <span className="font-display font-bold text-[15px]" style={{ color: 'hsl(var(--primary))' }}>O</span>
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-[15px] tracking-tight">
              <span className="text-foreground">Output</span><span className="text-primary">Lens</span>
            </span>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
        {collapsed && (
          <button
            onClick={onToggle}
            aria-label="Expand sidebar"
            className="absolute top-3 right-1 text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Primary CTA */}
      <div className="px-3 pt-3">
        <Link
          to="/workspace"
          title={collapsed ? 'New Simulation' : undefined}
          className={cn(
            'w-full flex items-center gap-2 rounded-xl border border-primary/20 text-primary font-semibold text-[13px] hover:bg-primary/15 transition-all h-10',
            collapsed ? 'justify-center' : 'px-3',
          )}
          style={{ backgroundColor: 'hsl(var(--primary) / 0.10)' }}
        >
          <Sparkles className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>New Simulation</span>}
        </Link>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto pb-4 pt-2">
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-4 mb-1 mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
                {group.label}
              </div>
            )}
            {collapsed && <div className="mt-4" aria-hidden />}
            <ul className="space-y-0.5 px-2">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.to.split('?')[0];
                const isDashboard = item.to === '/dashboard';
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'relative flex items-center h-[38px] rounded-xl text-[13px] transition-colors',
                        collapsed ? 'justify-center px-0' : 'px-3 gap-3',
                        active
                          ? 'bg-elevated text-foreground font-medium'
                          : 'text-muted-foreground hover:bg-elevated/50 hover:text-foreground',
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {!collapsed && isDashboard && streak > 1 && (
                        <span className="flex items-center gap-0.5 text-[11px] font-mono text-caution tabular-nums flex-shrink-0">
                          🔥 {streak}
                        </span>
                      )}
                      {!collapsed && item.live && (
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
                          style={{ background: 'hsl(var(--bullish))', boxShadow: '0 0 6px hsl(var(--bullish))' }}
                        />
                      )}
                      {!collapsed && item.alerts && alertsCount > 0 && (
                        <span
                          className="text-[10px] font-mono font-semibold px-1.5 rounded-full leading-4 flex-shrink-0"
                          style={{ background: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}
                        >
                          {alertsCount}
                        </span>
                      )}
                      {collapsed && item.alerts && alertsCount > 0 && (
                        <span
                          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                          style={{ background: 'hsl(var(--destructive))' }}
                        />
                      )}
                      {collapsed && item.live && (
                        <span
                          className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{ background: 'hsl(var(--bullish))' }}
                        />
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer: account */}
      <div className="mt-auto border-t border-border/40 px-3 py-3">
        <Link
          to="/account"
          title={collapsed ? displayName : undefined}
          className={cn(
            'flex items-center rounded-xl text-[12px] text-muted-foreground hover:text-foreground hover:bg-elevated/50 transition-colors',
            collapsed ? 'h-10 justify-center' : 'h-10 px-2 gap-2',
          )}
        >
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border border-border/60"
            style={{ background: 'hsl(var(--elevated))' }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display font-semibold text-[11px] text-foreground">{initials}</span>
            )}
          </span>
          {!collapsed && <span className="truncate">{displayName}</span>}
        </Link>
      </div>
    </aside>
  );
}
