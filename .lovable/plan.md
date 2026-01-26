
# Update Demo Page to Match Workspace Results Layout

## Problem Analysis

The Demo page (`/demo`) currently displays analysis results using **legacy components** that don't match the updated institutional-grade Workspace layout:

| Demo Page (Current) | Workspace (Target) |
|---------------------|-------------------|
| `EnhancedQuantMetricsCard` | `RiskSnapshot` (above-the-fold) |
| `EnhancedRiskSummary` | `PnLSummary` |
| `ReturnDistributionChart` | `TailRiskPanel` |
| `ScenarioProbabilityChart` | `ScenarioRegimeCards` |
| `EnhancedScenarioDisplay` | `ReturnDistributionChart` |
| Raw AI explanation card | `AdvancedMetrics` |
| - | `RiskInterpretation` |

This creates an inconsistent user experience when visitors click "See Full Analysis" from the landing page `InteractivePreview` component.

---

## Solution

Refactor the Demo page to use the same Workspace components, following the established visual hierarchy:

1. **Risk Snapshot** - Above-the-fold key metrics
2. **P&L Summary** - Position economics
3. **Tail Risk Panel** - Extreme scenario emphasis
4. **Scenario Regime Cards** - Base Regime, Bullish Continuation, Bearish Scenario
5. **Return Distribution Chart** - Visual Monte Carlo output
6. **Advanced Metrics** - Collapsed quant details
7. **Risk Interpretation** - AI-powered explanation

---

## Implementation Details

### File: `src/pages/Demo.tsx`

**Changes:**

1. **Update imports** - Replace legacy components with Workspace components:
   - Remove: `EnhancedQuantMetricsCard`, `EnhancedRiskSummary`, `EnhancedScenarioDisplay`, `ScenarioProbabilityChart`
   - Add: `RiskSnapshot`, `PnLSummary`, `TailRiskPanel`, `ScenarioRegimeCards`, `AdvancedMetrics`, `RiskInterpretation`, `ActionPanel`

2. **Update results section** - Replace the current component layout with Workspace-style layout:
   ```
   Current (lines 204-274):
   - EnhancedQuantMetricsCard
   - ReturnDistributionChart
   - EnhancedRiskSummary
   - ScenarioProbabilityChart
   - EnhancedScenarioDisplay
   - Raw AI explanation card
   
   New:
   - RiskSnapshot (with demo badge)
   - PnLSummary
   - TailRiskPanel
   - ScenarioRegimeCards
   - ReturnDistributionChart
   - AdvancedMetrics (collapsed)
   - RiskInterpretation
   ```

3. **Add position sizing for demo** - Update `DEMO_ANALYSIS` in `demoData.ts` to include position info, or use defaults in Demo page

4. **Style adjustments** - Maintain the demo header bar and signup CTAs while using new components

5. **Update terminology** - Remove "Educational Disclaimer" language, ensure consistent professional tone

---

## Updated Demo Page Structure

```text
┌─────────────────────────────────────────────────┐
│  Demo Header (Sample Analysis badge)            │
│  Trade Summary Bar (Asset, Direction, Entry)    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Risk Snapshot                           │   │
│  │  Risk Level | Win Prob | Tail Risk | ER  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  P&L Summary (Expected P&L, Max Gain)    │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Tail Risk Panel                         │   │
│  │  Black Swan scenarios emphasized         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐    │
│  │Base Regime│ │ Bullish   │ │ Bearish   │    │
│  │           │ │Continuation│ │ Scenario  │    │
│  └───────────┘ └───────────┘ └───────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Return Distribution Chart               │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Advanced Metrics [Collapsed]            │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Risk Interpretation (AI Explanation)    │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  "Want to try your own?" CTA Section     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Final Signup CTA                        │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Additional Updates

### File: `src/lib/demoData.ts`

Add position sizing defaults to `DEMO_ANALYSIS`:
```typescript
input: {
  // ... existing fields
  positionSize: 100,      // 100 shares
  positionType: 'shares', // Shares mode for demo
}
```

### File: `src/components/landing/InteractivePreview.tsx`

Update terminology to match institutional style:
- "Base Case" → "Base Regime"
- "Upside Potential" → "Bullish Continuation"
- "Downside Risk" → "Bearish Scenario"

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Demo.tsx` | Replace legacy components with Workspace components, update layout structure |
| `src/lib/demoData.ts` | Add `positionSize` and `positionType` to demo input |
| `src/components/landing/InteractivePreview.tsx` | Update scenario labels to institutional terminology |

---

## Dependencies

All required Workspace components already exist in `src/components/workspace/`:
- `RiskSnapshot.tsx`
- `PnLSummary.tsx`
- `TailRiskPanel.tsx`
- `ScenarioRegimeCards.tsx`
- `AdvancedMetrics.tsx`
- `RiskInterpretation.tsx`

These are exported via `src/components/workspace/index.ts`.

---

## Outcome

After implementation:
- Demo page will display the same institutional-grade layout as the Workspace
- Consistent visual hierarchy: Insight → Evidence → Detail
- Professional terminology throughout
- Seamless experience from landing page preview to demo to actual workspace
