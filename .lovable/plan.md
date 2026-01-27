

# Complete YC-Style Landing Page + Three Critical Gaps Implementation

## Executive Summary

This plan addresses the **three critical gaps** identified in the gap analysis while updating the landing page to achieve **YC-grade investor readiness**. The result: OutputLens becomes a licensable, defensible, regulator-safe probabilistic risk infrastructure company.

---

## Gap Analysis Summary

| Gap | Problem | Solution |
|-----|---------|----------|
| **Gap 1** | Core math is described, not owned | Create modular engine with deterministic, reproducible TypeScript math modules |
| **Gap 2** | Neural DB technically undefined | Define explicit embedding schema + similarity query architecture |
| **Gap 3** | Monetization is UI-level, not compute-level | Implement cost units per operation + backend enforcement |

---

## Implementation Architecture

### Current State (What Exists)
The codebase already has good foundations:
- `src/lib/scenarioEngine.ts` - GBM Monte Carlo implementation
- `src/lib/riskMetrics.ts` - VaR, CVaR, Sharpe/Sortino calculations
- `src/lib/stripe.ts` - Three-layer plan configuration
- Edge function `analyze-trade` - AI interpretation with Layer 3 constraints

### Target State (What We're Building)

```text
src/lib/
├── engine/                    ← GAP 1: Deterministic Risk Engine
│   ├── index.ts              ← Main orchestrator (CORE IP)
│   ├── stochastic/
│   │   ├── gbm.ts            ← Geometric Brownian Motion (refactored from scenarioEngine)
│   │   ├── garch.ts          ← GARCH-like volatility (new)
│   │   └── regimeGbm.ts      ← Regime-switched GBM (new)
│   ├── risk/
│   │   ├── var.ts            ← Value at Risk (refactored from riskMetrics)
│   │   ├── cvar.ts           ← Expected Shortfall
│   │   └── drawdown.ts       ← Max drawdown estimation
│   ├── regimes/
│   │   └── hmm.ts            ← Hidden Markov Model regime detection (new)
│   └── scenarios/
│       ├── base.ts           ← Scenario parameter transformers
│       ├── volSpike.ts       ← Volatility spike scenario
│       └── stressTail.ts     ← Black swan tail fattening
│
├── neural/                    ← GAP 2: Neural Database Architecture
│   ├── embeddings.ts         ← Embedding vector schema
│   ├── index.ts              ← Vector index management
│   ├── similarity.ts         ← Cosine similarity + k-NN
│   └── query.ts              ← Context retrieval (NOT prediction)
│
├── billing/                   ← GAP 3: Compute-Based Monetization
│   ├── costModel.ts          ← Internal cost units per operation
│   ├── usageMeter.ts         ← Real-time usage tracking
│   └── enforcement.ts        ← Backend limit enforcement
│
└── (existing files unchanged)
```

---

## Phase 1: Landing Page Enhancement

### 1.1 Update Hero Section
Add explicit "Why Now?" urgency and three-layer architecture messaging:

```typescript
// Hero badges update
const trustBadges = [
  { icon: Target, text: 'Probabilities, Not Predictions' },
  { icon: Layers, text: 'Three-Layer Intelligence' },  // NEW
  { icon: Shield, text: 'Open Methodology' },
];

// Add "Why Now?" urgency paragraph
<p className="text-sm text-primary/90 font-medium">
  Markets are more volatile, correlated, and regime-driven than ever. 
  Traditional indicators fail during tail events. Probabilistic risk modeling is no longer optional.
</p>
```

### 1.2 Update Features Grid - Technical Specificity

Replace vague descriptions with YC-grade technical terminology:

| Feature | Updated Description |
|---------|---------------------|
| Monte Carlo Simulation | "Free: 5,000 paths (US only). Paid: 10,000+ paths (Global). GBM with fixed seeding for reproducibility." |
| Stochastic Modeling | "Fat-tailed distributions, regime switching via HMM, mean reversion (Ornstein-Uhlenbeck). Layer 1 IP." |
| Risk Metrics | "VaR (90/95/99%), Expected Shortfall (CVaR), tail loss density, max drawdown. Deterministic math." |
| Neural Database + RAG | "Stores embeddings of volatility regimes, return distributions, correlation states. Retrieves context, never predicts." |
| AI Interpretation Layer | "Layer 3 only: LLMs explain distributions. Never compute prices. Every number cited from Layer 1-2." |
| Global Market Access | "Free: US Only. Paid: UK, EU, Crypto, Forex. Monetized by compute + data, not UI." |

### 1.3 Add Three-Layer Architecture Visualization

New section showing the intelligence stack:

```text
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: AI Interpretation (LLM + RAG)                     │
│  • Explains distributions • Never predicts • Cites Layer 1-2│
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: Statistical Adaptation (ML)                       │
│  • HMM regime detection • Neural DB similarity • Volatility │
├─────────────────────────────────────────────────────────────┤
│  LAYER 1: Deterministic Math/Physics (CORE IP)              │
│  • GBM simulation • VaR/CVaR • Scenarios • Reproducible     │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 Update ISP Use Cases with Technical Value Props

| ISP | Problem | Technical Value |
|-----|---------|-----------------|
| Active Traders | Overconfidence, gut decisions | "5,000 Monte Carlo paths + VaR quantifies tail exposure before you trade" |
| Quant Analysts | Tools fragmented & opaque | "Modular engine: GBM, GARCH, HMM, scenario transformers. API-ready." |
| B2B / Funds | Legacy tooling expensive | "Deterministic engine runs without OpenAI. License the math, not the UI." |

### 1.5 Add IP Transparency Section

New callout component on landing page:

```typescript
<Card className="border-primary/30 bg-primary/5">
  <CardContent className="p-6">
    <h3 className="font-semibold text-foreground mb-2">IP Transparency</h3>
    <p className="text-sm text-muted-foreground">
      The mathematics are public. Our IP is how we orchestrate, interpret, 
      and operationalize them at scale. The engine runs independently of 
      Supabase and OpenAI—benchmarkable, testable, licensable.
    </p>
  </CardContent>
</Card>
```

---

## Phase 2: Deterministic Risk Engine (GAP 1)

### 2.1 Engine Orchestrator (`src/lib/engine/index.ts`)

This is the **CORE IP** - the central orchestrator that ties all math modules together:

```typescript
export interface EngineConfig {
  seed?: number;           // Fixed seed for reproducibility
  paths: number;           // Monte Carlo paths
  stochasticModel: 'gbm' | 'garch' | 'regime_gbm';
  regimeDetection: boolean;
  jumpDiffusion: boolean;
}

export interface EngineResult {
  simulation: SimulationResult;
  riskMetrics: AdvancedRiskMetrics;
  scenarios: DynamicScenarioSet;
  regime?: 'bull' | 'neutral' | 'bear' | 'stress';
  computeCost: number;     // Internal cost units for billing
  reproducible: boolean;   // True if seeded
}

export function runRiskEngine(params: TradeInput, config: EngineConfig): EngineResult {
  // Layer 1: Deterministic math only - no AI calls
  // Reproducible with fixed seed
  // Computes cost units for backend billing
}
```

### 2.2 Refactored GBM Module (`src/lib/engine/stochastic/gbm.ts`)

Extract and enhance from `scenarioEngine.ts`:

```typescript
export interface GBMParams {
  currentPrice: number;
  volatility: number;       // Annualized (%)
  holdingPeriodDays: number;
  drift?: number;
  paths?: number;
  seed?: number;            // NEW: Fixed seed for reproducibility
}

export function runGBM(params: GBMParams): SimulationResult {
  // Deterministic with optional fixed seed
  // Returns full distribution + percentiles
}
```

### 2.3 GARCH-like Volatility Module (`src/lib/engine/stochastic/garch.ts`)

New module for stochastic volatility:

```typescript
export interface GARCHParams {
  currentVolatility: number;
  alpha: number;            // ARCH term weight
  beta: number;             // GARCH term weight
  omega: number;            // Unconditional variance
  holdingPeriodDays: number;
}

export function runGARCH(params: GARCHParams, returns: number[]): number[] {
  // Returns volatility path - NOT prices
  // Layer 1: Pure math, no AI
}
```

### 2.4 HMM Regime Detection (`src/lib/engine/regimes/hmm.ts`)

New module for market regime classification:

```typescript
export type MarketRegime = 'bull' | 'neutral' | 'bear' | 'stress';

export interface HMMParams {
  priceHistory: number[];
  volatilityHistory: number[];
  lookback?: number;
}

export interface HMMResult {
  currentRegime: MarketRegime;
  regimeProbabilities: Record<MarketRegime, number>;
  transitionMatrix: number[][];
}

export function detectRegime(params: HMMParams): HMMResult {
  // Layer 2: ML-based regime detection
  // No prediction - classification only
}
```

### 2.5 Scenario Parameter Transformers (`src/lib/engine/scenarios/`)

These modify model parameters, not outputs:

```typescript
// volSpike.ts
export function applyVolatilitySpike(
  baseVolatility: number, 
  severity: 'mild' | 'moderate' | 'severe'
): number {
  // Returns adjusted volatility for stress scenario
}

// stressTail.ts
export function applyTailFattening(
  kurtosis: number,
  stressLevel: number
): number {
  // Returns adjusted kurtosis for black swan scenarios
}
```

---

## Phase 3: Neural Database Architecture (GAP 2)

### 3.1 Embedding Schema (`src/lib/neural/embeddings.ts`)

Define exactly what gets embedded:

```typescript
export interface RegimeEmbedding {
  // Distribution characteristics
  meanReturn: number;
  volatility: number;
  skewness: number;
  kurtosis: number;
  
