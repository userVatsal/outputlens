
# Complete YC-Style Master Technical Overhaul

## Overview

This plan implements the complete **OutputLens Master Project Instructions** across the entire frontend and backend, establishing OutputLens as a **YC-grade risk infrastructure company** with clear IP boundaries, explicit math/physics models, controlled AI, and credit-efficient monetization.

---

## Strategic Positioning (Applied Throughout)

### Core Identity
- **What we are**: Risk infrastructure + probabilistic education + explainable AI
- **What we're NOT**: Trading signals, price predictions, black-box AI
- **Mission**: "Quantify uncertainty before capital is deployed"

### Three-Layer Intelligence Stack (Architecture Philosophy)
1. **Layer 1**: Deterministic Math/Physics (CORE IP) - Must work without AI
2. **Layer 2**: Statistical & ML Adaptation (regime detection, volatility adjustment)
3. **Layer 3**: LLM Interpretation & RAG - Never hallucinate numbers, always cite internal logic

---

## Implementation Batches (Credit-Efficient)

### BATCH 1: Core Configuration & SEO (Highest ROI)

#### 1.1 Update `index.html` - Enhanced SEO Structured Data
- Add explicit model references to schema: GBM, GARCH, regime switching, fat-tailed distributions
- Add new FAQ schema items:
  - "What stochastic models do you use?"
  - "How does the neural database work?"
  - "Why don't you predict prices?"
  - "What is the three-layer intelligence architecture?"
- Update `priceRange`: "$0 - $79/month"
- Add `BreadcrumbList` schema for navigation signals
- Update `dateModified` to current date

#### 1.2 Update `src/lib/stripe.ts` - Enhanced Plan Configuration
Add new configuration fields to `PlanConfig`:
```typescript
interface PlanConfig {
  // Existing fields...
  
  // Layer 1: Math/Physics
  stochasticModels: 'basic_gbm' | 'gbm_garch' | 'full_suite' | 'api';
  jumpDiffusion: boolean;
  regimeSwitching: boolean;
  
  // Layer 2: Statistical/ML
  neuralDatabase: 'limited' | 'full' | 'auto';
  regimeDetection: boolean;
  volatilityAdaptation: boolean;
  
  // Layer 3: AI
  aiInterpretation: 'manual' | 'auto' | 'advanced';
  ragAccess: boolean;
  
  // Market access
  globalMarkets: boolean;
  marketsList: string[]; // ['US'] for free, ['US','UK','EU','Crypto','Forex'] for paid
}
```

Update each plan's features:
- **Free**: `basic_gbm`, US only, limited neural DB, manual AI
- **Starter**: `gbm_garch`, global, full neural DB, auto AI
- **Pro**: `full_suite`, global, auto neural DB, advanced AI, portfolio
- **Trader**: `full_suite` + API, all features, priority processing

---

### BATCH 2: Landing Page Overhaul (`src/pages/Landing.tsx`)

#### 2.1 Hero Section Updates
- Add "Why Now?" urgency statement:
  > "Markets are more volatile, correlated, and regime-driven than ever. Traditional indicators fail during tail events. Probabilistic risk modeling is no longer optional."
- Update trust badges to three-layer architecture:
  - "Deterministic Math First"
  - "AI Interprets, Never Predicts"
  - "Open Methodology"
- Add market access clarity to subhead

#### 2.2 Features Grid (6 Features Matching Architecture)
1. **Stochastic Price Models**: "GBM + GARCH-like dynamics + regime switching. Free: 5,000 paths | Paid: 10,000+"
2. **Advanced Risk Metrics**: "VaR (90/95/99%), Expected Shortfall, tail loss probability, max drawdown"
3. **Regime Detection**: "Hidden Markov Model detects bull/bear/stress regimes. Parameters adapt automatically."
4. **Neural Database + RAG**: "Retrieves historically similar volatility patterns—does not predict markets."
5. **AI Interpretation Layer**: "LLMs explain distributions—never predict prices or give signals."
6. **Global Market Access**: "Free: US Only | Paid: UK, EU, Crypto, Forex"

#### 2.3 Use Cases Section (Explicit 3 ISPs)
- **ISP 1 - Active Traders (Retail → Semi-Pro)**: 
  - Problem: "Overconfidence, gut decisions, no tail awareness"
  - Value: "Monte Carlo distributions, VaR/CVaR, US Free tier as education"
- **ISP 2 - Quant/Technical Analysts**: 
  - Problem: "Tools fragmented & opaque"
  - Value: "GBM + regime switching, physics-inspired intuition, neural similarity search"
