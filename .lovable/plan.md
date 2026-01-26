
# Personalized Email Experience - Welcome & Risk Alerts

## Overview

Implement a founder-personal email experience where:
1. **Welcome Email**: When users sign up, they receive a personalized email from "Vatsal" (the founder) welcoming them to OutputLens
2. **Risk Alert Emails**: When the `monitor-assets` function detects risk threshold breaches, users receive email notifications

---

## Current State Analysis

### What Exists
- **Profiles table** has `contact_preferences: { email: true, push: false }` - users can opt-in/out
- **Risk alerts** are created in `risk_alerts` table by `monitor-assets` Edge Function
- **AlertsPanel** displays alerts in the dashboard UI
- **No email integration** currently exists (no Resend API key configured)

### What's Needed
- Resend API key for email sending
- Edge function for sending welcome emails (triggered after signup)
- Modify `monitor-assets` function to also send email alerts
- Email preference toggle in Account settings (already exists in schema!)

---

## Implementation Plan

### Phase 1: Setup Resend Integration

**Prerequisite**: You'll need to:
1. Sign up at https://resend.com (free tier: 100 emails/day)
2. Verify your domain at https://resend.com/domains (required for deliverability)
3. Create an API key at https://resend.com/api-keys
4. Add the `RESEND_API_KEY` secret to your backend

### Phase 2: Create Welcome Email Edge Function

Create `supabase/functions/send-welcome-email/index.ts`:

**Trigger**: Called from the frontend after successful signup, or via database webhook

**Email Content** (from Vatsal):
```text
Subject: Welcome to OutputLens - Let's make smarter trades together

From: Vatsal <vatsal@yourdomain.com>

---

Hey [Name or "there"],

I'm Vatsal, the founder of OutputLens.

I built this because I was tired of entering trades blind — not knowing 
if my gut feel aligned with real market conditions. Now you have a tool 
that shows you probabilities before you commit capital.

Here's what you can do right now:
→ Run your first analysis: Head to the Workspace and enter any trade idea
→ Track an asset: Save it to your dashboard and get alerts when risk changes
→ Build a portfolio: Add multiple positions and see aggregate risk

If you ever have questions or feedback, just reply to this email. 
I read every one.

Let's make better trades together.

— Vatsal
Founder, OutputLens

P.S. Your first 3 analyses are on me. No credit card needed.
```

### Phase 3: Modify Monitor-Assets for Email Alerts

Update `supabase/functions/monitor-assets/index.ts` to:

1. After creating a `risk_alert` record, check user's `contact_preferences.email`
2. If enabled, fetch user's email from `auth.users` (via service role)
3. Call a new `send-alert-email` function with alert details

**Email Content** (from Vatsal):
```text
Subject: ⚠️ Risk Alert: [SYMBOL] - Your position risk has changed

From: Vatsal @ OutputLens <alerts@yourdomain.com>

---

Hey [Name],

I wanted to give you a heads up — the risk profile for your 
[SYMBOL] position just changed significantly.

📊 What happened:
• Previous Risk Score: [X.X]
• Current Risk Score: [Y.Y]  
• Change: [+/-Z.Z] points

🎯 What this means:
[Dynamic interpretation based on alert type]

→ View Full Analysis: [Link to /tracked-assets]

You're getting this because you enabled email alerts for tracked assets.
Manage your preferences: [Link to /account]

Stay sharp,
Vatsal

---
OutputLens - Know your risk before you trade
```

### Phase 4: Trigger Welcome Email on Signup

**Option A: Call from Frontend** (simpler)
After successful signup in `Auth.tsx`, call the welcome email function:
```typescript
// After successful signup
await supabase.functions.invoke('send-welcome-email', {
  body: { email: email }
});
```

**Option B: Database Webhook** (more robust)
Create a database trigger that fires on profile creation and calls the edge function.

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/send-welcome-email/index.ts` | Create | Personalized founder welcome email |
| `supabase/functions/send-alert-email/index.ts` | Create | Risk alert notification email |
| `supabase/functions/monitor-assets/index.ts` | Modify | Add email alert integration |
| `src/pages/Auth.tsx` | Modify | Trigger welcome email after signup |
| `supabase/config.toml` | Modify | Add new function configs |

---

## Email Design Guidelines

**From Name**: "Vatsal" or "Vatsal @ OutputLens" — personal, not corporate
**Reply-To**: A real email you monitor (builds trust)
**Tone**: Conversational, helpful, founder-direct
**CTAs**: One primary action per email
**Footer**: Unsubscribe link + email preference link

---

## Database Additions (Optional Enhancement)

Consider adding to `profiles` table:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  email_preferences jsonb DEFAULT '{
    "welcome": true,
    "risk_alerts": true,
    "weekly_digest": false,
    "product_updates": true
  }'::jsonb;
```

This gives granular control over email types.

---

## Technical Architecture

```text
┌─────────────────┐         ┌──────────────────────┐
│  User Signup    │────────▶│ send-welcome-email   │
│  (Auth.tsx)     │         │   Edge Function      │
└─────────────────┘         └──────────────────────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │    Resend     │
                              │     API       │
                              └───────────────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │  User Inbox   │
                              └───────────────┘

┌─────────────────┐         ┌──────────────────────┐
│ monitor-assets  │────────▶│  send-alert-email    │
│ (CRON job)      │         │   Edge Function      │
└─────────────────┘         └──────────────────────┘
        │                             │
        ▼                             ▼
┌───────────────┐             ┌───────────────┐
│ risk_alerts   │             │    Resend     │
│   table       │             │     API       │
└───────────────┘             └───────────────┘
```

---

## User Experience Flow

### Signup → Welcome Email
1. User signs up with email/password
2. Account created, redirected to dashboard
3. Within 30 seconds, welcome email arrives
4. Email feels personal (from Vatsal, founder)
5. Clear CTA to run first analysis

### Risk Alert → Email Notification
1. User tracks an asset with alerts enabled
2. `monitor-assets` runs on schedule (daily/weekly)
3. Risk threshold breached → alert created in DB
4. If `contact_preferences.email = true`:
   - Fetch user email from auth
   - Send personalized alert email
5. Email includes direct link to view analysis

---

## Required Secrets

| Secret | Purpose |
|--------|---------|
| `RESEND_API_KEY` | Email sending API authentication |

---

## Estimated Effort

- **2 New Edge Functions**: ~100 lines each
- **1 Modified Edge Function**: ~30 lines added
- **1 Modified Frontend File**: ~10 lines added
- **1 Config Update**: ~6 lines

---

## Next Step

Before I can implement this, you'll need to set up Resend:

1. Go to https://resend.com and create a free account
2. Verify your domain (e.g., `outputlens.com`) at https://resend.com/domains
3. Create an API key at https://resend.com/api-keys
4. Let me know when ready, and I'll prompt you to add the `RESEND_API_KEY` secret
