
# OutputLens PMF-First Redesign Plan

## Executive Summary

This plan transforms OutputLens from a feature-rich "institutional trading platform" into a focused **pre-decision risk lens** that answers one question: *"What's the worst-case loss if I do this trade?"*

The redesign strips away complexity, marketing language, and engagement-focused features to create a product that changes behavior - making users pause before committing capital.

---

## 1. Page Architecture Overhaul

### Current State (17+ pages)
- Landing, Dashboard, Workspace, Results, Pricing, History, Account, Portfolio, TrackedAssets, Methodology, About, Privacy, Terms, Auth, Onboarding, Demo, NotFound

### Target State (4 core pages)

| Route | Purpose | PMF Role |
|-------|---------|----------|
| `/` | Single Decision Page (THE PRODUCT) | Core value delivery |
| `/decisions` | Decision Log (replaces History) | Behavior reinforcement |
| `/account` | Minimal account + billing | Necessary infrastructure |
| `/legal` | Trust page (Terms, Privacy, Disclaimer) | Legal compliance |

### Pages to DELETE
- `/landing` - Marketing pages destroy focus
- `/dashboard` - Dashboards invite browsing, not decisions
- `/pricing` - Replace with inline paywall after value
- `/methodology` - If it works, it explains itself
- `/about` - Remove until PMF proven
- `/portfolio` - Portfolios delay accountability
- `/tracked-assets` - Feature creep
- `/demo` - The product IS the demo

### Pages to REDIRECT
- All existing routes redirect to `/` or `/auth` (if unauthenticated)

---

## 2. Single Decision Page (/) - The Entire Product

### Design Philosophy
- One screen, one decision, one outcome
- Must work in under 20 seconds
- Every element must make someone hesitate

### Wireframe Structure (Top to Bottom)

```text
+-------------------------------------------------------+
|  [small, muted text]                                  |
|  "Risk analysis before you deploy capital"            |
+-------------------------------------------------------+
|                                                       |
|  [HERO - large, bold]                                 |
|  What's the worst-case loss if I do this trade?       |
|                                                       |
+-------------------------------------------------------+
|                                                       |
|  Describe the trade you're considering                |
|  +-------------------------------------------+        |
|  | Asset:          [ AAPL                  ] |        |
|  | Direction:      [ Buy / Sell            ] |        |
|  | Capital at risk (currency): [ 2,000     ] |        |
|  | Time horizon:   [ 1d | 1w | 1m | 3m     ] |        |
|  +-------------------------------------------+        |
|                                                       |
|  [ Analyze downside risk ]  <- Single, calm button    |
|                                                       |
+-------------------------------------------------------+
|                                                       |
|  RESULTS (after analysis):                            |
|                                                       |
|  [Based on probabilistic scenarios, not predictions]  |
|                                                       |
|  +-------------------+                                |
|  | Worst-case loss   |                                |
|  | (5% probability)  |                                |
|  |                   |                                |
|  |    -$412          |  <- BIG, RED, UNAVOIDABLE      |
|  +-------------------+                                |
|                                                       |
|  Probability of loss:    61%                          |
|  Expected drawdown:      -$180                        |
|  Stress scenario loss:   -$690                        |
|                                                       |
+-------------------------------------------------------+
|                                                       |
|  [ ] Stress this position  <- One toggle              |
|                                                       |
|  [Plain English Explanation - 3-5 lines max]          |
|  "In similar volatility conditions, losses of this    |
|   size occurred roughly 1 in 20 times. Risk is        |
|   driven more by volatility than direction."          |
|                                                       |
+-------------------------------------------------------+
|                                                       |
|  [ Save this decision ]  [ Close ]                    |
|                                                       |
+-------------------------------------------------------+
|                                                       |
|  [Micro disclaimer - faint, bottom]                   |
|  "Probabilistic analysis. Not financial advice."      |
|                                                       |
+-------------------------------------------------------+
```

