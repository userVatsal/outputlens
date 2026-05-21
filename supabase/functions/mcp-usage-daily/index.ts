import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DAILY_BUDGET_GBP = 50; // alert threshold
const MIN_CACHE_HIT_RATE = 50;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  // Yesterday in UTC
  const d = new Date(); d.setUTCDate(d.getUTCDate() - 1);
  const day = d.toISOString().slice(0, 10);

  const { data: rows } = await sb.from("mcp_usage").select("*").eq("date", day);
  const totals = (rows || []).reduce((a, r: any) => ({
    cost: a.cost + Number(r.estimated_cost), tools: a.tools + r.tool_calls, hits: a.hits + r.cache_hits, msgs: a.msgs + r.claude_messages, tin: a.tin + r.tokens_input, tout: a.tout + r.tokens_output,
  }), { cost: 0, tools: 0, hits: 0, msgs: 0, tin: 0, tout: 0 });
  const cacheHitRate = totals.tools > 0 ? (totals.hits / totals.tools) * 100 : 0;

  // Expire old cache
  await sb.from("mcp_tool_cache").delete().lt("expires_at", new Date().toISOString());

  // Record platform metric
  await sb.from("platform_metrics").insert({
    metric_type: "mcp_daily", metric_name: "mcp_daily_summary", metric_value: totals.cost,
    dimensions: { date: day, ...totals, cacheHitRate, users: (rows || []).length },
  });

  const alerts: string[] = [];
  if (totals.cost > DAILY_BUDGET_GBP) alerts.push(`MCP daily cost £${totals.cost.toFixed(2)} exceeded budget £${DAILY_BUDGET_GBP}`);
  if (totals.tools > 50 && cacheHitRate < MIN_CACHE_HIT_RATE) alerts.push(`Cache hit rate ${cacheHitRate.toFixed(1)}% below ${MIN_CACHE_HIT_RATE}%`);

  if (alerts.length) {
    await sb.from("security_events").insert(alerts.map(message => ({
      event_type: "mcp_budget_alert", severity: "medium", threat_score: 0,
      request_metadata: { date: day, message, totals, cacheHitRate },
    })));
  }

  return new Response(JSON.stringify({ day, totals, cacheHitRate, alerts }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});