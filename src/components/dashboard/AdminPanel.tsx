import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  BarChart3, 
  DollarSign,
  Activity,
  Eye,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

interface AnalyticsData {
  totalUsers: number;
  activeUsersToday: number;
  totalAnalyses: number;
  analysesToday: number;
  totalTrackedAssets: number;
  totalPortfolios: number;
  paidUsers: number;
  recentSignups: Array<{
    email: string;
    created_at: string;
    plan: string;
  }>;
  topAssets: Array<{
    asset: string;
    count: number;
  }>;
}

export function AdminPanel() {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch all analytics in parallel
      const [
        profilesResult,
        analysisResult,
        analysesTodayResult,
        trackedResult,
        portfoliosResult,
        paidResult,
        topAssetsResult
      ] = await Promise.all([
        supabase.from('profiles').select('user_id, created_at, subscription_plan', { count: 'exact' }),
        supabase.from('analysis_history').select('id', { count: 'exact' }),
        supabase.from('analysis_history').select('id', { count: 'exact' }).gte('created_at', today),
        supabase.from('tracked_assets').select('id', { count: 'exact' }),
        supabase.from('saved_portfolios').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }).neq('subscription_plan', 'free'),
        supabase.from('analysis_history').select('asset').limit(1000)
      ]);

      // Get recent signups (last 7 days)
      const { data: recentProfiles } = await supabase
        .from('profiles')
        .select('user_id, created_at, subscription_plan, full_name')
        .gte('created_at', subDays(new Date(), 7).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      // Count asset occurrences
      const assetCounts: Record<string, number> = {};
      topAssetsResult.data?.forEach((item: { asset: string }) => {
        assetCounts[item.asset] = (assetCounts[item.asset] || 0) + 1;
      });
      const topAssets = Object.entries(assetCounts)
        .map(([asset, count]) => ({ asset, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Count active users today (users who ran analysis today)
      const { count: activeToday } = await supabase
        .from('analysis_history')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', today);

      setData({
        totalUsers: profilesResult.count || 0,
        activeUsersToday: activeToday || 0,
        totalAnalyses: analysisResult.count || 0,
        analysesToday: analysesTodayResult.count || 0,
        totalTrackedAssets: trackedResult.count || 0,
        totalPortfolios: portfoliosResult.count || 0,
        paidUsers: paidResult.count || 0,
        recentSignups: recentProfiles?.map(p => ({
          email: p.full_name || 'Unknown',
          created_at: p.created_at,
          plan: p.subscription_plan || 'free'
        })) || [],
        topAssets
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  if (loading) {
    return (
      <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Admin Analytics Dashboard
            <Badge variant="outline" className="ml-2 text-xs border-primary/50 text-primary">
              Admin Only
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => navigate('/ceo-dashboard')}
              className="text-xs gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              CEO Dashboard
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            icon={Users}
            label="Total Users"
            value={data.totalUsers}
            subLabel={`${data.paidUsers} paid`}
            trend="up"
          />
          <MetricCard
            icon={Activity}
            label="Active Today"
            value={data.activeUsersToday}
            subLabel="users"
          />
          <MetricCard
            icon={TrendingUp}
            label="Total Analyses"
            value={data.totalAnalyses}
            subLabel={`${data.analysesToday} today`}
            trend="up"
          />
          <MetricCard
            icon={Eye}
            label="Tracked Assets"
            value={data.totalTrackedAssets}
            subLabel={`${data.totalPortfolios} portfolios`}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Signups */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Signups (7 days)
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {data.recentSignups.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent signups</p>
              ) : (
                data.recentSignups.map((signup, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-md bg-background/50">
                    <div>
                      <p className="text-sm font-medium truncate max-w-[150px]">{signup.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(signup.created_at), 'MMM d, HH:mm')}
                      </p>
                    </div>
                    <Badge variant={signup.plan === 'free' ? 'secondary' : 'default'} className="text-xs">
                      {signup.plan}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Analyzed Assets */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Top Analyzed Assets
            </h4>
            <div className="space-y-2">
              {data.topAssets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No analyses yet</p>
              ) : (
                data.topAssets.map((asset, i) => (
                  <div key={asset.asset} className="flex items-center justify-between p-2 rounded-md bg-background/50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">#{i + 1}</span>
                      <span className="font-mono font-medium">{asset.asset}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {asset.count} analyses
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  subLabel, 
  trend 
}: { 
  icon: React.ElementType;
  label: string;
  value: number;
  subLabel?: string;
  trend?: 'up' | 'down';
}) {
  return (
    <div className="p-4 rounded-lg bg-background/50 border border-border/50">
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {trend && (
          trend === 'up' 
            ? <ArrowUpRight className="h-4 w-4 text-bullish" />
            : <ArrowDownRight className="h-4 w-4 text-bearish" />
        )}
      </div>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {subLabel && (
        <p className="text-xs text-primary mt-1">{subLabel}</p>
      )}
    </div>
  );
}
