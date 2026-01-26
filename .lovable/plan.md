

# OutputLens Dashboard & Institutional UX Overhaul - Implementation Plan

## Overview

This plan transforms OutputLens into an institutional-grade control center for risk and scenario intelligence through three interconnected initiatives:

1. **Home/Dashboard Page** - A new centralized post-login command center at `/dashboard`
2. **Platform-wide Language & Terminology Update** - Institutional tone across all pages
3. **Workspace/Results Page Enhancement** - Refined analysis presentation with trend indicators

---

## Phase 1: Create Home Dashboard Page (`/dashboard`)

### 1.1 New Page: `src/pages/Dashboard.tsx`

A comprehensive post-login control center with these sections:

**Above-the-Fold: Account & Quick Insights**
- Account card showing profile picture, display name, subscription tier badge
- Usage meter (analyses remaining, plan type) using existing `useUsage` hook
- Quick action buttons: "New Analysis" | "Portfolio Mode" | "Account Settings"
- Age verification banner for advanced features (if `date_of_birth` not set in profile)

**Section 2: Risk Alerts & Notifications**
- Pull from existing `risk_alerts` table via `useTrackedAssets` hook
- Color-coded severity badges (info/warning/critical) 
- "Dismiss" and "View Details" actions
- Empty state: "No active alerts"

**Section 3: Tracked Assets Overview**
- Compact card grid from `tracked_assets` table
- Each card shows: Symbol, entry price, current risk score, risk delta, trend arrow
- Quick actions: "Analyze Now" | "Pause" | "Untrack"
- CTA: "Track More Assets" linking to Workspace

**Section 4: Historical Risk Reports**
- Recent analyses from `analysis_history` table (limit 5)
- Metrics preview: asset, date, risk score, direction badge
- "Re-run Risk Analysis" and "View Full Report" CTAs
- Link to `/history` for full list

**Section 5: Market News & Intelligence**
- Integrate existing `SentimentIndicator` component pattern
- Pull from `aggregated_insights` table
- Headlines with source, sentiment score, relevance
- AI-generated summary when available

**Section 6: Risk Workspace CTA Panel**
- Prominent card linking to `/workspace`
- Preview metrics from latest analysis (if available)
- CTAs: "Perform Risk & Scenario Analysis" | "Portfolio Mode"

### 1.2 Dashboard Components to Create

```text
src/components/dashboard/
├── AccountCard.tsx          # Profile, plan, usage meter
├── AlertsPanel.tsx          # Risk alerts from tracked assets
├── TrackedAssetsGrid.tsx    # Compact tracked assets overview
├── RecentReports.tsx        # Historical analysis list
├── MarketIntelligence.tsx   # News feed + sentiment
├── WorkspaceCTA.tsx         # Link to analysis workspace
└── AgeVerificationBanner.tsx # Compliance prompt for DOB
```

### 1.3 Route Configuration

- Add `/dashboard` route in `App.tsx`
- Redirect authenticated users from `/` to `/dashboard` (using auth check)
- Keep `/` (Landing) for unauthenticated users

---

## Phase 2: Platform-wide Language & Terminology Update

### 2.1 Terminology Replacements

| Current Term | Institutional Replacement |
|--------------|---------------------------|
| "Recommendation" | "Risk Interpretation" |
| "Best/Worst Case" | "Scenario Regimes" |
| "Your past analyses" | "Historical Risk & Scenario Reports" |
| "Run again" | "Re-run Risk Analysis" |
| "Track This Asset" | "Monitor Asset & Risk" |
| "Base Case" | "Base Regime" |
| "Upside" | "Bullish Continuation" |
| "Downside" | "Bearish Scenario" |
| "I think it will go up/down" | "Bullish View" / "Bearish View" |
| "Run Analysis" | "Perform Risk & Scenario Analysis" |
| "What's your view?" | "Market Outlook" |
| "Show me the scenarios" | "Analyze Risk & Scenarios" |

### 2.2 Files to Update

