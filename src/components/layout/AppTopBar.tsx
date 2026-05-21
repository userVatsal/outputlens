import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronRight, LogOut, Settings, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAlertsCount } from '@/hooks/useAlertsCount';
import { useMarketStatus, formatCountdown } from '@/hooks/useMarketStatus';
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';

const POPULAR = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'BTC-USD', 'ETH-USD', 'SPY', 'QQQ'];

const ROUTE_LABEL: Record<string, string> = {
  dashboard: 'Dashboard',
  workspace: 'Simulation',
  portfolio: 'Portfolios',
  history: 'History',
  regime: 'Regime Monitor',
  alerts: 'Risk Alerts',
  scenarios: 'Scenarios',
  'tracked-assets': 'Tracked Assets',
  account: 'Account',
  results: 'Results',
};

function MarketPill() {
  const { state, minutesToOpen } = useMarketStatus();
  const map = {
    open:   { color: 'hsl(var(--bullish))',     label: 'NYSE OPEN' },
    pre:    { color: 'hsl(var(--accent))',      label: 'PRE-MARKET' },
    after:  { color: 'hsl(var(--caution))',     label: 'AFTER HOURS' },
    closed: { color: 'hsl(var(--muted-foreground))', label: 'NYSE CLOSED' },
  }[state];
  return (
    <div className="hidden sm:flex items-center gap-2 px-2.5 h-7 rounded-md bg-elevated/60 border border-border/60 text-[11px] font-medium tracking-wide">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: map.color, boxShadow: `0 0 6px ${map.color}` }} />
      <span className="text-foreground">{map.label}</span>
      {state !== 'open' && minutesToOpen > 0 && (
        <span className="text-muted-foreground font-mono">· opens in {formatCountdown(minutesToOpen)}</span>
      )}
    </div>
  );
}

interface Props {
  sidebarWidth: number;
}

export function AppTopBar({ sidebarWidth }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const alertsCount = useAlertsCount();
  const { profile } = useProfile();
  const [cmdOpen, setCmdOpen] = useState(false);

  // CMD+K to open palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const segments = pathname.split('/').filter(Boolean);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const initials = (profile?.display_name || profile?.full_name || 'U')
    .split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header
      className="fixed top-0 right-0 z-30 h-14 border-b border-border/60 bg-background/80 backdrop-blur-md flex items-center px-4 gap-3"
      style={{ left: sidebarWidth }}
    >
      {/* Breadcrumb */}
      <nav className="hidden md:flex items-center gap-1.5 text-sm min-w-0">
        <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
          OutputLens
        </Link>
        {segments.map((seg, i) => {
          const last = i === segments.length - 1;
          const label = ROUTE_LABEL[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
          return (
            <span key={seg} className="flex items-center gap-1.5 min-w-0">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
              <span className={cn('truncate', last ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                {label}
              </span>
            </span>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* Search trigger */}
      <button
        onClick={() => setCmdOpen(true)}
        className="hidden sm:flex items-center gap-2 h-9 w-[280px] lg:w-[360px] px-3 rounded-md bg-elevated/60 border border-border/60 hover:border-border text-sm text-muted-foreground transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left truncate">Search assets, portfolios, analyses…</span>
        <kbd className="hidden lg:inline font-mono text-[10px] px-1.5 py-0.5 rounded bg-background border border-border">⌘K</kbd>
      </button>

      <MarketPill />

      {/* Alerts bell */}
      <Link
        to="/alerts"
        className="relative flex items-center justify-center w-9 h-9 rounded-md hover:bg-elevated text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Alerts"
      >
        <Bell className="h-4 w-4" />
        {alertsCount > 0 && (
          <span
            className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-mono font-bold leading-4 text-center"
            style={{ background: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}
          >
            {alertsCount > 9 ? '9+' : alertsCount}
          </span>
        )}
      </Link>

      {/* Avatar */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center justify-center w-9 h-9 rounded-full bg-elevated border border-border/60 hover:border-primary/40 transition-colors">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="font-display font-semibold text-xs text-foreground">{initials}</span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild><Link to="/account"><User className="h-4 w-4 mr-2" />Account</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/pricing"><Settings className="h-4 w-4 mr-2" />Plan & Billing</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}><LogOut className="h-4 w-4 mr-2" />Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* CMD+K palette */}
      <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <CommandInput placeholder="Search assets, portfolios, saved analyses…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Quick actions">
            <CommandItem onSelect={() => { setCmdOpen(false); navigate('/workspace'); }}>
              <Sparkles /> New simulation
            </CommandItem>
            <CommandItem onSelect={() => { setCmdOpen(false); navigate('/portfolio'); }}>
              Open portfolio
            </CommandItem>
            <CommandItem onSelect={() => { setCmdOpen(false); navigate('/regime'); }}>
              Regime monitor
            </CommandItem>
            <CommandItem onSelect={() => { setCmdOpen(false); navigate('/alerts'); }}>
              Risk alerts {alertsCount > 0 && `(${alertsCount} unread)`}
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Popular assets">
            {POPULAR.map(sym => (
              <CommandItem key={sym} onSelect={() => { setCmdOpen(false); navigate(`/workspace?asset=${sym}`); }}>
                <span className="font-mono text-xs">{sym}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}

// Sparkles icon import (declared late to keep header readable)
import { Sparkles } from 'lucide-react';