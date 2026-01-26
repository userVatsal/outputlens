

# Update Results Page + Dashboard as Home + User Onboarding

## Overview

This plan addresses three connected tasks:
1. Update the Results page (`/results`) to match the Workspace institutional layout
2. Make Dashboard the home page for authenticated users (after signup redirect)
3. Add user onboarding guidance to Dashboard for first-time users

---

## Asset Coverage Summary

**OutputLens can analyze thousands of assets:**

| Market | Coverage | Data Source |
|--------|----------|-------------|
| US Equities | ~20,000+ stocks, ETFs, ADRs | Finnhub API |
| UK Equities | LSE-listed stocks | Finnhub API |
| EU Equities | XETRA, Euronext, SIX exchanges | Finnhub API |
| Cryptocurrency | 15 major coins | Predefined list |
| Forex | Currency pairs | Supported |

**Usage Limits:**
- Free tier: 5 analyses/month
- Pro tier: Higher limits + asset monitoring

---

## Part 1: Update Results Page

### Problem

The Results page (`/results`) uses legacy components instead of the institutional-grade Workspace layout:

| Current (Legacy) | Target (Workspace) |
|------------------|-------------------|
| `EnhancedQuantMetricsCard` | `RiskSnapshot` |
| `EnhancedRiskSummary` | `PnLSummary` |
| `ScenarioProbabilityChart` | `TailRiskPanel` |
| `EnhancedScenarioDisplay` | `ScenarioRegimeCards` |
| `AIExplanation` (lazy) | `RiskInterpretation` |
| - | `AdvancedMetrics` |

### File: `src/pages/Results.tsx`

**1. Update Imports**

Remove:
```typescript
import { EnhancedQuantMetricsCard } from '@/components/EnhancedQuantMetricsCard';
import { EnhancedScenarioDisplay } from '@/components/EnhancedScenarioDisplay';
import { EnhancedRiskSummary } from '@/components/EnhancedRiskSummary';
import { ScenarioProbabilityChart } from '@/components/ScenarioProbabilityChart';
const AIExplanation = lazy(() => ...);
```

Add:
```typescript
import { 
  RiskSnapshot, 
  PnLSummary, 
  TailRiskPanel, 
  ScenarioRegimeCards, 
  AdvancedMetrics, 
  RiskInterpretation,
  ActionPanel 
} from '@/components/workspace';
import { investmentToShares } from '@/lib/positionCalculations';
```

**2. Add Helper Variables**

After line 81, add:
```typescript
const currencySymbol = marketInfo.currencySymbol;
const shares = input.positionType === 'shares' 
  ? input.positionSize 
  : investmentToShares(input.positionSize, input.entryPrice, input.positionType);
```

**3. Replace Results Sections (Lines 206-297)**

Replace the numbered step sections with Workspace components:

```typescript
{/* Risk Snapshot - Above the fold */}
<RiskSnapshot 
  analysis={analysis} 
  currencySymbol={currencySymbol}
/>

{/* P&L Summary */}
<PnLSummary 
  analysis={analysis}
  shares={shares}
  currencySymbol={currencySymbol}
/>

{/* Tail Risk Panel */}
<TailRiskPanel 
  scenarios={scenarios}
  expectedShortfall={riskMetrics.expectedShortfall}
  kurtosis={riskMetrics.kurtosis}
  currencySymbol={currencySymbol}
  entryPrice={input.entryPrice}
/>

{/* Scenario Regime Cards */}
<ScenarioRegimeCards 
  scenarios={scenarios}
  shares={shares}
  currencySymbol={currencySymbol}
  entryPrice={input.entryPrice}
/>

{/* Return Distribution Chart (keep existing) */}
<ReturnDistributionChart 
  riskMetrics={riskMetrics}
  simulation={simulation}
/>

{/* Advanced Metrics - Collapsed */}
<AdvancedMetrics 
  riskMetrics={riskMetrics}
  simulation={simulation}
/>

{/* Risk Interpretation */}
<RiskInterpretation 
  explanation={analysis.explanation}
/>

{/* Sentiment - Feature Gated (keep existing) */}
<FeatureGate feature="sentiment">
  <SentimentIndicator asset={input.asset} market={input.market} />
</FeatureGate>

{/* Action Panel (if not historical) */}
{!isHistorical && (
  <ActionPanel 
    analysis={analysis}
    onNewAnalysis={handleNewAnalysis}
  />
)}
```

**4. Update Disclaimer Text**

Remove "Educational Disclaimer" label, use institutional phrasing.

---

## Part 2: Dashboard as Home Page for Authenticated Users

### Problem

Currently, `Auth.tsx` redirects authenticated users to `/analyze`. After the dashboard overhaul, new signups should land on `/dashboard` to see their command center.

### File: `src/pages/Auth.tsx`

**Change redirect target from `/analyze` to `/dashboard`**

Lines 88-93 and 98-100:
```typescript
// Before
if (session) {
  navigate('/analyze');
}

// After  
if (session) {
  navigate('/dashboard');
}
```

Also update `emailRedirectTo` in signup options (line 158):
```typescript
emailRedirectTo: `${window.location.origin}/dashboard`,
```

---

## Part 3: User Onboarding on Dashboard

### Problem

New users who sign up land on Dashboard but have no guidance on what to do first.