- **ISP 3 - B2B / Funds / Fintechs**: 
  - Problem: "Risk tooling expensive, slow, legacy"
  - Value: "Deterministic engine, explainable AI, API + licensing"

#### 2.4 Comparison Table Updates
Add new rows:
- "Three-Layer Intelligence Architecture" ✓
- "Regime-Switching Stochastic Models" ✓
- "Physics-Inspired Risk Framing" ✓
- "Transparent IP Boundaries" ✓

---

### BATCH 3: Methodology Page Overhaul (`src/pages/Methodology.tsx`)

#### 3.1 New Section: Three-Layer Architecture Diagram
Visual representation of the intelligence stack with clear boundaries

#### 3.2 Section A: Stochastic Price Models (Layer 1 - CORE IP)
- **Geometric Brownian Motion (GBM)**: Base price evolution, risk-neutral & real-drift modes
- **Regime-Switched GBM**: Drift & volatility depend on detected market regime (bull/neutral/bear/stress)
- **GARCH-like Dynamics**: Stochastic volatility extensions
- **Fat-Tailed Distributions**: Non-Gaussian returns modeling

Code file references:
```
src/lib/scenarioEngine.ts  ← GBM implementation
src/lib/riskMetrics.ts     ← VaR, CVaR calculations
```

#### 3.3 Section B: Risk Metrics (Deterministic Math)
1. Value at Risk (VaR) - 90%, 95%, 99%
2. Expected Shortfall (CVaR)
3. Downside Probability
4. Tail Loss Density
5. Drawdown Distribution

#### 3.4 Section C: Scenario Engine (IP Core)
- "Scenario engine modifies model parameters, not outputs"
- Scenarios: Rate shock, volatility spike, liquidity crunch, black-swan tail fattening

#### 3.5 Section D: Machine Learning (Layer 2 - Non-LLM)
- **Hidden Markov Model (HMM)**: Market regime detection
- **PCA / Eigen Decomposition**: Correlation compression
- Purpose: "ML is used ONLY to classify regimes, adjust parameters, learn correlations"

#### 3.6 Section E: AI/LLM System (Layer 3 - Strictly Controlled)
What AI DOES:
- Explain risk outputs
- Translate metrics into human language
- Select scenarios based on user intent

What AI NEVER DOES:
- ❌ Compute prices
- ❌ Generate numbers
- ❌ Replace simulations

#### 3.7 IP Boundary Statement (Prominent Callout)
> "The mathematics are public. Our IP is how we orchestrate, interpret, and operationalize them at scale."

---

### BATCH 4: About Page Overhaul (`src/pages/About.tsx`)

#### 4.1 Mission Section Enhancement
> "Build the world's most trustworthy, AI-powered probabilistic risk intelligence platform—giving traders and institutions the same mathematical tools used by hedge funds, without hype or black-box predictions."

#### 4.2 Core Principles Section (NEW)
1. Truth over hype
2. Probabilities, not predictions
3. Deterministic math first, AI second
4. Transparent methodology
5. Clear free vs paid boundaries

#### 4.3 Non-Goals Section (NEW - Critical for Compliance)
- No trading execution
- No price predictions
- No hype indicators
- No social trading
- No black-box AI

#### 4.4 Why We Win Section (NEW)
- "Others show targets → we show distributions"
- "Others predict → we quantify downside"
- "Others hide math → we explain it"

#### 4.5 What is OutputLens IP (NEW)
✔ Scenario parameter engine
✔ Regime → volatility mapping
✔ Risk composition logic
✔ RAG knowledge base
✔ Compute-based pricing logic

❌ Raw Monte Carlo (public math)
❌ VaR formula (public math)

#### 4.6 Glossary Expansion
Add new terms from Master Prompt:
- Geometric Brownian Motion
- GARCH
- Regime switching
- Hidden Markov Model
- Neural embeddings
- RAG (Retrieval-Augmented Generation)
- Ornstein-Uhlenbeck process

---

### BATCH 5: Workspace & Results Updates

#### 5.1 `src/pages/Workspace.tsx` - Enhanced Loading States
Phase messages reflecting three-layer architecture:
1. "Fetching live market data..."
2. "Running Geometric Brownian Motion simulation..."
3. "Applying regime switching models..."
4. "Querying neural database for scenario similarity..."
5. "Generating AI interpretation (explains, never predicts)..."

#### 5.2 Tier Indicator Enhancement
- Free users see: "Layer 1: Basic GBM | 5,000 paths | US Only"
- Paid users see: "Layers 1-3: Full Suite | 10,000 paths | Global"

