

# Fix Demo Page - Apply Workspace Components

## Problem
The Demo page (`/demo`) was NOT updated during the previous implementation. It still uses legacy components instead of the new institutional-grade Workspace components, causing an inconsistent experience when users click "See Full Analysis" from the landing page.

## Current State (Demo.tsx lines 203-274)
Uses old components:
- `EnhancedQuantMetricsCard`
- `ReturnDistributionChart`
- `EnhancedRiskSummary`
- `ScenarioProbabilityChart`
- `EnhancedScenarioDisplay`
- Raw AI explanation in a card

## Required Changes

### File: `src/pages/Demo.tsx`

**1. Update Imports (lines 22-26)**

Remove:
```typescript
import { EnhancedQuantMetricsCard } from '@/components/EnhancedQuantMetricsCard';
import { EnhancedRiskSummary } from '@/components/EnhancedRiskSummary';
import { ScenarioProbabilityChart } from '@/components/ScenarioProbabilityChart';
import { EnhancedScenarioDisplay } from '@/components/EnhancedScenarioDisplay';
```

Add:
```typescript
import { 
  RiskSnapshot, 
  PnLSummary, 
  TailRiskPanel, 
  ScenarioRegimeCards, 
  AdvancedMetrics, 
  RiskInterpretation 
} from '@/components/workspace';
import { investmentToShares } from '@/lib/positionCalculations';
import { MARKETS } from '@/types/trade';
```

**2. Add Helper Variables (after line 40)**

Add currency and shares calculation:
```typescript
const currencySymbol = MARKETS[analysis.input.market].currencySymbol;
const shares = analysis.input.positionType === 'shares' 
  ? analysis.input.positionSize 
  : investmentToShares(
      analysis.input.positionSize, 
      analysis.input.entryPrice, 
      analysis.input.positionType
    );
```

**3. Replace Results Section (lines 203-274)**

Replace the entire results display with Workspace components:

```typescript
{showingResults ? (
  <div className="space-y-6">
    {/* Risk Snapshot - Above the fold key metrics */}
    <RiskSnapshot 
      analysis={analysis} 
      currencySymbol={currencySymbol}
    />

    {/* P&L Summary - Position economics */}
    <PnLSummary 
      analysis={analysis}
      shares={shares}
      currencySymbol={currencySymbol}
    />

    {/* Tail Risk Panel - Extreme scenarios */}
    <TailRiskPanel 
      tailScenarios={analysis.scenarios.tail}
      currencySymbol={currencySymbol}
    />

    {/* Scenario Regime Cards - Base/Bullish/Bearish */}
    <ScenarioRegimeCards 
      scenarios={analysis.scenarios}
      currencySymbol={currencySymbol}
    />

    {/* Return Distribution Chart */}
    <ReturnDistributionChart 
      riskMetrics={analysis.riskMetrics}
      simulation={analysis.simulation}
    />

    {/* Advanced Metrics - Collapsed by default */}
    <AdvancedMetrics 
      riskMetrics={analysis.riskMetrics}
      simulation={analysis.simulation}
    />

    {/* Risk Interpretation - AI explanation */}
    <RiskInterpretation 
      explanation={analysis.explanation}
    />

    {/* ... keep existing "Try Your Own" and CTA sections ... */}
  </div>
) : (
  // ... keep existing loading state ...
)}
```

---

## Visual Hierarchy After Fix

```text
┌─────────────────────────────────────────────────┐
│  Demo Header + Trade Summary Bar                │
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
│  "Want to try your own?" CTA                    │
├─────────────────────────────────────────────────┤
│  Final Signup CTA                               │
└─────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Demo.tsx` | Replace legacy components with Workspace components, add position/currency helpers |

## Outcome

After this fix:
- Demo page matches Workspace layout exactly
- Professional institutional terminology throughout
- Consistent "Insight → Evidence → Detail" hierarchy
- Seamless UX from landing preview → demo → actual workspace

