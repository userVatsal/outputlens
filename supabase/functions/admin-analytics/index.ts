import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.91.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = 'uservatsal@outlook.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Create client with user's token to verify identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Verify admin email
    const userEmail = claimsData.claims.email?.toLowerCase();
    if (userEmail !== ADMIN_EMAIL.toLowerCase()) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Use service role for data queries
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'overview';

    let result;

    switch (action) {
      case 'overview':
        result = await getOverviewMetrics(supabase);
        break;
      case 'traffic':
        result = await getTrafficSources(supabase);
        break;
      case 'signups':
        result = await getRecentSignups(supabase);
        break;
      case 'journey':
        const userId = url.searchParams.get('userId');
        if (!userId) {
          return new Response(JSON.stringify({ error: 'userId required' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }
        result = await getUserJourney(supabase, userId);
        break;
      default:
        result = await getOverviewMetrics(supabase);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getOverviewMetrics(supabase: any) {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Signups in last 24h
  const { count: signups24h } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneDayAgo);

  // Signups in last 7d
  const { count: signups7d } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo);

  // Signups in last 30d
  const { count: signups30d } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo);

  // Total sessions
  const { count: totalSessions } = await supabase
    .from('behavior_sessions')
    .select('*', { count: 'exact', head: true });

  // Sessions with user_id (converted)
  const { count: convertedSessions } = await supabase
    .from('behavior_sessions')
    .select('*', { count: 'exact', head: true })
    .not('user_id', 'is', null);

  // Total analyses
  const { count: totalAnalyses } = await supabase
    .from('analysis_history')
    .select('*', { count: 'exact', head: true });

  const conversionRate = totalSessions ? ((convertedSessions || 0) / totalSessions * 100).toFixed(1) : 0;

  return {
    totalUsers: totalUsers || 0,
    signups24h: signups24h || 0,
    signups7d: signups7d || 0,
    signups30d: signups30d || 0,
    totalSessions: totalSessions || 0,
    convertedSessions: convertedSessions || 0,
    conversionRate: parseFloat(conversionRate as string),
    totalAnalyses: totalAnalyses || 0,
  };
}

async function getTrafficSources(supabase: any) {
  const { data: sessions } = await supabase
    .from('behavior_sessions')
    .select('utm_source, entry_referrer')
    .limit(1000);

  if (!sessions) return [];

  const sourceCount: Record<string, number> = {};

  for (const session of sessions) {
    let source = 'Direct';
    
    if (session.utm_source) {
      source = session.utm_source;
    } else if (session.entry_referrer) {
      try {
        const url = new URL(session.entry_referrer);
        const host = url.hostname.replace('www.', '');
        
        if (host.includes('google')) source = 'Google';
        else if (host.includes('reddit')) source = 'Reddit';
        else if (host.includes('twitter') || host.includes('x.com')) source = 'Twitter/X';
        else if (host.includes('linkedin')) source = 'LinkedIn';
        else if (host.includes('facebook')) source = 'Facebook';
        else if (host.includes('youtube')) source = 'YouTube';
        else if (host.includes('bing')) source = 'Bing';
        else source = host;
      } catch {
        source = 'Other';
      }
    }

    sourceCount[source] = (sourceCount[source] || 0) + 1;
  }

  const sorted = Object.entries(sourceCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const total = sorted.reduce((sum, s) => sum + s.count, 0);
  
  return sorted.map(s => ({
    ...s,
    percentage: total ? parseFloat((s.count / total * 100).toFixed(1)) : 0
  }));
}

async function getRecentSignups(supabase: any) {
  // Get recent profiles with their user_id
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, full_name, created_at, subscription_tier')
    .order('created_at', { ascending: false })
    .limit(20);

  if (!profiles) return [];

  const result = [];

  for (const profile of profiles) {
    // Get analysis count
    const { count: analysisCount } = await supabase
      .from('analysis_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.user_id);

    // Get traffic source from their first session
    const { data: sessions } = await supabase
      .from('behavior_sessions')
      .select('utm_source, entry_referrer, started_at')
      .eq('user_id', profile.user_id)
      .order('started_at', { ascending: true })
      .limit(1);

    let source = 'Direct';
    if (sessions && sessions.length > 0) {
      const session = sessions[0];
      if (session.utm_source) {
        source = session.utm_source;
      } else if (session.entry_referrer) {
        try {
          const url = new URL(session.entry_referrer);
          source = url.hostname.replace('www.', '');
        } catch {
          source = 'Other';
        }
      }
    }

    result.push({
      userId: profile.user_id,
      name: profile.full_name || 'Anonymous',
      createdAt: profile.created_at,
      tier: profile.subscription_tier,
      analysisCount: analysisCount || 0,
      source,
    });
  }

  return result;
}

async function getUserJourney(supabase: any, userId: string) {
  // Get user's sessions
  const { data: sessions } = await supabase
    .from('behavior_sessions')
    .select('id, started_at, ended_at, entry_url, exit_page, total_pages, total_time_seconds, utm_source, entry_referrer')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(10);

  if (!sessions) return { sessions: [], events: [] };

  const sessionIds = sessions.map((s: any) => s.id);

  // Get events for these sessions
  const { data: events } = await supabase
    .from('behavior_events')
    .select('*')
    .in('session_id', sessionIds)
    .order('created_at', { ascending: true })
    .limit(100);

  // Get user profile for email
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, created_at, subscription_tier')
    .eq('user_id', userId)
    .single();

  // Get email from auth.users via service role
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);

  return {
    user: {
      email: authUser?.user?.email || 'Unknown',
      name: profile?.full_name || 'Anonymous',
      createdAt: profile?.created_at,
      tier: profile?.subscription_tier,
    },
    sessions: sessions || [],
    events: events || [],
  };
}
