
# Post-Login Redesign: Bloomberg Terminal, Better

## What's Wrong Right Now

Every authenticated page suffers from the same core problem: they look like admin panels from a generic SaaS starter template. Specifically:

- **Dashboard**: The `AccountHeader` and `DashboardHero` are two separate strips doing the same job. Cards everywhere. The `WorkspacePreview` is generic. `AlertsPanel` uses the default shadcn `Card` wrapper.
- **Workspace**: A white form card on the left, a white results card on the right. No sense of a "terminal" or "instrument." The loading state is just a spinner and plain text. The results section is a loose stack of individual cards with no cohesion.
- **Auth**: A basic centered form with a white header. No brand presence.
- **History**: An okay table list but with no visual hierarchy — every row looks identical.
- **Account**: Generic tabs with generic form fields.
- **TrackedAssets**: Card grid with shadcn `Card` components. Looks like any todo app.

## Design Principles for Post-Login

1. **Dark sidebar or dark top-bar for app chrome** — authenticated app feels different from the marketing site
2. **Data density without clutter** — Bloomberg-style: show more in less space, but every element earns its place
3. **Monospace for numbers** — all financial figures use `font-mono`
4. **Terminal-inspired inputs** — dark backgrounds, border-focus, scan-line feel
5. **Color as signal only** — green = profit/bullish, red = loss/bearish, blue = action, amber = warning. Never decorative.
6. **No generic shadcn Cards** — replace with custom panels that use `border-l-4` accents, dark headers, and tight padding

---

## Files to Change

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Full split-screen layout |
| `src/pages/Dashboard.tsx` | New layout: merge AccountHeader+Hero into one strip, redesign all panels |
| `src/pages/Workspace.tsx` | Terminal-style input panel, dramatic loading state, results overhaul |
| `src/pages/History.tsx` | Bloomberg-style data table with row hover |
| `src/pages/Account.tsx` | Clean settings layout, left sidebar tabs |
| `src/pages/TrackedAssets.tsx` | Data table instead of card grid |
| `src/components/dashboard/DashboardHero.tsx` | Merge into slim command strip |
| `src/components/dashboard/AccountHeader.tsx` | Eliminate — merge into DashboardHero |
| `src/components/dashboard/AlertsPanel.tsx` | Redesign as dark-header panel |
| `src/components/dashboard/WorkspacePreview.tsx` | Redesign as pipeline diagram |
| `src/components/dashboard/QuickActions.tsx` | Already good — minor polish |
| `src/components/workspace/RiskSnapshot.tsx` | Terminal-style metric blocks |
| `src/components/workspace/TailRiskPanel.tsx` | Dark header panel, table-style risk rows |
| `src/components/workspace/ScenarioRegimeCards.tsx` | Horizontal bar chart style, not cards |
| `src/components/workspace/PnLSummary.tsx` | Ledger-style layout |
| `src/components/workspace/ActionPanel.tsx` | Compact toolbar, not icon buttons |

---

## Page-by-Page Design

### 1. Auth Page — Split Screen

**Left panel (40% width, dark navy `#1B2B4B`):**
- OutputLens logo top-left
- Large centered quote: *"Know your risk before you risk your money."*
- Three bullet value props with checkmarks: "10,000 Monte Carlo paths", "Live market data", "AI scenario interpretation"
- Bottom: small footer with Privacy and Terms links

**Right panel (60% width, near-white background):**
- "Welcome back" or "Create account" heading, left-aligned
- Clean form with dark-border inputs
- Google OAuth button styled distinctly
- Mode toggle (Sign In / Sign Up) as tabs, not a link
- No header — the split-screen IS the brand presence

### 2. Dashboard — Command Centre Layout

Eliminate the separate `AccountHeader` + `DashboardHero` strips — merge into ONE thin command bar:

```
[ JS Avatar ] Good morning, Alex  [ Pro badge ]  [ 3/5 analyses used ██░░░ ]  [ Run Analysis → ]
```

This is the entire top area — one row, no marketing copy.

Below it, a 3-column stat strip (no cards):
```
| 12 Reports | 4 Tracked Assets | 2 Active Alerts |
  (linked)     (linked)           (linked)
```

Then a 2-column layout:
- **Left (7/12)**: WorkspacePreview redesigned as a dark terminal panel showing the analysis pipeline with animated steps
- **Right (5/12)**: AlertsPanel redesigned with a dark header and compact alert rows (not shadcn Cards)

Below: full-width grid of Tracked Assets as a data table (not cards), then Recent Reports + Latest Articles side by side.

Remove `WhySection` — user is already a customer, this is marketing copy in the wrong place.

### 3. Workspace — The Terminal

**Layout**: Keep the 5/7 column split but completely change the styling.

**Left column — Input Panel:**
- Dark navy header band: "RISK WORKSPACE" in caps, monospace, with a green pulsing "LIVE" dot
- Step indicators become a horizontal stepper with connected dots
- Inputs styled with dark backgrounds (`bg-[#1B2B4B]/5`), thick focus borders in primary blue
- "Run Analysis" button spans full width, deep navy → blue gradient
- Usage indicator becomes a thin progress bar at the top of the panel, not a separate card

**Right column — Results:**
- Empty state: replace the dashed border card with a full-height terminal window showing a blinking cursor and: `> Waiting for input...`
- Loading state: animated terminal with typewriter text:
  ```
  > Fetching TSLA live price... ✓
  > Building volatility surface... ✓
  > Running 10,000 Monte Carlo paths...
  > [████████░░] 82%
  ```

**Results — Each Section Redesigned:**