  // Risk metrics
  maxDrawdown: number;
  var95: number;
  
  // Regime labels
  regimeLabel: MarketRegime;
  correlationScore: number;
  
  // Metadata
  assetClass: string;
  timeframe: string;
  timestamp: number;
}

export function createEmbeddingVector(data: RegimeEmbedding): number[] {
  // Returns normalized vector for similarity search
  // Typically 8-16 dimensions
}
```

### 3.2 Similarity Search (`src/lib/neural/similarity.ts`)

```typescript
export interface SimilarityResult {
  matchedRegime: RegimeEmbedding;
  similarity: number;       // 0-1 cosine similarity
  historicalDate: string;
  outcomeAfter30Days: {
    actualReturn: number;
    worstDrawdown: number;
  };
}

export function findSimilarRegimes(
  currentEmbedding: number[],
  k: number = 5
): SimilarityResult[] {
  // k-NN cosine similarity search
  // Returns historical analogs for context
  // NEVER predicts - only retrieves
}
```

### 3.3 Context Query (`src/lib/neural/query.ts`)

```typescript
export interface NeuralContext {
  similarRegimes: SimilarityResult[];
  regimeLabel: string;
  confidenceScore: number;
  contextStatement: string;  // Human-readable context for Layer 3
}

export function queryNeuralContext(
  simulation: SimulationResult,
  currentRegime: MarketRegime
): NeuralContext {
  // Convert simulation to embedding
  // Query similar historical regimes
  // Return context (NOT prediction)
}
```

---

## Phase 4: Compute-Based Monetization (GAP 3)

### 4.1 Cost Model (`src/lib/billing/costModel.ts`)

Define internal cost units per operation:

```typescript
export const COST_UNITS = {
  // Layer 1 operations
  gbm_path: 0.001,           // Per path
  garch_volatility: 0.5,     // Per run
  regime_switching: 0.3,     // Per run
  jump_diffusion: 0.5,       // Per run
  var_calculation: 0.1,      // Per metric
  cvar_calculation: 0.1,     // Per metric
  
  // Layer 2 operations
  hmm_regime: 1.0,           // Per detection
  neural_query: 2.0,         // Per similarity search
  
  // Layer 3 operations
  ai_explanation: 1.0,       // Per LLM call
} as const;

export function calculateComputeCost(config: EngineConfig): number {
  let cost = config.paths * COST_UNITS.gbm_path;
  if (config.stochasticModel === 'garch') cost += COST_UNITS.garch_volatility;
  if (config.regimeDetection) cost += COST_UNITS.hmm_regime;
  // ... etc
  return cost;
}
```

### 4.2 Plan Cost Budgets (`src/lib/billing/enforcement.ts`)

```typescript
export const PLAN_COST_BUDGETS: Record<SubscriptionPlan, number> = {
  free: 100,       // ~5 basic analyses
  starter: 600,    // ~30 full analyses
  pro: 2500,       // ~100 full analyses + portfolio
  trader: 15000,   // ~500 + API calls
};

export function checkCostBudget(
  userId: string,
  requestedCost: number,
  plan: SubscriptionPlan
): { allowed: boolean; remaining: number; reason?: string } {
  // Backend enforcement
  // UI reflects this, doesn't define it
}
```

### 4.3 Usage Meter (`src/lib/billing/usageMeter.ts`)

```typescript
export async function meterUsage(
  userId: string,
  operation: keyof typeof COST_UNITS,
  quantity: number = 1
): Promise<void> {
  // Track compute usage in database
  // Increment usage_tracking table with cost units
}

