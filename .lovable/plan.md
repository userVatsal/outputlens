
# Two-Part Fix: Live Asset Dashboard + No-Signup Analysis on Landing

## What's Being Fixed

### Problem 1: LiveAssetDashboard — Stale data + infinite re-fetch bug
The `fetchAllAssetData` callback in `LiveAssetDashboard.tsx` has a **critical stale closure bug**: it lists `assets` as a dependency, which causes a new callback every time assets update, which triggers the `setInterval` to reset, which calls fetch again — an infinite loop. The network logs confirm this: all 4 assets fetch simultaneously every ~60 seconds fine on first load, but the auto-refresh at `23:33:07` shows "Failed to fetch" because the component is fighting itself.

**Fix**: Remove `assets` from the `useCallback` dependency and instead use `initialAssets` as a constant reference (the asset list never changes, only the `liveData` attached to each). This breaks the dependency cycle.

Additionally, the static `riskScore` values (78, 23, 45, 35) never update from live data. We should compute a real risk level from the live `changePercent` — e.g., assets with >2% daily swing = High, 1–2% = Medium, <1% = Low. This makes the Risk column actually reflect live reality.

### Problem 2: InteractivePreview — Hardcoded fake prices, no real analysis
The `InteractivePreview` component uses completely **hardcoded static prices** from a `DEMO_ASSETS` object (AAPL at $185.50, etc.) and fake math to generate "results." The CTA at the bottom still forces people to `/auth?mode=signup` before doing anything real. This is exactly what the user wants to fix — let people run a real analysis without signing up.

**Fix**: Convert `InteractivePreview` into a proper **unauthenticated analysis launcher**:
- Keep the asset picker (AAPL, TSLA, etc.) but fetch **real live prices** from `fetch-market-data` edge function using the existing `useMarketData` hook
- Connect the "Run Analysis" button to the **actual workspace** at `/workspace?asset=AAPL&market=US&direction=long` — the Workspace page already supports unauthenticated use (it only prompts for auth at analysis submission time)
- Show the live current price next to each asset
- Keep the investment slider and direction/horizon controls — they feed directly into workspace URL params
- Remove the fake calculated metrics (winProb etc.) — instead show real current prices and a CTA: "Run Full Analysis" that pre-fills the workspace

This is a much stronger conversion pattern: the user sees real current prices, sets their parameters, clicks one button, and lands directly in the workspace with the form pre-filled. They only hit the auth wall when they actually hit "Submit" — which is a much more motivated moment.

---

## Detailed Implementation

### File 1: `src/components/landing/LiveAssetDashboard.tsx`

**Fix the stale closure bug:**
```
// BEFORE — assets in deps causes infinite loop:
const fetchAllAssetData = useCallback(async () => {
  const updatedAssets = await Promise.all(
    assets.map(async (asset) => { ... })   // 'assets' is stale
  );
  setAssets(updatedAssets);
}, [assets, fetchMarketData]);  // <-- 'assets' here causes loop

// AFTER — use initialAssets (static ref, never changes):
const fetchAllAssetData = useCallback(async () => {
  setIsRefreshing(true);
  const updatedAssets = await Promise.all(
    initialAssets.map(async (asset) => { ... })  // stable reference
  );
  setAssets(updatedAssets);
  setLastUpdate(new Date());
  setIsRefreshing(false);
}, [fetchMarketData]);  // only fetchMarketData as dep
```

**Compute live risk level from real data:**
```typescript
// After fetching live data, compute risk level from changePercent
function computeRiskLevel(changePercent: number | undefined): 'High' | 'Medium' | 'Low' {
  const abs = Math.abs(changePercent ?? 0);
  if (abs >= 2.5) return 'High';
  if (abs >= 1.0) return 'Medium';
  return 'Low';
}
// Apply when setting liveData
return {
  ...asset,
  liveData: data,
  riskLevel: computeRiskLevel(data?.changePercent),
  riskScore: Math.min(95, Math.round(Math.abs(data?.changePercent ?? 0) * 15 + 20)),
};
```

**Redesign the table rows to be Bloomberg-style** (matching the post-login aesthetic):
- Dark navy header instead of `bg-muted/30`
- `font-mono` for all prices and changes
- Clicking any row navigates to `/workspace?asset=TSLA&market=US` (pre-fills the workspace)
- Footer CTA changes from "Sign up to analyze" → "Run Analysis" that goes directly to `/workspace`

