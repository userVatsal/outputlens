import { useEffect } from 'react';
import { Radio } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

export default function Regime() {
  useEffect(() => { document.title = 'Regime Monitor | OutputLens'; }, []);
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: 'hsl(var(--primary) / 0.12)' }}>
            <Radio className="h-4 w-4" style={{ color: 'hsl(var(--primary))' }} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Regime Monitor</h1>
            <p className="text-sm text-muted-foreground">Live HMM regime detection across your watchlist.</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-medium mb-4"
               style={{ background: 'hsl(var(--accent) / 0.12)', color: 'hsl(var(--accent))' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'hsl(var(--accent))' }} />
            Phase 3
          </div>
          <h2 className="text-xl font-display font-semibold text-foreground mb-2">Regime war room — coming next</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Live regime status, 90-day regime history with your simulation pins, and per-asset divergence signals.
          </p>
        </div>
      </div>
    </AppShell>
  );
}