import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, History, Bookmark, Home, Bell } from 'lucide-react';
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
import { BrandLogo } from '@/components/BrandLogo';
import { RiskAlertBell } from '@/components/RiskAlertBell';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navLinks = [
  { href: '/workspace', label: 'Workspace' },
  { href: '/methodology', label: 'Methodology' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => { setUser(session?.user ?? null); }
    );
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'U';

  return (
    <header className="sticky top-0 z-50 border-b border-white/10" style={{ backgroundColor: 'hsl(222, 47%, 14%)' }}>
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <BrandLogo size="md" className="text-white [&_.text-logo-navy]:text-white [&_.text-logo-blue]:text-blue-400" />
          </Link>

          {/* Desktop Nav — center */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? 'text-white bg-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <RiskAlertBell />
                <Link
                  to="/dashboard"
                  className="text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5"
                >
                  Dashboard
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white/20">
                      <Avatar className="h-8 w-8 border border-white/20">
                        <AvatarFallback className="text-xs font-semibold" style={{ backgroundColor: 'hsl(225, 83%, 53%)', color: 'white' }}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2">
                        <Home className="h-4 w-4" /> Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/tracked-assets" className="flex items-center gap-2">
                        <Bookmark className="h-4 w-4" /> Tracked Assets
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/history" className="flex items-center gap-2">
                        <History className="h-4 w-4" /> History
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="flex items-center gap-2">
                        <User className="h-4 w-4" /> Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive focus:text-destructive">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="text-sm font-medium text-white/70 hover:text-white transition-colors px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="inline-flex items-center px-4 py-2 rounded text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: 'hsl(225, 83%, 53%)' }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col gap-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                    location.pathname === link.href
                      ? 'text-white bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/8'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white">
                    <Home className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link to="/tracked-assets" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white">
                    <Bookmark className="h-4 w-4" /> Tracked Assets
                  </Link>
                  <Link to="/history" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white">
                    <History className="h-4 w-4" /> History
                  </Link>
                  <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white">
                    <User className="h-4 w-4" /> Account
                  </Link>
                  <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm text-white/70 hover:text-white text-center">
                    Sign In
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded text-sm font-semibold text-white text-center"
                    style={{ backgroundColor: 'hsl(225, 83%, 53%)' }}
                  >
                    Get Started Free
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