### What We Remove from Current Workspace
- Header navigation
- Portfolio/Single Asset toggle
- History button
- Mode toggle
- Usage indicator (move to paywall moment only)
- All charts and visualizations
- Scenario Regime Cards
- Advanced Metrics accordion
- P&L Summary section
- Tail Risk Panel (simplified into main output)
- Risk Interpretation long-form AI explanation
- "Monitor Asset" button
- All badges and labels

### Loading State
Replace spinner with educational sequence:
1. "Simulating thousands of possible outcomes..."
2. "Measuring worst-case losses..."
3. "Quantifying tail risk..."

---

## 3. Design System Overhaul

### Color Palette

| Element | Color | Hex | Purpose |
|---------|-------|-----|---------|
| Primary Background | Warm Off-White | `#F9FAF7` | Less fatiguing, analytical |
| Primary Text | Near-Black (Soft) | `#111827` | High contrast, not harsh |
| Secondary Text | Gray | `#6B7280` | Labels, context |
| Risk/Loss Color | Muted Red | `#9B2C2C` | Danger signal, not panic |
| Dividers/Borders | Light Gray | `#E5E7EB` | Thin, 1px, no shadows |
| CTA Button | Deep Slate | `#1F2933` | Authority, "commit decision" |

### Colors to REMOVE
- Neon green (bullish indicators)
- Bright success colors
- Gradients
- Purple AI branding
- Gold "premium" cues
- All "trading platform" aesthetics

### Typography

| Element | Font | Size | Purpose |
|---------|------|------|---------|
| Hero question | Inter/System | 32-36px | Confrontational clarity |
| Big risk number | Inter/System | 40-44px | Unavoidable truth |
| Section headers | Inter/System | 18px | Structure |
| Body/labels | Inter/System | 14-15px | Readability |
| Disclaimer | Inter/System | 12px | Legal, unobtrusive |

### Interaction Rules
- No hover animations
- No bounce effects
- Fade transitions only (150-200ms)
- Focus state: darker border only
- Disabled looks disabled

---

## 4. Copy & Messaging Overhaul

### Current Copy Problems
- "Three-layer intelligence: Stochastic simulation -> Regime detection -> AI interpretation"
- "AI-Powered Risk & Scenario Intelligence"
- "Monte Carlo Simulation with 10,000 paths"
- "GBM + GARCH + HMM"

### New Copy Principles
- Lead with downside, not capability
- Plain English, no jargon
- No marketing language
- No predictions, no advice

### Key Copy Changes

| Location | Current | New |
|----------|---------|-----|
| Hero question | "Quantify Uncertainty Before You Trade" | "What's the worst-case loss if I do this trade?" |
| Subtext | "Monte Carlo simulation with GBM..." | "Risk analysis before you deploy capital" |
| CTA button | "Analyze Risk & Scenarios" | "Analyze downside risk" |
| Direction input | "Bullish View / Bearish View" | "Buy / Sell" |
| Results header | "Risk Snapshot" | (Remove - just show the number) |
| Risk explanation | Multi-paragraph AI interpretation | 3-5 lines, plain English |

### Phrases to DELETE
- "AI-powered"
- "Three-layer intelligence"
- "Institutional-grade"
- "Monte Carlo paths"
- "GBM/GARCH/HMM"
- "Neural Database"
- "Regime detection"
- "Scenario regimes"
- "Layer 1/2/3"
- Any technical terminology

---

## 5. Feature Deletions

### Delete Immediately
| Feature | Reason |
|---------|--------|
| Portfolio analysis | Delays single-decision accountability |
| Tracked assets | Feature creep |
| Charts and visualizations | Numbers first, not entertainment |
| Advanced metrics accordion | Complexity before PMF |
| Scenario Regime Cards | Visual noise |
| Return Distribution Chart | Entertainment, not decision |
| AI Risk Interpretation (long-form) | 3-5 lines max, no AI branding |
| Usage indicator in workspace | Move to paywall only |
| "Pro" badges everywhere | Feels sold-to before value |
| Dashboard alerts | Alerts feel like signals |
| Dashboard hero | Dashboards invite browsing |
| Recent reports grid | Historical context, not action |
| Methodology page | If it works, it explains itself |
| About page | Marketing before PMF |
| Demo page | The product IS the demo |
| Pricing page | Inline paywall only |
| Onboarding wizard | First analysis IS onboarding |

