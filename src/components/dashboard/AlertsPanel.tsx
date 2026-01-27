import { AlertTriangle, Info, X, ChevronRight, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      return {
        bg: 'bg-destructive/10',
        border: 'border-destructive/30',
        icon: 'text-destructive',
        badge: 'bg-destructive text-destructive-foreground',
      };
    case 'warning':
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        icon: 'text-amber-500',
        badge: 'bg-amber-500 text-white',
      };
    default:
      return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        icon: 'text-blue-500',
        badge: 'bg-blue-500 text-white',
      };
  }
}

function AlertItem({ 
  alert, 
  onDismiss, 
  onMarkRead 
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
        "relative flex items-start gap-3 p-3 rounded-lg border transition-colors",
        styles.bg,
        styles.border,
        isUnread && "ring-1 ring-primary/20"
      )}
      onClick={() => isUnread && onMarkRead(alert.id)}
    >
      {alert.severity === 'critical' ? (
        <AlertTriangle className={cn("h-5 w-5 mt-0.5 flex-shrink-0", styles.icon)} />
      ) : (
        <Info className={cn("h-5 w-5 mt-0.5 flex-shrink-0", styles.icon)} />
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge className={cn("text-[10px] px-1.5 py-0", styles.badge)}>
            {alert.severity.toUpperCase()}
          </Badge>
          {isUnread && (
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-foreground">{alert.message}</p>
        {alert.delta !== null && (
          <p className="text-xs text-muted-foreground mt-1">
            Change: {alert.delta > 0 ? '+' : ''}{alert.delta.toFixed(1)} pts
          </p>
        )}
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(alert.id);
        }}
        className="p-1 rounded-md hover:bg-background/50 transition-colors"
        title="Dismiss"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}

export function AlertsPanel({ alerts, onDismiss, onMarkRead }: AlertsPanelProps) {
  const displayAlerts = alerts.slice(0, 5);
  const hasMore = alerts.length > 5;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          Risk Alerts
          {alerts.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {alerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No active alerts</p>
            <p className="text-xs">Stay ahead of market surprises. You'll be notified when risk metrics change significantly.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayAlerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onDismiss={onDismiss}
                onMarkRead={onMarkRead}
              />
            ))}
            
            {hasMore && (
              <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
                <Link to="/tracked-assets">
                  View All Alerts
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
