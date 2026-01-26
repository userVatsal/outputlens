
# Contact Form & Email Updates

## Overview

This plan implements three changes:
1. **Update Welcome Email** - Change from address to `contact@outputlens.com` and personalize the intro with "Hi, I am the founder Vatsal Pareshkumar, welcome to OutputLens"
2. **Update Alert Email** - Change from address to `contact@outputlens.com` for consistency
3. **Add Footer Contact Form** - A compact contact form in the footer that sends submissions to `outputlens@gmail.com`

---

## What We're Building

### Contact Form in Footer

A clean, embedded contact form with:
- **Name** (required)
- **Email** (required, validated)
- **Subject** dropdown (Support, Bug Report, Feature Request, General Inquiry)
- **Message** (required, max 1000 characters)
- **Send button** with loading state

When submitted → Email sent to `outputlens@gmail.com` with all details

---

## Technical Implementation

### 1. Update Welcome Email Function

**File**: `supabase/functions/send-welcome-email/index.ts`

**Changes**:
- From: `Vatsal <vatsal@outputlens.com>` → `Vatsal Pareshkumar <contact@outputlens.com>`
- Reply-to: `contact@outputlens.com`
- Email intro updated to: "Hi, I am the founder Vatsal Pareshkumar. Welcome to OutputLens!"

### 2. Update Alert Email Function

**File**: `supabase/functions/send-alert-email/index.ts`

**Changes**:
- From: `Vatsal @ OutputLens <alerts@outputlens.com>` → `Vatsal Pareshkumar <contact@outputlens.com>`
- Reply-to: `contact@outputlens.com`

### 3. Create Contact Form Edge Function

**New File**: `supabase/functions/send-contact-email/index.ts`

Receives form data and sends email to `outputlens@gmail.com`:

```text
Subject: [OutputLens Contact] {Subject Type} from {Name}

---

New contact form submission:

From: {Name} ({Email})
Subject: {Subject Type}

Message:
{User's message}

---
Sent via OutputLens Contact Form
```

### 4. Update Footer Component

**File**: `src/components/layout/Footer.tsx`

Add a new "Contact Us" column with:
- Compact form with proper input validation (using zod)
- Subject dropdown with 4 options
- Textarea for message
- Submit button with loading/success states
- Toast notifications for success/error

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/send-welcome-email/index.ts` | Modify | Update from address and intro text |
| `supabase/functions/send-alert-email/index.ts` | Modify | Update from address |
| `supabase/functions/send-contact-email/index.ts` | Create | New function to send contact form emails |
| `supabase/config.toml` | Modify | Add config for new contact email function |
| `src/components/layout/Footer.tsx` | Modify | Add contact form section |

---

## Contact Form Validation

Using zod for secure input validation:
- **Name**: 2-100 characters, trimmed
- **Email**: Valid email format, max 255 characters
- **Subject**: One of predefined options
- **Message**: 10-1000 characters, trimmed

All inputs sanitized before sending to prevent injection attacks.

---

## Updated Footer Layout

```text
┌─────────────────────────────────────────────────────────────────┐
│  Brand     │  Product    │  Legal      │  Contact Us           │
│  ────────  │  ────────   │  ────────   │  ─────────────────    │
│  Logo      │  Workspace  │  Privacy    │  Name: [_________]    │
│  Tagline   │  Method     │  Terms      │  Email: [________]    │
│            │  Pricing    │             │  Subject: [dropdown]  │
│            │  About      │             │  Message: [_______]   │
│            │             │             │        [____Send____] │
└─────────────────────────────────────────────────────────────────┘
│  Disclaimer section spanning full width                         │
└─────────────────────────────────────────────────────────────────┘
│  © 2026 OutputLens                 Risk analysis disclaimer     │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Experience Flow

1. User scrolls to footer
2. Fills out contact form fields
3. Clicks "Send Message"
4. Button shows loading spinner
5. On success: Toast notification "Message sent! We'll get back to you soon."
6. On error: Toast notification with error message
7. Form resets on success

---

## Email Deliverability Note

**Important**: For emails to `outputlens@gmail.com` to work reliably:
- The sending domain (`outputlens.com`) must be verified in Resend
- The from address `contact@outputlens.com` must be on a verified domain

---

## Estimated Changes

- **2 Modified Edge Functions**: ~10 lines each
- **1 New Edge Function**: ~80 lines
- **1 Modified Component**: ~100 lines added
- **1 Config Update**: ~3 lines
