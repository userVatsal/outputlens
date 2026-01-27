import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { BrandLogo } from '@/components/BrandLogo';

export function Header() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
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

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="section-container">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <BrandLogo size="md" />
          </Link>

          {/* Desktop Navigation - Minimal */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/decisions" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Decisions
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/account" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Account
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-2">
              {user ? (
                <>
                  <Button variant="ghost" size="sm" asChild className="justify-start">
                    <Link to="/decisions" onClick={() => setMobileMenuOpen(false)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Decisions
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="justify-start">
                    <Link to="/account" onClick={() => setMobileMenuOpen(false)}>
                      <User className="h-4 w-4 mr-2" />
                      Account
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button size="sm" asChild>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
