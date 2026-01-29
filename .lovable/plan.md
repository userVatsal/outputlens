

# Landing Page Copy Redesign Plan

## Summary

This plan updates the OutputLens landing page copy to adopt a more sales-focused, action-oriented messaging style while retaining the core technical differentiation. The new copy emphasizes "Stop Guessing, Start Winning" as the hero message and restructures sections around features, use cases, a sample asset dashboard, testimonials, and a strong CTA.

---

## Key Changes Overview

| Section | Current | New |
|---------|---------|-----|
| Hero Headline | "Quantify Uncertainty Before You Trade" | "Stop Guessing, Start Winning" |
| Hero Subhead | Technical tier info | AI-powered risk management layer |
| Trust Badges | Technical terms | Remove or simplify |
| Features | 6 technical features | 3 simpler features (Data Aggregation, AI Scenario Analysis, Risk Probability) |
| Use Cases | 3 ICPs (Traders, Quants, B2B) | Real-time Asset Risk Dashboard with sample tickers |
| Social Proof | None | 3 Testimonials section |
| Final CTA | Technical messaging | "Ready to Elevate Your Trading?" |

---

## Files to Modify

### 1. `src/pages/Landing.tsx`
Main landing page - complete copy overhaul:

**Hero Section Changes:**
- Headline: "Stop Guessing, Start Winning"
- Subhead: "OutputLens provides a comprehensive risk management layer, leveraging AI to analyze qualitative, quantitative, and scenario-based data for smarter asset purchasing decisions."
- CTAs: "Request a Demo" + "Learn More"
- Remove "Why Now?" box and technical tier info

**Features Section Changes:**
- New header: "A Smarter Way to Assess Risk"
- Reduce to 3 features:
  1. **Data Aggregation** - Aggregate qualitative and quantitative data from diverse sources to get a holistic view of asset risks
  2. **AI Scenario Analysis** - Our Gen-AI tools analyze potential scenarios, incorporating internal and external factors to foresee market shifts
  3. **Risk Probability Prediction** - Receive a clear risk probability score for any asset, visualized in an intuitive gauge

**Use Cases → Asset Dashboard:**
- Replace ICP cards with a sample "Asset Risk Dashboard" table
- Show 4 sample assets (Tesla, Apple, Amazon, NVIDIA) with risk scores and risk levels (High/Medium/Low)
- Make rows appear clickable with hover states

**Add Testimonials Section:**
- 3 testimonial cards with quotes, names, and roles
- Professional styling with quotation marks

**Final CTA:**
- Headline: "Ready to Elevate Your Trading?"
- Subhead: "Sign up to get early access, or contact us for a personalized demo for your team."
- Single email CTA linking to signup

---

## Sections to Remove/Simplify

1. **Three-Layer Architecture Visualization** - Remove (too technical for new messaging)
2. **Problem-Solution Section** - Remove or merge into features
3. **Metrics Bar** (10,000 paths, GBM, etc.) - Remove (too technical)
4. **IP Transparency Section** - Remove (B2B focused, not relevant for new messaging)
5. **Comparison Table** - Remove (competitive positioning can be more subtle)
6. **FAQ/AISemanticSection** - Keep but simplify or move lower

---

## New Testimonials Data

```typescript
const testimonials = [
  {
    quote: "OutputLens has revolutionized my trading strategy. The risk probability predictions are incredibly accurate and have saved me from several potential losses. It's like having an AI co-pilot.",
    name: "Sarah L.",
    role: "Day Trader"
  },
  {
    quote: "The depth of analysis, combining both quantitative and qualitative data, is unmatched. OutputLens provides the clarity we need to make high-stakes decisions with confidence.",
    name: "Michael B.",
    role: "Hedge Fund Manager"
  },
  {
    quote: "I was skeptical at first, but the AI scenario analysis is a game-changer. It surfaces risks I would have never considered. An essential tool for any serious analyst.",
    name: "Jessica T.",
    role: "Financial Analyst"
  }
];
```

---

## New Asset Dashboard Data

```typescript
const sampleAssets = [
  { name: 'Tesla, Inc.', ticker: 'TSLA', riskScore: 78, riskLevel: 'High' },
  { name: 'Apple Inc.', ticker: 'AAPL', riskScore: 23, riskLevel: 'Low' },
  { name: 'Amazon.com, Inc.', ticker: 'AMZN', riskScore: 45, riskLevel: 'Medium' },
  { name: 'NVIDIA Corporation', ticker: 'NVDA', riskScore: 35, riskLevel: 'Medium' },
];
```

---

## Technical Details

### New Landing Page Structure

```text
1. Hero Section
   - Badge: "AI-Powered Risk Intelligence"
   - H1: "Stop Guessing, Start Winning"
   - Subhead: Comprehensive risk management layer...
   - CTAs: "Request a Demo" | "Learn More"

2. Features Section (Our Features)
   - Header: "A Smarter Way to Assess Risk"
   - 3 feature cards in grid

3. Interactive Demo (existing - keep)
   - Keep the InteractivePreview component

4. Asset Risk Dashboard (new)
   - Header: "Real-time Asset Risk Analysis"
   - Subhead: "See our AI in action..."
   - Table with sample assets

5. Testimonials Section (new)
   - Header: "Trusted by Professionals"
   - 3 testimonial cards

6. Final CTA Section
   - Header: "Ready to Elevate Your Trading?"
   - Email signup link + contact info

7. FAQ Section (keep AISemanticSection)
```

### Component Structure

The Landing page will be restructured but still use:
- `Layout` wrapper
- `InteractivePreview` (interactive demo)
- `AISemanticSection` (FAQ - keep for SEO)
- `LazySection` (performance optimization)

New inline components:
- Asset dashboard table (simple, no new file needed)
- Testimonials grid (simple, no new file needed)

---

## Files Summary

| File | Action |
|------|--------|
| `src/pages/Landing.tsx` | Major rewrite - new copy, structure, and sections |
| `src/components/landing/ProblemSolutionSection.tsx` | Remove import/usage from Landing |

---

## Considerations

- **SEO**: The AISemanticSection (FAQ) remains for search engine optimization
- **Interactive Demo**: Preserved as the key conversion element
- **Testimonials**: Using placeholder names - can be updated with real testimonials later
- **Risk Dashboard**: Static sample data to illustrate the product value proposition
- **Mobile**: All sections will remain responsive with existing Tailwind utilities