**Pages:**
- `History.tsx` - Title: "Historical Risk & Scenario Reports", CTAs, empty state
- `TrackedAssets.tsx` - Card labels: "Monitor Asset & Risk", action buttons
- `Workspace.tsx` - Button label update on submit CTA

**Components:**
- `TradeInputForm.tsx` - Direction labels ("I think it will go up" → "Bullish View ↗")
- `ScenarioRegimeCards.tsx` - Card titles ("Base Case" → "Base Regime", etc.)
- `Header.tsx` - Add "Dashboard" link for authenticated users
- `Footer.tsx` - Ensure institutional disclaimer is present (already correct)

### 2.3 SEO & Metadata Updates

**Target Keywords (natural integration):**
- "AI-powered risk analysis"
- "tail risk monitoring"  
- "portfolio scenario modeling"
- "Monte Carlo simulation"
- "asset tracking"
- "scenario probability distribution"

**ALT Text for Images/Charts (add where missing):**
- Distribution chart: `alt="Monte Carlo probability distribution for {asset} trade analysis"`
- Scenario cards: `alt="Scenario regime probability for {scenario_name}"`
- Tail risk panel: `alt="Tail risk analysis showing {probability}% extreme event chance"`

---

## Phase 3: Workspace/Results Page Enhancement

### 3.1 Risk Snapshot Enhancements

**Add Trend Arrows:**
- Compare current analysis metrics to previous analysis of same asset (if exists in history)
- Display trend indicators (↑ improving, ↓ worsening, — stable)
- Visual cue: green up arrow for improving risk, red down for worsening

**Add Quick Track CTA:**
- Small "Monitor Asset" button in RiskSnapshot header
- Opens TrackAssetModal for one-click tracking

### 3.2 Scenario Cards Enhancement

- Update card titles to institutional terminology:
  - "Base Case" → "Base Regime"
  - "Upside" → "Bullish Continuation"  
  - "Downside" → "Bearish Scenario"
- Add probability weight color-coding (stronger color = higher probability)
- Ensure trigger conditions are visible inline

### 3.3 Action Panel Updates

- Button labels already professional
- Ensure "Add to Portfolio" shows meaningful toast (already present)
- "Compare to History" action → link to `/history?asset={symbol}`

---

## Phase 4: AI Discovery & SEO Files Update

### 4.1 Update Existing Discovery Files

**`public/ai.txt`** - Already uses institutional language (verified)

**`public/llm.txt`** - Ensure consistent with ai.txt

**`public/.well-known/ai.json`** - Add dashboard to capabilities

### 4.2 Schema.org Markup (Future Enhancement)

- Add structured data to Landing page for SoftwareApplication schema
- This can be done via React Helmet in a later sprint

---

## Phase 5: Compliance & Legal Updates

### 5.1 Disclaimer Text (Standardized)

Already present in Footer.tsx:
```
"OutputLens provides risk analysis and scenario modeling for informational purposes only. 
It does not provide financial advice, predictions, or trading signals. 
Past scenarios do not guarantee future results."
```

### 5.2 Age Verification Flow

- If `date_of_birth` not set in profile, show `AgeVerificationBanner` on Dashboard
- Banner prompts user to complete profile for advanced features
- Required for leverage analysis, derivatives (future features)
- Store verification in profile via existing `updateProfile` hook

---

## Implementation Order

### Sprint 1: Dashboard Foundation
1. Create `src/components/dashboard/` directory
2. Create `AccountCard.tsx` - profile picture, display name, plan badge, usage meter
3. Create `AlertsPanel.tsx` - risk alerts with severity badges
4. Create `WorkspaceCTA.tsx` - prominent CTA to workspace
5. Create `src/pages/Dashboard.tsx` - main page structure

### Sprint 2: Dashboard Data Integration  
6. Create `TrackedAssetsGrid.tsx` - tracked assets with risk deltas
7. Create `RecentReports.tsx` - recent analysis history
8. Create `MarketIntelligence.tsx` - sentiment + news integration
9. Create `AgeVerificationBanner.tsx` - compliance prompt

