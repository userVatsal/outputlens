import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BehaviorInsight {
  type: string;
  title: string;
  description: string;
  metric: string | number;
  recommendation?: string;
  priority: "high" | "medium" | "low";
}

interface PageStats {
  page_url: string;
  page_views: number;
  avg_time_seconds: number;
  avg_scroll_depth: number;
  bounce_rate: number;
  exit_rate: number;
}

interface DropOffPoint {
  page_url: string;
  exit_count: number;
  total_sessions: number;
  exit_rate: number;
}

interface BehaviorSession {
  id: string;
  visitor_id: string;
  entry_url: string;
  entry_referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  exit_page: string | null;
  exit_reason: string | null;
  total_time_seconds: number | null;
  total_pages: number | null;
  converted: boolean;
}

interface BehaviorEvent {
  id: string;
  session_id: string;
  event_type: string;
  page_url: string;
  page_type: string | null;
  event_data: Record<string, unknown>;
}

interface ExitSurveyResponse {
  id: string;
  session_id: string | null;
  exit_page: string;
  reason: string | null;
  looking_for: string | null;
  additional_feedback: string | null;
}

interface CursorHeatmapRecord {
  id: string;
  session_id: string;
  page_url: string;
  positions: Array<{ x: number; y: number; t?: number }>;
  viewport_width: number | null;
  viewport_height: number | null;
}