export async function getCurrentUsage(userId: string): Promise<{
  costUsed: number;
  costRemaining: number;
  operationBreakdown: Record<string, number>;
}> {
  // Return current month's compute usage
}
```

---

## Phase 5: Update AI Semantic Section

### 5.1 New FAQ Items for YC/Investor Audience

Add these questions to `AISemanticSection.tsx`:

```typescript
{
  question: "What is the three-layer intelligence architecture?",
  answer: "Layer 1 (Deterministic Math): GBM simulation, VaR/CVaR, scenario parameters - runs without AI. Layer 2 (Statistical Adaptation): HMM regime detection, neural database similarity, volatility adjustment. Layer 3 (AI Interpretation): LLMs explain distributions but never compute prices or give signals."
},
{
  question: "Can the engine run without AI?",
  answer: "Yes. Layer 1 is fully deterministic and runs independently of Supabase, OpenAI, or any external services. This is critical for reproducibility, testing, and B2B licensing. AI is last-mile interpretation only."
},
{
  question: "What is your compute-based pricing model?",
  answer: "Revenue comes from compute, not UI. Each operation has internal cost units: GBM paths, regime detection, neural queries, AI explanations. Plans map to monthly cost budgets, not feature counts. This is risk infrastructure pricing."
},
{
  question: "What exactly is stored in the neural database?",
  answer: "Embeddings of: volatility regimes, return distributions, drawdown profiles, correlation states. Vector format: [mean_return, volatility, skew, kurtosis, max_drawdown, regime_label, correlation_score]. Used for cosine similarity and k-NN retrieval. Never stores predictions."
}
```

---

## Phase 6: Edge Function Updates

### 6.1 Update `analyze-trade` System Prompt

Add engine context to make architecture explicit:

```typescript
const systemPrompt = `You are the qualitative reasoning layer (Layer 3) of OutputLens.

ENGINE CONTEXT (Layer 1-2 ran before you):
- Deterministic engine ran ${config.paths} GBM paths with seed ${config.seed || 'random'}
- Stochastic model: ${config.stochasticModel}
- Regime detection: ${regime?.currentRegime || 'disabled'}
- Neural context: ${neuralContext?.similarRegimes?.length || 0} similar historical regimes found
- Compute cost: ${computeCost} units

YOUR CONSTRAINTS:
- Every number you cite MUST come from the input data
- You are Layer 3 - interpretation only
- Layer 1-2 output is deterministic and reproducible
- You explain WHY, not WHAT will happen`;
```

---

## Files to Create/Modify

### New Files (GAP 1: Engine)
1. `src/lib/engine/index.ts` - Main orchestrator
2. `src/lib/engine/stochastic/gbm.ts` - Refactored GBM
3. `src/lib/engine/stochastic/garch.ts` - GARCH volatility
4. `src/lib/engine/stochastic/regimeGbm.ts` - Regime-switched GBM
5. `src/lib/engine/risk/var.ts` - Value at Risk
6. `src/lib/engine/risk/cvar.ts` - Expected Shortfall
7. `src/lib/engine/risk/drawdown.ts` - Max drawdown
8. `src/lib/engine/regimes/hmm.ts` - HMM detection
9. `src/lib/engine/scenarios/base.ts` - Base scenarios
10. `src/lib/engine/scenarios/volSpike.ts` - Vol spike scenario
11. `src/lib/engine/scenarios/stressTail.ts` - Tail fattening

### New Files (GAP 2: Neural DB)
12. `src/lib/neural/embeddings.ts` - Embedding schema
13. `src/lib/neural/index.ts` - Vector index
14. `src/lib/neural/similarity.ts` - Cosine similarity
15. `src/lib/neural/query.ts` - Context retrieval

### New Files (GAP 3: Billing)
16. `src/lib/billing/costModel.ts` - Cost units
17. `src/lib/billing/usageMeter.ts` - Usage tracking
18. `src/lib/billing/enforcement.ts` - Backend limits

### Modified Files
19. `src/pages/Landing.tsx` - Full overhaul
20. `src/components/landing/AISemanticSection.tsx` - New FAQs
21. `src/components/landing/ProblemSolutionSection.tsx` - Architecture diagram
22. `src/components/landing/InteractivePreview.tsx` - Three-layer context
23. `supabase/functions/analyze-trade/index.ts` - Engine context in prompt

---

## Expected Outcomes

### Investor Readiness
- Three-layer architecture is explicit and documented
- IP boundaries are crystal clear
- Engine runs independently of AI services
- Compute-based monetization is defensible

### Technical Credibility
- Deterministic, reproducible simulations with fixed seeding
- Modular engine for B2B licensing
- Neural DB technically specified (not buzzwordy)
- Cost units tied to actual compute

### Compliance Safety
- AI never generates numbers
- Every output traceable to Layer 1-2
- No prediction claims anywhere
- "Probabilities, not predictions" enforced in code

### YC Alignment
- "Why Now?" urgency statement present
- 3 ISPs explicitly named with technical value
- IP transparency section visible
- Revenue from compute, not UI

---

## Strategic Summary

After this implementation:

**OutputLens is not a trading app. It is:**
> Probabilistic risk infrastructure with a modular, licensable engine

**Revenue comes from:**
- Compute (Monte Carlo paths, regime detection, neural queries)
- Data (neural database access)
- Models (stochastic suite licensing)
- APIs (B2B integration)

**What we own:**
- Engine orchestration logic
- Regime → volatility mapping
- Neural embeddings of market behavior
- Risk interpretation framework
- Compute-based pricing logic

**What we don't own (and don't pretend to):**
- Raw Monte Carlo math (public)
- VaR formula (public)
- GBM equation (public)

This is YC-grade, regulator-safe, licensable infrastructure.

