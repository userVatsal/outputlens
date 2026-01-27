
# OutputLens PMF-First Redesign - Implementation Plan

## Overview

This plan transforms OutputLens from a 17+ page feature-rich platform into a focused **4-page pre-decision risk lens** that answers one question: *"What's the worst-case loss if I do this trade?"*

The redesign eliminates 80% of the current UI to create a product that changes behavior - making users pause before committing capital.

---

## Phase 1: Core Decision Page (/) - The Entire Product

### New Single-Screen Design

The main page becomes the complete product - no layout wrapper, no navigation, no distractions.

```text
+-------------------------------------------------------+
|  [small, muted]                                       |
|  "Risk analysis before you deploy capital"            |
+-------------------------------------------------------+
|                                                       |
|  What's the worst-case loss if I do this trade?       |
|                                                       |
+-------------------------------------------------------+
|  Asset:          [ AAPL                  ]            |
|  Direction:      [ Buy / Sell            ]            |
|  Capital at risk:[ $2,000                ]            |
|  Time horizon:   [ 1d | 1w | 1m | 3m     ]            |
|                                                       |
|  [ Analyze downside risk ]                            |
+-------------------------------------------------------+
|  RESULTS:                                             |
|                                                       |
|  Worst-case loss (5% probability)                     |
|  -$412                 <- BIG, RED, UNAVOIDABLE       |
|                                                       |
|  Probability of loss:    61%                          |
|  Expected drawdown:      -$180                        |
|  Stress scenario loss:   -$690                        |
|                                                       |
|  [ ] Stress this position                             |
|                                                       |
|  "In similar volatility conditions, losses of this    |
|   size occurred roughly 1 in 20 times."               |
|                                                       |
|  [ Save this decision ]  [ Close ]                    |
+-------------------------------------------------------+
|  Probabilistic analysis. Not financial advice.        |
+-------------------------------------------------------+
```

### Files to Create
- `src/pages/Decision.tsx` - New single decision page with embedded form and results

### What This Page Removes
- Header navigation (logo only, minimal)
- Portfolio/Single Asset toggle
- Usage indicator (move to paywall only)
- All charts and visualizations
- Scenario Regime Cards
- Advanced Metrics accordion
- P&L Summary section
- Tail Risk Panel complexity
- Long-form AI Risk Interpretation (reduce to 3-5 lines)
- "Monitor Asset" button
- All badges and PRO labels

### Loading State
Replace the current spinner with an educational sequence:
1. "Simulating thousands of possible outcomes..."
2. "Measuring worst-case losses..."
3. "Quantifying tail risk..."

---

## Phase 2: Design System Overhaul

### New Color Palette

| Element | Current | New Hex | Purpose |
|---------|---------|---------|---------|
| Background | `hsl(220 30% 98%)` | `#F9FAF7` | Warm off-white, analytical |
| Primary Text | `hsl(222 47% 15%)` | `#111827` | Near-black, soft |
| Secondary Text | Various | `#6B7280` | Labels, context |
| Risk/Loss Color | `bearish` red | `#9B2C2C` | Muted red, danger signal |
| CTA Button | Primary blue | `#1F2933` | Deep slate, authority |
| Borders | Various | `#E5E7EB` | Thin, minimal |

### Colors to Remove
- Bright green (`bullish`) for success
- Gradients (`hero-gradient`)
- Purple/brand accents
- Gold premium cues
- All trading platform aesthetics

### Typography Changes
- Hero question: 32-36px, bold
- Big risk number: 40-44px, bold, red
- Body/labels: 14-15px
- Disclaimer: 12px, faint

### Files to Modify
- `src/index.css` - New CSS variables and base styles
- `tailwind.config.ts` - Simplified color tokens

---

## Phase 3: Simplified Form Component

### Current TradeInputForm (343 lines) → New DecisionInput (~150 lines)

**Remove:**
- Step indicators (1-2-3 progress)
- Market selector (default to US, hide complexity)
- Advanced options (confidence, assumptions)
- Position type toggle (shares vs dollars) - default to capital
- Date/time pickers (simplify to preset horizons)
- Quick select chips for position size
- All animations and transitions

