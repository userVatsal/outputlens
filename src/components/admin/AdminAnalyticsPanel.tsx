import { useState } from 'react';
import { 
  Shield, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  TrendingUp, 
  Activity,
  BarChart3,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAdminOverview, useAdminTraffic, useAdminSignups } from '@/hooks/useAdminAnalytics';
import { TrafficSourcesChart } from './TrafficSourcesChart';
import { RecentSignupsTable } from './RecentSignupsTable';

interface AdminAnalyticsPanelProps {
  isAdmin: boolean;
}

export function AdminAnalyticsPanel({ isAdmin }: AdminAnalyticsPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  const { data: overview, isLoading: overviewLoading } = useAdminOverview(isAdmin);
  const { data: traffic, isLoading: trafficLoading } = useAdminTraffic(isAdmin);
  const { data: signups, isLoading: signupsLoading } = useAdminSignups(isAdmin);

  if (!isAdmin) return null;

  const isLoading = overviewLoading || trafficLoading || signupsLoading;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="glass-card border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-primary" />
                Admin Analytics
                <Badge variant="outline" className="ml-2 text-[10px] text-primary border-primary/30">
                  ADMIN ONLY
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                icon={Users}
                label="Total Users"
                value={overview?.totalUsers ?? '-'}
                subValue={`+${overview?.signups7d ?? 0} this week`}
                loading={overviewLoading}
              />
              <StatCard
                icon={TrendingUp}
                label="New (24h)"
                value={overview?.signups24h ?? '-'}
                subValue={`${overview?.signups30d ?? 0} this month`}
                loading={overviewLoading}
              />
              <StatCard
                icon={Activity}
                label="Sessions"
                value={overview?.totalSessions ?? '-'}
                subValue={`${overview?.conversionRate ?? 0}% convert`}
                loading={overviewLoading}
              />
              <StatCard
                icon={BarChart3}
                label="Analyses"
                value={overview?.totalAnalyses ?? '-'}
                subValue="total reports"
                loading={overviewLoading}
              />
            </div>

            {/* Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Traffic Sources */}
              <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Traffic Sources
                </h4>
                {trafficLoading ? (
                  <div className="flex items-center justify-center h-[200px]">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <TrafficSourcesChart data={traffic || []} />
                )}
              </div>

              {/* Recent Signups */}
              <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Recent Signups
                </h4>
                {signupsLoading ? (
                  <div className="flex items-center justify-center h-[200px]">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <RecentSignupsTable data={signups || []} isAdmin={isAdmin} />
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subValue: string;
  loading?: boolean;
}

function StatCard({ icon: Icon, label, value, subValue, loading }: StatCardProps) {
  return (
    <div className="p-3 rounded-lg bg-card/50 border border-border/50">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <>
          <div className="text-xl font-bold text-foreground">{value}</div>
          <div className="text-[10px] text-muted-foreground">{subValue}</div>
        </>
      )}
    </div>
  );
}
