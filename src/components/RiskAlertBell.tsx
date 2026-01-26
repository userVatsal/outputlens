import { useState } from 'react';
import { Bell, AlertTriangle, TrendingUp, TrendingDown, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTrackedAssets, RiskAlert } from '@/hooks/useTrackedAssets';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

function AlertIcon({ type }: { type: string }) {
  switch (type) {
    case 'risk_increase':
      return <TrendingUp className="h-4 w-4 text-destructive" />;
    case 'risk_decrease':
      return <TrendingDown className="h-4 w-4 text-emerald-500" />;
    case 'tail_spike':
    case 'var_breach':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
}

function AlertItem({ 
  alert, 
  onMarkRead, 
  onDismiss 
}: { 
  alert: RiskAlert; 
  onMarkRead: () => void;
  onDismiss: () => void;
}) {
  const isUnread = !alert.read_at;

  return (
    <div
      className={cn(
        "p-3 border-b border-border last:border-0 transition-colors",
        isUnread && "bg-primary/5"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <AlertIcon type={alert.alert_type} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm", isUnread && "font-medium")}>
            {alert.message}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
            </span>
            {alert.delta !== null && (
              <span className={cn(
                "text-xs font-medium",
                alert.delta > 0 ? "text-destructive" : "text-emerald-500"
              )}>
                {alert.delta > 0 ? '+' : ''}{alert.delta.toFixed(1)} pts
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isUnread && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onMarkRead}
              title="Mark as read"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onDismiss}
            title="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RiskAlertBell() {
  const { alerts, unreadAlertCount, markAlertRead, dismissAlert } = useTrackedAssets();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadAlertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
              {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h4 className="font-semibold text-sm">Risk Alerts</h4>
          {alerts.length > 0 && (
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
              <Link to="/tracked-assets" onClick={() => setOpen(false)}>
                View All
              </Link>
            </Button>
          )}
        </div>
        
        {alerts.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No alerts yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Track assets to receive risk monitoring alerts
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            {alerts.slice(0, 10).map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onMarkRead={() => markAlertRead(alert.id)}
                onDismiss={() => dismissAlert(alert.id)}
              />
            ))}
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
