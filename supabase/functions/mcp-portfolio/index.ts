import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-mcp-agent, x-request-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MCP_API_KEY = Deno.env.get("MCP_API_KEY")!;
async function sha256(s: string) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join("");
}
async function authenticate(req: Request, body: any) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (token === MCP_API_KEY && body?.userId) return { userId: body.userId, source: "mcp-external" };
  try {
    const sb = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data } = await sb.auth.getUser(token);
    if (data?.user) return { userId: data.user.id, source: "in-app" };
  } catch (_) {}
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const t0 = Date.now();
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  let body: any = {};
  try { body = await req.json(); } catch (_) {}
  const auth = await authenticate(req, body);
  if (!auth) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);
  const { op, ...args } = body;
  const argsHash = await sha256(JSON.stringify(args));
  try {
    let result: any;
    switch (op) {
      case "get_portfolio": {
        const { data: portfolios } = await sb.from("saved_portfolios").select("*").eq("user_id", auth.userId);
        const { data: positions } = await sb.from("portfolio_assets").select("*").eq("user_id", auth.userId);
        result = { portfolios: portfolios || [], positions: positions || [] };
        break;
      }
      case "add_position": {
        const { portfolioId, symbol, market = "US", direction = "long", weight = 10, entryPrice, assetName } = args;
        if (!portfolioId || !symbol) throw new Error("portfolioId and symbol required");
        const { data, error } = await sb.from("portfolio_assets").insert({
          portfolio_id: portfolioId, user_id: auth.userId, symbol, market, direction, weight, entry_price: entryPrice, asset_name: assetName,
        }).select().single();
        if (error) throw error;
        result = { position: data };
        break;
      }
      case "remove_position": {
        const { error } = await sb.from("portfolio_assets").delete().eq("id", args.positionId).eq("user_id", auth.userId);
        if (error) throw error;
        result = { removed: args.positionId };
        break;
      }
      case "update_position": {
        const { positionId, ...patch } = args;
        const { data, error } = await sb.from("portfolio_assets").update(patch).eq("id", positionId).eq("user_id", auth.userId).select().single();
        if (error) throw error;
        result = { position: data };
        break;
      }
      default: throw new Error(`unknown op: ${op}`);
    }
    await sb.from("mcp_audit_log").insert({ user_id: auth.userId, action: "tool_call", tool_name: `portfolio.${op}`, args_hash: argsHash, status: "ok", latency_ms: Date.now() - t0, request_id: requestId, source: auth.source });
    return new Response(JSON.stringify({ ok: true, result, requestId, latencyMs: Date.now() - t0 }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e: any) {
    await sb.from("mcp_audit_log").insert({ user_id: auth.userId, action: "tool_call", tool_name: `portfolio.${op || "?"}`, args_hash: argsHash, status: "error", latency_ms: Date.now() - t0, request_id: requestId, source: auth.source, error_message: String(e?.message || e).slice(0, 500) });
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }
});