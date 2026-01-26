
# Update Footer Tagline + Create "About" Page

## Overview

This plan implements two changes:
1. Update the footer description with the new tagline
2. Create a new "About" page combining "Why We Exist" storytelling with a Blog section

---

## Part 1: Update Footer Tagline

### File: `src/components/layout/Footer.tsx`

**Change (Line 14-16):**
```typescript
// Before
<p className="text-sm text-muted-foreground">
  AI-powered risk & scenario intelligence. Quantify downside before you trade.
</p>

// After
<p className="text-sm text-muted-foreground">
  AI risk & scenario intelligence for traders: quantify loss, analyze scenarios, track positions, and trade smarter.
</p>
```

**Also add "About" link to Product section (Line 37):**
```typescript
<li>
  <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
    About
  </Link>
</li>
```

---

## Part 2: Create "About" Page (Why We Exist + Blog)

### New File: `src/pages/About.tsx`

**Page Structure:**

```text
┌─────────────────────────────────────────────────────────────────┐
│  HERO SECTION                                                   │
│  ─────────────────────────────────────────────────────────────  │
│  Badge: "Our Story"                                             │
│  Headline: "Why We Built OutputLens"                           │
│  Sub-headline: Problem-driven, YC-style                        │
│  CTA: "Explore Risk Scenarios" | "See How It Works"            │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│  WHY WE EXIST                                                   │
│  ─────────────────────────────────────────────────────────────  │
│  Founder-led storytelling:                                      │
│  • The problem: Traders lose money due to irrational markets,  │
│    insufficient scenario planning, gut-based decisions          │
│  • The insight: Institutions have quant tools, retail doesn't  │
│  • The solution: AI + quantitative + qualitative risk analysis │
│                                                                 │
│  Customer Personas:                                             │
│  [Day Trader] [Quant Analyst] [B2B/Hedge Funds]                │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│  OUR APPROACH                                                   │
│  ─────────────────────────────────────────────────────────────  │
│  4 feature cards with icons:                                    │
│  • AI-Powered Probabilistic Risk Analysis                       │
│  • Qualitative Scenario Planning                                │
│  • Monte Carlo & Tail Risk Measurement                          │
│  • Portfolio & Asset Tracking                                   │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│  BLOG / LEARNING SECTION                                        │
│  ─────────────────────────────────────────────────────────────  │
│  Featured articles (static content for now):                    │
│  • "How to Interpret Monte Carlo Risk Scenarios"                │
│  • "Understanding Tail Risk in Volatile Markets"                │
│  • "Position Sizing with Quantitative Analysis"                 │
│                                                                 │
│  Social Links:                                                  │
│  [X/Twitter] [Reddit] [Instagram] [YouTube]                    │
│                                                                 │
│  CTA: "Subscribe for updates"                                   │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│  CTA SECTION                                                    │
│  ─────────────────────────────────────────────────────────────  │
│  "Start analyzing risk today"                                   │
│  Buttons: [Try Free Analysis] [Join Community]                  │
└─────────────────────────────────────────────────────────────────┘
```

### Content Details

**Hero Section:**
- Headline: "Why We Built OutputLens"
- Sub-headline: "Markets are irrational. Drawdowns are inevitable. We built the tools to quantify what others guess."

**Why We Exist Section:**
```typescript
const story = {
  problem: "Most traders lose money because they trade on gut feeling. " +
           "Institutional players have quantitative tools. Retail traders don't.",
  insight: "We saw a gap: Monte Carlo simulation, tail risk analysis, and scenario planning " +
           "were locked behind Bloomberg terminals and prop desk infrastructure.",
  solution: "OutputLens brings institutional-grade risk analysis to every trader. " +
            "AI-powered. Quantitative + qualitative. In your browser."
};
```

**Customer Personas:**
```typescript
const personas = [
  {
    title: "Active Day Traders",
    description: "Size positions with probability distributions, not hunches.",
    icon: TrendingUp
  },
  {
    title: "Quantitative Analysts",
    description: "Build intuition through Monte Carlo simulation and tail risk metrics.",
    icon: BarChart3
  },
  {
    title: "Hedge Funds & Asset Managers",
    description: "B2B scenario planning and portfolio risk assessment.",
    icon: Building2
  }
];
```

**Our Approach Features:**
```typescript
const approach = [
  {
    icon: Brain,
    title: "AI-Powered Risk Analysis",
    description: "10,000 Monte Carlo simulations powered by live market volatility."
  },
  {
    icon: Target,
    title: "Qualitative Scenario Planning",
    description: "Translate complex quant outputs into actionable risk interpretations."
  },
  {
    icon: Activity,
    title: "Tail Risk Measurement",
    description: "VaR, Expected Shortfall, and black swan probability analysis."
  },
  {
    icon: LineChart,
    title: "Portfolio & Asset Tracking",
    description: "Monitor positions with real-time alerts and sentiment signals."
  }
];
```

**Blog Section (Static Articles):**
```typescript
const articles = [
  {
    title: "How to Interpret Monte Carlo Risk Scenarios",
    excerpt: "Learn to read probability distributions and make smarter sizing decisions.",
    readTime: "5 min read",
    category: "Tutorial"
  },
  {
    title: "Understanding Tail Risk in Volatile Markets",
    excerpt: "Why 95% VaR isn't enough—and how Expected Shortfall protects you.",
    readTime: "7 min read",
    category: "Insights"
  },
  {
    title: "Position Sizing with Quantitative Analysis",
    excerpt: "From gut feeling to probability-based risk management.",
    readTime: "6 min read",
    category: "Strategy"
  }
];
```

**Social Links:**
```typescript
const socialLinks = [
  { name: "X / Twitter", icon: Twitter, url: "#" },
  { name: "Reddit", icon: MessageSquare, url: "#" },
  { name: "Instagram", icon: Instagram, url: "#" },
  { name: "YouTube", icon: Youtube, url: "#" }
];
```

---

## Part 3: Add Route

### File: `src/App.tsx`

**Add import:**
```typescript
import About from "./pages/About";
```

**Add route (before catch-all):**
```typescript
<Route path="/about" element={<About />} />
```

---

## Files Summary

| File | Action | Changes |
|------|--------|---------|
| `src/components/layout/Footer.tsx` | Modify | Update tagline + add About link |
| `src/pages/About.tsx` | Create | New page with Why We Exist + Blog |
| `src/App.tsx` | Modify | Add /about route |

---

## Design Notes

- **Colors**: White background, navy blue headings, primary blue accents, subtle burgundy/orange for highlights
- **Typography**: font-brand for headings, standard body text
- **Tone**: Professional, approachable, founder-led voice ("We built this because...")
- **Layout**: Consistent with Methodology page structure (hero-gradient, glass-cards, section-container)

---

## Social Links Note

The social links (X, Reddit, Instagram, YouTube) will use placeholder `#` URLs. You can update these with actual social profile URLs once they're created.

---

## SEO

Page title set via useEffect:
```typescript
document.title = 'About OutputLens - Why We Built AI Risk Intelligence | OutputLens';
```
