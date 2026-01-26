
# Implementation Plan: Account Page Redesign, Dashboard Cleanup, and About/Blog Expansion

## Overview

This plan covers multiple interconnected changes to improve the user experience:
1. **Account Page Redesign** - Add profile picture upload directly on Account page with improved design
2. **Dashboard Cleanup** - Rename to "Home", remove duplicate account info, replace Market Intelligence with Latest Articles
3. **About Page Enhancement** - Add formal mission statement and create 2 detailed educational articles
4. **Blog Infrastructure** - Set up structure for monthly finance articles

---

## 1. Account Page Redesign

### Current Issues
- No direct profile picture upload on Account page (users must click through to complete this)
- Design feels basic compared to other institutional-grade pages

### Changes
- **Add ProfilePhotoCard** at the top of the Profile tab with the existing `AvatarUpload` component
- Add a visually prominent avatar section with:
  - Large avatar preview (128px)
  - Drag-and-drop upload zone
  - Clear "Change Photo" button
- Improve overall card styling to match the institutional design system

### Files to Modify
- `src/pages/Account.tsx` - Add profile photo section
- `src/components/account/ProfileSection.tsx` - Integrate avatar upload at top of card

---

## 2. Dashboard Page Updates

### Changes

**a) Rename to "Home" in Navigation**
- Update Header to show "Home" instead of "Dashboard"
- Update translation keys in LanguageContext

**b) Remove Duplicate Account Info**
The `DashboardHero` component currently shows:
- Avatar + display name + plan badge + remaining analyses

This duplicates the `AccountHeader` component. We will:
- Keep `AccountHeader` at the top (compact profile summary with photo)
- Modify `DashboardHero` to ONLY show:
  - The headline "AI-Powered Risk & Scenario Intelligence"
  - The tagline
  - Usage info (remaining analyses)
  - Settings + Upgrade buttons
- Remove the duplicate avatar/name/plan from `DashboardHero`

**c) Replace Market Intelligence with Latest Articles**
- Create new `LatestArticles` component that links to the About page articles
- Display 2-3 article cards with title, category badge, and read time
- Link to `/about#learn` for "See All"

### Files to Modify
- `src/components/layout/Header.tsx` - Rename Dashboard to Home
- `src/contexts/LanguageContext.tsx` - Update translation key
- `src/components/dashboard/DashboardHero.tsx` - Remove duplicate account info
- `src/components/dashboard/MarketIntelligence.tsx` - Replace with `LatestArticles.tsx`
- `src/components/dashboard/index.ts` - Update exports

---

## 3. About Page Enhancements

### Changes

**a) Add Formal Mission Statement**
Add a dedicated mission statement section after the hero:
> "OutputLens exists to democratize institutional-grade risk analysis. We believe every trader deserves to quantify their downside before they trade - not guess. Our mission is to close the gap between retail intuition and hedge fund precision."

**b) Create 2 Detailed Educational Articles**

The articles will be embedded directly in the About page (expandable or as separate sections with anchors):

**Article 1: "Understanding Trading & Investment Terms"**
- Category: Glossary
- Read time: 10 min
- Content structure:
  - **OutputLens Terminology**: Win Probability, VaR (Value at Risk), Expected Shortfall, Monte Carlo Simulation, Tail Risk, Sharpe Ratio, Kurtosis, Skewness
  - **Industry Standard Terms**: Alpha, Beta, Drawdown, Leverage, Position Sizing, Stop Loss, Take Profit, Risk-Reward Ratio
  - Each term includes: Definition, Why it matters, How OutputLens helps

**Article 2: "Trading & Hedge Fund Strategies in 2026"**
- Category: Strategy
- Read time: 12 min
- Content structure:
  - **Momentum Strategies**: Riding trends with quantified entry/exit
  - **Mean Reversion**: Identifying overextended moves
  - **Risk Parity**: Balancing portfolios by risk contribution
  - **Quantitative/Systematic**: Algorithm-driven decision making
  - **Event-Driven**: Earnings, M&A, macro events
  - How OutputLens supports each strategy type

**c) Add Monthly Finance Article Placeholder**
- Add a "Monthly Insights" section with a placeholder card
- Shows "Coming February 2026: [Topic TBD]"
- Structure for future dynamic loading

### Files to Modify
- `src/pages/About.tsx` - Complete redesign with mission statement and full articles

---

## 4. Create Article Pages (Optional Future Enhancement)

For now, articles will be embedded in the About page. Later, you could:
- Create individual article pages (`/articles/trading-terms`, `/articles/strategies-2026`)
- Store articles in database for dynamic loading
- Add monthly article publishing workflow

---

## Technical Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `src/pages/Account.tsx` | Modify | Add ProfilePhotoCard section |
| `src/components/account/ProfileSection.tsx` | Modify | Integrate avatar upload with improved UI |
| `src/components/layout/Header.tsx` | Modify | Rename "Dashboard" to "Home" |
| `src/contexts/LanguageContext.tsx` | Modify | Update translation keys |
| `src/components/dashboard/DashboardHero.tsx` | Modify | Remove duplicate avatar/name/plan |
| `src/components/dashboard/LatestArticles.tsx` | Create | New component for article cards |
| `src/components/dashboard/MarketIntelligence.tsx` | Delete | Replace with LatestArticles |
| `src/components/dashboard/index.ts` | Modify | Update exports |
| `src/pages/Dashboard.tsx` | Modify | Swap MarketIntelligence for LatestArticles |
| `src/pages/About.tsx` | Modify | Add mission statement, 2 full articles, monthly section |

---

## Implementation Order

1. **Account Page** - Add avatar upload with improved design
2. **Header** - Rename Dashboard to Home
3. **Dashboard cleanup** - Remove duplicate account info from DashboardHero
4. **LatestArticles** - Create component and replace MarketIntelligence
5. **About Page** - Add mission statement and full article content

