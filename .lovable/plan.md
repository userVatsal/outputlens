# OutputLens Authenticated Experience — Retention-First Rebuild

Full rebuild of every post-signup page into a quant-terminal shell with sidebar + AI feed, designed around hook-model loops (trigger → action → reward → investment).

Scope is large, so it ships in 4 phases. Each phase leaves the app in a working state.

---

## Phase 1 — Global Authenticated Shell

The foundation everything else plugs into.

**New layout component** `src/components/layout/AppShell.tsx` (replaces `Layout` on all authenticated routes):

- Left sidebar 240px (`AppSidebar.tsx`) — uses shadcn `Sidebar` with `collapsible="icon"`
  - Primary CTA: New Simulation (cyan, always pinned top)
  - Groups: Workspace · Intelligence · Tools
  - Active route: 3px cyan left border + elevated bg
  - Regime Monitor item: live pulsing cyan dot when high-vol regime active
  - Risk Alerts item: red badge with unread count
  - Footer: streak chip ("🔥 7-day streak") + subtle upgrade nudge
- Top bar 56px (`AppTopBar.tsx`)
  - Breadcrumb (route-driven)
  - CMD+K command palette (`cmdk` package) — assets, portfolios, saved analyses
  - Market status pill (NYSE OPEN/CLOSED/PRE-MARKET, time-based, no API)
  - Alerts bell with badge + avatar dropdown
- Right AI Intelligence Feed (`AIFeedPanel.tsx`), 320px, collapsible
  - Stack of insight cards, newest on top, slide-down animation
  - Unread cards: 2px cyan left border
  - Seeded with rotating mock signals (regime, vol compression, divergence)

**Hooks**:
- `useStreak()` — reads `analysis_history`, computes consecutive-day streak, persists last-seen in localStorage
- `useMarketStatus()` — pure client-side from UTC clock + NYSE hours
- `useAlertsCount()` — reads existing `risk_alerts` table, returns unread count
- `useAIFeed()` — local seeded feed (no backend), rotates every 45–90s

**Routing**: Wrap `/dashboard`, `/workspace`, `/portfolio`, `/history`, `/account`, `/tracked-assets`, plus new `/regime`, `/alerts`, `/scenarios` in `AppShell`.

---

## Phase 2 — Dashboard + Simulation (core daily loop)

### Dashboard rewrite (`src/pages/Dashboard.tsx`)

Five zones, top to bottom:

1. **Greeting + context bar** — personalised line referencing live elevated-tail-risk count, market-open countdown
2. **Portfolio KPI row** — 4 cards: Portfolio at Risk · 1-Day VaR · Expected Shortfall · Regime State. Mono numbers, deterioration drives amber/red bg tint, each card has `Drill In →`
3. **Portfolio distribution fan chart** — reuses `MonteCarloHero` engine, full-width 280px, freshness stamp + `[Update Now]`
4. **Positions table** — sorted by tail-risk desc; tail-risk score 0–100 colour bar; row-hover reveals `[Analyse] [Add to Scenario]`
5. **Activity + Insights** — two columns: Recent Simulations (from `analysis_history`) + AI Insights teasers linking into right panel

### Simulation rewrite (`src/pages/Workspace.tsx`)

Three-pane: configurator (left 320px) · running/results (centre) · keeps AI feed on right.

- Configurator with collapsible sections (Time Horizon pills · Model Selection radio with rationale · Simulation Parameters sliders · optional Scenarios)
- Run button shows estimated time + count of previous runs on this asset
- Running state: full-pane cyan ring + counter 0→10,000 + stepped status messages (reuses Welcome page motion)
- Results as 5 tabs:
  1. **Distribution** — fan chart + KPI row + interactive probability queries ("P(AAPL > $X in 3M) = ...")
  2. **Percentiles** — P1–P99 table with contextual interpretation
  3. **Tail Risk** — histogram vs normal overlay, fat-tail call-out
  4. **Scenarios** — base vs stress side-by-side
  5. **AI Analysis** — structured commentary + Suggested Next Analyses (each a 1-click new sim)

---

## Phase 3 — Portfolio · Regime Monitor · Alerts

- **Portfolio Analyser** (`src/pages/Portfolio.tsx`): builder table with weight bars and remaining-allocation indicator → correlation heatmap + portfolio vs individual overlay + efficient frontier + historical-crisis grid (2008/2020/2022/2010)
- **Regime Monitor** (new `src/pages/Regime.tsx`): large status panel with regime-tinted bg, 90-day regime history timeline with user's simulation pins, watchlist regime table with divergence pulses. Uses existing `hmm.ts` on cached market data
- **Risk Alerts** (new `src/pages/Alerts.tsx`): card feed from `risk_alerts` table (CRITICAL/WARNING/SIGNAL/INFO with the prescribed colors), dismiss/snooze, configuration panel for per-asset thresholds and digest toggles (writes to `tracked_assets.risk_threshold` + new `profiles.contact_preferences` keys — no schema change)

---

## Phase 4 — History · Scenario Builder · polish

- **Simulation History** (`src/pages/History.tsx`): animated stats strip (47 sims · 12 assets · 3 portfolios · since X), filter pills, card grid with star/pin, compare mode (select 2 → diff view showing metric deltas since the older run)
- **Scenario Builder** (new `src/pages/Scenarios.tsx`): canvas with draggable parameter blocks (Market Shock · Macro · Asset-Specific), save scenarios to a new lightweight `saved_scenarios` table (single migration), apply scenario to any simulation
- **Cross-cutting polish**: streak persistence + break-recovery toast, "X days old — re-run" obsolescence prompts on stale analyses, completion-compulsion zero-badge behaviour on alerts

---

## Technical notes

- All colour via existing HSL semantic tokens. No raw hex.
- Numbers in `font-mono` (JetBrains Mono, tabular-nums); headings `Sora`; UI `DM Sans`.
- Sidebar uses shadcn `Sidebar` (already installed). CMD+K uses shadcn `Command` + `cmdk` (already installed).
- AI feed cards, market status, streak: client-side only — no edge function or schema changes in Phase 1.
- Phase 3 alerts page reads existing `risk_alerts` (RLS already correct).
- Phase 4 scenario builder is the only schema touch: one migration adds `saved_scenarios (id, user_id, name, blocks jsonb, created_at)` with standard own-row RLS.
- Reuses existing engine modules (`src/lib/engine/**`) — no new math.
- Files removed from authenticated pages: `DashboardHero`, `WorkspacePreview`, `WhySection`, `LatestArticles`, `WorkspaceCTA` (marketing-shaped components incompatible with the terminal layout). Kept on Landing only.

---

## Ship order

1. **Phase 1** in next turn (shell + sidebar + AI feed + top bar wired to existing pages — no page content changes yet).
2. Phases 2–4 in subsequent turns, each gated on you confirming the previous one feels right before I rebuild more pages.

Reply **"go"** to start Phase 1, or tell me to reorder/cut.
