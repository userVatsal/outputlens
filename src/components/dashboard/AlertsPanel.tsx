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
      return { border: 'border-l-destructive', icon: 'text-destructive' };
    case 'warning':
      return { border: 'border-l-caution', icon: 'text-caution' };
    default:
      return { border: 'border-l-bullish', icon: 'text-bullish' };
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
        'flex items-start gap-3 p-3 rounded-r-lg bg-elevated/40 border-l-2 cursor-pointer hover:bg-elevated/60 transition-colors duration-100',
        styles.border
      )}
      onClick={() => isUnread && onMarkRead(alert.id)}
    >
      {/* Icon */}
      {alert.severity === 'critical'
        ? <AlertTriangle className={cn('h-4 w-4 flex-shrink-0 mt-0.5', styles.icon)} />
        : <Info className={cn('h-4 w-4 flex-shrink-0 mt-0.5', styles.icon)} />
      }

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[11px] text-primary uppercase tracking-wider">
            {alert.alert_type.replace(/_/g, ' ')}
          </span>
          {isUnread && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
          <span className="text-[11px] text-muted-foreground ml-auto font-mono tabular-nums">
            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-[13px] text-foreground leading-snug">{alert.message}</p>
        {alert.delta !== null && (
          <p className="text-[11px] font-mono text-muted-foreground mt-1 tabular-nums">
            Δ {alert.delta > 0 ? '+' : ''}{alert.delta.toFixed(1)} pts
          </p>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(alert.id); }}
        className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 self-start"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function AlertsPanel({ alerts, onDismiss, onMarkRead }: AlertsPanelProps) {
  const displayAlerts = alerts.slice(0, 5);
  const hasMore = alerts.length > 5;
  const unreadCount = alerts.filter(a => !a.read_at).length;

  return (
    <div className="rounded-xl bg-surface border border-border/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-[13px] font-semibold text-foreground">Risk Alerts</h3>
        {unreadCount > 0 && (
          <span className="text-[10px] font-mono font-semibold text-primary bg-primary/10 border border-primary/20 rounded-md px-1.5 py-0.5">
            {unreadCount}
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="h-7 w-7 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-[13px] text-muted-foreground">No active alerts</p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            You'll be notified when risk metrics change significantly.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
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
            <div className="mt-3 pt-3 border-t border-border/40">
              <Button variant="ghost" size="sm" className="w-full text-[12px]" asChild>
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
