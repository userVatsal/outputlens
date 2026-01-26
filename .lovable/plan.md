

# Fix Website Issues - Comprehensive Remediation Plan

## Overview

This plan addresses all identified issues affecting security warnings, conversion rates, and UX consistency across OutputLens.

---

## Issue 1: CORS Configuration (Critical - Blocks Payments)

### Problem
Edge functions `create-checkout` and `customer-portal` have hardcoded CORS origin `https://outputlens.com`, blocking requests from preview/lovable.app domains.

### Files to Modify
- `supabase/functions/create-checkout/index.ts`
- `supabase/functions/customer-portal/index.ts`

### Solution
Update CORS headers to dynamically allow the request origin:

```typescript
// Before
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://outputlens.com",
  ...
};

// After
const getAllowedOrigin = (requestOrigin: string | null): string => {
  const allowedOrigins = [
    "https://outputlens.com",
    "https://outputlens.lovable.app",
    "http://localhost:5173",
    "http://localhost:8080"
  ];
  // Also allow preview domains
  if (requestOrigin?.includes('.lovable.app')) {
    return requestOrigin;
  }
  return allowedOrigins.includes(requestOrigin || '') 
    ? requestOrigin! 
    : allowedOrigins[0];
};

// In handler:
const origin = req.headers.get("origin");
const corsHeaders = {
  "Access-Control-Allow-Origin": getAllowedOrigin(origin),
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

---

## Issue 2: Inconsistent Free Tier Messaging

### Problem
Demo page says "10 free analyses/month" but Pricing page says "5 free analyses/month".

### File to Modify
- `src/pages/Demo.tsx`

### Solution
Update Demo page messaging to match Pricing (5 analyses):

```typescript
// Find line with "10 free analyses" and change to:
"5 free analyses"
```

---

## Issue 3: History Page Back Button

### Problem
Back button navigates to legacy `/analyze` route instead of `/workspace` or `/dashboard`.

### File to Modify
- `src/pages/History.tsx`

### Solution
Update navigation target:

```typescript
// Before
navigate('/analyze')

// After
navigate('/workspace')
```

---

## Issue 4: Mobile Navigation Missing Links

### Problem
Mobile menu lacks "Dashboard" and "Tracked Assets" links that exist on desktop.

### File to Modify
- `src/components/layout/Header.tsx`

### Solution
Add missing links to mobile navigation section matching desktop nav structure.

---

## Issue 5: Add "Forgot Password" Flow

### Problem
No password reset option on Auth page increases support burden and user frustration.

### Files to Modify
- `src/pages/Auth.tsx`

### Solution
1. Add "Forgot Password" link below password input
2. Add password reset form state
3. Implement Supabase `resetPasswordForEmail` call
4. Show success message directing user to check email

```typescript
// Add state
const [isResetMode, setIsResetMode] = useState(false);

// Add reset handler
const handlePasswordReset = async () => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth?reset=true`,
  });
  if (!error) {
    toast({ title: "Check your email", description: "Password reset link sent" });
  }
};

// Add UI link
<button onClick={() => setIsResetMode(true)}>
  Forgot password?
</button>
```

---

## Issue 6: Add Google OAuth (Conversion Boost)

### Problem
No social login option increases signup friction. Many users prefer one-click Google signin.

### Files to Modify
- `src/pages/Auth.tsx`

### Solution
Add Google OAuth button using Supabase's built-in provider:

```typescript
const handleGoogleSignIn = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
};

// Add UI button with Google icon
<Button variant="outline" onClick={handleGoogleSignIn}>
  <GoogleIcon /> Continue with Google
</Button>
```

**Note**: Requires Google OAuth to be configured in Lovable Cloud. Will add a check and prompt user to configure if not set up.

---

## Issue 7: SEO Domain Consistency

### Problem
Multiple domain references create confusion:
- `index.html` references `outputlens.com`
- App actually hosted on `outputlens.lovable.app`
- Some edge functions reference different domains

### Files to Review
- `index.html` (canonical URL, og:url)
- Edge function CORS headers (covered in Issue 1)

### Solution
Keep `outputlens.com` as the canonical/SEO domain (assuming custom domain is configured or planned), but ensure CORS allows all valid origins. No changes needed to SEO metadata if custom domain is set up.

---

## Files Summary

| File | Changes |
|------|---------|
| `supabase/functions/create-checkout/index.ts` | Dynamic CORS origin handling |
| `supabase/functions/customer-portal/index.ts` | Dynamic CORS origin handling |
| `src/pages/Demo.tsx` | Fix "10 free" → "5 free" messaging |
| `src/pages/History.tsx` | Fix back button `/analyze` → `/workspace` |
| `src/components/layout/Header.tsx` | Add Dashboard/Tracked Assets to mobile nav |
| `src/pages/Auth.tsx` | Add forgot password flow + Google OAuth button |

---

## Implementation Order

1. **CORS Fix** (Critical - currently blocking payments)
2. **Messaging Consistency** (Quick fix)
3. **Navigation Fixes** (History back button + mobile nav)
4. **Forgot Password Flow** (Medium complexity)
5. **Google OAuth** (Requires backend configuration check)

---

## Expected Outcomes

| Issue | Impact |
|-------|--------|
| CORS Fix | Payments work from all domains |
| Messaging Fix | Consistent trust signals |
| Navigation Fixes | Improved UX, no dead ends |
| Forgot Password | Reduced support burden, better retention |
| Google OAuth | 20-40% improvement in signup conversion |

---

## Note on "Website Not Safe" Warning

The SSL/security warning on library PCs is likely due to:
1. Corporate/library proxy blocking unknown subdomains
2. Missing custom domain SSL certificate

**Recommendation**: If `outputlens.com` is your production domain, ensure it's properly configured with SSL in Lovable Cloud settings. Library/corporate networks often block `.lovable.app` subdomains as they're development-focused.