**Keep (Simplified):**
- Asset search (autocomplete)
- Direction: Buy / Sell (simple buttons)
- Capital at risk: Single input
- Time horizon: 1d / 1w / 1m / 3m buttons

### Files to Modify
- `src/components/TradeInputForm.tsx` - Drastically simplify to 4 inputs

---

## Phase 4: Results Display Redesign

### Current Output Components → New DecisionResult (~100 lines)

**Remove:**
- `RiskSnapshot.tsx` (4-card grid, too complex)
- `TailRiskPanel.tsx` (delete)
- `ScenarioRegimeCards.tsx` (delete)
- `PnLSummary.tsx` (delete)
- `AdvancedMetrics.tsx` (delete)
- `ReturnDistributionChart.tsx` (delete)
- `RiskInterpretation.tsx` (simplify to 3-5 lines)
- `ActionPanel.tsx` (simplify to 2 buttons)

**New Output (Single Component):**
1. **Hero Number**: Worst-case loss (5% probability) - BIG, RED
2. **Supporting Context**: 
   - Probability of loss: X%
   - Expected drawdown: -$X
   - Stress scenario loss: -$X
3. **Stress Toggle**: Single checkbox
4. **Plain English**: 3-5 lines maximum
5. **Decision Buttons**: Save | Close

### Files to Delete
- `src/components/workspace/TailRiskPanel.tsx`
- `src/components/workspace/ScenarioRegimeCards.tsx`
- `src/components/workspace/PnLSummary.tsx`
- `src/components/workspace/AdvancedMetrics.tsx`
- `src/components/workspace/TrackAssetModal.tsx`
- `src/components/workspace/AddToPortfolioModal.tsx`
- `src/components/ReturnDistributionChart.tsx`
- `src/components/ScenarioProbabilityChart.tsx`
- `src/components/PortfolioAnalyzer.tsx`
- `src/components/EnhancedQuantMetricsCard.tsx`
- `src/components/EnhancedRiskSummary.tsx`
- `src/components/EnhancedScenarioDisplay.tsx`

---

## Phase 5: Navigation & Routing Overhaul

### New Route Structure (4 pages only)

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `Decision.tsx` | Core product - the decision page |
| `/decisions` | `Decisions.tsx` | Decision log (renamed from History) |
| `/account` | `Account.tsx` | Minimal account + billing |
| `/legal` | `Legal.tsx` | Terms, Privacy, Disclaimer combined |
| `/auth` | `Auth.tsx` | Authentication (keep) |

### Pages to DELETE
- `src/pages/Landing.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/Workspace.tsx`
- `src/pages/Results.tsx`
- `src/pages/Pricing.tsx`
- `src/pages/Methodology.tsx`
- `src/pages/About.tsx`
- `src/pages/Portfolio.tsx`
- `src/pages/TrackedAssets.tsx`
- `src/pages/Demo.tsx`
- `src/pages/Analyze.tsx`

### Redirects to Add
All deprecated routes redirect to `/` or `/auth`:
- `/landing` → `/`
- `/dashboard` → `/`
- `/workspace` → `/`
- `/pricing` → `/account`
- `/methodology` → `/legal`
- `/about` → `/`
- `/portfolio` → `/`
- `/tracked-assets` → `/`
- `/demo` → `/`
- `/history` → `/decisions`

### Files to Modify
- `src/App.tsx` - New route structure with redirects

---

## Phase 6: Header Simplification

### Current Header (244 lines) → New MinimalHeader (~60 lines)

**Logged-in users see:**
- Logo (links to /)
- Decisions (link to /decisions)
- Account (link to /account)
- Sign out

**Logged-out users see:**
- Logo
- Sign in

**Remove:**
- Demo link
- Workspace link
- Methodology link
- Pricing link
- Language toggle
- Home link
- Tracked link
- History link (rename to Decisions)
- Risk alert bell
- Mobile menu complexity

### Files to Modify
- `src/components/layout/Header.tsx` - Minimal navigation

### Files to DELETE
- `src/components/layout/Footer.tsx` - Remove entirely
- `src/components/RiskAlertBell.tsx` - Feature creep

---

## Phase 7: Decision Log Page (/decisions)

### Purpose
Behavior reinforcement - make users respect their own caution.