### Freeze for 6 Months
- API access
- Global markets beyond US (for free tier)
- Alerts & notifications
- Custom scenarios
- Education content
- B2B features
- Mobile app

---

## 6. Monetization Redesign

### Current State
- Prominent pricing page
- Upgrade CTAs throughout
- Feature comparison tables
- "PRO" badges everywhere

### New State
- Inline paywall ONLY after value delivered
- Triggers: Usage limit reached, stress scenario locked, non-US market

### Paywall Copy
```text
Free users can run 5 US market analyses per month.
Upgrade to unlock stress scenarios and global markets.

[ Upgrade ]
```

No pricing table. No feature list. No comparison. Just the unlock.

---

## 7. Decision Log (/decisions)

Replaces current History page with behavior reinforcement focus.

### Purpose
Make users respect their own caution.

### Content
- List of past decisions (date, asset, worst-case loss shown)
- Simple outcome tag: Avoided / Entered / Ignored risk
- No charts, no PnL, no performance stats

### Copy
"Your decision history" - not "Analysis History"

---

## 8. Account Page (/account)

### Current State
- Profile section with avatar upload
- Bio editing
- Subscription management
- Privacy/Legal tabs

### New State
Minimal. Only:
- Email display
- Usage counter
- Upgrade/downgrade button
- Delete account

No preferences. No themes. No AI settings. No profile customization.

---

## 9. Legal Page (/legal)

Consolidates all trust/legal content:
- Important Disclaimer (prominent)
- Data usage summary
- Model limitations
- Privacy policy link
- Terms of service link

This is the ONLY place disclaimers exist. Remove from all other pages.

---

## 10. Navigation Overhaul

### Current Header
- Logo, Demo, Workspace, Methodology, Pricing, Language toggle, Home, Tracked, History, Account, Sign out

### New Header
For logged-in users:
- Logo (links to /)
- Decisions (link to /decisions)
- Account (link to /account)
- Sign out

For logged-out users:
- Logo
- Sign in

No other navigation. No footer.

---

## 11. Onboarding Redesign

### Current Flow
3-step wizard: Credentials -> Legal -> Dashboard

### New Flow
No onboarding wizard. The first analysis IS onboarding.

When user first arrives:
1. Show the decision page
2. Pre-fill a common asset (e.g., AAPL, TSLA)
3. Show example worst-case loss
4. The "click" moment: "This outcome happens 1 out of 20 times. Most people never price that in."

### The Psychological Moment
After first analysis, show:
```text
"Think of a trade you were confident about - 
one that later went against you."

[pause]

"This is what the risk looked like before you took it."
```

---

## 12. Security Considerations

### Retained from Current Implementation
- Supabase Auth (email/password, OAuth)
- Row Level Security on all tables
- API rate limiting
- Encrypted data at rest/in transit
- Audit logs for all operations

### Removed/Simplified
- Complex user preferences (less data to protect)
- Portfolio data (not storing multi-asset positions)
- Tracked asset alerts (not sending notifications)

### Added
- Immutable decision logs (for user accountability)
- Clear data retention policy in /legal

---

## 13. SEO Changes

### Current Titles
- "OutputLens: Probabilistic Risk Intelligence | Monte Carlo Simulation"
- "Analyse - Probabilistic Risk Analysis | OutputLens"
- "AI-Powered Risk & Scenario Intelligence"

### New Titles
- "/" - "OutputLens - Know Your Downside Before You Trade"
- "/decisions" - "Your Decision History | OutputLens"
- "/account" - "Account | OutputLens"
- "/legal" - "Legal & Disclaimers | OutputLens"

