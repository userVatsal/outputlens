

# About Page Redesign - Compressed & Streamlined

## Overview

Redesign the About page to merge sections, reduce duplication with the landing page, and add real social media links. The goal is a focused, founder-led mission page that drives conversions.

---

## Changes Summary

### 1. Merge "Our Story" + "Why We Exist" into One Section

**Current:** Hero section + separate "Why We Exist" section with 3 cards (Problem, Insight, Solution) + separate "Who We Serve" section + separate "Our Approach" section (4 feature cards)

**New:** Single combined section with compressed mission statement + bullet-style personas + punchy tagline

**Remove entirely:**
- The 3 separate cards (Problem/Insight/Solution) - replace with 1 paragraph
- "Our Approach" section (4 feature cards) - this duplicates landing page features

---

### 2. Updated Content Structure

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  HERO SECTION                                                               │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Badge: "Our Story & Mission"                                               │
│  Headline: "Why We Built OutputLens"                                        │
│  Mission statement (1 paragraph):                                           │
│  "Markets are irrational, and drawdowns are inevitable. We built OutputLens│
│   to give traders the same institutional-grade risk tools that hedge funds │
│   use — AI-powered, in-browser, and accessible to everyone."               │
│  CTAs: [Explore Risk Scenarios] [See How It Works]                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  WHO WE SERVE (Bullet-style, compact)                                       │
│  ─────────────────────────────────────────────────────────────────────────  │
│  3 quick bullets with icons:                                                │
│  • Active Traders → Quantify positions with probability, not gut.          │
│  • Quantitative Analysts → Build intuition through scenario-based risk.    │
│  • Hedge Funds & Asset Managers → Portfolio-level risk planning for B2B.   │
│                                                                             │
│  Tagline: "Most traders guess. Institutions quantify. We close that gap."  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  LEARN & EXPLORE (Condensed hub)                                            │
│  ─────────────────────────────────────────────────────────────────────────  │
│  "Sharpen your risk management with tutorials, insights, and strategies."  │
│                                                                             │
│  3 article cards (more compact format with inline read time):              │
│  • Tutorial: How to Read Monte Carlo Scenarios — 5 min                     │
│  • Insight: Tail Risk & 95% VaR Limitations — 7 min                        │
│  • Strategy: Probability-Based Position Sizing — 6 min                     │
│                                                                             │
│  Link: "See All Resources →"                                                │
│                                                                             │
│  Social Links with real URLs:                                               │
│  [X - @ivatsal1] [X - @outputlens] [Instagram - @outputlens]               │
│  [YouTube - @outputlens]                                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  FINAL CTA (Same as current, already good)                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  "Start Analyzing Risk Today"                                               │
│  "Join traders who quantify before they trade."                            │
│  [Try Free Analysis] [View Pricing]                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Implementation

### File: `src/pages/About.tsx`

#### 1. Update Data Constants

**Remove:**
- `story` object (Problem/Insight/Solution cards)
- `approach` array (4 feature cards - duplicates landing page)

**Update `personas` to simpler format:**
```typescript
const personas = [
  {
    title: "Active Traders",
    description: "Quantify positions with probability, not gut.",
    icon: TrendingUp
  },
  {
    title: "Quantitative Analysts", 
    description: "Build intuition through scenario-based risk.",
    icon: BarChart3
  },
  {
    title: "Hedge Funds & Asset Managers",
    description: "Portfolio-level risk planning for B2B.",
    icon: Building2
  }
];
```

**Update `articles` with inline format:**
```typescript
const articles = [
  {
    title: "How to Read Monte Carlo Scenarios",
    readTime: "5 min",
    category: "Tutorial"
  },
  {
    title: "Tail Risk & 95% VaR Limitations",
    readTime: "7 min",
    category: "Insight"
  },
  {
    title: "Probability-Based Position Sizing",
    readTime: "6 min",
    category: "Strategy"
  }
];
```

**Update `socialLinks` with real URLs:**
```typescript
const socialLinks = [
  { name: "Founder on X", icon: Twitter, url: "https://x.com/ivatsal1", handle: "@ivatsal1" },
  { name: "OutputLens on X", icon: Twitter, url: "https://x.com/outputlens", handle: "@outputlens" },
  { name: "Instagram", icon: Instagram, url: "https://instagram.com/outputlens", handle: "@outputlens" },
  { name: "YouTube", icon: Youtube, url: "https://youtube.com/@outputlens", handle: "@outputlens" }
];
```

#### 2. Restructure Page Sections

**Hero Section (Updated):**
- Change badge text from "Our Story" to "Our Story & Mission"
- Replace subheadline with compressed mission statement
- Keep CTAs as-is (already good)

**Who We Serve Section (New consolidated section):**
- Merge into a cleaner horizontal bullet format (not 3 large cards)
- Add closing tagline: "Most traders guess. Institutions quantify. We close that gap."

**Remove:**
- "Our Approach" section entirely (lines 215-245) - duplicates landing page features

**Learn & Explore Section (Updated):**
- Keep header copy (already good)
- Make article cards more compact (inline category + title + read time)
- Add "See All Resources →" link
- Update social links with real URLs and handles

**Final CTA Section:**
- Keep as-is (already matches requested format)

---

## Visual Changes

| Current | New |
|---------|-----|
| 3 large Problem/Insight/Solution cards | 1 paragraph mission statement in hero |
| 4 "Our Approach" feature cards | Removed (duplicates landing) |
| 3 large persona cards with icons | Compact horizontal bullets with arrows |
| Article cards with excerpts | Compact inline format: Category: Title — X min |
| Placeholder social links | Real URLs with handles displayed |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/About.tsx` | Complete restructure: remove approach section, compress personas, update articles format, add real social URLs |

---

## Content Details

### Mission Statement (Hero)
```
Markets are irrational, and drawdowns are inevitable. We built OutputLens to give 
traders the same institutional-grade risk tools that hedge funds use — AI-powered, 
in-browser, and accessible to everyone.
```

### Who We Serve Bullets
- **Active Traders** → Quantify positions with probability, not gut.
- **Quantitative Analysts** → Build intuition through scenario-based risk.
- **Hedge Funds & Asset Managers** → Portfolio-level risk planning for B2B.

### Tagline
"Most traders guess. Institutions quantify. We close that gap."

### Social Links
| Platform | URL | Handle |
|----------|-----|--------|
| X (Founder) | https://x.com/ivatsal1 | @ivatsal1 |
| X (Company) | https://x.com/outputlens | @outputlens |
| Instagram | https://instagram.com/outputlens | @outputlens |
| YouTube | https://youtube.com/@outputlens | @outputlens |

---

## Expected Outcome

- **Shorter page**: Remove ~100 lines of duplicative content
- **Clearer focus**: Mission-driven, not feature-focused
- **Real social presence**: Actual links to founder and company accounts
- **Better conversion**: CTA remains strong at bottom
- **No duplication**: Features/methodology live on landing page only