**Add 5 more assets** to make it more impressive:
- Current: TSLA, AAPL, AMZN, NVDA
- Add: MSFT, META, GOOGL, SPY, BTC (via CoinGecko)
- Total: 9 rows — a proper Bloomberg-style watchlist

### File 2: `src/components/landing/InteractivePreview.tsx`

**Complete rethink** — from a fake calculator to a real analysis launcher:

**New layout** (keeps existing structure but replaces fake math):
1. Asset selector (same pill buttons) — now shows live price next to each
2. Investment slider (keep as-is)
3. Direction toggle (keep as-is)  
4. Time horizon selector (keep as-is)
5. **Remove**: fake winProb / expectedReturn / VaR / scenario bars (all fake)
6. **Add**: Live price display — "Current price: $262.45 (−1.4%)" with color
7. **Big CTA**: "Run Analysis in Workspace →" that goes to `/workspace?asset=AAPL&direction=long&amount=1000&horizon=1W`

The Workspace page (`src/pages/Workspace.tsx`) already reads URL params to pre-fill the form. The user lands there, sees the pre-filled form, hits "Run Analysis" — THEN gets prompted to sign in. This is the correct funnel.

**Live price fetching in InteractivePreview:**
```typescript
// Add useMarketData hook
const { fetchMarketData } = useMarketData();
const [livePrice, setLivePrice] = useState<number | null>(null);
const [livePriceChange, setLivePriceChange] = useState<number | null>(null);

// Fetch when symbol changes
useEffect(() => {
  fetchMarketData(selectedSymbol, 'US').then(data => {
    if (data) {
      setLivePrice(data.price);
      setLivePriceChange(data.changePercent ?? null);
    }
  });
}, [selectedSymbol]);
```

**Navigation to workspace:**
```typescript
const handleRunAnalysis = () => {
  const params = new URLSearchParams({
    asset: selectedSymbol,
    market: 'US',
    direction,
    amount: String(amount),
    horizon,
  });
  navigate(`/workspace?${params.toString()}`);
};
```

### File 3: `src/pages/Workspace.tsx` — Verify URL param reading

Check that the Workspace already reads these URL params. If it does, nothing extra needed. If not, add a `useEffect` that reads `URLSearchParams` on mount and pre-fills the trade form.

### Visual Changes to LiveAssetDashboard

Matching the new Bloomberg aesthetic from the post-login redesign:
- Dark navy (`bg-[#1B2B4B]`) header bar instead of `bg-muted/30`
- White text in header
- "LIVE" badge with green pulse dot in header
- Each row: monospace price + change, color-coded (green/red)
- Row click → workspace with asset pre-filled
- "Analyze →" button appears on row hover (rightmost column)
- Footer: "Click any asset to run a full risk analysis. No signup required."

---

## Files to Edit

| File | Change |
|------|--------|
| `src/components/landing/LiveAssetDashboard.tsx` | Fix stale closure bug, add 5 more assets, live risk scoring, Bloomberg styling, click-to-analyze |
| `src/components/landing/InteractivePreview.tsx` | Fetch live prices, remove fake math, add "Run in Workspace" CTA that pre-fills params |
| `src/pages/Workspace.tsx` | Verify/add URL param reading to pre-fill TradeInputForm on mount |

---

## What Does NOT Change

- All edge functions and security logic — untouched
- `useMarketData` hook — works correctly already, just used in more places  
- `fetch-market-data` edge function — already live and working (confirmed by network logs)
- Auth flow — users who aren't signed in get prompted when they click "Run" in Workspace
- All other landing page sections

---

## Technical Notes on the Stale Closure Fix

The current code is:
```typescript
useEffect(() => {
  const interval = setInterval(fetchAllAssetData, 60000);
  return () => clearInterval(interval);
}, [fetchAllAssetData]);  // fetchAllAssetData changes when assets changes
```
Since `fetchAllAssetData` depends on `assets`, and `assets` updates after every fetch, this creates a dependency chain: fetch → update assets → new callback → clear interval → set new interval → repeat. By removing `assets` from `fetchAllAssetData`'s deps and using `initialAssets` directly, the callback becomes stable and the auto-refresh works correctly.
