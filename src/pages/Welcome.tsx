import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Peak-end confirmation: cinematic counter ramp → identity-affirming line → auto-redirect.
// Loss-averse, reciprocity-completing screen after first signup.
export default function Welcome() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<'count' | 'reveal'>('count');
  const [ticker, setTicker] = useState<string>('AAPL');

  useEffect(() => {
    document.title = 'Distribution complete | OutputLens';
    const stored = sessionStorage.getItem('ol_first_ticker');
    if (stored) setTicker(stored.toUpperCase());
  }, []);

  // Count up 0 → 10,000 over ~2.2s with eased curve
  useEffect(() => {
    const target = 10000;
    const duration = 2200;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setPhase('reveal'), 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Auto-route forward after the moment lands
  useEffect(() => {
    if (phase !== 'reveal') return;
    const t = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', session.user.id)
        .single();
      navigate(profile?.onboarding_completed ? '/dashboard' : '/onboarding');
    }, 3200);
    return () => clearTimeout(t);
  }, [phase, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient grid + cyan glow */}
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.18), transparent 60%)' }}
      />

      <div className="relative z-10 text-center max-w-2xl">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-6">
          Running Monte Carlo
        </div>

        <div
          className="font-mono text-7xl md:text-8xl font-bold tabular-nums leading-none"
          style={{ color: 'hsl(var(--primary))', textShadow: '0 0 40px hsl(var(--primary) / 0.45)' }}
        >
          {count.toLocaleString()}
        </div>
        <div className="mt-3 text-sm text-muted-foreground tracking-wide">
          simulated paths · {ticker}
        </div>

        <div
          className={`mt-12 transition-all duration-700 ${
            phase === 'reveal' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Distribution complete.
          </h1>
          <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            You now see <span className="text-foreground font-semibold">{ticker}</span> as a
            probability distribution — not a consensus estimate.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Loading your workspace…
          </div>
        </div>
      </div>
    </div>
  );
}