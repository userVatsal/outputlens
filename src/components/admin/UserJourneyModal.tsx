import { format } from 'date-fns';
import { 
  MousePointer, 
  Eye, 
  Clock, 
  Globe, 
  ArrowRight,
  Loader2,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserJourney } from '@/hooks/useAdminAnalytics';

interface UserJourneyModalProps {
  userId: string | null;
  isAdmin: boolean;
  onClose: () => void;
}

const EVENT_ICONS: Record<string, any> = {
  page_view: Eye,
  click: MousePointer,
  scroll: ArrowRight,
  session_start: Globe,
  session_end: X,
};

const EVENT_COLORS: Record<string, string> = {
  page_view: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  click: 'bg-green-500/20 text-green-400 border-green-500/30',
  scroll: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  session_start: 'bg-primary/20 text-primary border-primary/30',
  session_end: 'bg-muted text-muted-foreground border-muted',
};

export function UserJourneyModal({ userId, isAdmin, onClose }: UserJourneyModalProps) {
  const { data, isLoading } = useUserJourney(userId, isAdmin);

  const isOpen = !!userId;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            User Journey
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            {/* User Info */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <span className="ml-2 font-medium">{data.user.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <span className="ml-2 font-medium">{data.user.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Joined:</span>
                  <span className="ml-2 font-medium">
                    {data.user.createdAt ? format(new Date(data.user.createdAt), 'MMM d, yyyy') : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tier:</span>
                  <Badge variant="outline" className="ml-2">
                    {data.user.tier}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Sessions Summary */}
            <div>
              <h4 className="text-sm font-medium mb-2">Sessions ({data.sessions.length})</h4>
              <div className="space-y-2">
                {data.sessions.slice(0, 5).map((session) => (
                  <div 
                    key={session.id}
                    className="p-3 rounded-lg bg-card border border-border/50 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-muted-foreground">
                        {format(new Date(session.started_at), 'MMM d, HH:mm')}
                      </span>
                      <div className="flex items-center gap-2">
                        {session.total_pages && (
                          <Badge variant="secondary" className="text-[10px]">
                            {session.total_pages} pages
                          </Badge>
                        )}
                        {session.total_time_seconds && (
                          <Badge variant="outline" className="text-[10px]">
                            <Clock className="h-2.5 w-2.5 mr-1" />
                            {Math.round(session.total_time_seconds / 60)}m
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-muted-foreground truncate">
                      Entry: {session.entry_url}
                    </div>
                    {session.utm_source && (
                      <Badge variant="outline" className="mt-1 text-[10px]">
                        via {session.utm_source}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Event Timeline */}
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Events ({data.events.length})</h4>
              <ScrollArea className="h-[200px]">
                <div className="space-y-1">
                  {data.events.slice(0, 50).map((event) => {
                    const Icon = EVENT_ICONS[event.event_type] || Eye;
                    const colorClass = EVENT_COLORS[event.event_type] || EVENT_COLORS.page_view;
                    
                    return (
                      <div 
                        key={event.id}
                        className="flex items-start gap-2 p-2 rounded hover:bg-muted/50 transition-colors"
                      >
                        <div className={`p-1 rounded border ${colorClass}`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">
                              {event.event_type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {format(new Date(event.created_at), 'HH:mm:ss')}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {event.page_url}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No journey data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
