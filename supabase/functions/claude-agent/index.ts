import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

const MODELS = {
  haiku: { id: "claude-haiku-4-5", inUsd: 0.80, outUsd: 4.00 },
  sonnet: { id: "claude-sonnet-4-5", inUsd: 3.00, outUsd: 15.00 },
};
const USD_TO_GBP = 0.79;
const PLAN_DAILY_LIMITS: Record<string, number> = { free: 5, starter: 25, pro: 100, trader: 500 };

// Intent → tool subset routing (max 6 tools per call)
const INTENT_KEYWORDS: Record<string, string[]> = {
  simulation: ["simulate", "scenario", "monte carlo", "what if", "outcome", "history"],
  portfolio: ["portfolio", "position", "weight", "holding", "allocation"],
  alerts: ["alert", "risk", "tracked", "watch", "threshold"],
  analysis: ["regime", "sentiment", "signal", "market", "price", "quote", "news"],
};

const ALL_TOOLS = [
  // simulation
  { name: "run_simulation", description: "Run a Monte Carlo trade simulation", input_schema: { type: "object", properties: { asset: { type: "string" }, market: { type: "string" }, direction: { type: "string", enum: ["long", "short"] }, entryPrice: { type: "number" }, timeHorizon: { type: "string" }, confidence: { type: "number" } }, required: ["asset", "entryPrice"] }, _domain: "simulation", _op: "run_simulation" },
  { name: "get_simulation_history", description: "List user's past simulations", input_schema: { type: "object", properties: { limit: { type: "number" } } }, _domain: "simulation", _op: "get_simulation_history" },
  { name: "get_simulation_detail", description: "Fetch a single past simulation", input_schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] }, _domain: "simulation", _op: "get_simulation_detail" },
  // portfolio
  { name: "get_portfolio", description: "Get user's portfolios and positions", input_schema: { type: "object", properties: {} }, _domain: "portfolio", _op: "get_portfolio" },
  { name: "add_position", description: "Add a position to a portfolio", input_schema: { type: "object", properties: { portfolioId: { type: "string" }, symbol: { type: "string" }, market: { type: "string" }, direction: { type: "string" }, weight: { type: "number" }, entryPrice: { type: "number" } }, required: ["portfolioId", "symbol"] }, _domain: "portfolio", _op: "add_position" },
  { name: "remove_position", description: "Remove a position", input_schema: { type: "object", properties: { positionId: { type: "string" } }, required: ["positionId"] }, _domain: "portfolio", _op: "remove_position" },
  { name: "update_position", description: "Update a position", input_schema: { type: "object", properties: { positionId: { type: "string" }, weight: { type: "number" } }, required: ["positionId"] }, _domain: "portfolio", _op: "update_position" },
  // alerts
  { name: "list_alerts", description: "List active risk alerts", input_schema: { type: "object", properties: {} }, _domain: "alerts", _op: "list_alerts" },
  { name: "list_tracked", description: "List tracked assets", input_schema: { type: "object", properties: {} }, _domain: "alerts", _op: "list_tracked" },
  { name: "dismiss_alert", description: "Dismiss an alert", input_schema: { type: "object", properties: { alertId: { type: "string" } }, required: ["alertId"] }, _domain: "alerts", _op: "dismiss_alert" },
  { name: "track_asset", description: "Start tracking an asset", input_schema: { type: "object", properties: { symbol: { type: "string" }, entryPrice: { type: "number" }, market: { type: "string" } }, required: ["symbol", "entryPrice"] }, _domain: "alerts", _op: "track_asset" },
  // analysis
  { name: "get_regime", description: "Get current market regime for an asset", input_schema: { type: "object", properties: { asset: { type: "string" } } }, _domain: "analysis", _op: "get_regime" },
  { name: "get_sentiment", description: "Get sentiment scores for an asset", input_schema: { type: "object", properties: { asset: { type: "string" }, limit: { type: "number" } }, required: ["asset"] }, _domain: "analysis", _op: "get_sentiment" },
  { name: "get_signals", description: "Get qualitative signals (news, posts) for an asset", input_schema: { type: "object", properties: { asset: { type: "string" }, limit: { type: "number" } }, required: ["asset"] }, _domain: "analysis", _op: "get_signals" },
  { name: "get_market_data", description: "Get cached market data for a symbol", input_schema: { type: "object", properties: { symbol: { type: "string" }, market: { type: "string" } }, required: ["symbol"] }, _domain: "analysis", _op: "get_market_data" },
];

