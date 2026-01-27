import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface OverviewMetrics {
  totalUsers: number;
  signups24h: number;
  signups7d: number;
  signups30d: number;
  totalSessions: number;
  convertedSessions: number;
  conversionRate: number;
  totalAnalyses: number;
}

interface TrafficSource {
  name: string;
  count: number;
  percentage: number;
}

interface RecentSignup {
  userId: string;
  name: string;
  createdAt: string;
  tier: string;
  analysisCount: number;
  source: string;
}

interface UserSession {
  id: string;
  started_at: string;
  ended_at: string | null;
  entry_url: string;
  exit_page: string | null;
  total_pages: number | null;
  total_time_seconds: number | null;
  utm_source: string | null;
  entry_referrer: string | null;
}

interface UserEvent {
  id: string;
  session_id: string;
  event_type: string;
  page_url: string;
  page_type: string | null;
  event_data: Record<string, any>;
  created_at: string;
}

interface UserJourney {
  user: {
    email: string;
    name: string;
    createdAt: string;
    tier: string;
  };
  sessions: UserSession[];
  events: UserEvent[];
}

async function fetchAdminData<T>(action: string, params?: Record<string, string>): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-analytics`);
  url.searchParams.set('action', action);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch admin data');
  }

  return response.json();
}

export function useAdminOverview(enabled: boolean) {
  return useQuery<OverviewMetrics>({
    queryKey: ['admin', 'overview'],
    queryFn: () => fetchAdminData<OverviewMetrics>('overview'),
    enabled,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });
}

export function useAdminTraffic(enabled: boolean) {
  return useQuery<TrafficSource[]>({
    queryKey: ['admin', 'traffic'],
    queryFn: () => fetchAdminData<TrafficSource[]>('traffic'),
    enabled,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export function useAdminSignups(enabled: boolean) {
  return useQuery<RecentSignup[]>({
    queryKey: ['admin', 'signups'],
    queryFn: () => fetchAdminData<RecentSignup[]>('signups'),
    enabled,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export function useUserJourney(userId: string | null, enabled: boolean) {
  return useQuery<UserJourney>({
    queryKey: ['admin', 'journey', userId],
    queryFn: () => fetchAdminData<UserJourney>('journey', { userId: userId! }),
    enabled: enabled && !!userId,
    staleTime: 60000,
  });
}