### Meta Description
"Before you trade, know the worst-case loss. OutputLens shows probability distributions, not predictions."

---

## 14. Technical Implementation Approach

### Phase 1: Core Page Rebuild
1. Create new minimal `/` page with decision-focused design
2. Implement new color system in CSS variables
3. Simplify TradeInputForm to 4 inputs only
4. Create results component showing only worst-case loss
5. Add stress toggle (single boolean)
6. Implement 3-5 line plain English explanation

### Phase 2: Navigation & Routing
1. Update App.tsx routes to new 4-page structure
2. Add redirects for deprecated pages
3. Simplify Header to minimal navigation
4. Remove Footer entirely

### Phase 3: Feature Removal
1. Delete Dashboard, Pricing, Methodology, About pages
2. Remove all chart components from results
3. Remove Portfolio mode
4. Remove Tracked Assets functionality
5. Remove Advanced Metrics

### Phase 4: Design System
1. Update tailwind.config.ts with new colors
2. Update index.css with new base styles
3. Remove all gradient backgrounds
4. Implement calm, clinical aesthetic

### Phase 5: Copy & Messaging
1. Update all button text
2. Update all labels and headings
3. Remove all technical jargon
4. Write new plain English risk explanations

---

## 15. PMF Kill Metrics (Non-Negotiable)

After implementation, track these to validate PMF:

| Metric | Kill Threshold | Target |
|--------|----------------|--------|
| Pre-trade usage | <15% run analysis 2+ times/month | >30% |
| Stress toggle usage | <30% of analyses use stress mode | >40% |
| Decision saves | <20% save decisions | >30% |
| Paid user habit | <25% of paying users run 3+ analyses/month | >40% |

### Language Test
Listen for:
- "This stopped me" - Good
- "This scared me" - Good
- "Cool charts" - Kill signal

---

## 16. Files to Modify

### Core Pages (Create New)
- `src/pages/Decision.tsx` - New single decision page (/)
- `src/pages/Decisions.tsx` - New decision log page

### Delete Entirely
- `src/pages/Landing.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/Pricing.tsx`
- `src/pages/Methodology.tsx`
- `src/pages/About.tsx`
- `src/pages/Portfolio.tsx`
- `src/pages/TrackedAssets.tsx`
- `src/pages/Demo.tsx`
- `src/pages/Results.tsx` (merge into Decision page)
- `src/pages/Workspace.tsx` (merge into Decision page)
- `src/components/dashboard/*` (all)
- `src/components/landing/*` (all)
- `src/components/ReturnDistributionChart.tsx`
- `src/components/ScenarioProbabilityChart.tsx`
- `src/components/workspace/ScenarioRegimeCards.tsx`
- `src/components/workspace/AdvancedMetrics.tsx`
- `src/components/workspace/PnLSummary.tsx`
- `src/components/workspace/TailRiskPanel.tsx`
- `src/components/workspace/TrackAssetModal.tsx`
- `src/components/PortfolioAnalyzer.tsx`

### Simplify Heavily
- `src/App.tsx` - New route structure
- `src/components/layout/Header.tsx` - Minimal nav
- `src/components/layout/Footer.tsx` - DELETE entirely
- `src/components/TradeInputForm.tsx` - 4 inputs only
- `src/index.css` - New color system
- `tailwind.config.ts` - New design tokens

### Keep (with modifications)
- `src/pages/Auth.tsx`
- `src/pages/Account.tsx` (simplify)
- `src/pages/Terms.tsx` -> `/legal`
- `src/pages/Privacy.tsx` -> merge into `/legal`
- `src/pages/Onboarding.tsx` (simplify dramatically)

---

## Summary

This redesign eliminates 80% of the current UI to focus on one thing: making people pause before committing capital.

The product becomes a simple loop:
1. User about to trade
2. User enters trade details
3. User sees scary number
4. User pauses, resizes, or walks away

That's PMF. Everything else is distraction.
