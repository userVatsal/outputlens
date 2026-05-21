import { useEffect } from 'react';
import { Wand2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

export default function Scenarios() {
  useEffect(() => { document.title = 'Scenario Builder | OutputLens'; }, []);
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: 'hsl(var(--accent) / 0.12)' }}>
            <Wand2 className="h-4 w-4" style={{ color: 'hsl(var(--accent))' }} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Scenario Builder</h1>
            <p className="text-sm text-muted-foreground">Build counterfactuals. Save them. Replay against any position.</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-medium mb-4"
               style={{ background: 'hsl(var(--accent) / 0.12)', color: 'hsl(var(--accent))' }}>
            Phase 4
          </div>
          <h2 className="text-xl font-display font-semibold text-foreground mb-2">Drag-and-drop scenario canvas — coming soon</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Compose market shocks, macro shifts, and asset-specific events into reusable stress scenarios.
          </p>
        </div>
      </div>
    </AppShell>
  );
}