// deno-lint-ignore no-explicit-any
type SupabaseClient = ReturnType<typeof createClient<any>>;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const { action, startDate, endDate, pageUrl } = body;

    // Default to last 7 days
    const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    if (action === "get-insights") {
      const insights = await generateInsights(supabase, start, end);
      return new Response(JSON.stringify({ insights }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get-heatmap") {
      const heatmapData = await getHeatmapData(supabase, pageUrl, start, end);
      return new Response(JSON.stringify({ heatmap: heatmapData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get-page-stats") {
      const stats = await getPageStats(supabase, start, end);
      return new Response(JSON.stringify({ stats }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get-drop-offs") {
      const dropOffs = await getDropOffPoints(supabase, start, end);
      return new Response(JSON.stringify({ dropOffs }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get-survey-responses") {
      const responses = await getSurveyResponses(supabase, start, end);
      return new Response(JSON.stringify({ responses }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[behavior-insights] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function generateInsights(
  supabase: SupabaseClient,
  start: string,
  end: string
): Promise<BehaviorInsight[]> {
  const insights: BehaviorInsight[] = [];

  // Get session data
  const { data: sessionsRaw } = await supabase
    .from("behavior_sessions")
    .select("*")
    .gte("started_at", start)
    .lte("started_at", end);

  const sessions = (sessionsRaw || []) as BehaviorSession[];

  if (sessions.length === 0) {
    return [
      {
        type: "info",
        title: "No data yet",
        description: "Start tracking to see behavioral insights",
        metric: 0,
        priority: "low",
      },
    ];
  }

  const totalSessions = sessions.length;
  const convertedSessions = sessions.filter((s) => s.converted).length;
  const conversionRate = ((convertedSessions / totalSessions) * 100).toFixed(1);

  // Conversion rate insight
  insights.push({
    type: "conversion",
    title: "Conversion Rate",
    description: `${conversionRate}% of sessions resulted in signup or analysis`,
    metric: `${conversionRate}%`,
    priority: Number(conversionRate) < 5 ? "high" : "medium",
    recommendation:
      Number(conversionRate) < 5
        ? "Consider simplifying the signup flow or adding more social proof"
        : undefined,
  });

  // Referrer analysis
  const referrerGroups: Record<string, number> = {};
  sessions.forEach((s) => {
    const ref = s.entry_referrer || "direct";
    let domain = "Direct";
    if (ref !== "direct") {
      try {
        domain = new URL(ref).hostname;
      } catch {
        domain = ref;
      }
    }
    referrerGroups[domain] = (referrerGroups[domain] || 0) + 1;
  });

  const topReferrer = Object.entries(referrerGroups).sort((a, b) => b[1] - a[1])[0];
  if (topReferrer) {
    insights.push({
      type: "traffic",
      title: "Top Traffic Source",
      description: `${topReferrer[0]} drives ${((topReferrer[1] / totalSessions) * 100).toFixed(1)}% of traffic`,
      metric: topReferrer[1],
      priority: "medium",
    });
  }

  // UTM campaign analysis
  const campaignSessions = sessions.filter((s) => s.utm_source);
  if (campaignSessions.length > 0) {
    const campaignGroups: Record<string, number> = {};
    campaignSessions.forEach((s) => {
      const key = `${s.utm_source}/${s.utm_medium || "none"}`;
      campaignGroups[key] = (campaignGroups[key] || 0) + 1;
    });

    const topCampaign = Object.entries(campaignGroups).sort((a, b) => b[1] - a[1])[0];
    insights.push({
      type: "campaign",
      title: "Top Campaign",
      description: `${topCampaign[0]} brought ${topCampaign[1]} sessions`,
      metric: topCampaign[1],
      priority: "medium",
    });
  }

  // Average session duration
  const avgDuration =
    sessions.reduce((acc, s) => acc + (s.total_time_seconds || 0), 0) / totalSessions;
  insights.push({
    type: "engagement",
    title: "Average Session Duration",
    description: `Users spend ${Math.round(avgDuration)} seconds on average`,
    metric: `${Math.round(avgDuration)}s`,
    priority: avgDuration < 30 ? "high" : "low",
    recommendation:
      avgDuration < 30 ? "Users are leaving quickly. Consider improving above-the-fold content" : undefined,
  });

  // Exit survey insights
  const { data: surveysRaw } = await supabase
    .from("exit_survey_responses")
    .select("*")
    .gte("created_at", start)
    .lte("created_at", end);

  const surveys = (surveysRaw || []) as ExitSurveyResponse[];

  if (surveys.length > 0) {
    const reasonCounts: Record<string, number> = {};
    surveys.forEach((s) => {
      if (s.reason) {
        reasonCounts[s.reason] = (reasonCounts[s.reason] || 0) + 1;
      }
    });

    const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0];
    if (topReason) {
      const reasonLabels: Record<string, string> = {
        just_browsing: "Just browsing",
        not_what_i_need: "Not what they need",
        too_complex: "Found it too complex",
        pricing: "Pricing concerns",
        need_more_info: "Need more information",
        will_return: "Planning to return",
      };

      insights.push({
        type: "exit",
        title: "Top Exit Reason",
        description: `${reasonLabels[topReason[0]] || topReason[0]}: ${topReason[1]} responses`,
        metric: topReason[1],
        priority: topReason[0] === "pricing" || topReason[0] === "too_complex" ? "high" : "medium",
        recommendation:
          topReason[0] === "pricing"
            ? "Consider adding more value messaging or a lower entry tier"
            : topReason[0] === "too_complex"
              ? "Simplify the UI or add more onboarding guidance"
              : undefined,
      });
    }
  }

  return insights;
}

async function getHeatmapData(
  supabase: SupabaseClient,
  pageUrl: string,
  start: string,
  end: string
) {
  const { data: dataRaw } = await supabase
    .from("cursor_heatmap")
    .select("positions, viewport_width, viewport_height")
    .eq("page_url", pageUrl)
    .gte("recorded_at", start)
    .lte("recorded_at", end);

  const data = (dataRaw || []) as Pick<CursorHeatmapRecord, "positions" | "viewport_width" | "viewport_height">[];

  if (data.length === 0) return null;

  // Aggregate all positions
  const allPositions: Array<{ x: number; y: number; count: number }> = [];
  const positionMap = new Map<string, number>();

  data.forEach((record) => {
    const positions = record.positions;
    positions.forEach((pos) => {
      // Round to grid cells (5% increments)
      const gridX = Math.round(pos.x / 5) * 5;
      const gridY = Math.round(pos.y / 5) * 5;
      const key = `${gridX},${gridY}`;
      positionMap.set(key, (positionMap.get(key) || 0) + 1);
    });
  });

  positionMap.forEach((count, key) => {
    const [x, y] = key.split(",").map(Number);
    allPositions.push({ x, y, count });
  });

  return {
    positions: allPositions.sort((a, b) => b.count - a.count).slice(0, 500),
    totalSamples: data.length,
  };
}

async function getPageStats(
  supabase: SupabaseClient,
  start: string,
  end: string
): Promise<PageStats[]> {
  const { data: eventsRaw } = await supabase
    .from("behavior_events")
    .select("page_url, event_type, event_data")
    .gte("created_at", start)
    .lte("created_at", end);

  const events = (eventsRaw || []) as Pick<BehaviorEvent, "page_url" | "event_type" | "event_data">[];

  if (events.length === 0) return [];

  const pageStats = new Map<string, { views: number; scrollDepths: number[]; times: number[] }>();

  events.forEach((event) => {
    if (!pageStats.has(event.page_url)) {
      pageStats.set(event.page_url, { views: 0, scrollDepths: [], times: [] });
    }
    const stats = pageStats.get(event.page_url)!;

    if (event.event_type === "page_view") {
      stats.views++;
      const eventData = event.event_data as { timeOnPreviousPage?: number };
      if (eventData?.timeOnPreviousPage) stats.times.push(eventData.timeOnPreviousPage);
    }

    if (event.event_type === "scroll") {
      const eventData = event.event_data as { scrollDepth?: number };
      if (eventData?.scrollDepth) stats.scrollDepths.push(eventData.scrollDepth);
    }
  });

  return Array.from(pageStats.entries()).map(([page_url, stats]) => ({
    page_url,
    page_views: stats.views,
    avg_time_seconds: stats.times.length > 0 ? Math.round(stats.times.reduce((a, b) => a + b, 0) / stats.times.length) : 0,
    avg_scroll_depth:
      stats.scrollDepths.length > 0
        ? Math.round(stats.scrollDepths.reduce((a, b) => a + b, 0) / stats.scrollDepths.length)
        : 0,
    bounce_rate: 0,
    exit_rate: 0,
  }));
}

async function getDropOffPoints(
  supabase: SupabaseClient,
  start: string,
  end: string
): Promise<DropOffPoint[]> {
  const { data: sessionsRaw } = await supabase
    .from("behavior_sessions")
    .select("exit_page")
    .gte("started_at", start)
    .lte("started_at", end)
    .not("exit_page", "is", null);

  const sessions = (sessionsRaw || []) as Pick<BehaviorSession, "exit_page">[];

  if (sessions.length === 0) return [];

  const exitCounts = new Map<string, number>();
  sessions.forEach((s) => {
    if (s.exit_page) {
      exitCounts.set(s.exit_page, (exitCounts.get(s.exit_page) || 0) + 1);
    }
  });

  const totalSessions = sessions.length;

  return Array.from(exitCounts.entries())
    .map(([page_url, exit_count]) => ({
      page_url,
      exit_count,
      total_sessions: totalSessions,
      exit_rate: Math.round((exit_count / totalSessions) * 100),
    }))
    .sort((a, b) => b.exit_count - a.exit_count);
}

async function getSurveyResponses(
  supabase: SupabaseClient,
  start: string,
  end: string
) {
  const { data } = await supabase
    .from("exit_survey_responses")
    .select("*")
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: false });

  return data || [];
}
