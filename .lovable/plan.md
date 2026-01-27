

# PMF-Friendly Landing Page Implementation Plan

## Overview
Transform the current Decision page (`/`) into a clean, single-scroll landing experience that keeps the focus on the core value proposition: knowing your downside before you trade. This redesign follows your exact specifications for layout, colors, typography, and psychology.

## Current State Analysis
- The Decision page already has the core structure (header, input form, results, footer)
- CSS variables exist for the clinical design system (warm off-white, muted red for risk)
- Logo colors (`--logo-navy`, `--logo-blue`) are referenced in tailwind.config.ts but **missing** from index.css
- The `Plus Jakarta Sans` font for branding is referenced but **not imported**
- The page currently requires sign-in to see the input form

## Changes Summary

### 1. Add Missing CSS Variables and Font Import

**File: `src/index.css`**

Add the missing logo and brand color variables, plus import Plus Jakarta Sans:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  /* Existing variables... */
  
  /* Logo colors from brand (using your spec colors) */
  --logo-navy: 213 33% 17%;    /* Deep navy #1F2933 */
  --logo-blue: 217 91% 60%;    /* Royal blue accent */
  
  /* Brand colors */
  --brand-blue: 217 91% 60%;
  --navy: 213 33% 17%;
  --navy-deep: 220 39% 10%;
}
```

### 2. Simplify the Decision Page Layout

**File: `src/pages/Decision.tsx`**

Restructure to match your wireframe:

```text
+------------------------------------------------+
| LOGO (small, subtle color accent)              |
+------------------------------------------------+
| HERO / HEADLINE                                |
| "Know your downside before you trade."         |
+------------------------------------------------+
| SUBHEAD (small, supportive)                    |
| "Enter your trade details..."                  |
+------------------------------------------------+
| DECISION INTERFACE                             |
| [Asset] [Buy/Sell] [Capital] [Time horizon]    |
| [Analyze downside risk]                        |
+------------------------------------------------+
| FOOTER (legal + reassurance)                   |
| "Probabilistic analysis. Not financial advice."|
| [Sign in / Sign up]                            |
+------------------------------------------------+
```

Key changes:
- Remove the header border for cleaner look
- Change headline to "Know your downside before you trade."
- Add supportive subhead
- **Show input form to all visitors** (not just signed-in users)
- Move sign-in CTA to footer (minimal, optional)
- Authenticated users still see full nav in header

### 3. Update Color Palette per Your Spec

| Element | Color | HSL Value |
|---------|-------|-----------|
| Background | Warm off-white #F9FAF7 | Already set (60 10% 97%) |
| Headline text | Near-black #111827 | Already set (220 39% 10%) |
| Subhead | Gray #6B7280 | Already set (muted-foreground) |
| CTA Button | Deep slate #1F2933 | Already set (primary) |
| Risk numbers | Muted red #9B2C2C | Update to 0 60% 35% |
| Logo "Output" | Deep navy #1F2933 | Add --logo-navy |
| Logo "Lens" | Brand accent | Add --logo-blue |

### 4. Typography Updates

| Element | Current | Target |
|---------|---------|--------|
| Logo | text-xl to text-2xl | Bold 24px (keep as-is) |
| Hero headline | 2xl to 3xl | 32-36px (increase slightly) |
| Subhead | text-xs | 16px (increase for readability) |
| CTA button | text-base | 18px |
| Footer | text-xs | 12px (keep) |

### 5. UX Flow Changes

**For unauthenticated visitors:**
1. See full input form immediately (no "Sign in to analyze" blocker)
2. Can fill out form and click "Analyze"
3. On submit, prompt to sign up/sign in to see results
4. Footer has subtle "Sign in" link

**For authenticated users:**
1. See minimal nav (Decisions, Account, Sign out)
2. Full input + results flow as current

---

## Detailed File Changes

### File 1: `src/index.css`

**Add font import** (line 1):
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
```

**Add missing CSS variables** inside `:root` (after line 58):
```css
/* Logo and brand colors */
--logo-navy: 213 33% 17%;
--logo-blue: 217 91% 60%;
--brand-blue: 217 91% 60%;
--navy: 213 33% 17%;
--navy-deep: 220 39% 10%;
```

**Update risk color** (line 47):
```css
--risk: 0 60% 35%;  /* Muted red #9B2C2C */
```

---

### File 2: `src/pages/Decision.tsx`

**Major structural changes:**

1. **Remove header border** - cleaner, more minimal
2. **Update headline** - "Know your downside before you trade."
3. **Add subhead** - "Enter your trade details to see the worst-case loss."
4. **Show form to everyone** - Remove the sign-in blocker for input form
5. **Handle auth on submit** - Redirect to auth only when they try to analyze
6. **Update footer** - Add optional sign-in CTA for guests

```tsx
// Simplified structure
return (
  <div className="min-h-screen bg-background flex flex-col">
    {/* Minimal header - no border */}
    <header className="py-4">
      <div className="section-container flex items-center justify-between">
        <BrandLogo size="md" />
        {user ? (
          // Authenticated nav
        ) : (
          // Small "Sign in" text link
        )}
      </div>
    </header>

    {/* Main content - centered vertically */}
    <main className="flex-1 flex flex-col justify-center section-container py-8">
      {/* Hero */}
      <h1 className="text-3xl sm:text-4xl font-semibold text-center text-foreground mb-3">
        Know your downside before you trade.
      </h1>
      
      {/* Subhead */}
      <p className="text-base text-muted-foreground text-center mb-10">
        Enter your trade details to see the worst-case loss.
      </p>

      {/* Decision interface */}
      <div className="max-w-md mx-auto w-full">
        {/* Always show form */}
        {/* Results or input based on state */}
      </div>
    </main>

    {/* Footer */}
    <footer className="py-6">
      <p className="text-xs text-muted-foreground text-center">
        Probabilistic analysis. Not financial advice. <Link>Legal</Link>
        {!user && <> · <Link>Sign in</Link></>}
      </p>
    </footer>
  </div>
);
```

---

### File 3: `src/App.css`

**Clean up unused Vite boilerplate** - remove the old logo animation and card styles that are no longer relevant to the minimal design.

---

## Optional Enhancements (Phase 2)

These can be added after the core landing page is working:

1. **Micro-animations**: Subtle fade-in on form fields (using existing `animate-fade-in`)
2. **Logo hover**: Slightly brighter accent on hover (CSS transition)
3. **Progress indicator**: "First analysis done" toast for new users
4. **CTA hover state**: Slightly deeper slate on button hover

---

## Technical Notes

- No new dependencies required
- Reuses existing `DecisionInput` and `DecisionResult` components
- Maintains all existing functionality (auth, usage limits, paywall)
- Mobile-responsive with existing Tailwind breakpoints
- Clean separation: landing experience vs authenticated dashboard

