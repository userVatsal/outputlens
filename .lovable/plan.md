
# OutputLens Dashboard & Institutional UX Overhaul

## Overview
This plan transforms OutputLens from a tool-focused platform into an institutional-grade control center for risk and scenario intelligence. The implementation spans three interconnected initiatives:

1. **Home/Dashboard Page** - A new centralized post-login command center
2. **Platform-wide Language & Terminology Update** - Institutional tone across all pages
3. **Workspace/Results Page Enhancement** - Refined analysis presentation

---

## Phase 1: Create Home Dashboard Page (`/dashboard`)

### 1.1 New Page: `src/pages/Dashboard.tsx`
A comprehensive post-login control center with these sections:

**Above-the-Fold: Account & Quick Insights**
- Account card showing profile picture, display name, subscription tier
- Usage meter (analyses remaining, plan type)
- Quick action buttons: "New Analysis" | "Portfolio Mode" | "Account Settings"
- Age verification prompt for advanced features (if `date_of_birth` not set)

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
- Metrics preview: asset, date, risk score, tail risk, expected return
- "Re-run Analysis" and "View Full Report" CTAs
- Link to `/history` for full list

**Section 5: Market News & Intelligence**
- Integrate existing `SentimentIndicator` component
- Pull from `aggregated_insights` and `qualitative_signals` tables
- Filter by tracked assets or general market
- Headlines with source, sentiment score, relevance
- AI-generated summary: "Tail risk elevated due to Fed policy announcement"

**Section 6: Risk Workspace CTA Panel**
- Prominent card linking to `/workspace`
- Preview metrics from latest analysis (if available)
- CTAs: "Perform Risk & Scenario Analysis" | "Portfolio Mode"

### 1.2 Dashboard Components to Create
```
src/components/dashboard/
├── AccountCard.tsx          # Profile, plan, usage meter
├── AlertsPanel.tsx          # Risk alerts from tracked assets
├── TrackedAssetsGrid.tsx    # Compact tracked assets overview
├── RecentReports.tsx        # Historical analysis list
├── MarketIntelligence.tsx   # News feed + sentiment
├── WorkspaceCTA.tsx         # Link to analysis workspace
└── AgeVerificationBanner.tsx # Compliance prompt
```

### 1.3 Route Configuration
- Add `/dashboard` route in `App.tsx`
- Redirect authenticated users from `/` to `/dashboard`
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
| "Update" | "Latest Risk & Scenario Update" |
| "Analytics" | "Risk & Scenario Workspace" |
| "Run Analysis" | "Perform Risk & Scenario Analysis" |
| "educational" | REMOVE entirely |

### 2.2 Files to Update

**Pages:**
- `Landing.tsx` - Hero copy, CTAs, feature descriptions
- `Workspace.tsx` - Headers, button labels, empty states
- `History.tsx` - Title, list labels, CTAs
- `TrackedAssets.tsx` - Card labels, action buttons
- `Methodology.tsx` - Remove "educational" framing
- `Pricing.tsx` - Professional feature descriptions
- `Privacy.tsx` / `Terms.tsx` - Ensure no "educational" disclaimers

**Components:**
- `ActionPanel.tsx` - Button labels and tooltips
- `RiskInterpretation.tsx` - Section header (already correct)
- `ScenarioRegimeCards.tsx` - Card labels
- `TradeInputForm.tsx` - Direction labels ("I think it will go up" -> professional phrasing)
- `Header.tsx` - Navigation labels
- `Footer.tsx` - Disclaimer text

### 2.3 SEO & Metadata Updates

**Target Keywords (natural integration):**
- "AI-powered risk analysis"
- "tail risk monitoring"
- "portfolio scenario modeling"
- "Monte Carlo simulation"
- "asset tracking"
- "scenario probability distribution"

**ALT Text for Images/Charts:**
- Distribution chart: "Monte Carlo probability distribution for {asset} trade analysis"
- Scenario cards: "Scenario regime probability for {scenario_name}"
- Tail risk panel: "Tail risk analysis showing {probability}% extreme event chance"

**Export Metadata:**
- CSV/PDF exports include: asset, date, scenario probabilities, risk score, tail risk, VaR, CVaR

---

## Phase 3: Workspace/Results Page Enhancement

### 3.1 Visual Hierarchy Refinement

