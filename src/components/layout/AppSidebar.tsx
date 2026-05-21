import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Sparkles, LayoutGrid, Briefcase, History, Star,
  Radio, Bell, Grid3x3, Calculator, Network, Wand2,
  Flame, ArrowUpRight, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { useStreak } from '@/hooks/useStreak';
import { useAlertsCount } from '@/hooks/useAlertsCount';
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
      { to: '/workspace?tool=var',         label: 'VaR Calculator',    icon: Calculator },
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

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col fixed top-0 left-0 h-screen z-40 border-r border-border/60 bg-surface transition-[width] duration-200',
        collapsed ? 'w-[64px]' : 'w-[240px]',
      )}
    >
      {/* Brand */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-border/60">
        <Link to="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: 'hsl(var(--primary) / 0.12)' }}
          >
            <span className="font-display font-bold text-sm" style={{ color: 'hsl(var(--primary))' }}>O</span>
          </div>
          {!collapsed && <span className="font-display font-bold tracking-tight text-foreground">OutputLens</span>}
        </Link>
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Primary CTA */}
      <div className="px-3 pt-3">
        <Link
          to="/workspace"
          className={cn(
            'flex items-center gap-2 rounded-md font-semibold text-sm transition-all',
            collapsed ? 'h-10 justify-center' : 'h-10 px-3',
          )}
          style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
        >
          <Sparkles className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>New Simulation</span>}
        </Link>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-5">
        {groups.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-5 mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
                {group.label}
              </div>
            )}
            <ul className="space-y-0.5 px-2">
              {group.items.map(item => {
                const Icon = item.icon;
                const active = pathname === item.to.split('?')[0];
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'relative flex items-center gap-3 h-9 rounded-md text-sm transition-colors',
                        collapsed ? 'justify-center px-0' : 'px-3',
                        active
                          ? 'bg-elevated text-foreground font-medium'
                          : 'text-muted-foreground hover:bg-elevated/50 hover:text-foreground',
                      )}
                    >
                      {active && (
                        <span
                          aria-hidden
                          className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r"
                          style={{ background: 'hsl(var(--primary))' }}
                        />
                      )}
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {!collapsed && item.live && (
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
                          style={{ background: 'hsl(var(--primary))' }}
                        />
                      )}
                      {!collapsed && item.alerts && alertsCount > 0 && (
                        <span
                          className="text-[10px] font-mono font-semibold px-1.5 rounded-full leading-4"
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
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer: streak + upgrade */}
      <div className="border-t border-border/60 px-3 py-3 space-y-2">
        <div
          className={cn(
            'flex items-center rounded-md bg-elevated/50 border border-border/60',
            collapsed ? 'h-9 justify-center' : 'h-9 px-3 gap-2',
          )}
          title={`${streak}-day analysis streak`}
        >
          <Flame className="h-4 w-4 text-caution flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="font-mono text-sm text-foreground tabular-nums">{streak}</span>
              <span className="text-xs text-muted-foreground">day streak</span>
            </>
          )}
        </div>
        <Link
          to="/pricing"
          className={cn(
            'flex items-center rounded-md text-xs text-muted-foreground hover:text-foreground transition-colors',
            collapsed ? 'h-9 justify-center' : 'h-9 px-3 gap-2',
          )}
        >
          <ArrowUpRight className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Upgrade to Desk</span>}
        </Link>
      </div>
    </aside>
  );
}