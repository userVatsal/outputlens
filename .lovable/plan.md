
# OutputLens Security Audit Report

## 1. Security Audit Summary

| Metric | Assessment |
|--------|------------|
| **Overall Security Posture** | **6.5/10** |
| **Biggest Systemic Risk** | Unauthenticated sendBeacon writes to database bypass RLS |
| **Immediate Red Flags** | 3 Critical, 4 High severity issues identified |

The application has a solid security foundation with proper RLS policies, role separation via `has_role()` SECURITY DEFINER function, SentinelAI threat detection, and hCaptcha integration. However, several gaps require immediate attention before enterprise/investor readiness.

---

## 2. Detailed Findings

### CRITICAL ISSUES (Must Fix Immediately)

---

**Issue 1: Unauthenticated sendBeacon Bypasses RLS**

| Field | Details |
|-------|---------|
| **Severity** | CRITICAL |
| **Area** | Frontend / Database |
| **Attack Scenario** | The `sendBeacon` call in `useBehaviorTracking.tsx` line 286-289 writes directly to `behavior_sessions` REST endpoint without authentication headers. Since sendBeacon cannot set custom headers, this bypasses normal Supabase auth. Attackers can forge session data, pollute analytics, or perform resource exhaustion attacks. |
| **Exact Fix** | Replace sendBeacon with an edge function that validates the session before accepting updates. Create a `close-session` edge function that validates the session_id belongs to the visitor_id before accepting updates. |

---

**Issue 2: send-welcome-email and send-alert-email Have No Authentication**

| Field | Details |
|-------|---------|
| **Severity** | CRITICAL |
| **Area** | Edge Functions |
| **Attack Scenario** | Both email functions accept any request with just an email address. Attackers can enumerate email addresses, spam arbitrary users, or deplete email quotas. The welcome email includes the founder's personal branding which could be abused for phishing. |
| **Exact Fix** | Add authentication checks: `send-welcome-email` should only be callable from the authenticated signup flow (validate via service_role that a user was just created). `send-alert-email` should validate that the userId matches the authenticated user and that they have email alerts enabled. |

---

**Issue 3: Leaked Password Protection Disabled**

| Field | Details |
|-------|---------|
| **Severity** | CRITICAL |
| **Area** | Authentication |
| **Attack Scenario** | Users can register with passwords that appear in public breach databases (e.g., "password123"). Credential stuffing becomes trivial. |
| **Exact Fix** | Enable in Supabase Dashboard: Authentication > Password Security > Enable "Block Passwords from Public Breaches (HaveIBeenPwned)". This is a configuration-only fix. |

---

### HIGH SEVERITY ISSUES

---

**Issue 4: CORS Wildcard on Sensitive Edge Functions**

| Field | Details |
|-------|---------|
| **Severity** | HIGH |
| **Area** | Edge Functions |
| **Attack Scenario** | All 19 edge functions use `Access-Control-Allow-Origin: *`. While auth is enforced server-side, a malicious website could make authenticated requests on behalf of logged-in users for `create-checkout`, `customer-portal`, `update-profile`, and `analyze-trade`. |
| **Exact Fix** | Restrict CORS origins for sensitive endpoints to: `["https://outputlens.com", "https://outputlens.lovable.app", "https://*.lovable.app"]`. Keep wildcard only for truly public endpoints like `fetch-market-data` and `search-symbols`. |

---

**Issue 5: Password Minimum Length Only 6 Characters**

| Field | Details |
|-------|---------|
| **Severity** | HIGH |
| **Area** | Authentication |
| **Attack Scenario** | 6-character passwords can be brute-forced with modern hardware. The Zod schema in Auth.tsx line 18 only requires `min(6)`. |
| **Exact Fix** | Update validation schemas to require at least 8 characters with complexity: `z.string().min(8, 'Password must be at least 8 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number')` |

---

**Issue 6: analyze-trade Uses Client-Provided Tier Without Validation**

| Field | Details |
|-------|---------|
| **Severity** | HIGH |
| **Area** | Edge Function |
| **Attack Scenario** | Line 44 accepts `tier` from request body. A user could send `tier: 'trader'` to access premium AI models (gemini-2.5-pro) without paying. While usage checks exist, they're optional and the tier affects model selection before the check. |
| **Exact Fix** | Always fetch the user's tier server-side from the `profiles` table using the authenticated user's ID. Never trust client-provided tier values. Move model selection after the database lookup. |