#### 5.3 Results Panel - Neural Context (Paid Users)
- "Similar historical regimes detected: [regime name]"
- "Pattern match confidence: [percentage]"
- "Regime state: Bull/Neutral/Bear/Stress"

---

### BATCH 6: Edge Function Updates

#### 6.1 Update `supabase/functions/analyze-trade/index.ts`
Enhance system prompt with three-layer context:

```typescript
const systemPrompt = `You are the qualitative reasoning layer (Layer 3) of OutputLens, a structured risk analysis system.

ARCHITECTURE CONTEXT:
Layer 1 (Deterministic): GBM simulation, VaR/CVaR calculations, scenario parameters
Layer 2 (Statistical): HMM regime detection, volatility adaptation
Layer 3 (You): Interpret and explain Layer 1-2 outputs in human language

YOUR ROLE:
- Synthesize simulation data into clear risk interpretation
- Reference specific probabilities from Monte Carlo simulation
- Explain regime states and their implications
- NEVER predict prices or generate numbers

CRITICAL RULES:
- Every number you cite must come from the input data
- Use probabilistic language: "may", "could", "might", "historically"
- Frame output as risk interpretation, not recommendations
- Reference the three-layer architecture when appropriate`;
```

---

### BATCH 7: Pricing Page Updates (`src/pages/Pricing.tsx`)

#### 7.1 Updated Tier Table with Layer Access

| Feature | Free | Starter ($12) | Pro ($29) | Trader ($79) |
|---------|------|---------------|-----------|--------------|
| **Layer 1: Stochastic Models** | Basic GBM | GBM + GARCH | Full Suite | Full + API |
| Monte Carlo Paths | 5,000 | 10,000 | 10,000 | 10,000 |
| Regime Switching | ❌ | ✓ | ✓ | ✓ |
| Jump Diffusion | ❌ | ❌ | ✓ | ✓ |
| **Layer 2: ML Adaptation** | Limited | Full | Full | Full |
| Neural Database | Limited | Full | Auto | Auto |
| Regime Detection | ❌ | ✓ | ✓ | ✓ |
| **Layer 3: AI Interpretation** | Manual | Auto | Advanced | Advanced |
| RAG Knowledge Access | ❌ | ✓ | ✓ | ✓ |
| **Markets** | US Only | Global | Global | Global |
| **API Access** | ❌ | ❌ | ❌ | 100/mo |

#### 7.2 New FAQ Items
- "What is the three-layer intelligence architecture?"
- "How does regime detection work?"
- "What's the difference between basic GBM and full stochastic suite?"
- "Why don't you predict prices?"

---

### BATCH 8: Component Updates

#### 8.1 `src/components/PaywallModal.tsx` - Enhanced Triggers
Add new trigger types:
```typescript
type PaywallTrigger = 
  | 'usage_limit' 
  | 'portfolio' 
  | 'neural_database'  // NEW
  | 'regime_detection' // NEW
  | 'global_markets'   // NEW
  | 'advanced_ai'      // NEW
  | 'api';
```

Each trigger references the three-layer architecture:
- `neural_database`: "Unlock full neural database for historical regime similarity search (Layer 2)"
- `regime_detection`: "Enable Hidden Markov Model for automatic regime classification (Layer 2)"
- `advanced_ai`: "Get advanced AI interpretations with RAG knowledge access (Layer 3)"

#### 8.2 `src/components/FeatureGate.tsx` - New Gatable Features
```typescript
type GatableFeature = 
  | 'sentiment' 
  | 'portfolio' 
  | 'api' 
  | 'exports' 
  | 'alerts'
  | 'neural_database'  // NEW
  | 'regime_detection' // NEW
  | 'global_markets'   // NEW
  | 'advanced_ai';     // NEW
```

#### 8.3 `src/components/landing/ProblemSolutionSection.tsx`
Update "How We Do It" card:
> "Three-layer intelligence: (1) GBM + GARCH stochastic simulation, (2) HMM regime detection + neural database, (3) LLM interpretation with RAG. Deterministic math first. AI interprets, never predicts. Institutional methodology, delivered in 2 seconds."

---

### BATCH 9: Dashboard & Footer Updates

#### 9.1 `src/components/dashboard/WhySection.tsx`
Replace with YC-style positioning:
> "OutputLens is not a trading tool. It is risk infrastructure for decisions under uncertainty. We quantify the downside before you trade—using the same mathematical models hedge funds use, but accessible in your browser."

#### 9.2 `src/components/layout/Footer.tsx`
Update disclaimer to reflect three-layer architecture:
> "OutputLens provides probabilistic risk analysis using a three-layer intelligence architecture: (1) deterministic stochastic models for simulation, (2) machine learning for regime detection, (3) AI for interpretation only. It shows probability distributions, not predictions. The neural database retrieves historical patterns—it does NOT predict markets. LLMs explain math—they never predict prices or give trading signals. Not financial advice."

