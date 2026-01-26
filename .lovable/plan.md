

# YC-Style Landing Page Improvement Plan

## Overview

Transform the current landing page from information-heavy to conversion-focused with improved visual hierarchy, reduced repetition, and a clear Problem → Solution → Proof structure.

---

## Current Issues Identified

| Issue | Current State | Impact |
|-------|---------------|--------|
| Text density | Long paragraphs in features, FAQ | Casual visitors bounce |
| Repetition | Monte Carlo, tail risk mentioned 6+ times | Dilutes impact |
| Hero headline | Feature-focused ("10,000 simulations") | Not problem-first |
| Missing founder voice | No "why we exist" statement | Less trust/relatability |
| Section order | Features before problem/solution | Confusing for new users |
| Use cases | 3+ lines per persona | Too verbose |

---

## Proposed Structure (New Visual Hierarchy)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  HERO SECTION (Punchier, problem-first)                                     │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Headline: "Quantify Risk Before You Trade"                                 │
│  Subhead: "AI-powered Monte Carlo risk & scenario analysis for traders     │
│            and B2B firms. Know the downside before deploying capital."      │
│  Why-line: "Markets are unpredictable. OutputLens helps traders manage     │
│             uncertainty with AI-driven probabilistic scenarios."            │
│  CTAs: [Run Risk Analysis – Free] [See Live Demo]                          │
│  Microcopy: "5 free analyses/month • No credit card • Institutional-grade" │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  PROBLEM → SOLUTION → HOW (New Section)                                     │
│  ─────────────────────────────────────────────────────────────────────────  │
│  3 cards side by side:                                                      │
│  [The Problem] → [The Solution] → [How We Do It]                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  INTERACTIVE DEMO (Keep, but compress metrics display)                      │
│  Show only: Win Probability | Expected Return | 95% VaR                     │
│  CTA: "Run Risk Analysis – Free"                                            │
│  + Data Provider Logos below                                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  METRICS BAR (Slightly redesigned)                                          │
│  10,000 Paths | 95% VaR Coverage | <2s Results | 24/7 Data                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  CORE FEATURES (5 cards, reduced from 6, shorter copy)                      │
│  Monte Carlo | Risk Metrics | AI Interpretation | Live Data | Multi-Market │
│  (Remove Sentiment as standalone - merge into AI Interpretation)            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  USE CASES (Compressed to 1 line each + CTA)                                │
│  Active Trader: Size positions with probability, not guesswork.             │
│  Portfolio Manager: Stress-test correlation risk across your book.         │
│  Quant Analyst: Build intuition through Monte Carlo simulation.            │
│  [See How It Works →]                                                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  COMPARISON TABLE (Keep, already good)                                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  FAQ SECTION (Already accordion-style via AISemanticSection - keep)         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  FINAL CTA SECTION (Streamlined)                                            │
│  "Stop Guessing. Start Quantifying."                                        │
│  [Run Your First Risk Analysis] [Compare Plans]                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Changes

### 1. Hero Section Rewrite

**Current:**
```
Title: "OutputLens: AI-Powered Risk & Scenario Intelligence"
Subhead: "10,000 Monte Carlo simulations in 2 seconds..."
```

**New:**
```
Title: "Quantify Risk Before You Trade"
Subhead: "AI-powered Monte Carlo risk & scenario analysis for traders 
         and B2B firms. Know the downside before deploying capital."
Why-line: "Markets are unpredictable. OutputLens helps you manage 
          uncertainty with AI-driven probabilistic scenarios."
```

**Trust badges remain but reorder:**
- "Live Market Data" first (most relatable)
- "10,000 Simulations" second
- "Bank-Grade Encryption" third

---

### 2. New "Problem → Solution → How" Section

Create 3-card horizontal layout right after hero:

| The Problem | The Solution | How We Do It |
|-------------|--------------|--------------|
| Traders lose money from tail events, fragmented liquidity, and gut-based decisions. Most tools give a single price target—not the probability distribution. | OutputLens quantifies your downside before you trade. See 10,000 possible outcomes, measure tail risk, and understand scenario regimes. | Monte Carlo simulation + live market volatility + AI interpretation. Institutional methodology, delivered in 2 seconds. |

---

### 3. Interactive Demo Section

**Keep InteractivePreview component but:**
- Move DataProviderLogos directly under it (currently below)
- Add repeated CTA below demo: "Run Risk Analysis – Free"

---

### 4. Streamlined Features (5 cards, shorter copy)

| Feature | New Short Copy |
|---------|----------------|
| Monte Carlo Simulation | 10,000 probabilistic paths reveal where your trade could realistically end up. |
| Advanced Risk Metrics | VaR, Expected Shortfall, and tail risk quantified before you enter. |
| AI Risk Interpretation | Complex quant results translated into clear, actionable insights. |
| Live Market Data | Current volatility from global markets—not static assumptions. |
| Multi-Market Support | US, UK, EU stocks, ETFs, crypto, and forex in one platform. |

Remove "Sentiment Analysis" as standalone card (merge concept into AI Interpretation).

---

### 5. Compressed Use Cases

**Current:** 3 lines per persona
**New:** 1 line each + shared CTA

```typescript
const useCases = [
  {
    persona: 'Active Trader',
    useCase: 'Size positions with probability, not guesswork.',
    icon: TrendingUp,
  },
  {
    persona: 'Portfolio Manager',
    useCase: 'Stress-test correlation risk across your entire book.',
    icon: BarChart3,
  },
  {
    persona: 'Quant Analyst',
    useCase: 'Build intuition for risk-reward through simulation.',
    icon: Target,
  },
];
```

Add shared CTA at bottom: "See How It Works →" linking to /demo

---

### 6. Section Reordering

**Current order:**
1. Hero
2. Metrics Bar
3. Features Grid
4. Comparison
5. Use Cases
6. FAQ
7. Final CTA

**New order:**
1. Hero (rewritten)
2. Problem → Solution → How (NEW)
3. Interactive Demo + Data Providers
4. Metrics Bar
5. Features Grid (streamlined)
6. Use Cases (compressed)
7. Comparison Table
8. FAQ
9. Final CTA

---

## Files to Modify

| File | Action | Changes |
|------|--------|---------|
| `src/pages/Landing.tsx` | Modify | Restructure sections, update copy, add Problem/Solution component |
| `src/components/landing/ProblemSolutionSection.tsx` | Create | New 3-card section |
| `src/components/landing/InteractivePreview.tsx` | Modify | Add CTA button at bottom |

---

## Copy Updates Summary

### Hero
- Headline: "Quantify Risk Before You Trade"
- Subhead: "AI-powered Monte Carlo risk & scenario analysis for traders and B2B firms. Know the downside before deploying capital."
- Why-line (NEW): "Markets are unpredictable. OutputLens helps you manage uncertainty with AI-driven probabilistic scenarios."

### Features Section Header
- Badge: "Capabilities" (keep)
- Title: "Institutional-Grade Risk Analysis" (keep)
- Subtitle: "Quantitative methods used by hedge funds—now accessible to everyone." (shortened)

### Use Cases Section Header
- Title: "Built for Serious Decision-Making" → "Who Uses OutputLens"
- Subtitle: Remove long sentence, keep simple

### Final CTA
- Keep "Stop Guessing. Start Quantifying."
- Update subtitle: "Your first 5 analyses are free. Quantify your next trade in under 2 seconds."

---

## Expected Outcomes

| Improvement | Expected Impact |
|-------------|-----------------|
| Problem-first headline | Higher immediate engagement |
| "Why we exist" micro-copy | Builds trust, founder-led voice |
| Reduced repetition | Each feature feels impactful |
| Compressed use cases | Faster scanning, clearer personas |
| Better visual hierarchy | Visitors understand value in 5 seconds |
| Repeated CTAs near demo | Higher conversion to signup |

