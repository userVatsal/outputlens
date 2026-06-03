import { useEffect, useMemo, useState } from 'react';
import { Bell, AlertOctagon, AlertTriangle, Info, Zap, X, Check, Filter } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTrackedAssets, RiskAlert } from '@/hooks/useTrackedAssets';
import { useFeatureAccess, UpgradePrompt } from '@/components/FeatureGate';
import { usePlan } from '@/hooks/usePlan';

type Severity = 'all' | 'critical' | 'warning' | 'info';

const severityMeta = {
  critical: { icon: AlertOctagon, label: 'CRITICAL', tone: 'text-bearish border-bearish/30 bg-bearish/5' },
  warning: { icon: AlertTriangle, label: 'WARNING', tone: 'text-primary border-primary/30 bg-primary/5' },
  info: { icon: Info, label: 'SIGNAL', tone: 'text-muted-foreground border-border bg-muted/20' },
} as const;

function timeAgo(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.round(m / 60)}h ago`;
  return `${Math.round(m / 1440)}d ago`;
}

function AlertCard({ alert, asset, onDismiss, onRead }: {
  alert: RiskAlert;
  asset: string;
  onDismiss: (id: string) => void;
  onRead: (id: string) => void;
}) {
  const sev = (alert.severity || 'info') as keyof typeof severityMeta;
  const meta = severityMeta[sev] || severityMeta.info;
  const Icon = meta.icon;
  const unread = !alert.read_at;

  return (
    <div className={cn(
      'rounded-lg border p-4 transition-all',
      meta.tone,
      unread && 'ring-1 ring-primary/30'
    )}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest font-semibold">
              {meta.label}
            </span>
            <span className="font-mono text-sm text-foreground">{asset}</span>
            {unread && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
            <span className="ml-auto text-[11px] text-muted-foreground font-mono">
              {timeAgo(alert.created_at)}
            </span>
          </div>
          <p className="text-sm text-foreground mb-2">{alert.message}</p>
          {alert.delta != null && (
            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
              {alert.previous_value != null && (
                <span>From {(alert.previous_value * 100).toFixed(1)}%</span>
              )}
              {alert.current_value != null && (
                <span className="text-foreground">→ {(alert.current_value * 100).toFixed(1)}%</span>
              )}
              <span className={alert.delta > 0 ? 'text-bearish' : 'text-bullish'}>
                Δ {alert.delta > 0 ? '+' : ''}{(alert.delta * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {unread && (
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onRead(alert.id)}>
              <Check className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onDismiss(alert.id)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Alerts() {
  const { alerts, trackedAssets, dismissAlert, markAlertRead, isLoading } = useTrackedAssets();
  const [filter, setFilter] = useState<Severity>('all');
  const hasAlertsAccess = useFeatureAccess('alerts');
  const { isLoading: planLoading } = usePlan();

  useEffect(() => { document.title = 'Risk Alerts | OutputLens'; }, []);

  const assetById = useMemo(() => {
    const m = new Map<string, string>();
    trackedAssets.forEach(a => m.set(a.id, a.symbol));
    return m;
  }, [trackedAssets]);

  const filtered = useMemo(() => {
    if (filter === 'all') return alerts;
    return alerts.filter(a => (a.severity || 'info') === filter);
  }, [alerts, filter]);

  const counts = useMemo(() => ({
    all: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => (a.severity || 'info') === 'info').length,
  }), [alerts]);

  const filters: { id: Severity; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'critical', label: 'Critical' },
    { id: 'warning', label: 'Warning' },
    { id: 'info', label: 'Signals' },
  ];

  if (!planLoading && !hasAlertsAccess) {
    return (
      <AppShell>
        <div className="section-container py-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md flex items-center justify-center bg-bearish/10">
                <Bell className="h-5 w-5 text-bearish" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-semibold text-foreground">Risk Alerts</h1>
                <p className="text-sm text-muted-foreground">Available on the Trader plan</p>
              </div>
            </div>
            <UpgradePrompt feature="alerts" />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="section-container py-6">
        <div className="max-w-4xl mx-auto space-y-6">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md flex items-center justify-center bg-bearish/10">
                <Bell className="h-5 w-5 text-bearish" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-semibold text-foreground">Risk Alerts</h1>
                <p className="text-sm text-muted-foreground">
                  {counts.all > 0 ? `${counts.all} active alert${counts.all === 1 ? '' : 's'}` : 'No active alerts'}
                </p>
              </div>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider border transition-colors',
                  filter === f.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:bg-muted'
                )}
              >
                {f.label}
                <span className="ml-1.5 opacity-70">{counts[f.id]}</span>
              </button>
            ))}
          </div>

          {/* List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-lg bg-muted/30 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-10 text-center">
              <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-display font-semibold text-foreground mb-1">
                {filter === 'all' ? 'No alerts right now' : `No ${filter} alerts`}
              </h3>
              <p className="text-sm text-muted-foreground">
                Track positions in the workspace to start receiving risk alerts.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(a => (
                <AlertCard
                  key={a.id}
                  alert={a}
                  asset={(a.tracked_asset_id && assetById.get(a.tracked_asset_id)) || 'Portfolio'}
                  onDismiss={dismissAlert}
                  onRead={markAlertRead}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}