Add social links section (prominent):
- X (Founder): @ivatsal1
- X (OutputLens): @outputlens
- Instagram: @outputlens
- YouTube: @outputlens

---

### BATCH 10: Demo Page Updates (`src/pages/Demo.tsx`)

#### 10.1 Banner Enhancement
> "This demo shows probabilities from our three-layer intelligence stack—not predictions. Layer 1 runs the simulation. Layer 2 detects regime. Layer 3 explains. We quantify uncertainty, we don't forecast outcomes."

#### 10.2 Loading Animation Phases
1. "Layer 1: Initializing GBM stochastic process..."
2. "Layer 1: Generating 10,000 price paths..."
3. "Layer 2: Detecting market regime via HMM..."
4. "Layer 2: Querying neural database for similarity..."
5. "Layer 3: Generating AI explanation (interprets, never predicts)..."

---

## Files to Modify (Complete List)

### Configuration (~3 files)
- `index.html` - SEO structured data
- `src/lib/stripe.ts` - Plan configuration with three-layer access
- `supabase/functions/analyze-trade/index.ts` - AI prompt with architecture context

### Core Pages (~8 files)
- `src/pages/Landing.tsx` - Hero, features, ISPs, comparison
- `src/pages/Methodology.tsx` - Three-layer architecture, math/physics sections
- `src/pages/About.tsx` - Mission, principles, non-goals, IP, glossary
- `src/pages/Pricing.tsx` - Tier table with layer access
- `src/pages/Demo.tsx` - Banners, loading phases
- `src/pages/Workspace.tsx` - Loading states, tier indicator
- `src/pages/Dashboard.tsx` - Minor updates
- `src/pages/Auth.tsx` - Value prop updates

### Components (~8 files)
- `src/components/PaywallModal.tsx` - New triggers
- `src/components/FeatureGate.tsx` - New gatable features
- `src/components/UsageIndicator.tsx` - Layer access display
- `src/components/layout/Footer.tsx` - Disclaimer, social links
- `src/components/dashboard/WhySection.tsx` - YC positioning
- `src/components/dashboard/DashboardHero.tsx` - Upgrade messaging
- `src/components/landing/ProblemSolutionSection.tsx` - Three-layer explanation
- `src/components/landing/AISemanticSection.tsx` - FAQ expansion

---

## Key Terminology Reference (Apply Consistently)

### Architecture Terms
- **"Three-layer intelligence"** (core differentiator)
- **"Layer 1: Deterministic math"** (stochastic models)
- **"Layer 2: Statistical adaptation"** (ML/neural DB)
- **"Layer 3: AI interpretation"** (LLM/RAG)

### Model Terms
- **"Geometric Brownian Motion (GBM)"** - primary simulation model
- **"GARCH-like dynamics"** - stochastic volatility
- **"Hidden Markov Model (HMM)"** - regime detection
- **"Fat-tailed distributions"** - non-Gaussian modeling
- **"Regime switching"** - bull/bear/stress states

### Positioning Terms
- **"Probabilities, not predictions"** - core differentiator
- **"Quantify uncertainty"** - mission statement
- **"AI interprets, never predicts"** - Layer 3 constraint
- **"Deterministic math first, AI second"** - methodology
- **"Truth over hype"** - brand positioning
- **"Risk infrastructure"** - company category

---

## Expected Outcomes

1. **Investor Clarity**: YC-grade three-layer architecture explanation
2. **Technical Credibility**: Explicit math/physics model documentation
3. **IP Protection**: Clear boundaries between public math and proprietary orchestration
4. **Compliance Safety**: LLM constraints prevent "AI trading tool" accusations
5. **Tier Clarity**: Layer access maps directly to subscription tiers
6. **Monetization Logic**: Compute + data + models = revenue, not UI
7. **ISP Alignment**: Three customer profiles with specific value props
8. **SEO Enhancement**: Architecture keywords improve search visibility

---

## Strategic Truth (Implementation Principle)

**OutputLens is not a trading app. It is:**
> Risk infrastructure + probabilistic education + explainable AI

**Revenue comes from:**
- Compute (Monte Carlo paths)
- Data (neural database access)
- Models (stochastic suite)
- APIs (B2B integration)

**NOT from:**
- UI
- Dashboards
- Charts
- Predictions

This plan closes all gaps from the Master Project Instructions and establishes OutputLens as a YC-grade risk intelligence infrastructure company.