const CACHE_TTL_SEC: Record<string, number> = {
  get_simulation_history: 60, get_simulation_detail: 600, get_portfolio: 30,
  list_alerts: 20, list_tracked: 60, get_regime: 300, get_sentiment: 180,
  get_signals: 300, get_market_data: 60,
};
const MUTATION_TOOLS = new Set(["add_position", "remove_position", "update_position", "dismiss_alert", "track_asset", "run_simulation"]);

function pickTools(userMsg: string) {
  const lower = userMsg.toLowerCase();
  const domains = new Set<string>();
  for (const [domain, kws] of Object.entries(INTENT_KEYWORDS)) {
    if (kws.some(k => lower.includes(k))) domains.add(domain);
  }
  if (domains.size === 0) { domains.add("simulation"); domains.add("analysis"); }
  const picked = ALL_TOOLS.filter(t => domains.has((t as any)._domain)).slice(0, 6);
  return picked.length ? picked : ALL_TOOLS.slice(0, 6);
}

function pickModel(userMsg: string, history: any[]) {
  const complex = /\b(why|explain|compare|analyse|analyze|strategy|optimi[sz]e|recommend|trade-?off)\b/i.test(userMsg);
  const longCtx = history.length > 4;
  return complex || longCtx ? MODELS.sonnet : MODELS.haiku;
}

async function sha256(s: string) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function callTool(sb: any, userId: string, tool: any, input: any, userJwt: string) {
  const cacheKey = `${userId}:${tool._domain}:${tool._op}:${await sha256(JSON.stringify(input))}`;
  const ttl = CACHE_TTL_SEC[tool._op];
  if (ttl) {
    const { data: hit } = await sb.from("mcp_tool_cache").select("payload, expires_at").eq("cache_key", cacheKey).maybeSingle();
    if (hit && new Date(hit.expires_at) > new Date()) return { result: hit.payload, cached: true };
  }
  const resp = await sb.functions.invoke(`mcp-${tool._domain}`, {
    body: { op: tool._op, ...input },
    headers: { Authorization: `Bearer ${userJwt}` },
  });
  if (resp.error) throw new Error(resp.error.message);
  const result = resp.data?.result ?? resp.data;
  if (ttl) {
    await sb.from("mcp_tool_cache").upsert({ cache_key: cacheKey, tool_name: tool._op, user_id: userId, payload: result, expires_at: new Date(Date.now() + ttl * 1000).toISOString() });
  }
  // Invalidate related cache on mutations
  if (MUTATION_TOOLS.has(tool._op)) {
    await sb.from("mcp_tool_cache").delete().eq("user_id", userId).like("cache_key", `${userId}:${tool._domain}:%`);
  }
  return { result, cached: false };
}

function compressResult(r: any): any {
  // Strip heavy fields before sending back to Claude (saves tokens)
  if (!r || typeof r !== "object") return r;
  const clone: any = Array.isArray(r) ? [...r] : { ...r };
  const heavy = ["historical_prices", "positions", "results", "data_sources"];
  for (const k of heavy) if (k in clone) {
    const v = clone[k];
    if (Array.isArray(v) && v.length > 20) clone[k] = { _truncated: true, _length: v.length, sample: v.slice(0, 5) };
    else if (typeof v === "object" && v && JSON.stringify(v).length > 2000) clone[k] = "[compressed]";
  }
  return clone;
}

async function recordUsage(sb: any, userId: string, modelId: string, tokensIn: number, tokensOut: number, toolCalls: number, cacheHits: number) {
  const model = Object.values(MODELS).find(m => m.id === modelId) || MODELS.haiku;
  const costUsd = (tokensIn / 1_000_000) * model.inUsd + (tokensOut / 1_000_000) * model.outUsd;
  const costGbp = costUsd * USD_TO_GBP;
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await sb.from("mcp_usage").select("*").eq("user_id", userId).eq("date", today).eq("model", modelId).maybeSingle();
  if (existing) {
    await sb.from("mcp_usage").update({
      claude_messages: existing.claude_messages + 1,
      tool_calls: existing.tool_calls + toolCalls,
      cache_hits: existing.cache_hits + cacheHits,
      tokens_input: existing.tokens_input + tokensIn,
      tokens_output: existing.tokens_output + tokensOut,
      estimated_cost: Number(existing.estimated_cost) + costGbp,
    }).eq("id", existing.id);
  } else {
    await sb.from("mcp_usage").insert({ user_id: userId, date: today, model: modelId, claude_messages: 1, tool_calls: toolCalls, cache_hits: cacheHits, tokens_input: tokensIn, tokens_output: tokensOut, estimated_cost: costGbp });
  }
}

