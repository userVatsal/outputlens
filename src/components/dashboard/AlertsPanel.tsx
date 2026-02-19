import { AlertTriangle, Info, X, ChevronRight, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RiskAlert } from '@/hooks/useTrackedAssets';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface AlertsPanelProps {
  alerts: RiskAlert[];
  onDismiss: (alertId: string) => void;
  onMarkRead: (alertId: string) => void;
}

function getSeverityStyles(severity: 'info' | 'warning' | 'critical') {
  switch (severity) {
    case 'critical':
      return { bar: 'bg-destructive', icon: 'text-destructive', badge: 'text-destructive bg-destructive/10' };
    case 'warning':
      return { bar: 'bg-caution', icon: 'text-caution', badge: 'text-caution bg-caution/10' };
    default:
      return { bar: 'bg-primary', icon: 'text-primary', badge: 'text-primary bg-primary/10' };
  }
}

function AlertRow({
  alert,
  onDismiss,
  onMarkRead,
}: {
  alert: RiskAlert;
  onDismiss: (id: string) => void;
  onMarkRead: (id: string) => void;
}) {
  const styles = getSeverityStyles(alert.severity);
  const isUnread = !alert.read_at;

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/20 transition-colors duration-100',
        isUnread && 'bg-primary/3'
      )}
      onClick={() => isUnread && onMarkRead(alert.id)}
    >
      {/* Severity bar */}
      <div className={cn('w-0.5 self-stretch rounded-full flex-shrink-0 mt-0.5', styles.bar)} />

      {/* Icon */}
      {alert.severity === 'critical'
        ? <AlertTriangle className={cn('h-4 w-4 flex-shrink-0 mt-0.5', styles.icon)} />
        : <Info className={cn('h-4 w-4 flex-shrink-0 mt-0.5', styles.icon)} />
      }

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={cn('text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider', styles.badge)}>
            {alert.severity}
          </span>
          {isUnread && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
          <span className="text-[11px] text-muted-foreground ml-auto font-mono">
            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-foreground leading-snug">{alert.message}</p>
        {alert.delta !== null && (
          <p className="text-xs font-mono text-muted-foreground mt-0.5">
            Δ {alert.delta > 0 ? '+' : ''}{alert.delta.toFixed(1)} pts
          </p>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(alert.id); }}
        className="p-1 rounded hover:bg-muted/50 transition-colors flex-shrink-0"
      >
        <X className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    </div>
  );
}

export function AlertsPanel({ alerts, onDismiss, onMarkRead }: AlertsPanelProps) {
  const displayAlerts = alerts.slice(0, 5);
  const hasMore = alerts.length > 5;
  const unreadCount = alerts.filter(a => !a.read_at).length;

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-card">
      {/* Dark header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-border"
        style={{ backgroundColor: 'hsl(var(--brand-navy))' }}
      >
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-white/60" />
          <span className="text-sm font-mono font-semibold text-white tracking-wider uppercase">Risk Alerts</span>
        </div>
        {alerts.length > 0 && (
          <span className="text-xs font-mono text-white/50">
            {unreadCount > 0 ? `${unreadCount} unread` : `${alerts.length} total`}
          </span>
        )}
      </div>

      {/* Body */}
      {alerts.length === 0 ? (
        <div className="text-center py-10 px-4">
          <Bell className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">No active alerts</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            You'll be notified when risk metrics change significantly.
          </p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border/0">
            {displayAlerts.map((alert) => (
              <AlertRow
                key={alert.id}
                alert={alert}
                onDismiss={onDismiss}
                onMarkRead={onMarkRead}
              />
            ))}
          </div>
          {hasMore && (
            <div className="px-4 py-2 border-t border-border bg-muted/20">
              <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                <Link to="/tracked-assets">
                  View all {alerts.length} alerts
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