### Content
- List of past decisions (date, asset, worst-case loss shown)
- Simple outcome tag: Avoided / Entered / Ignored risk
- No charts, no PnL, no performance stats

### Files to Create
- `src/pages/Decisions.tsx` - Renamed and simplified History page

### Database Schema Addition
Add `decision_outcome` column to `analysis_history` table:
- Values: `avoided`, `entered`, `ignored`
- Nullable (user can optionally mark outcome)

---

## Phase 8: Account Page Simplification

### Current Account (153 lines) → Minimal Account (~80 lines)

**Keep:**
- Email display
- Usage counter
- Upgrade/downgrade button
- Delete account

**Remove:**
- Profile section (avatar, bio, username)
- Tabs navigation
- Privacy/Legal tab (move to /legal)
- All profile customization

### Files to Modify
- `src/pages/Account.tsx` - Minimal version

### Files to DELETE
- `src/components/account/ProfileSection.tsx`
- `src/components/account/LegalSection.tsx` (move to /legal)

---

## Phase 9: Legal Page Creation

### New Combined Legal Page

Consolidates all trust/legal content:
- **Important Disclaimer** (prominent, top)
- Data usage summary
- Model limitations
- Privacy policy (full text)
- Terms of service (full text)

This is the ONLY place disclaimers exist.

### Files to Create
- `src/pages/Legal.tsx` - Combined legal page

### Files to Modify
- Remove disclaimers from all other pages

---

## Phase 10: Copy & Messaging Overhaul

### Key Copy Changes

| Location | Current | New |
|----------|---------|-----|
| Page title | "Analyse - Probabilistic Risk Analysis" | "OutputLens - Know Your Downside" |
| Hero question | "Quantify Uncertainty Before You Trade" | "What's the worst-case loss if I do this trade?" |
| Subtext | "Three-layer intelligence: Stochastic..." | "Risk analysis before you deploy capital" |
| CTA button | "Analyze Risk & Scenarios" | "Analyze downside risk" |
| Direction | "Bullish View / Bearish View" | "Buy / Sell" |
| Results header | "Risk Snapshot" | (Remove - just show the number) |
| Risk explanation | Multi-paragraph AI interpretation | 3-5 lines, plain English |

### Phrases to DELETE Everywhere
- "AI-powered"
- "Three-layer intelligence"
- "Institutional-grade"
- "Monte Carlo paths"
- "GBM/GARCH/HMM"
- "Neural Database"
- "Regime detection"
- "Scenario regimes"
- "Layer 1/2/3"
- "PRO" badges

---

## Phase 11: Paywall Redesign

### Current Approach
- Prominent pricing page
- Upgrade CTAs everywhere
- Feature comparison tables
- PRO badges

### New Approach
Inline paywall ONLY after value delivered.

**Triggers:**
- Usage limit reached (5 analyses/month)
- Stress scenario toggle (premium feature)
- Non-US market selected

**Paywall Copy:**
```
Free users can run 5 US market analyses per month.
Upgrade to unlock stress scenarios and global markets.

[ Upgrade ]
```

No pricing table. No feature list. No comparison.

### Files to Modify
- `src/components/PaywallModal.tsx` - Simplify drastically

---

## Phase 12: Component Cleanup

### Files to DELETE (Complete List)

**Dashboard Components:**
- `src/components/dashboard/AccountCard.tsx`
- `src/components/dashboard/AccountHeader.tsx`
- `src/components/dashboard/AgeVerificationBanner.tsx`
- `src/components/dashboard/AlertsPanel.tsx`
- `src/components/dashboard/DashboardHero.tsx`
- `src/components/dashboard/LatestArticles.tsx`
- `src/components/dashboard/OnboardingGuide.tsx`
- `src/components/dashboard/RecentReports.tsx`
- `src/components/dashboard/TrackedAssetsGrid.tsx`
- `src/components/dashboard/WorkspaceCTA.tsx`
- `src/components/dashboard/WhySection.tsx`
- `src/components/dashboard/index.ts`

**Landing Components:**
- `src/components/landing/AISemanticSection.tsx`
- `src/components/landing/DataProviderLogos.tsx`
- `src/components/landing/InteractivePreview.tsx`
- `src/components/landing/ProblemSolutionSection.tsx`