async function checkDailyLimit(sb: any, userId: string): Promise<{ ok: boolean; used: number; limit: number; plan: string }> {
  const { data: profile } = await sb.from("profiles").select("subscription_plan").eq("user_id", userId).maybeSingle();
  const plan = profile?.subscription_plan || "free";
  const limit = PLAN_DAILY_LIMITS[plan] ?? 5;
  const today = new Date().toISOString().slice(0, 10);
  const { data: rows } = await sb.from("mcp_usage").select("claude_messages").eq("user_id", userId).eq("date", today);
  const used = (rows || []).reduce((a: number, r: any) => a + (r.claude_messages || 0), 0);
  return { ok: used < limit, used, limit, plan };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const userJwt = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: userData } = await sb.auth.getUser(userJwt);
  if (!userData?.user) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
  }
  const userId = userData.user.id;
  const { message } = await req.json();
  if (!message || typeof message !== "string" || message.length > 4000) {
    return new Response(JSON.stringify({ error: "invalid message" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }

  // Daily limit
  const limit = await checkDailyLimit(sb, userId);
  if (!limit.ok) {
    return new Response(JSON.stringify({ error: `Daily limit reached (${limit.used}/${limit.limit} for ${limit.plan})`, limit }), { status: 429, headers: { ...cors, "Content-Type": "application/json" } });
  }

  // Load + prune history to last 8
  const { data: hist } = await sb.from("mcp_agent_messages").select("role, content").eq("user_id", userId).order("created_at", { ascending: false }).limit(8);
  const history = (hist || []).reverse().map(m => ({ role: m.role, content: m.content }));

  // Save user message
  await sb.from("mcp_agent_messages").insert({ user_id: userId, role: "user", content: message });

  // Pick tools + model
  const tools = pickTools(message);
  const model = pickModel(message, history);
  const claudeTools = tools.map(t => ({ name: t.name, description: t.description, input_schema: t.input_schema }));
  const messages = [...history, { role: "user", content: message }];

  // Stream SSE response
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (obj: any) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));
      let totalIn = 0, totalOut = 0, toolCallCount = 0, cacheHitCount = 0;
      let assistantText = "";

      try {
        send({ type: "meta", model: model.id, tools: tools.map(t => t.name) });

        // Multi-turn tool loop (max 3 rounds)
        let workingMessages = messages.slice();
        for (let round = 0; round < 3; round++) {
          const resp = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
            body: JSON.stringify({
              model: model.id, max_tokens: 2048,
              system: "You are the OutputLens trading assistant. Use the provided tools to answer questions about the user's portfolio, simulations, and market regime. Be concise. Always cite which tool you used.",
              messages: workingMessages, tools: claudeTools,
            }),
          });
          if (!resp.ok) { send({ type: "error", message: `Claude ${resp.status}: ${(await resp.text()).slice(0, 200)}` }); break; }
          const data = await resp.json();
          totalIn += data.usage?.input_tokens || 0;
          totalOut += data.usage?.output_tokens || 0;

          const toolUses = (data.content || []).filter((c: any) => c.type === "tool_use");
          const textParts = (data.content || []).filter((c: any) => c.type === "text").map((c: any) => c.text).join("");
          if (textParts) { assistantText += textParts; send({ type: "text", delta: textParts }); }

          if (data.stop_reason !== "tool_use" || toolUses.length === 0) break;

          // Execute tools in parallel
          workingMessages.push({ role: "assistant", content: data.content });
          const toolResults = await Promise.all(toolUses.map(async (tu: any) => {
            const def = tools.find(t => t.name === tu.name);
            if (!def) return { type: "tool_result", tool_use_id: tu.id, content: "tool not available", is_error: true };
            send({ type: "tool_start", name: tu.name, input: tu.input });
            try {
              const { result, cached } = await callTool(sb, userId, def, tu.input, userJwt);
              toolCallCount++; if (cached) cacheHitCount++;
              send({ type: "tool_end", name: tu.name, cached });
              return { type: "tool_result", tool_use_id: tu.id, content: JSON.stringify(compressResult(result)) };
            } catch (e: any) {
              send({ type: "tool_error", name: tu.name, error: String(e?.message || e) });
              return { type: "tool_result", tool_use_id: tu.id, content: String(e?.message || e), is_error: true };
            }
          }));
          workingMessages.push({ role: "user", content: toolResults });
        }

        // Persist assistant message + usage
        if (assistantText) await sb.from("mcp_agent_messages").insert({ user_id: userId, role: "assistant", content: assistantText, tokens_input: totalIn, tokens_output: totalOut });
        await recordUsage(sb, userId, model.id, totalIn, totalOut, toolCallCount, cacheHitCount);

        send({ type: "done", tokens: { input: totalIn, output: totalOut }, toolCalls: toolCallCount, cacheHits: cacheHitCount });
      } catch (e: any) {
        send({ type: "error", message: String(e?.message || e) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { ...cors, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
});