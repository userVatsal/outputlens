
# Complete Site Overhaul: SEO, UI/UX, User Flows, Copy & Features

## Overview

This plan addresses a comprehensive update to OutputLens across all pages, SEO, UI/UX, user flows, copy, and features. The documentation provided references "Loveable" but I've adapted all changes for **OutputLens** - the AI Risk & Scenario Intelligence platform.

---

## 1. Global SEO Updates

### 1.1 Meta & Structured Data (index.html)
- Update `dateModified` in Schema.org to current date
- Add `priceRange` to SoftwareApplication schema for paid tiers
- Enhance FAQ schema with Monte Carlo path counts (Free: 5,000 vs Paid: 10,000)
- Add `BreadcrumbList` schema for improved navigation signals

### 1.2 Per-Page SEO Titles & Meta (All Pages)
Update `document.title` patterns for consistency:
- Landing: `OutputLens: AI Risk & Scenario Intelligence | Monte Carlo Simulation`
- Workspace: `Risk Workspace - Run 10,000 Monte Carlo Simulations | OutputLens`
- Demo: `Live Demo - See AI Risk Analysis in Action | OutputLens`
- Pricing: `Pricing Plans - Free to Pro Risk Analysis | OutputLens`
- Methodology: `Methodology - Monte Carlo Simulation & VaR Calculations | OutputLens`
- About: `About OutputLens - Mission, Team & Educational Resources`
- History: `Historical Risk Reports - Your Analysis Archive | OutputLens`
- Dashboard: `Dashboard - Your Risk Intelligence Hub | OutputLens`
- Account: `Account Settings - Profile & Subscription | OutputLens`

---

## 2. Landing Page Overhaul

### 2.1 Hero Section Updates
**Current:** "Quantify Risk Before You Trade"
**Updated Copy:**
- Headline: "Quantify Risk Before You Trade" (keep)
- Subhead: "Free: 5 analyses/mo. Starter & Pro: Unlimited analyses + advanced simulations."
- Add FOMO microcopy: "Only 5 free analyses/month — start quantifying now."

### 2.2 Interactive Preview Enhancement
- Display "Free vs Paid" feature comparison inline
- Show simulation count: "This demo runs 10,000 paths (full analysis)"
- Add "Upgrade to unlock advanced metrics" hover state for Pro features

### 2.3 Features Grid Updates
Current 5 features become 6 with clearer Free vs Paid differentiation:
1. Monte Carlo Simulation - "Free: 5,000 paths | Paid: 10,000 paths"
2. Advanced Risk Metrics - "VaR, Expected Shortfall, tail risk"
3. AI Risk Interpretation - "Free: Manual | Paid: Auto-generated"
4. Live Market Data - "Free: 15min delay | Paid: Real-time"
5. Multi-Market Support - "US, UK, EU stocks, ETFs, crypto, forex"
6. **NEW:** Portfolio Analysis - "Pro only: Up to 20 assets"

### 2.4 Metrics Bar Update
- Change "10,000" → "Up to 10,000" to reflect tier differences
- Add tooltip showing tier comparison

### 2.5 Use Cases Section
Update personas with clearer value props:
- Active Trader: "Size positions with probability, not guesswork. Free tier available."
- Portfolio Manager: "Stress-test correlation risk. Upgrade for full portfolio features."
- Quant Analyst: "Build intuition through simulation. API access on Trader tier."

### 2.6 Final CTA Section
- Update: "Your first 5 analyses are free. Quantify your next trade in under 2 seconds."
- Add urgency: "Limited free tier — 5 analyses/month"

---

## 3. Workspace Page Updates

### 3.1 Usage Indicator Enhancement
- Show remaining quota prominently: "2 / 5 free analyses left this month"
- Add progress bar with color coding (green → yellow → red)
- Show tier-specific limits: "Free: 5/mo | Starter: 30/mo | Pro: 100/mo"

### 3.2 Results Panel Free vs Paid Differentiation
- **Free Users:** 
  - Basic metrics visible
  - AI interpretation blurred with "Upgrade to unlock" overlay
  - Sentiment section locked with preview
- **Paid Users:**
  - Full AI explanations auto-generated
  - Complete sentiment breakdown
  - Export buttons visible (Pro+)