**Current Flow (Good):**
1. Risk Snapshot (above-fold)
2. P&L Summary
3. Tail Risk Panel
4. Scenario Regime Cards
5. Distribution Chart
6. Advanced Metrics (collapsed)
7. AI Interpretation
8. Action Panel

**Enhancements:**
- Add "Historical Comparison" toggle showing trends vs. previous analyses
- Add trend arrows to Risk Snapshot metrics
- Make Tail Risk Panel more visually prominent with dedicated styling
- Add "Track Asset" CTA directly in Risk Snapshot for quick access

### 3.2 Scenario Cards Enhancement
- Update labels: "Base Case" -> "Base Regime", "Upside" -> "Bullish Continuation"
- Add risk level badges to each card
- Show trigger conditions inline
- Color-code by probability weight

### 3.3 Action Panel Updates
- Remove "Coming Soon" toasts (tracking now works)
- Add working "Export PDF" functionality (Pro feature)
- Implement "Add to Portfolio" workflow
- Add "Compare to History" action

---

## Phase 4: AI Discovery & SEO Files Update

### 4.1 Update Existing Discovery Files
Files to update with new institutional language:
- `public/ai.txt`
- `public/llm.txt`
- `public/.well-known/ai.json`

### 4.2 Schema.org Markup
Add structured data to pages:
- `Dashboard`: SoftwareApplication schema
- `Workspace`: WebApplication + AnalysisTool schema
- Results: QuantitativeRiskAnalysis custom schema

---

## Phase 5: Compliance & Legal Updates

### 5.1 Disclaimer Text (Standardized)
```
"OutputLens provides risk analysis and scenario modeling for informational purposes only. 
It does not provide financial advice, predictions, or trading signals. 
Past scenarios do not guarantee future results."
```

### 5.2 Age Verification Flow
- If `date_of_birth` not set in profile, show banner on Dashboard
- Required for advanced features (leverage, derivatives analysis)
- Store verification in profile, audit log

---

## Implementation Order

### Sprint 1: Dashboard Foundation (Days 1-3)
1. Create Dashboard page structure
2. Build AccountCard, AlertsPanel, WorkspaceCTA components
3. Add `/dashboard` route and auth redirect logic

### Sprint 2: Dashboard Data Integration (Days 4-5)
4. Build TrackedAssetsGrid using existing hook
5. Build RecentReports from analysis_history
6. Integrate MarketIntelligence with SentimentIndicator

### Sprint 3: Language & Terminology (Days 6-7)
7. Update all page headers and CTAs
8. Update component labels and copy
9. Update TradeInputForm to professional phrasing

### Sprint 4: Workspace Enhancement (Days 8-9)
10. Add trend arrows to Risk Snapshot
11. Enhance Scenario Regime Cards styling
12. Add Historical Comparison toggle
13. Wire up Track Asset from Risk Snapshot

### Sprint 5: SEO & Compliance (Day 10)
14. Update AI discovery files
15. Add ALT text across components
16. Standardize disclaimer across pages
17. Implement age verification banner

---

## File Summary

### New Files
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

### Modified Files
| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/dashboard` route, auth redirect |
| `src/pages/Landing.tsx` | Terminology updates, CTAs |
| `src/pages/Workspace.tsx` | Add trend arrows, historical toggle |
| `src/pages/History.tsx` | Rename to "Historical Risk Reports" |
| `src/pages/TrackedAssets.tsx` | Professional labels |
| `src/components/workspace/ActionPanel.tsx` | Working track/export |
| `src/components/workspace/RiskSnapshot.tsx` | Trend arrows, track CTA |
| `src/components/workspace/ScenarioRegimeCards.tsx` | Enhanced labels |
| `src/components/TradeInputForm.tsx` | Professional direction labels |
| `src/components/layout/Header.tsx` | Add Dashboard link |
| `public/ai.txt`, `llm.txt`, `ai.json` | Institutional language |

---

## Success Criteria

After implementation:
1. Authenticated users land on a professional dashboard with at-a-glance insights
2. All "educational" language removed across the platform
3. Consistent institutional terminology: "Risk Interpretation", "Scenario Regimes", etc.
4. Clear visual hierarchy: Insight -> Evidence -> Detail
5. SEO keywords naturally integrated across pages
6. Compliance disclaimers present but unobtrusive
7. Age verification flow for advanced features
