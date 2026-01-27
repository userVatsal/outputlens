

# Fix Disclaimers, Header Demo Link, and Account Plan Display

## Summary of Issues Found

After thorough investigation, I identified three distinct problems:

### Issue 1: Disclaimers on Too Many Pages
Disclaimers currently appear in 10+ locations across the app. Based on your preference, they should only remain on **Methodology + Terms** pages.

**Pages with disclaimers to remove:**
- `Footer.tsx` - Lines 211-228 (global footer disclaimer)
- `Results.tsx` - Lines 309-317 (Monte Carlo disclaimer)
- `Workspace.tsx` - Lines 185-191 (Layer 1-3 disclaimer)
- `Analyze.tsx` - Lines 157-161 (educational disclaimer)
- `Portfolio.tsx` - Lines 222-231 (correlation disclaimer)
- `PortfolioAnalyzer.tsx` - Lines 543-548 (educational disclaimer)
- `Dashboard.tsx` - Lines 150-157 (informational disclaimer)
- `Pricing.tsx` - Lines 426-431 (probability disclaimer)
- `AIExplanation.tsx` - Lines 83-88 (probabilistic warning)
- `RiskInterpretation.tsx` - Lines 157-164 (Monte Carlo disclaimer)
- `ActionPanel.tsx` - Lines 174-179 (PDF export disclaimer)

**Pages to KEEP disclaimers:**
- `Methodology.tsx` - Already has appropriate disclaimers
- `Terms.tsx` - Keep legal disclaimers

### Issue 2: Demo Link in Header Navigation
The header navigation at `Header.tsx` line 18 still shows:
```typescript
{ href: '/demo', labelKey: 'demo' }
```

This should be changed to point to the landing page demo section:
```typescript
{ href: '/#demo', labelKey: 'demo' }
```

### Issue 3: Account Shows "Free" Despite Trader Access
**Root Cause Identified:**

The `usePlan` hook calls the `check-subscription` Edge Function, which queries Stripe for active subscriptions. Since test@outputlens.com and uservatsal@outlook.com were granted Trader access via a **database override** (not a Stripe subscription), the Edge Function finds no Stripe subscription and returns "free".

Meanwhile, `useUsage` correctly reads `subscription_plan` from the `profiles` table and shows the 500-analysis limit.

**The Fix:**

Modify the `check-subscription` Edge Function to check the `profiles.subscription_plan` column FIRST before checking Stripe. If the database has a manual override (e.g., 'trader'), return that plan. Only fall back to Stripe check if no override exists.

---

## Implementation Details

### Phase 1: Remove Disclaimers from Non-Essential Pages

Remove disclaimer sections from these 11 files:

| File | Lines to Remove | Description |
|------|-----------------|-------------|
| `src/components/layout/Footer.tsx` | 211-228 | Three-layer architecture + "Not financial advice" |
| `src/pages/Results.tsx` | 309-317 | Monte Carlo disclaimer box |
| `src/pages/Workspace.tsx` | 185-191 | Layer 1-3 architecture note |
| `src/pages/Analyze.tsx` | 157-161 | Educational disclaimer |
| `src/pages/Portfolio.tsx` | 222-231 | Correlation disclaimer |
| `src/components/PortfolioAnalyzer.tsx` | 543-548 | Educational disclaimer |
| `src/pages/Dashboard.tsx` | 150-157 | Risk analysis disclaimer |
| `src/pages/Pricing.tsx` | 426-431 | Probability disclaimer |
| `src/components/AIExplanation.tsx` | 83-88 | Probabilistic warning |
| `src/components/workspace/RiskInterpretation.tsx` | 157-164 | Monte Carlo disclaimer |
| `src/components/workspace/ActionPanel.tsx` | 174-179 | PDF disclaimer (in template) |

### Phase 2: Update Header Demo Link

Modify `src/components/layout/Header.tsx`:

**Before (line 17-22):**
```typescript
const navLinks = [
  { href: '/demo', labelKey: 'demo' },
  { href: '/workspace', labelKey: 'workspace' },
  { href: '/methodology', labelKey: 'methodology' },
  { href: '/pricing', labelKey: 'pricing' },
];
```

**After:**
```typescript
const navLinks = [
  { href: '/#demo', labelKey: 'demo' },
  { href: '/workspace', labelKey: 'workspace' },
  { href: '/methodology', labelKey: 'methodology' },
  { href: '/pricing', labelKey: 'pricing' },
];
```

### Phase 3: Fix Plan Display for Database Overrides

Modify `supabase/functions/check-subscription/index.ts` to respect database overrides:

**New Logic Flow:**
1. Authenticate user
2. Query `profiles.subscription_plan` directly from database
3. If database has a non-free, non-null plan AND no active Stripe subscription exists → return the database plan (this handles testing/demo accounts)
4. If Stripe subscription exists → return Stripe-based plan (normal flow)
5. If neither → return "free"

**Code changes needed:**

After line 82 (after user authentication), add a database check:

```typescript
// Check for database override first (for testing/demo accounts)
const { data: profileData } = await supabaseClient
  .from("profiles")
  .select("subscription_plan")
  .eq("user_id", user.id)
  .single();

const dbPlan = profileData?.subscription_plan;
```

Then, after the Stripe check (around line 120), if no active Stripe subscription but database has a plan:

```typescript
if (subscriptions.data.length === 0) {
  // No Stripe subscription - check for database override
  if (dbPlan && dbPlan !== 'free') {
    logStep("Using database plan override", { plan: dbPlan });
    return new Response(JSON.stringify({ 
      subscribed: true,
      plan: dbPlan,
      subscription_end: null
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
  // Otherwise return free tier
  ...
}
```

This ensures manually-granted Trader access displays correctly in the UI.

---

## Files to Modify

| File | Change Type |
|------|-------------|
| `src/components/layout/Header.tsx` | Update demo link to `/#demo` |
| `src/components/layout/Footer.tsx` | Remove disclaimer section |
| `src/pages/Results.tsx` | Remove disclaimer box |
| `src/pages/Workspace.tsx` | Remove Layer 1-3 note |
| `src/pages/Analyze.tsx` | Remove educational disclaimer |
| `src/pages/Portfolio.tsx` | Remove correlation disclaimer |
| `src/components/PortfolioAnalyzer.tsx` | Remove educational disclaimer |
| `src/pages/Dashboard.tsx` | Remove informational disclaimer |
| `src/pages/Pricing.tsx` | Remove probability disclaimer |
| `src/components/AIExplanation.tsx` | Remove probabilistic warning |
| `src/components/workspace/RiskInterpretation.tsx` | Remove Monte Carlo disclaimer |
| `src/components/workspace/ActionPanel.tsx` | Remove PDF disclaimer from template |
| `supabase/functions/check-subscription/index.ts` | Add database override check |

---

## Testing Checklist

After implementation:
- [ ] Disclaimers only appear on Methodology and Terms pages
- [ ] Header "Demo" link scrolls to landing page `/#demo` section
- [ ] test@outputlens.com shows "Trader" plan in Account
- [ ] uservatsal@outlook.com shows "Trader" plan in Account
- [ ] Usage indicator shows correct 500-analysis limit
- [ ] Stripe-based subscribers still work correctly