### 3.3 Portfolio Mode Enhancement
- Clearer "PRO" badge on Portfolio toggle
- Tooltip: "Analyze up to 20 correlated assets with Pro"
- Paywall modal with specific portfolio benefits

### 3.4 Simulation Feedback
- Show simulation count during loading: "Running 10,000 simulations..."
- For Free: Show "Running 5,000 simulations (Upgrade for 10,000)"

---

## 4. Pricing Page Overhaul

### 4.1 Updated Tier Table

| Feature | Free | Starter ($12) | Pro ($29) | Trader ($79) |
|---------|------|---------------|-----------|--------------|
| Analyses/mo | 5 | 30 | 100 | 500 |
| Monte Carlo Paths | 5,000 | 10,000 | 10,000 | 10,000 |
| Market Data | 15min delay | Live | Priority Live | Priority Live |
| AI Interpretation | Manual | Auto | Auto + Advanced | Auto + Advanced |
| Portfolio Assets | - | - | 5 | 20 |
| Exports | - | - | PDF/CSV | PDF/CSV + API |

### 4.2 Copy Updates
- Free: "Get started with 5 analyses per month"
- Starter: "Perfect for active traders"
- Pro: "Full power for serious analysis" (Most Popular badge)
- Trader: "API access + team features"

### 4.3 FAQ Section Expansion
Add questions:
- "How many Monte Carlo simulations do I get?"
- "Can I upgrade or downgrade anytime?"
- "What's the difference between VaR and Expected Shortfall?"

---

## 5. Demo Page Updates

### 5.1 Free vs Paid Visibility
- Add banner: "This demo shows a full 10,000-path analysis. Free tier runs 5,000 paths."
- Highlight which features require upgrade

### 5.2 Try Your Own Section
- Clearer CTA: "Sign up free to analyze your own assets (5/month)"
- Show popular assets with quick-start options

### 5.3 Signup Prompt Enhancement
- Time-delayed prompt after 5 seconds: "Save this analysis to your dashboard"
- Show benefits: "Track assets • Get alerts • Build history"

---

## 6. Auth & Onboarding Flow Optimization

### 6.1 Auth Page Updates
- Simplified signup: Email + Password only (current ✓)
- Add value prop: "5 free analyses/month • No credit card • Start in 30 seconds"
- Google OAuth prominent

### 6.2 Onboarding Wizard Simplification
**Current:** 5 steps (Credentials → Profile → Legal → Welcome → Complete)
**Proposed:** 3 steps (Credentials → Legal → Dashboard)

- **Remove Profile step from initial flow** - Collect name/DOB later via Account page
- **Combine legal checkboxes** into single "I agree to Terms & Privacy Policy"
- **Add skip option** for avatar/bio (move to Account)

### 6.3 Post-Signup Flow
- Redirect to Dashboard with "First Analysis" CTA
- Show onboarding guide for new users

---

## 7. Dashboard Page Enhancements

### 7.1 Hero Section Updates
- Show remaining analyses prominently: "3 Analyses Remaining This Month"
- Upgrade nudge for free users with feature list

### 7.2 Quick Actions
- Primary CTA: "Run Risk Analysis" button
- Secondary: "View Demo" for new users

### 7.3 Tracked Assets Grid
- Show live prices with sparklines
- Alert indicators for price movements

---

## 8. Methodology Page Updates

### 8.1 Technical Depth Enhancement
- Add flow diagram section explaining: User Input → Monte Carlo → Neural Processing → AI Feedback → Results
- Clarify Free vs Paid simulation differences

### 8.2 Data Sources Section
- Highlight live data providers: Finnhub, Twelve Data, CoinGecko
- Show data freshness indicators

---

## 9. About Page Updates

### 9.1 Mission Section
- Emphasize democratizing institutional-grade tools
- Add founder story/why we built this

### 9.2 Educational Resources
- Expand trading terms glossary
- Add "Free tier as educational tool" positioning

---

## 10. History Page Updates

### 10.1 UI Enhancements
- Add filtering: By asset, date range, direction
- Show key metrics inline: Win probability, VaR

