

# Restore Original Layout with PMF Enhancements

## Overview
Restore the Decision page to use the standard Layout component with the proper sticky header (with border, navigation, mobile menu) while keeping all the PMF improvements: cleaner copy, P&L metrics, simplified flow, and auth-on-submit behavior.

## Current State vs Target

**Current (PMF-only):**
- Custom minimal header inline in Decision.tsx
- No border, no mobile hamburger menu
- Vertically centered hero layout
- Single-file architecture

**Target (Original Layout + PMF):**
- Uses `Layout` component with `Header`
- Sticky header with border, proper navigation
- Mobile hamburger menu support
- Content uses section-container spacing
- **Keeps PMF enhancements**: headline, P&L metrics, auth-on-submit

## Visual Structure

```text
+------------------------------------------------------+
| OutputLens       [Decisions] [Account] [Sign Out]    | <- Sticky header with border
|------------------------------------------------------|
|                                                      |
|     Know your downside before you trade.             |
|     Enter your trade details to see worst-case loss. |
|                                                      |
|     +--------------------------------------------+   |
|     | Decision Input Form                        |   |
|     | Asset, Direction, Capital, Time Horizon    |   |
|     | [Analyze downside risk]                    |   |
|     +--------------------------------------------+   |
|                                                      |
|     Probabilistic analysis. Not financial advice.    |
|     Legal                                            |
|                                                      |
+------------------------------------------------------+
```

## File Changes

### File 1: `src/pages/Decision.tsx`

**Key changes:**
1. Import and use the `Layout` component wrapper
2. Remove inline header (Layout provides it via Header component)
3. Keep PMF headline, subhead, and auth-on-submit flow
4. Keep footer with legal disclaimer
5. Maintain vertically-centered content for cleaner UX

```tsx
import { Layout } from '@/components/layout/Layout';

export default function Decision() {
  // ... existing state and hooks ...

  return (
    <Layout>
      <div className="flex-1 flex flex-col">
        {/* Main content - centered */}
        <main className="flex-1 flex flex-col justify-center section-container py-12">
          {/* Hero headline */}
          <h1 className="text-3xl sm:text-4xl font-semibold text-center text-foreground mb-3 max-w-lg mx-auto leading-tight">
            Know your downside before you trade.
          </h1>
          
          {/* Subhead */}
          <p className="text-base text-muted-foreground text-center mb-10">
            Enter your trade details to see the worst-case loss.
          </p>

          {/* Decision interface */}
          <div className="max-w-md mx-auto w-full">
            {/* Loading / Results / Input form */}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6">
          <p className="text-xs text-muted-foreground/60 text-center">
            Probabilistic analysis. Not financial advice. Legal
          </p>
        </footer>
      </div>
      
      <PaywallModal />
    </Layout>
  );
}
```

## What Gets Restored

| Feature | Current | After Restore |
|---------|---------|---------------|
| Header component | Inline, no border | `Header` with sticky, border |
| Mobile menu | No hamburger | Full hamburger menu |
| Navigation | Basic links | Full nav with icons |
| Sign out button | Small icon | "Sign Out" with icon + text |

## What Stays (PMF Enhancements)

| PMF Feature | Status |
|-------------|--------|
| "Know your downside" headline | Kept |
| Supportive subhead | Kept |
| P&L metrics in results | Kept |
| Auth-on-submit (not blocking form) | Kept |
| Probability of loss fix | Kept |
| Footer legal disclaimer | Kept |
| Clean 4-page architecture | Kept |

## Technical Notes

- No new dependencies
- Reuses existing `Layout` and `Header` components
- Maintains all PMF improvements to `DecisionResult` (P&L, probability fix)
- Mobile-responsive with existing hamburger menu
- Loading state handled properly
- Auth check moved from render-blocking to submit-time

