import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

export default function Alerts() {
  useEffect(() => { document.title = 'Risk Alerts | OutputLens'; }, []);
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: 'hsl(var(--destructive) / 0.12)' }}>
            <Bell className="h-4 w-4" style={{ color: 'hsl(var(--destructive))' }} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Risk Alerts</h1>
            <p className="text-sm text-muted-foreground">Threats your positions are facing right now.</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-medium mb-4"
               style={{ background: 'hsl(var(--destructive) / 0.12)', color: 'hsl(var(--destructive))' }}>
            Phase 3
          </div>
          <h2 className="text-xl font-display font-semibold text-foreground mb-2">Full alert centre — coming next</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Critical / warning / signal / info feed, per-asset thresholds, snooze + dismiss flows, and digest configuration.
          </p>
        </div>
      </div>
    </AppShell>
  );
}