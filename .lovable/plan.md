# OutputLens MCP Build Plan

Scope picked: everything that fits in Lovable + Claude proxied through an edge function. Splitting into 3 phases so each one is reviewable.

## Phase A — Standalone MCP server (downloadable artifact)

Generate the full `outputlens-mcp/` Node project to `/mnt/documents/outputlens-mcp.zip`. Nothing is added to the Lovable app — this is the package you deploy to Railway/Fly/Render or run locally with Claude Desktop.

Files generated exactly per spec:
- `index.js` (stdio + `--http` SSE modes)
- `tools/{simulation,portfolio,regime,alerts,analysis}.js` (15 tools)
- `lib/{api-client,auth}.js`
- `package.json`, `.env.example`, `README.md`

The server calls `https://outputlens.com/functions/v1/mcp-*` (the edge functions built in Phase B) using a shared `OUTPUTLENS_API_KEY`.

## Phase B — Edge function backend

Instead of 15 separate edge functions, consolidate into **5 routers** (one per domain) that switch on a `path` field. Easier to deploy, share validation/auth.

- `mcp-simulation` → run / get / history / compare
- `mcp-portfolio` → get / add position / remove position / health
- `mcp-regime` → current / history
- `mcp-alerts` → list / create / dismiss
- `mcp-analysis` → var / correlation / scenario / save_scenario

Shared logic (in each function, no shared file possible in edge runtime):
- Validate `Authorization: Bearer $MCP_API_KEY` + `x-mcp-agent: true`
- Resolve `userId` from body/params, scope all DB queries by it
- Zod input validation, CORS, structured JSON responses

Implementations reuse the existing deterministic risk engine in `src/lib/engine/` where possible. Since edge functions can't import frontend code, the engine modules will be **inlined/ported** into each function (read-only copies of `gbm.ts`, `var.ts`, etc.). Scenario / correlation / VaR use the same math as the in-app analyzer so MCP results match what users see in the UI.

New secrets required:
- `MCP_API_KEY` — shared bearer token between MCP server and edge functions

New table:
- `saved_scenarios` already exists ✓
- `risk_alerts` already exists ✓
- May need a `mcp_simulations` table to persist runs callable by `get_simulation_history` — or reuse `analysis_history`. **Decision: reuse `analysis_history`** to keep MCP results visible in the existing History page.

## Phase C — In-app Claude agent

A floating "Ask OutputLens AI" panel inside `AppShell` (bottom-right pill, opens a chat drawer). Uses the same 15 tools so the conversational experience inside the app matches what external Claude users get.

- New edge function `claude-agent`:
  - Server-side `ANTHROPIC_API_KEY` (added via secrets tool)
  - Implements the agentic tool loop from the spec
  - Calls the Phase B `mcp-*` functions internally (no Anthropic key in browser)
- Frontend:
  - `src/components/agent/AgentDrawer.tsx` — chat UI with tool-call indicators
  - `src/hooks/useClaudeAgent.tsx` — message state + streaming
  - Mount in `AppShell` so it's available on every authenticated page

Reward loop: each tool call shows an animated "Running simulation on AAPL…" chip → result inline → suggested next-action button. Matches retention philosophy from earlier phases.

---

## What I need from you to start

1. **Anthropic API key** — I'll trigger the secret prompt for `ANTHROPIC_API_KEY` and `MCP_API_KEY` at the start of Phase B.
2. **Confirm phase order** — I'll do A → B → C, pausing between phases for review. Reply "go" and I start Phase A (zero risk, just generates a zip file).