### 10.2 Retention Messaging
- Free users: "History retained for 7 days. Upgrade for unlimited."
- Paid users: "Unlimited history retention"

---

## 11. Account Page Updates

### 11.1 Profile Section
- Allow deferred profile completion (name, DOB, avatar)
- Show profile completion percentage

### 11.2 Subscription Section
- Current plan with usage meter
- Upgrade path visualization
- One-click upgrade buttons

---

## 12. Component Updates

### 12.1 Header Navigation
- Add "Demo" link for non-authenticated users
- Show usage indicator in header for authenticated users

### 12.2 Footer Updates
- Add social links (X, Instagram, YouTube)
- Add "Resources" section with links to About educational content

### 12.3 PaywallModal Enhancement
- Contextual messaging based on trigger:
  - Usage limit: "You've used 5/5 analyses. Upgrade for 30+ monthly."
  - Portfolio: "Portfolio analysis requires Pro. See all 20-asset correlation."
  - Exports: "PDF exports included with Pro plan."

---

## 13. Feature Gate Enhancements

### 13.1 Blurred Preview Pattern
- Show blurred version of premium features (sentiment, exports)
- Overlay with "Upgrade to unlock" button
- Works for: AI Interpretation, Sentiment, Exports, Portfolio

### 13.2 Usage Transparency
- Clear limits shown everywhere
- Real-time usage counter updates

---

## 14. Technical Implementation Order

### Phase 1: SEO & Meta (Quick Wins)
1. Update index.html structured data
2. Standardize document.title across all pages
3. Add dateModified updates

### Phase 2: Landing Page Copy & UI
1. Hero section copy updates
2. Features grid with tier differentiation
3. Metrics bar tooltips
4. Final CTA urgency copy

### Phase 3: Workspace & Paywall
1. Usage indicator enhancements
2. Free vs Paid result differentiation
3. PaywallModal contextual messaging

### Phase 4: Pricing Page
1. Tier table with clear differentiation
2. FAQ expansion
3. Monte Carlo path comparison

### Phase 5: Auth & Onboarding
1. Simplified onboarding (3 steps)
2. Combined legal checkbox
3. Quick signup flow

### Phase 6: Other Pages
1. Demo page tier visibility
2. History page filtering
3. Account page completion flow
4. About page educational content

---

## 15. Files to Modify

### Core Pages (18 files)
- `src/pages/Landing.tsx`
- `src/pages/Workspace.tsx`
- `src/pages/Pricing.tsx`
- `src/pages/Demo.tsx`
- `src/pages/Methodology.tsx`
- `src/pages/About.tsx`
- `src/pages/Auth.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/History.tsx`
- `src/pages/Account.tsx`
- `src/pages/Portfolio.tsx`
- `src/pages/Onboarding.tsx`
- `src/pages/TrackedAssets.tsx`
- `src/pages/Results.tsx`
- `src/pages/Privacy.tsx`
- `src/pages/Terms.tsx`
- `src/pages/Analyze.tsx`
- `src/pages/NotFound.tsx`

### Layout Components (3 files)
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/Layout.tsx`

### Core Components (10+ files)
- `src/components/UsageIndicator.tsx`
- `src/components/PaywallModal.tsx`
- `src/components/FeatureGate.tsx`
- `src/components/TradeInputForm.tsx`
- `src/components/onboarding/OnboardingWizard.tsx`
- `src/components/onboarding/StepLegal.tsx`
- `src/components/onboarding/StepProfile.tsx`
- `src/components/dashboard/DashboardHero.tsx`
- `src/components/landing/ProblemSolutionSection.tsx`
- `src/components/landing/InteractivePreview.tsx`

### Config Files
- `index.html` (SEO structured data)
- `src/lib/stripe.ts` (plan config updates)

---

## Expected Outcomes

1. **Conversion Improvement:** Clearer Free vs Paid differentiation should increase upgrade rate
2. **Reduced Onboarding Friction:** 3-step flow vs 5-step reduces dropoff
3. **SEO Enhancement:** Structured data + consistent titles improve search visibility
4. **User Clarity:** Explicit limits and quotas reduce confusion
5. **Value Communication:** Feature gates with previews demonstrate upgrade value
