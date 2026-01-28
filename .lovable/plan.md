

# Performance Optimization Plan for OutputLens

## Summary

The Lighthouse audit reveals significant performance issues, especially on mobile (60% score) vs desktop (89%). The main bottlenecks are:

1. **Render-blocking resources** (280-1,460ms savings)
2. **Unused JavaScript** (~330 KiB savings)
3. **Multiple page redirects** (230-780ms savings)
4. **Font loading blocking render** (Google Fonts)
5. **Cache lifetimes** (~510 KiB savings)
6. **Forced reflow** (JavaScript querying layout during DOM changes)

---

## Root Causes Identified

### 1. Render-Blocking Google Fonts
The `@import` statement in `src/index.css` blocks rendering:
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
```
This must complete before the page can render.

### 2. No Code Splitting on Landing Page
The entire app bundle loads on the landing page, including:
- All 15+ page components
- Heavy libraries (recharts, date-fns)
- All dashboard/workspace components
- Behavior tracking system

### 3. Synchronous Supabase Initialization
The `TrackingProvider` makes an API call immediately on page load, blocking First Contentful Paint.

### 4. No Lazy Loading for Below-the-Fold Content
The landing page loads all sections immediately, including:
- `AISemanticSection` (FAQ accordion - heavy)
- `InteractivePreview` (complex interactive demo)
- `DataProviderLogos`
- Full `Footer` with contact form

### 5. Tailwind CDN Warning
Console shows Tailwind CDN usage, which should not be in production.

---

## Implementation Plan

### Phase 1: Critical Rendering Path Fixes

#### 1.1 Optimize Font Loading
Move Google Fonts from CSS `@import` to HTML `<link>` with `display=swap` and `preconnect`:

**File: `index.html`**
```html
<!-- Add to <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" media="print" onload="this.media='all'">
```

**File: `src/index.css`**
Remove the `@import` statement.

**Est. savings: 200-400ms FCP**

#### 1.2 Defer Behavior Tracking Initialization
Move the Supabase tracking session initialization to after the page has rendered:

**File: `src/hooks/useBehaviorTracking.tsx`**
- Use `requestIdleCallback` or `setTimeout` to defer session creation
- Avoid blocking the main thread during initial render

```text
Change: initSession() called in useEffect
To: Delay initialization by 2-3 seconds after page load
```

**Est. savings: 90-150ms document latency**

### Phase 2: Route-Level Code Splitting

#### 2.1 Implement Lazy Loading for All Routes
Currently only `Results.tsx` uses lazy loading. Apply to all routes:

**File: `src/App.tsx`**
```tsx
// Replace direct imports with lazy imports
const Landing = lazy(() => import('./pages/Landing'));
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Workspace = lazy(() => import('./pages/Workspace'));
// ... etc for all page components

// Wrap routes in Suspense with a minimal fallback
<Suspense fallback={<PageSkeleton />}>
  <Routes>...</Routes>
</Suspense>
```

**Est. savings: 200-300 KiB initial bundle, 6+ sec FCP improvement on mobile**

### Phase 3: Landing Page Optimization

#### 3.1 Lazy Load Below-the-Fold Sections
Split the landing page into above-the-fold (critical) and below-the-fold (deferred):

**File: `src/pages/Landing.tsx`**
```tsx
// Lazy load non-critical sections
const AISemanticSection = lazy(() => import('@/components/landing/AISemanticSection'));
const InteractivePreview = lazy(() => import('@/components/landing/InteractivePreview'));

// Use Intersection Observer to load when near viewport
```

**Critical (keep synchronous):**
- Hero section
- Trust badges
- Metrics bar

**Deferred (lazy load):**
- Interactive demo
- Features grid
- Use cases
- FAQ section
- Comparison table

#### 3.2 Reduce Footer Complexity
The footer includes a contact form with validation that loads on every page:

- Consider lazy-loading the contact form
- Or simplify to a link to a dedicated contact page

### Phase 4: Bundle Optimization

#### 4.1 Tree-Shake Lucide Icons
Currently importing individual icons, which is good. Verify no star imports:
```tsx
// Good: import { Shield, ArrowRight } from 'lucide-react'
// Bad: import * as Icons from 'lucide-react'
```

#### 4.2 Lazy Load Recharts
Recharts (~150 KiB) is imported but only used on specific pages. Ensure it is not in the landing page bundle:

**File: `src/components/ReturnDistributionChart.tsx`**
Already only used in Results page - verify no landing page imports.

#### 4.3 Configure Vite Manual Chunks
Optimize bundle splitting in Vite config:

**File: `vite.config.ts`**
```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-supabase': ['@supabase/supabase-js'],
        'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', ...],
        'vendor-charts': ['recharts'],
      }
    }
  }
}
```

### Phase 5: Caching and Performance Headers

#### 5.1 Configure Cache Headers
This requires configuration in the deployment platform (Lovable/Netlify), but we can add hints:

**File: `public/_headers` (if supported)**
```
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

### Phase 6: Fix Forced Reflow

The forced reflow is likely caused by:
- The behavior tracking `handleMouseMove` and `handleScroll` accessing layout properties
- The `InteractivePreview` slider component

**File: `src/hooks/useBehaviorTracking.tsx`**
- Batch layout reads
- Use `requestAnimationFrame` for scroll/mouse handlers

---

## Technical Implementation Details

### Files to Modify

| File | Change | Impact |
|------|--------|--------|
| `index.html` | Add font preconnect and async loading | High - fixes render blocking |
| `src/index.css` | Remove `@import` for fonts | High - fixes render blocking |
| `src/App.tsx` | Add lazy loading for all routes | High - reduces initial bundle |
| `src/pages/Landing.tsx` | Lazy load below-fold sections | Medium - faster LCP |
| `src/hooks/useBehaviorTracking.tsx` | Defer session init | Medium - faster document response |
| `vite.config.ts` | Add manual chunk splitting | Medium - better caching |

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/PageSkeleton.tsx` | Suspense fallback component |

---

## Expected Results

| Metric | Current (Mobile) | Target |
|--------|------------------|--------|
| Performance Score | 60% | 85%+ |
| First Contentful Paint | 6.6s | < 2s |
| Largest Contentful Paint | 7.0s | < 2.5s |
| Speed Index | 6.6s | < 3s |
| Total Blocking Time | High | Low |

| Metric | Current (Desktop) | Target |
|--------|-------------------|--------|
| Performance Score | 89% | 95%+ |
| Render-blocking resources | 280ms | < 50ms |

---

## Implementation Order

1. **Font loading optimization** - Quick win, major impact
2. **Route-level code splitting** - Biggest bundle reduction
3. **Defer behavior tracking** - Reduces document latency
4. **Landing page section lazy loading** - Improves LCP
5. **Vite chunk optimization** - Better long-term caching

