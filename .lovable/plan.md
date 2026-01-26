

# YC-Style Dashboard Improvement Plan

## Overview

Transform the current dashboard into a clean, professional YC-style interface with improved hierarchy, better copy, and a more scannable layout based on the provided design specifications.

---

## Current State Analysis

The existing dashboard has:
- 3-column grid layout with AccountCard, AlertsPanel, TrackedAssetsGrid, RecentReports, WorkspaceCTA, MarketIntelligence
- Basic header: "Risk Intelligence Dashboard"
- Functional but lacks the polished YC-style copy and hierarchy

## Proposed Changes

### 1. New Hero Section (Above the Grid)

**Add a prominent hero banner** at the top of the dashboard with:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  AI-Powered Risk & Scenario Intelligence                                    │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Quantify downside before you trade. Monitor assets, simulate outcomes,    │
│  and anticipate market shocks—all in one workspace.                         │
│                                                                             │
│  [User Avatar] Vatsal | Free Plan – 5 Analyses Remaining [Settings] [Upgrade]│
└─────────────────────────────────────────────────────────────────────────────┘
```

**Implementation:**
- Create new `DashboardHero.tsx` component
- Integrate user profile, plan, and usage info into the hero
- Remove separate AccountCard (merge into hero)

---

### 2. Updated Component Copy

#### AlertsPanel.tsx
- Empty state: "Stay ahead of market surprises. You'll be notified when risk metrics change significantly."

#### TrackedAssetsGrid.tsx  
- Title: "Monitored Assets"
- Empty state: "Track positions directly from your analysis results."
- CTA: "Run Analysis"

#### RecentReports.tsx
- Title: "Historical Risk Reports"
- Add table-style display with columns: Asset | Position | Date | Value
- CTA: "View Full History"

#### WorkspaceCTA.tsx
- Title: "Risk & Scenario Workspace"
- Description: "Run institutional-grade risk analysis with Monte Carlo simulation:"
- Bullet points:
  - "10,000 Monte Carlo paths for probabilistic scenarios"
  - "Tail risk & scenario regime modeling"  
  - "Live market data integration"
- CTAs: "Perform Risk Analysis" | "Portfolio Mode"

#### MarketIntelligence.tsx
- Title: "Market Intelligence"
- Description: "Get AI-driven insights across your tracked assets."
- Add table-style headers: Symbol | Trend | Signals | Updated

---

### 3. New "Why OutputLens Exists" Micro-Section

Add a small section at the bottom of the main content area:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  Why OutputLens Exists                                                      │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Markets are irrational, liquidity is fragmented, and drawdowns happen     │
│  faster than most traders anticipate. OutputLens equips traders and B2B    │
│  firms with AI-powered, probabilistic risk analysis so you can see the     │
│  downside before you trade.                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 4. Improved Dashboard Layout

Restructure the grid for better visual hierarchy:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  HERO: AI-Powered Risk & Scenario Intelligence                              │
│  User: Vatsal | Free Plan – 5 Analyses Remaining [Settings] [Upgrade]       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  RISK & SCENARIO WORKSPACE CTA (full width, prominent)                      │
│  10,000 Monte Carlo paths | Tail risk & scenario regimes | Live data        │
│  [Perform Risk Analysis] [Portfolio Mode]                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐  ┌───────────────────────────────────────────────┐
│  RISK ALERTS             │  │  MONITORED ASSETS                             │
│  Stay ahead of market    │  │  Track positions from analysis results        │
│  surprises               │  │  [Asset cards or empty state]                 │
│  [No active alerts]      │  │  [Run Analysis]                               │
└──────────────────────────┘  └───────────────────────────────────────────────┘

┌──────────────────────────┐  ┌───────────────────────────────────────────────┐
│  HISTORICAL RISK REPORTS │  │  MARKET INTELLIGENCE                          │
│  Asset|Position|Date|Val │  │  AI-driven insights across tracked assets     │
│  BTC  | SHORT  |Jan25|$5 │  │  Symbol | Trend | Signals | Updated           │
│  AAPL | LONG   |Jan24|$50│  │  [Table rows]                                 │
│  [View Full History]     │  │                                               │
└──────────────────────────┘  └───────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  WHY OUTPUTLENS EXISTS (micro-section)                                      │
│  Markets are irrational... [full copy]                                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  FOOTER: Disclaimer + Quick Links                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Files to Create/Modify

| File | Action | Changes |
|------|--------|---------|
| `src/components/dashboard/DashboardHero.tsx` | Create | New hero component with headline, sub-headline, user status |
| `src/components/dashboard/WhySection.tsx` | Create | New micro-section explaining why OutputLens exists |
| `src/components/dashboard/index.ts` | Modify | Export new components |
| `src/pages/Dashboard.tsx` | Modify | New layout structure, integrate hero, remove AccountCard placement |
| `src/components/dashboard/AlertsPanel.tsx` | Modify | Update empty state copy |
| `src/components/dashboard/TrackedAssetsGrid.tsx` | Modify | Update copy and empty state |
| `src/components/dashboard/RecentReports.tsx` | Modify | Add table headers, improve layout |
| `src/components/dashboard/WorkspaceCTA.tsx` | Modify | Update copy to match YC style |
| `src/components/dashboard/MarketIntelligence.tsx` | Modify | Add table headers, update copy |

---

## Technical Details

### DashboardHero.tsx

```typescript
interface DashboardHeroProps {
  profile: ProfileData | null;
  usage: UsageData | null;
  plan: PlanData;
}

// Structure:
// - Headline: "AI-Powered Risk & Scenario Intelligence"
// - Sub-headline: "Quantify downside before you trade..."
// - User row: Avatar, Name, Plan badge, usage remaining, [Settings] [Upgrade]
```

### Layout Changes in Dashboard.tsx

```typescript
// Before: 3-column grid with AccountCard
// After: 
//   1. DashboardHero (full width)
//   2. WorkspaceCTA (full width, prominent)
//   3. 2-column grid: Alerts + Tracked Assets
//   4. 2-column grid: Reports + Market Intelligence
//   5. WhySection (full width)
//   6. Footer disclaimer (existing)
```

### Updated Copy Snippets

**AlertsPanel empty state:**
```typescript
<p className="text-sm font-medium">No active alerts</p>
<p className="text-xs text-muted-foreground">
  Stay ahead of market surprises. You'll be notified when risk metrics change significantly.
</p>
```

**TrackedAssetsGrid empty state:**
```typescript
<p className="text-sm font-medium">No assets tracked yet</p>
<p className="text-xs text-muted-foreground">
  Track positions directly from your analysis results.
</p>
<Button>Run Analysis</Button>
```

**WorkspaceCTA bullets:**
```typescript
const features = [
  "10,000 Monte Carlo paths for probabilistic scenarios",
  "Tail risk & scenario regime modeling",
  "Live market data integration"
];
```

---

## Design Notes

- **Clean, minimal interface**: White background, navy blue headings, primary blue accents
- **High scannability**: Tables for reports/intelligence, bullets for features
- **Action-focused CTAs**: Bold, visible buttons
- **Founder-led voice**: "Why We Exist" micro-section adds trust
- **Micro-copy for trust**: Small disclaimers at bottom

---

## Expected Outcome

After implementation:
- Dashboard feels like a professional YC-backed SaaS product
- Clear visual hierarchy with hero → CTA → data → story → footer
- Copy is consistent with institutional positioning
- Empty states guide users to take action
- User status (plan, usage) is prominent but not cluttered

