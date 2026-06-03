import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Activity, TrendingUp, BarChart3, RefreshCw, 
  Search, ArrowUpDown, ChevronDown, ChevronUp, Minus,
  Monitor, Smartphone, Globe, Clock, Shield, Loader2,
  Eye, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/useAdminRole';
import { format, formatDistanceToNow, subDays } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserRow {
  user_id: string;
  full_name: string | null;
  email?: string;
  subscription_plan: string | null;
  subscription_tier: string;
  account_status: string | null;
  created_at: string;
  locale: string | null;
  timezone: string | null;
  language: string | null;
  onboarding_completed: boolean | null;
  analysis_count: number;
  tracked_assets_count: number;
  last_analysis_at: string | null;
  last_seen?: string | null;
  // inferred
  device: 'mobile' | 'desktop' | 'unknown';
  location: string;
}

interface RecentActivity {
  user_name: string | null;
  user_id: string;
  asset: string;
  market: string;
  direction: string;
  created_at: string;
}

interface Metrics {
  totalUsers: number;
  activeToday: number;
  totalAnalyses: number;
  analysesToday: number;
  paidUsers: number;
  newThisWeek: number;
  trackedAssets: number;
  portfolios: number;
}

interface Sparks {
  analyses: number[];   // last 14 days
  signups: number[];    // last 14 days
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inferDevice(userAgent: string | null): 'mobile' | 'desktop' | 'unknown' {
  if (!userAgent) return 'unknown';
  if (/mobile|android|iphone|ipad|tablet/i.test(userAgent)) return 'mobile';
  return 'desktop';
}

function inferLocation(locale: string | null, timezone: string | null): string {
  if (timezone && timezone !== 'UTC') return timezone.replace('_', ' ');
  if (!locale) return 'Unknown';
  const map: Record<string, string> = {
    'en-US': 'United States',
    'en-GB': 'United Kingdom',
    'en-AU': 'Australia',
    'en-CA': 'Canada',
    'en-IN': 'India',
    'fr-FR': 'France',
    'de-DE': 'Germany',
    'es-ES': 'Spain',
    'it-IT': 'Italy',
    'pt-BR': 'Brazil',
    'zh-CN': 'China',
    'ja-JP': 'Japan',
    'ko-KR': 'South Korea',
  };
  return map[locale] || locale;
}

function getStatusColor(status: string | null) {
  switch (status) {
    case 'active': return 'text-bullish';
    case 'suspended': return 'text-bearish';
    default: return 'text-muted-foreground';
  }
}

function getPlanBadgeVariant(plan: string | null): 'default' | 'secondary' | 'outline' {
  if (!plan || plan === 'free') return 'secondary';
  if (plan === 'pro') return 'default';
  return 'outline';
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function MetricBlock({
  icon: Icon,
  label,
  value,
  sub,
  accent = false,
  trend,
  spark,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  trend?: 'up' | 'down' | 'flat';
  spark?: number[];
}) {
  const max = spark && spark.length ? Math.max(...spark, 1) : 1;
  return (
    <div
      className={`relative px-5 py-4 border-r border-border last:border-r-0 overflow-hidden group transition-colors ${
        accent ? 'bg-gradient-to-br from-primary/[0.08] via-primary/[0.03] to-transparent' : 'hover:bg-primary/[0.03]'
      }`}
    >
      {accent && (
        <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary/70" />
      )}
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-3.5 w-3.5 ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl font-bold font-mono text-foreground tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {spark && spark.length > 0 && (
          <div className="flex items-end gap-[2px] h-6 opacity-70">
            {spark.map((v, i) => (
              <span
                key={i}
                className={`w-[3px] rounded-sm ${accent ? 'bg-primary/60' : 'bg-muted-foreground/40'}`}
                style={{ height: `${Math.max(2, (v / max) * 24)}px` }}
              />
            ))}
          </div>
        )}
      </div>
      {sub && (
        <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-mono">
          {trend === 'up' && <ChevronUp className="h-3 w-3 text-bullish" />}
          {trend === 'down' && <ChevronDown className="h-3 w-3 text-bearish" />}
          {sub}
        </p>
      )}
    </div>
  );
}

type SortKey = 'created_at' | 'analysis_count' | 'last_analysis_at' | 'full_name';

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CEODashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminRole();

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [sparks, setSparks] = useState<Sparks>({ analyses: [], signups: [] });
  const [users, setUsers] = useState<UserRow[]>([]);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState<'users' | 'activity'>('users');

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/auth');
    };
    check();
  }, [navigate]);

  // ── Fetch data ──────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = subDays(new Date(), 7).toISOString();

      const [
        profilesRes,
        analysisRes,
        analysesTodayRes,
        paidRes,
        newWeekRes,
        trackedRes,
        portfoliosRes,
        recentActivityRes,
        sessionsRes,
      ] = await Promise.all([
        supabase.from('profiles').select(`
          user_id, full_name, subscription_plan, subscription_tier,
          account_status, created_at, locale, timezone, language, onboarding_completed
        `).order('created_at', { ascending: false }),
        supabase.from('analysis_history').select('id', { count: 'exact', head: true }),
        supabase.from('analysis_history').select('id', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).neq('subscription_plan', 'free'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
        supabase.from('tracked_assets').select('id, user_id', { count: 'exact' }),
        supabase.from('saved_portfolios').select('id', { count: 'exact', head: true }),
        supabase.from('analysis_history').select(`
          user_id, asset, market, direction, created_at
        `).order('created_at', { ascending: false }).limit(30),
        // Get last session per user for "last seen"
        supabase.from('behavior_sessions').select('user_id, started_at, user_agent').not('user_id', 'is', null).order('started_at', { ascending: false }).limit(200),
      ]);

      // Build per-user aggregates from analysis_history
      const { data: userAnalysisCounts } = await supabase
        .from('analysis_history')
        .select('user_id, created_at');

      const analysisByUser: Record<string, { count: number; last: string | null }> = {};
      userAnalysisCounts?.forEach(r => {
        if (!analysisByUser[r.user_id]) analysisByUser[r.user_id] = { count: 0, last: null };
        analysisByUser[r.user_id].count++;
        if (!analysisByUser[r.user_id].last || r.created_at > analysisByUser[r.user_id].last!) {
          analysisByUser[r.user_id].last = r.created_at;
        }
      });

      // Per-user tracked assets count
      const trackedByUser: Record<string, number> = {};
      trackedRes.data?.forEach((r: { user_id: string }) => {
        trackedByUser[r.user_id] = (trackedByUser[r.user_id] || 0) + 1;
      });

      // Last seen from behavior_sessions
      const lastSeenByUser: Record<string, { at: string; ua: string }> = {};
      sessionsRes.data?.forEach((s: { user_id: string | null; started_at: string; user_agent: string | null }) => {
        if (!s.user_id) return;
        if (!lastSeenByUser[s.user_id] || s.started_at > lastSeenByUser[s.user_id].at) {
          lastSeenByUser[s.user_id] = { at: s.started_at, ua: s.user_agent || '' };
        }
      });

      // Assemble user rows
      const userRows: UserRow[] = (profilesRes.data || []).map(p => {
        const session = lastSeenByUser[p.user_id];
        return {
          ...p,
          analysis_count: analysisByUser[p.user_id]?.count || 0,
          tracked_assets_count: trackedByUser[p.user_id] || 0,
          last_analysis_at: analysisByUser[p.user_id]?.last || null,
          last_seen: session?.at || null,
          device: inferDevice(session?.ua || null),
          location: inferLocation(p.locale, p.timezone),
        };
      });

      // Recent activity with names
      const userNames: Record<string, string | null> = {};
      profilesRes.data?.forEach(p => { userNames[p.user_id] = p.full_name; });

      const activityRows: RecentActivity[] = (recentActivityRes.data || []).map(a => ({
        user_name: userNames[a.user_id] || null,
        user_id: a.user_id,
        asset: a.asset,
        market: a.market,
        direction: a.direction,
        created_at: a.created_at,
      }));

      setUsers(userRows);
      setActivity(activityRows);

      // Build 14-day sparklines
      const days = 14;
      const bucket = (ts: string | null) => {
        if (!ts) return -1;
        const d = new Date(ts);
        const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
        return days - 1 - diff;
      };
      const analysesSpark = new Array(days).fill(0);
      userAnalysisCounts?.forEach(r => {
        const idx = bucket(r.created_at);
        if (idx >= 0 && idx < days) analysesSpark[idx] += 1;
      });
      const signupsSpark = new Array(days).fill(0);
      profilesRes.data?.forEach(p => {
        const idx = bucket(p.created_at);
        if (idx >= 0 && idx < days) signupsSpark[idx] += 1;
      });
      setSparks({ analyses: analysesSpark, signups: signupsSpark });

      setMetrics({
        totalUsers: profilesRes.data?.length || 0,
        activeToday: analysesTodayRes.count || 0,
        totalAnalyses: analysisRes.count || 0,
        analysesToday: analysesTodayRes.count || 0,
        paidUsers: paidRes.count || 0,
        newThisWeek: newWeekRes.count || 0,
        trackedAssets: trackedRes.count || 0,
        portfolios: portfoliosRes.count || 0,
      });
    } catch (err) {
      console.error('CEO dashboard fetch failed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const filteredUsers = users
    .filter(u => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (u.full_name?.toLowerCase().includes(q)) ||
        u.user_id.includes(q) ||
        u.location.toLowerCase().includes(q) ||
        (u.subscription_plan || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';
      if (sortKey === 'full_name') { av = a.full_name || ''; bv = b.full_name || ''; }
      else if (sortKey === 'analysis_count') { av = a.analysis_count; bv = b.analysis_count; }
      else if (sortKey === 'last_analysis_at') { av = a.last_analysis_at || ''; bv = b.last_analysis_at || ''; }
      else { av = a.created_at; bv = b.created_at; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  // ── Auth guard render ───────────────────────────────────────────────────────
  if (adminLoading || loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Shield className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">This page is restricted to administrators.</p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">

        {/* ── Header ── */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/[0.08] via-card to-card px-5 py-5">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-9 w-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <BarChart3 className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-bullish animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold font-mono tracking-tight">CEO Command Centre</h1>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-mono uppercase tracking-widest">
                    Live · {metrics?.totalUsers ?? 0} users · refreshed {format(new Date(), 'HH:mm:ss')}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-primary/40 text-primary font-mono uppercase tracking-widest">
                Admin only
              </Badge>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="font-mono text-xs gap-2">
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* ── Metrics Strip ── */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-[hsl(var(--primary)/0.08)] border-b border-border px-5 py-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Platform Metrics</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 divide-x divide-y sm:divide-y-0 divide-border bg-card">
            <MetricBlock icon={Users} label="Total Users" value={metrics?.totalUsers || 0} sub={`${metrics?.paidUsers || 0} paid`} />
            <MetricBlock icon={Activity} label="New This Week" value={metrics?.newThisWeek || 0} accent />
            <MetricBlock icon={TrendingUp} label="Total Analyses" value={metrics?.totalAnalyses || 0} />
            <MetricBlock icon={Activity} label="Analyses Today" value={metrics?.analysesToday || 0} accent />
            <MetricBlock icon={Eye} label="Tracked Assets" value={metrics?.trackedAssets || 0} />
            <MetricBlock icon={Globe} label="Portfolios" value={metrics?.portfolios || 0} />
            <MetricBlock icon={CheckCircle} label="Paid Users" value={metrics?.paidUsers || 0} accent />
            <MetricBlock icon={AlertTriangle} label="Free Users" value={(metrics?.totalUsers || 0) - (metrics?.paidUsers || 0)} />
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex gap-1 border-b border-border">
          {(['users', 'activity'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-widest border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'users' ? `All Users (${users.length})` : `Recent Activity (${activity.length})`}
            </button>
          ))}
        </div>

        {/* ── User Table ── */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, location, plan..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 font-mono text-sm bg-card border-border"
              />
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[hsl(222,47%,15%)] text-white">
                      <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors" onClick={() => toggleSort('full_name')}>
                          User <SortIcon col="full_name" />
                        </button>
                      </th>
                      <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest">Plan</th>
                      <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest">Location</th>
                      <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest">Device</th>
                      <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors" onClick={() => toggleSort('analysis_count')}>
                          Analyses <SortIcon col="analysis_count" />
                        </button>
                      </th>
                      <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest">Tracked</th>
                      <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest">Status</th>
                      <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors" onClick={() => toggleSort('last_analysis_at')}>
                          Last Active <SortIcon col="last_analysis_at" />
                        </button>
                      </th>
                      <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors" onClick={() => toggleSort('created_at')}>
                          Joined <SortIcon col="created_at" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground font-mono text-xs">
                          {'> No users found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user, i) => (
                        <tr
                          key={user.user_id}
                          className="hover:bg-primary/5 transition-colors duration-100 group"
                        >
                          {/* User */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                                {(user.full_name?.[0] || '?').toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-sm truncate max-w-[140px]">
                                  {user.full_name || <span className="text-muted-foreground italic">No name</span>}
                                </p>
                                <p className="text-[10px] font-mono text-muted-foreground truncate max-w-[140px]">
                                  {user.user_id.slice(0, 8)}…
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Plan */}
                          <td className="px-4 py-3">
                            <Badge variant={getPlanBadgeVariant(user.subscription_plan)} className="text-[10px] font-mono capitalize">
                              {user.subscription_plan || 'free'}
                            </Badge>
                          </td>

                          {/* Location */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <Globe className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs font-mono truncate max-w-[120px]">{user.location}</span>
                            </div>
                          </td>

                          {/* Device */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              {user.device === 'mobile' ? (
                                <Smartphone className="h-3.5 w-3.5 text-primary" />
                              ) : user.device === 'desktop' ? (
                                <Monitor className="h-3.5 w-3.5" />
                              ) : (
                                <Minus className="h-3.5 w-3.5" />
                              )}
                              <span className="text-xs font-mono capitalize">{user.device}</span>
                            </div>
                          </td>

                          {/* Analyses */}
                          <td className="px-4 py-3">
                            <span className={`font-mono text-sm font-semibold ${user.analysis_count > 0 ? 'text-bullish' : 'text-muted-foreground'}`}>
                              {user.analysis_count}
                            </span>
                          </td>

                          {/* Tracked */}
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm text-muted-foreground">{user.tracked_assets_count}</span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {user.account_status === 'active' ? (
                                <CheckCircle className="h-3.5 w-3.5 text-bullish" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5 text-bearish" />
                              )}
                              <span className={`text-xs font-mono capitalize ${getStatusColor(user.account_status)}`}>
                                {user.onboarding_completed ? user.account_status || 'active' : 'onboarding'}
                              </span>
                            </div>
                          </td>

                          {/* Last Active */}
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono text-muted-foreground">
                              {user.last_analysis_at
                                ? formatDistanceToNow(new Date(user.last_analysis_at), { addSuffix: true })
                                : '—'}
                            </span>
                          </td>

                          {/* Joined */}
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono text-muted-foreground">
                              {format(new Date(user.created_at), 'dd MMM yyyy')}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 border-t border-border bg-muted/30 text-[10px] font-mono text-muted-foreground">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            </div>
          </div>
        )}

        {/* ── Activity Feed ── */}
        {activeTab === 'activity' && (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[hsl(222,47%,15%)] text-white">
                    <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest">User</th>
                    <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest">Asset</th>
                    <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest">Market</th>
                    <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest">Direction</th>
                    <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activity.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground font-mono text-xs">
                        {'> No activity yet.'}
                      </td>
                    </tr>
                  ) : (
                    activity.map((a, i) => (
                      <tr key={i} className="hover:bg-primary/5 transition-colors duration-100">
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium">{a.user_name || <span className="text-muted-foreground italic text-xs">Anonymous</span>}</span>
                          <p className="text-[10px] font-mono text-muted-foreground">{a.user_id.slice(0, 8)}…</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-sm">{a.asset}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[10px] font-mono">{a.market}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-mono font-semibold uppercase ${a.direction === 'long' ? 'text-bullish' : 'text-bearish'}`}>
                            {a.direction === 'long' ? '↑ LONG' : '↓ SHORT'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs font-mono">
                              {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