### Sprint 3: Routing & Navigation
10. Add `/dashboard` route in `App.tsx`
11. Add auth-based redirect logic (authenticated → dashboard)
12. Update `Header.tsx` - add Dashboard link for logged-in users

### Sprint 4: Terminology Updates
13. Update `History.tsx` - rename to "Historical Risk & Scenario Reports"
14. Update `TradeInputForm.tsx` - professional direction labels
15. Update `ScenarioRegimeCards.tsx` - institutional card titles
16. Update `TrackedAssets.tsx` - professional labels

### Sprint 5: Workspace Enhancement
17. Update `RiskSnapshot.tsx` - add trend arrows, "Monitor Asset" CTA
18. Add historical comparison logic (fetch previous analysis for same asset)

---

## File Summary

### New Files to Create

| File | Purpose |
|------|---------|
| `src/pages/Dashboard.tsx` | Main dashboard page |
| `src/components/dashboard/AccountCard.tsx` | Profile & plan display |
| `src/components/dashboard/AlertsPanel.tsx` | Risk alerts list |
| `src/components/dashboard/TrackedAssetsGrid.tsx` | Compact asset cards |
| `src/components/dashboard/RecentReports.tsx` | History preview |
| `src/components/dashboard/MarketIntelligence.tsx` | News + sentiment |
| `src/components/dashboard/WorkspaceCTA.tsx` | Analysis workspace link |
| `src/components/dashboard/AgeVerificationBanner.tsx` | Compliance prompt |

### Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/dashboard` route, auth redirect logic |
| `src/pages/History.tsx` | Title: "Historical Risk & Scenario Reports", CTAs |
| `src/pages/TrackedAssets.tsx` | Professional labels and terminology |
| `src/components/TradeInputForm.tsx` | Direction labels: "Bullish View ↗" / "Bearish View ↘" |
| `src/components/workspace/ScenarioRegimeCards.tsx` | Card titles: "Base Regime", "Bullish Continuation", "Bearish Scenario" |
| `src/components/workspace/RiskSnapshot.tsx` | Add trend arrows, "Monitor Asset" CTA |
| `src/components/layout/Header.tsx` | Add "Dashboard" link for authenticated users |

---

## Technical Considerations

### Data Sources (Existing)

- **Profile data**: `useProfile` hook → `profiles` table
- **Usage data**: `useUsage` hook → `usage_tracking` table  
- **Plan data**: `usePlan` hook → `check-subscription` edge function
- **Tracked assets**: `useTrackedAssets` hook → `tracked_assets` table
- **Risk alerts**: `useTrackedAssets` hook → `risk_alerts` table
- **Analysis history**: Direct query → `analysis_history` table
- **Sentiment/News**: `SentimentIndicator` pattern → `aggregated_insights` table

### Authentication Check Pattern

```typescript
// Pattern for auth redirect in Dashboard
useEffect(() => {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/');
    }
  };
  checkAuth();
}, [navigate]);
```

### Existing Hook Reuse

All data fetching will reuse existing hooks to maintain consistency and avoid duplication:
- `useProfile()` for account card
- `useUsage()` for usage meter
- `usePlan()` for subscription tier
- `useTrackedAssets()` for tracked assets + alerts

---

## Success Criteria

After implementation:

1. ✓ Authenticated users land on a professional dashboard with at-a-glance insights
2. ✓ All "educational" language removed across the platform
3. ✓ Consistent institutional terminology: "Risk Interpretation", "Scenario Regimes", etc.
4. ✓ Clear visual hierarchy: Insight → Evidence → Detail
5. ✓ SEO keywords naturally integrated across pages
6. ✓ Compliance disclaimers present but unobtrusive
7. ✓ Age verification flow for advanced features
8. ✓ Trend arrows in Risk Snapshot showing risk changes
9. ✓ Dashboard navigation accessible from Header for logged-in users

