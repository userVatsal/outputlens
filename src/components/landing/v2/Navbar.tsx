import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 200);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'backdrop-blur-xl bg-background/80 border-b border-border/40'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 h-14 md:h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-lg font-bold tracking-tight flex items-center gap-2">
          <span className="block w-1.5 h-1.5 bg-primary rounded-sm shadow-[0_0_8px_hsl(var(--primary)/0.6)]" aria-hidden />
          <span>
            <span className="text-foreground">Output</span>
            <span className="text-primary">Lens</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <a href="#features" className="px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors no-underline">Features</a>
          <a href="#pricing" className="px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors no-underline">Pricing</a>
          <Link to="/blog" className="px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors no-underline">Blog</Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/auth"
            className="px-4 py-2 text-sm text-foreground/80 hover:text-foreground rounded-lg hover:bg-elevated transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/auth?mode=signup"
            className={`btn-primary inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm px-5 py-2.5 ${scrolled ? 'animate-glow-pulse' : ''}`}
            style={{ boxShadow: '0 0 0 1px hsl(189 100% 50% / 0.2), 0 4px 16px hsl(189 100% 50% / 0.3)' }}
          >
            Start Free →
          </Link>
        </div>

        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="md:hidden p-2 -mr-2 text-foreground"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-50 bg-surface flex flex-col animate-fade-in">
          <div className="h-14 px-6 flex items-center justify-between border-b border-border">
            <Link to="/" onClick={() => setOpen(false)} className="font-display text-lg font-bold flex items-center gap-2">
              <span className="block w-1.5 h-1.5 bg-primary rounded-sm" aria-hidden />
              <span><span className="text-foreground">Output</span><span className="text-primary">Lens</span></span>
            </Link>
            <button aria-label="Close" onClick={() => setOpen(false)} className="p-2 -mr-2"><X className="h-6 w-6" /></button>
          </div>
          <nav className="flex-1 flex flex-col px-6 py-4">
            <a href="#features" onClick={() => setOpen(false)} className="h-12 flex items-center text-foreground border-b border-border">Features</a>
            <a href="#pricing" onClick={() => setOpen(false)} className="h-12 flex items-center text-foreground border-b border-border">Pricing</a>
            <Link to="/blog" onClick={() => setOpen(false)} className="h-12 flex items-center text-foreground border-b border-border">Blog</Link>
            <Link to="/auth" onClick={() => setOpen(false)} className="h-12 flex items-center text-foreground border-b border-border">Sign In</Link>
          </nav>
          <div className="p-6 pb-10">
            <Link
              to="/auth?mode=signup"
              onClick={() => setOpen(false)}
              className="w-full inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-base h-12"
            >
              Start Free →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}