**RiskSnapshot**: 4 metric blocks in a dark header panel. No rounded bubbles — instead, a horizontal strip:
```
RISK SCORE      WIN PROB        TAIL RISK       EXPECTED P&L
  7.2 / 10       54.3%           3.1%            +$284
  HIGH          POSITIVE        ELEVATED        BULLISH
```

**PnLSummary**: Ledger-style table with alternating row shading:
```
POSITION SUMMARY                             100 shares × $182.50
─────────────────────────────────────────────────────
Expected Return    +$284.00        +1.56%      @ $185.35
Best Upside        +$1,240.00      +6.8%       @ $194.90
Worst Downside     -$640.00        -3.5%       @ $176.12
─────────────────────────────────────────────────────
VaR 95%            -$492.00        -2.7%       5% of paths
Expected Shortfall -$720.00        -3.9%       worst 5% avg
```

**TailRiskPanel**: Dark amber-header panel with a horizontal probability bar across the top showing the 3.1% with a visual indicator on a scale.

**ScenarioRegimeCards**: Replace the 3-column card grid with a single panel containing 3 rows — one per regime — each showing a horizontal bar proportional to probability, colored green/blue/red. Much more information dense.

**RiskInterpretation**: Dark panel with "AI ANALYSIS" header and a clean monospace rendering of bullet points. Each bullet gets a left-border accent line in primary blue.

**ActionPanel**: Compact horizontal toolbar with text buttons + icons (not icon-only stacked cards):
```
[ New Analysis ]  [ Track Asset ]  [ Monitor Risk ]  [ Add to Portfolio ]  [ ↓ Export PDF ]  [ ↓ CSV ]
```

### 4. History Page — Data Table

Replace the list of button items with a proper data table:

```
DATE         ASSET    DIRECTION   MARKET    ENTRY     HORIZON    
─────────────────────────────────────────────────────────────────
2 Jan 2026   TSLA     LONG ↑     US        $182.50   7 days    →
1 Jan 2026   AAPL     LONG ↑     US        $195.20   3 days    →
31 Dec 2025  BTC      SHORT ↓    Crypto    $96,400   1 day     →
```

- Sticky table header with dark navy background
- Row hover highlights the entire row in `bg-primary/5`
- Direction badge inline (small green/red pill)
- Chevron on the right to indicate clickable
- Search/filter bar at the top
- Empty state is a dark terminal panel: `> No analysis history found.`

### 5. Account Page — Settings Layout

Replace the generic tabs at the top with a **left sidebar navigation** on desktop (stacks to tabs on mobile):

```
┌─────────────┬───────────────────────────────────┐
│  Profile    │                                   │
│  ─────────  │   Profile Settings                │
│  Billing    │                                   │
│  Privacy    │   [Avatar]  Display Name          │
│             │             Username              │
│             │             Email (read-only)     │
│             │                                   │
│             │   [ Save Changes ]                │
└─────────────┴───────────────────────────────────┘
```

Profile tab: clean 2-column form layout with floating labels
Billing tab: current plan card + usage bar + upgrade/manage button
Privacy tab: consent checkboxes with version info

### 6. TrackedAssets Page — Data Table

Replace the card grid with a proper monitoring table:

```
SYMBOL    MARKET    DIRECTION   ENTRY     RISK@TRACK   CURRENT RISK   DELTA      STATUS    ACTIONS
────────────────────────────────────────────────────────────────────────────────────────────────────
TSLA      US        LONG ↑      $182.50   6.2 / 10     7.1 / 10       +0.9 ▲    ACTIVE    Analyze | ⏸ | ✕
AAPL      US        LONG ↑      $195.20   4.1 / 10     4.0 / 10        -0.1 ▼   ACTIVE    Analyze | ⏸ | ✕
BTC       Crypto    SHORT ↓     $96,400   8.5 / 10     8.5 / 10        0.0 —    PAUSED    Analyze | ▶ | ✕
```

- Risk delta shows colored up/down arrows
- Threshold breached rows get a left `border-l-4 border-destructive`
- Status as a small colored dot (green = active, gray = paused)
- Actions inline at the end of each row

---

## WorkspacePreview (Dashboard) — Pipeline Diagram

The current animation is functional but looks generic. New design:

A dark terminal window (full width, `bg-[#0f172a]`) with:
- Top bar: three dots + title "OutputLens Risk Engine"
- Left: vertical numbered pipeline steps (connected by a line)
- Right: Live mock results panel that populates after the animation completes

Steps:
```
01 → Asset Selection         TSLA / US Markets / LONG
02 → Live Data Fetch         Price: $182.50 | Vol: 28.4%
03 → Monte Carlo Simulation  10,000 paths | Regime: VOLATILE
04 → AI Analysis             Risk: 7.2/10 | Win: 54.3%
```

When step 4 completes, a mini results preview slides in on the right:
- Risk badge (7.2/10, red)
- Win probability bar (54.3%)
- 3 scenario chips (Base/Upside/Tail)

---

## Animation Changes

- Remove all `animate-pulse` decorative blobs from authenticated pages
- Keep the green `pulse-dot` on the LIVE indicator
- Terminal loading animation uses `setTimeout` chains (no new deps)
- Metric numbers use a CSS counter animation when they first appear
- Row hover transitions use `transition-colors duration-100` — fast, not slow

---

## Technical Notes

- All existing hooks (`useTrade`, `useUsage`, `useProfile`, etc.) stay unchanged
- The `TradeInputForm` internal logic stays unchanged — only the wrapper/styling changes
- No new npm packages needed
- The `TrackedAssets` table uses plain HTML `<table>` with Tailwind, not a table library
- Auth split-screen uses CSS Grid (`grid-cols-2` collapses to single column on mobile)
- The Account sidebar uses flex layout — collapses to shadcn Tabs on `< md`
- All RLS and security logic is untouched
