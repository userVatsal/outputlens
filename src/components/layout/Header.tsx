import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Languages, History, Bookmark, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useLanguage } from '@/contexts/LanguageContext';
import { BrandLogo } from '@/components/BrandLogo';
import { RiskAlertBell } from '@/components/RiskAlertBell';

const navLinks = [
  { href: '/#demo', labelKey: 'demo' },
  { href: '/workspace', labelKey: 'workspace' },
  { href: '/methodology', labelKey: 'methodology' },
  { href: '/pricing', labelKey: 'pricing' },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
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
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <BrandLogo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          {/* Language Toggle & Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  <span className="text-xs font-medium">{language === 'en-US' ? '🇺🇸 US' : '🇬🇧 UK'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border z-50">
                <DropdownMenuItem 
                  onClick={() => setLanguage('en-US')}
                  className={language === 'en-US' ? 'bg-muted' : ''}
                >
                  <span className="mr-2">🇺🇸</span> US English
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('en-GB')}
                  className={language === 'en-GB' ? 'bg-muted' : ''}
                >
                  <span className="mr-2">🇬🇧</span> UK English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <>
                <RiskAlertBell />
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/tracked-assets" className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4" />
                    Tracked
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/history" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    History
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
                  {t('signOut')}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">{t('signIn')}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/auth?mode=signup">{t('getStarted')}</Link>
                </Button>
              </>
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
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.href
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
              
              {/* Language Toggle for Mobile */}
              <div className="flex items-center gap-2 py-2">
                <Languages className="h-4 w-4 text-muted-foreground" />
                <button
                  onClick={() => setLanguage(language === 'en-US' ? 'en-GB' : 'en-US')}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {language === 'en-US' ? '🇺🇸 US English' : '🇬🇧 UK English'}
                </button>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {user ? (
                  <>
                    <Button variant="ghost" size="sm" asChild className="justify-start">
                      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Home className="h-4 w-4 mr-2" />
                        Home
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="justify-start">
                      <Link to="/tracked-assets" onClick={() => setMobileMenuOpen(false)}>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Tracked Assets
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="justify-start">
                      <Link to="/history" onClick={() => setMobileMenuOpen(false)}>
                        <History className="h-4 w-4 mr-2" />
                        History
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
                      {t('signOut')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                        {t('signIn')}
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                        {t('getStarted')}
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