### Solution

Add an onboarding component for first-time users that guides them through their first analysis.

### File: Create `src/components/dashboard/OnboardingGuide.tsx`

A new component that shows for users without any analysis history:

```typescript
interface OnboardingGuideProps {
  hasAnalysisHistory: boolean;
  onStartAnalysis: () => void;
}
```

Features:
- Welcome message with user's name (if available)
- Step-by-step guide: "1. Choose an asset → 2. Set direction → 3. Run analysis"
- Prominent CTA: "Run Your First Risk Analysis"
- Dismissible (stores in localStorage)
- Shows asset examples (AAPL, BTC, TSLA)

### Visual Layout

```text
┌─────────────────────────────────────────────────────────────────┐
│  🎉 Welcome to OutputLens, [Name]!                             │
│                                                                 │
│  Get started with your first risk analysis in 3 simple steps:  │
│                                                                 │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                    │
│  │   1     │ →  │   2     │ →  │   3     │                    │
│  │ Search  │    │  Set    │    │  Run    │                    │
│  │  Asset  │    │ View    │    │Analysis │                    │
│  └─────────┘    └─────────┘    └─────────┘                    │
│                                                                 │
│  Try these popular assets:                                      │
│  [AAPL] [TSLA] [BTC] [NVDA] [SPY]                              │
│                                                                 │
│  ╔═══════════════════════════════════════════════════════════╗ │
│  ║  🚀 Run Your First Risk Analysis                         ║ │
│  ╚═══════════════════════════════════════════════════════════╝ │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  💡 Tip: Your first analysis is free!                          │
└─────────────────────────────────────────────────────────────────┘
```

### File: `src/pages/Dashboard.tsx`

**Add onboarding logic:**

1. Import new OnboardingGuide component
2. Fetch analysis history count to determine if user is new
3. Show OnboardingGuide when:
   - User has no analysis history, AND
   - User hasn't dismissed the guide (localStorage)
4. Place above the Dashboard grid

```typescript
// Add state
const [hasCompletedFirstAnalysis, setHasCompletedFirstAnalysis] = useState(true);
const [showOnboarding, setShowOnboarding] = useState(true);

// Fetch history count
useEffect(() => {
  const checkFirstAnalysis = async () => {
    const { count } = await supabase
      .from('analysis_history')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id);
    
    setHasCompletedFirstAnalysis((count || 0) > 0);
  };
  checkFirstAnalysis();
}, []);

// In render
{!hasCompletedFirstAnalysis && showOnboarding && (
  <OnboardingGuide 
    profileName={profile?.full_name}
    onDismiss={() => setShowOnboarding(false)}
    onStartAnalysis={() => navigate('/workspace')}
  />
)}
```

---

## Files Summary

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/dashboard/OnboardingGuide.tsx` | First-time user onboarding walkthrough |

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Results.tsx` | Replace legacy components with Workspace suite |
| `src/pages/Auth.tsx` | Change redirect from `/analyze` to `/dashboard` |
| `src/pages/Dashboard.tsx` | Add onboarding logic for new users |
| `src/components/dashboard/index.ts` | Export new OnboardingGuide component |

---

## Technical Notes

### Position Sizing for Results Page

The Results page needs `shares` calculation for PnLSummary. If `input.positionSize` is undefined (older analyses), default to 100 shares:

```typescript
const shares = input.positionSize 
  ? (input.positionType === 'shares' 
      ? input.positionSize 
      : investmentToShares(input.positionSize, input.entryPrice, input.positionType))
  : 100; // Default for legacy analyses
```

### LocalStorage Key for Onboarding

```typescript
const ONBOARDING_DISMISSED_KEY = 'outputlens_onboarding_dismissed';
```

### Results Page Visual Hierarchy After Update

```text
┌─────────────────────────────────────────────────┐
│  Header (Back button, Title, View Only badge)   │
├─────────────────────────────────────────────────┤
│  Trade Input Summary Bar                        │
├─────────────────────────────────────────────────┤
│  RiskSnapshot (Risk Level, Win Prob, Tail, ER)  │
├─────────────────────────────────────────────────┤
│  PnLSummary (Expected P&L, Max Gain/Loss)       │
├─────────────────────────────────────────────────┤
│  TailRiskPanel (Black Swan scenarios)           │
├─────────────────────────────────────────────────┤
│  ScenarioRegimeCards (Base/Bullish/Bearish)     │
├─────────────────────────────────────────────────┤
│  ReturnDistributionChart (Monte Carlo visual)   │
├─────────────────────────────────────────────────┤
│  AdvancedMetrics [Collapsed by default]         │
├─────────────────────────────────────────────────┤
│  RiskInterpretation (AI explanation)            │
├─────────────────────────────────────────────────┤
│  SentimentIndicator [Pro Feature]               │
├─────────────────────────────────────────────────┤
│  ActionPanel (New Analysis, Export, etc.)       │
├─────────────────────────────────────────────────┤
│  Disclaimer                                     │
└─────────────────────────────────────────────────┘
```

---

## Outcome

After implementation:
- Results page matches Workspace institutional layout
- New users land on Dashboard after signup
- First-time users see onboarding guide with step-by-step instructions
- Consistent visual hierarchy across Demo, Results, and Workspace pages
- Professional terminology throughout