**Admin Components:**
- `src/components/admin/AdminAnalyticsPanel.tsx`
- `src/components/admin/RecentSignupsTable.tsx`
- `src/components/admin/TrafficSourcesChart.tsx`
- `src/components/admin/UserJourneyModal.tsx`
- `src/components/admin/index.ts`

**Onboarding Components:**
- `src/components/onboarding/AvatarUpload.tsx`
- `src/components/onboarding/OnboardingWizard.tsx`
- `src/components/onboarding/StepComplete.tsx`
- `src/components/onboarding/StepCredentials.tsx`
- `src/components/onboarding/StepLegal.tsx`
- `src/components/onboarding/StepProfile.tsx`
- `src/components/onboarding/StepWelcome.tsx`
- `src/components/onboarding/index.ts`

**Other Components:**
- `src/components/AIExplanation.tsx`
- `src/components/QuantMetricsCard.tsx`
- `src/components/ScenarioTable.tsx`
- `src/components/StructuredScenarioDisplay.tsx`
- `src/components/SentimentIndicator.tsx`
- `src/components/UsageIndicator.tsx`
- `src/components/FeatureGate.tsx`
- `src/components/OnboardingTooltips.tsx`

---

## Phase 13: Onboarding Redesign

### Current Flow
3-step wizard: Credentials → Legal → Dashboard

### New Flow
No onboarding wizard. The first analysis IS onboarding.

**Flow:**
1. User signs up via `/auth`
2. Redirect immediately to `/`
3. Pre-fill example asset (AAPL)
4. First analysis creates the "click" moment

### Files to Modify
- `src/pages/Onboarding.tsx` - DELETE or simplify to just legal consent
- `src/pages/Auth.tsx` - Redirect to `/` after auth

---

## Phase 14: Database Changes

### New Column for Decision Tracking
```sql
ALTER TABLE analysis_history 
ADD COLUMN decision_outcome TEXT CHECK (decision_outcome IN ('avoided', 'entered', 'ignored'));
```

### Clean Up Unused Tables (Optional - defer)
Consider archiving:
- `tracked_assets` (feature removed)
- `saved_portfolios` (feature removed)

---

## Technical Summary

### Files to CREATE (4 new files)
1. `src/pages/Decision.tsx` - Main product page
2. `src/pages/Decisions.tsx` - Decision log
3. `src/pages/Legal.tsx` - Combined legal page
4. `src/components/decision/DecisionInput.tsx` - Simplified input form
5. `src/components/decision/DecisionResult.tsx` - Simplified results

### Files to MODIFY (8 files)
1. `src/App.tsx` - New routes
2. `src/index.css` - New design system
3. `tailwind.config.ts` - New colors
4. `src/components/layout/Header.tsx` - Minimal nav
5. `src/pages/Account.tsx` - Simplified
6. `src/pages/Auth.tsx` - New redirect flow
7. `src/components/PaywallModal.tsx` - Simplified
8. `src/components/layout/Layout.tsx` - Remove footer

### Files to DELETE (~60 files)
All dashboard, landing, onboarding, admin, and feature-bloat components listed in Phase 12.

---

## PMF Kill Metrics (Post-Implementation)

Track these to validate the redesign:

| Metric | Kill Threshold | Target |
|--------|----------------|--------|
| Pre-trade usage | <15% run 2+ analyses/month | >30% |
| Stress toggle usage | <30% of analyses | >40% |
| Decision saves | <20% save decisions | >30% |
| Paid user habit | <25% run 3+ analyses/month | >40% |

### Language Test
**Good signals:**
- "This stopped me"
- "This scared me"
- "This made me think twice"

**Kill signals:**
- "Cool"
- "Nice charts"
- "Interesting"

---

## Implementation Order

1. **Phase 1-2**: Create new Decision page with new design system
2. **Phase 3-4**: Simplify form and results components
3. **Phase 5-6**: Update routing and navigation
4. **Phase 7-9**: Create supporting pages (Decisions, Legal)
5. **Phase 10-11**: Update copy and paywall
6. **Phase 12-13**: Delete unused components and simplify onboarding
7. **Phase 14**: Database migration

Total estimated scope: Major rewrite affecting ~70% of frontend codebase.