---

**Issue 7: Missing CSP Headers**

| Field | Details |
|-------|---------|
| **Severity** | HIGH |
| **Area** | Infrastructure |
| **Attack Scenario** | The `_headers` file only configures cache headers, no security headers. Missing CSP, X-Frame-Options, X-Content-Type-Options enables XSS injection and clickjacking. |
| **Exact Fix** | Add to `public/_headers`: `/*`, followed by `Content-Security-Policy: default-src 'self'; script-src 'self' https://js.hcaptcha.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://js.hcaptcha.com https://ai.gateway.lovable.dev; frame-src https://newassets.hcaptcha.com`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` |

---

### MEDIUM SEVERITY ISSUES

---

**Issue 8: Password Reset Success Message Allows User Enumeration**

| Field | Details |
|-------|---------|
| **Severity** | MEDIUM |
| **Area** | Authentication |
| **Attack Scenario** | Line 408 shows different behavior based on whether email exists (success alert) vs error. Attackers can enumerate valid accounts. |
| **Exact Fix** | Always show the same message: "If an account exists with this email, you'll receive a password reset link." Remove the alert() call and use a consistent toast message regardless of outcome. |

---

**Issue 9: Profile Stripe IDs Visible in Client Response**

| Field | Details |
|-------|---------|
| **Severity** | MEDIUM |
| **Area** | Data Exposure |
| **Attack Scenario** | The profiles table includes `stripe_customer_id` and `stripe_subscription_id`. These are returned to the client via the profile query and could be used to correlate users across services. |
| **Exact Fix** | Create a database view or modify the RLS policy to exclude sensitive columns from SELECT: `CREATE VIEW public.profile_public AS SELECT user_id, full_name, display_name, username, avatar_url, subscription_tier, onboarding_completed FROM profiles;` Use this view for client-facing queries. |

---

**Issue 10: hCaptcha Fallback Allows Bypass in Development**

| Field | Details |
|-------|---------|
| **Severity** | MEDIUM |
| **Area** | Security |
| **Attack Scenario** | Line 327-333 in sentinel-ai allows requests through when `HCAPTCHA_SECRET_KEY` is not configured, returning `success: true, development: true`. If deployed without the secret, captcha is bypassed. |
| **Exact Fix** | Add deployment check: If `HCAPTCHA_SECRET_KEY` is missing, return an error response instead of auto-allowing. Log an alert so admins know the secret is missing. |

---

**Issue 11: Exit Survey and Behavior Tracking Has No Rate Limiting**

| Field | Details |
|-------|---------|
| **Severity** | MEDIUM |
| **Area** | Database |
| **Attack Scenario** | Attackers can submit thousands of exit surveys or behavior events, polluting analytics data and potentially exhausting database resources. |
| **Exact Fix** | Add rate limiting via the SentinelAI endpoint before accepting behavior tracking events. Implement a per-IP limit of 100 events per minute for anonymous tracking. |

---

### LOW SEVERITY / HYGIENE ISSUES

---

**Issue 12: LocalStorage Used for Non-Sensitive Preferences**

| Field | Details |
|-------|---------|
| **Severity** | LOW |
| **Area** | Frontend |
| **Assessment** | Current usage is appropriate: visitor IDs, language preferences, and onboarding dismissal. No sensitive data stored. No fix needed but continue auditing new localStorage usage. |

---

**Issue 13: dangerouslySetInnerHTML in Chart Component**

| Field | Details |
|-------|---------|
| **Severity** | LOW |
| **Area** | Frontend |
| **Assessment** | Used in chart.tsx for CSS theme injection with hardcoded theme values from THEMES constant. No user input flows into this. Acceptable but should be monitored. |

---

**Issue 14: Usage Alert (Alert) Instead of Toast**

| Field | Details |
|-------|---------|
| **Severity** | LOW |
| **Area** | UX Security |
| **Attack Scenario** | Line 408 uses `alert()` which can be suppressed by attackers via browser extensions. |
| **Exact Fix** | Replace with `toast.success('Password reset link sent. Check your email.')` for consistent UX. |

---

## 3. Authentication & User Security Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Password hashing | PASS | Supabase handles bcrypt hashing |
| Password strength | FAIL | Only 6 char minimum, no complexity |
| Leaked password protection | FAIL | Disabled in dashboard |
| Session management | PASS | Supabase JWT with auto-refresh |
| Token expiry | PASS | Default 1hr with refresh |
| CSRF protection | PASS | SameSite cookies via Supabase |
| XSS protection | PARTIAL | No CSP headers configured |
| Account enumeration | FAIL | Password reset reveals existence |
| Email verification | PASS | Not auto-confirmed |
| Password reset security | PASS | Secure token-based flow |
| OAuth integration | PASS | Google OAuth properly configured |
| Admin role validation | PASS | Using has_role() SECURITY DEFINER |

---

## 4. API & Backend Security

| Check | Status | Notes |
|-------|--------|-------|
| Auth on endpoints | PARTIAL | Some edge functions lack auth checks |
| Input validation | PASS | Zod schemas, edge function validation |
| Role-based access | PASS | RLS + has_role() function |
| Rate limiting | PARTIAL | SentinelAI exists but not on all endpoints |
| Error message leakage | PASS | Generic errors in production |
| Logging | PASS | Structured logging with security events |
| Webhook signature verification | PASS | Stripe webhook verifies signature |

---

## 5. Frontend & Client-Side Risks

| Check | Status | Notes |
|-------|--------|-------|
| Exposed secrets | PASS | Only public VITE_ variables exposed |
| Insecure localStorage | PASS | No sensitive data stored |
| Analytics leakage | LOW RISK | Behavior tracking is anonymized |
| Third-party scripts | PASS | Only hCaptcha loaded externally |
| CSP headers | FAIL | Not configured |

---

## 6. Data & Privacy (GDPR-Ready)

| Check | Status | Notes |
|-------|--------|-------|
| Minimal data collection | PASS | Only necessary fields collected |
| Lawful basis | PASS | Explicit consent at signup |
| Data retention policy | PASS | IP anonymization after 7 days, deletion after 30 |
| User data deletion | PARTIAL | No self-service deletion visible |
| Privacy policy alignment | PASS | Terms and privacy pages exist |
| Consent versioning | PASS | consent_privacy_version tracked |
| GDPR consent checkbox | PASS | Required at signup |

---

## 7. Infrastructure & Environment

| Check | Status | Notes |
|-------|--------|-------|
| Environment variables | PASS | Properly prefixed with VITE_ |
| Secrets management | PASS | Edge function secrets configured |
| HTTPS/TLS | PASS | Enforced by Supabase/Lovable |
| Deployment config | PASS | No sensitive data in config |
| Logging sensitive data | PASS | No PII in console logs |

---

## 8. Final "Google / Enterprise Readiness" Verdict

### Would this pass a basic Google business/security review?

**NO** - Not in current state due to:
- Unauthenticated email sending endpoints (spam risk)
- Unauthenticated sendBeacon database writes
- Leaked password protection disabled
- Missing security headers (CSP)

### What must be fixed before onboarding serious users?

**IMMEDIATE (Week 1):**
1. Enable leaked password protection in Supabase Dashboard
2. Add authentication to email edge functions
3. Fix sendBeacon to use authenticated edge function
4. Add CSP and security headers
5. Restrict CORS on sensitive endpoints

**HIGH PRIORITY (Week 2):**
1. Increase password minimum to 8 characters with complexity
2. Validate tier server-side in analyze-trade
3. Fix password reset enumeration
4. Require hCaptcha secret in production

### What can wait?

- Exit survey rate limiting (medium risk)
- Stripe ID exposure in profiles (medium risk)
- Alert-to-toast migration (low impact)
- Additional audit logging

---

## Priority Implementation Order

| Priority | Issue | Time Estimate |
|----------|-------|---------------|
| 1 | Enable leaked password protection | 5 minutes |
| 2 | Add CSP headers to _headers file | 15 minutes |
| 3 | Auth on email functions | 1 hour |
| 4 | Fix sendBeacon → edge function | 1 hour |
| 5 | Restrict CORS on sensitive endpoints | 30 minutes |
| 6 | Server-side tier validation | 30 minutes |
| 7 | Fix password reset enumeration | 15 minutes |
| 8 | Increase password requirements | 15 minutes |
| 9 | hCaptcha production enforcement | 15 minutes |
| 10 | Profile view for sensitive columns | 30 minutes |

**Total estimated time: ~5-6 hours** to achieve enterprise readiness.
