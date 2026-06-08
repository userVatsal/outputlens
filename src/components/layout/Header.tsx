import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, History, Bookmark, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { RiskAlertBell } from '@/components/RiskAlertBell';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navLinks = [
  { href: '/workspace',   label: 'Workspace'   },
  { href: '/methodology', label: 'Methodology' },
  { href: '/pricing',     label: 'Pricing'     },
  { href: '/about',       label: 'About'       },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => { await supabase.auth.signOut(); navigate('/'); };
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'U';

  return (
    <header className="sticky top-0 z-50 glass-header">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
              <span className="text-primary text-xs font-bold tabular">OL</span>
            </div>
            <span className="font-brand font-bold tracking-tight select-none">
              <span className="text-logo-navy">Output</span><span className="text-logo-blue">Lens</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <RiskAlertBell />
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">
                  Dashboard
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-elevated border-border">
                    <DropdownMenuItem asChild><Link to="/dashboard" className="flex items-center gap-2"><Home className="h-4 w-4" /> Dashboard</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/tracked-assets" className="flex items-center gap-2"><Bookmark className="h-4 w-4" /> Tracked Assets</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/history" className="flex items-center gap-2"><History className="h-4 w-4" /> History</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/account" className="flex items-center gap-2"><User className="h-4 w-4" /> Account</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive focus:text-destructive">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">
                  Sign in
                </Link>
                <Link to="/auth?mode=signup" className="btn-primary text-sm py-2 px-4">
                  Analyse a Position Free
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-1 mb-4">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-md text-sm font-medium ${
                    location.pathname === link.href
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"><Home className="h-4 w-4" /> Dashboard</Link>
                  <Link to="/tracked-assets" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"><Bookmark className="h-4 w-4" /> Tracked Assets</Link>
                  <Link to="/history" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"><History className="h-4 w-4" /> History</Link>
                  <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"><User className="h-4 w-4" /> Account</Link>
                  <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 text-sm text-destructive"><LogOut className="h-4 w-4" /> Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm text-muted-foreground text-center">Sign in</Link>
                  <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)} className="btn-primary text-sm py-2.5">
                    Analyse a Position Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}