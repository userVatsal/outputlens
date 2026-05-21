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

async function authenticate(req: Request, body: any): Promise<{ userId: string; source: string } | null> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  // External MCP server path
  if (token === MCP_API_KEY && body?.userId) {
    return { userId: body.userId, source: "mcp-external" };
  }
  // In-app Supabase user
  try {
    const sb = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data } = await sb.auth.getUser(token);
    if (data?.user) return { userId: data.user.id, source: "in-app" };
  } catch (_) {}
  return null;
}

async function logAudit(sb: any, entry: any) {
  try { await sb.from("mcp_audit_log").insert(entry); } catch (_) {}
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const t0 = Date.now();
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  let body: any = {};
  try { body = await req.json(); } catch (_) {}
  const auth = await authenticate(req, body);
  if (!auth) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);
  const { op, ...args } = body;
  const argsHash = await sha256(JSON.stringify(args));

  try {
    let result: any;
    switch (op) {
      case "run_simulation": {
        // Proxy to analyze-trade edge function (existing) — minimum viable
        const { asset, market = "US", direction = "long", entryPrice, timeHorizon = "3-7 days", confidence = 5 } = args;
        if (!asset || !entryPrice) throw new Error("asset and entryPrice required");
        const resp = await sb.functions.invoke("analyze-trade", {
          body: { asset, market, direction, entryPrice, timeHorizon, userConfidence: confidence, userId: auth.userId },
        });
        if (resp.error) throw new Error(resp.error.message);
        result = resp.data;
        break;
      }
      case "get_simulation_history": {
        const limit = Math.min(args.limit || 10, 50);
        const { data, error } = await sb
          .from("analysis_history")
          .select("id, asset, market, direction, entry_price, time_horizon, created_at, results")
          .eq("user_id", auth.userId)
          .order("created_at", { ascending: false })
          .limit(limit);
        if (error) throw error;
        result = { history: data };
        break;
      }
      case "get_simulation_detail": {
        const { data, error } = await sb
          .from("analysis_history").select("*")
          .eq("user_id", auth.userId).eq("id", args.id).maybeSingle();
        if (error) throw error;
        result = data;
        break;
      }
      default:
        throw new Error(`unknown op: ${op}`);
    }
    const latency = Date.now() - t0;
    await logAudit(sb, {
      user_id: auth.userId, action: "tool_call", tool_name: `simulation.${op}`,
      args_hash: argsHash, status: "ok", latency_ms: latency,
      ip: req.headers.get("x-forwarded-for") || null, request_id: requestId, source: auth.source,
    });
    return new Response(JSON.stringify({ ok: true, result, requestId, latencyMs: latency }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    await logAudit(sb, {
      user_id: auth.userId, action: "tool_call", tool_name: `simulation.${op || "?"}`,
      args_hash: argsHash, status: "error", latency_ms: Date.now() - t0,
      ip: req.headers.get("x-forwarded-for") || null, request_id: requestId, source: auth.source,
      error_message: String(e?.message || e).slice(0, 500),
    });
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});