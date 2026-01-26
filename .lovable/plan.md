

# Multi-Step Signup & Onboarding Flow

## Overview

This plan transforms the current single-step signup into a modern, multi-step onboarding experience that collects user information progressively and sets the foundation for future community features.

---

## What We're Building

### Signup Flow (5 Steps)

```text
Step 1: Credentials           Step 2: Profile           Step 3: Legal
┌─────────────────────┐      ┌─────────────────────┐   ┌─────────────────────┐
│  Email & Password   │  →   │  Full Name          │ → │  ☑ GDPR Consent     │
│                     │      │  @handle (unique)   │   │  ☑ Terms of Service │
│  [Continue]         │      │  Date of Birth      │   │  ☑ Privacy Policy   │
└─────────────────────┘      └─────────────────────┘   └─────────────────────┘
          ↓                            ↓                         ↓
Step 4: Welcome               Step 5: Profile Completion
┌─────────────────────┐      ┌─────────────────────┐
│  🎉 Welcome!        │  →   │  [Upload Avatar]    │
│  Founder message    │      │  Bio (optional)     │
│  (auto-advance 2s)  │      │  [Complete Profile] │
└─────────────────────┘      └─────────────────────┘
```

### Key Features
- **Progressive disclosure**: Collect info in digestible chunks
- **Unique handles**: Real-time validation that `@handle` is available
- **Avatar upload**: Users can upload profile pictures (stored in Lovable Cloud Storage)
- **Bio field**: Prepare for future community/firm features
- **Welcome animation**: Warm, personal introduction for 2 seconds

---

## Database Changes

### 1. Add Bio Column to Profiles

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
```

### 2. Create Avatar Storage Bucket

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- RLS: Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Public can view avatars
CREATE POLICY "Avatars are publicly viewable"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');
```

### 3. Add Username Uniqueness Index

```sql
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique 
ON profiles (LOWER(username)) WHERE username IS NOT NULL;
```

---

## File Changes

### New Files

| File | Description |
|------|-------------|
| `src/components/onboarding/OnboardingWizard.tsx` | Multi-step wizard container with step navigation |
| `src/components/onboarding/StepCredentials.tsx` | Email/password form (Step 1) |
| `src/components/onboarding/StepProfile.tsx` | Name, handle, DOB form (Step 2) |
| `src/components/onboarding/StepLegal.tsx` | GDPR/Terms/Privacy checkboxes (Step 3) |
| `src/components/onboarding/StepWelcome.tsx` | Animated welcome screen (Step 4) |
| `src/components/onboarding/StepComplete.tsx` | Avatar upload & bio (Step 5) |
| `src/components/onboarding/AvatarUpload.tsx` | Drag-and-drop avatar upload component |
| `src/pages/Onboarding.tsx` | New page that shows the wizard after signup |

### Modified Files

| File | Changes |
|------|---------|
| `src/pages/Auth.tsx` | After signup success, redirect to `/onboarding` instead of `/dashboard` |
| `src/pages/Dashboard.tsx` | Check if `onboarding_completed` is false, redirect to `/onboarding` |
| `src/hooks/useProfile.tsx` | Add `bio` field to `ProfileData` and `ProfileUpdateData` interfaces |
| `src/App.tsx` | Add `/onboarding` route |
| `src/components/account/ProfileSection.tsx` | Add bio editing capability |

---

## Component Architecture

### OnboardingWizard

```text
OnboardingWizard (container)
├── Step indicator (1 of 5, progress bar)
├── Current step component
│   ├── StepCredentials (creates account via Supabase Auth)
│   ├── StepProfile (updates profile table)
│   ├── StepLegal (updates consent fields)
│   ├── StepWelcome (2 second delay, auto-advance)
│   └── StepComplete (avatar upload, bio, marks onboarding_completed)
└── Navigation (Back/Continue buttons)
```

### Step Flow Logic

1. **StepCredentials**: User enters email/password → Supabase `signUp()` → Creates auth user + profile row
2. **StepProfile**: User enters name, @handle, DOB → Validates handle uniqueness → Updates profile
3. **StepLegal**: User checks all consent boxes → Updates consent fields with current versions
4. **StepWelcome**: Shows personalized welcome → Auto-advances after 2 seconds
5. **StepComplete**: User optionally uploads avatar and adds bio → Sets `onboarding_completed = true` → Redirects to `/dashboard`

---

## Handle Validation

Real-time username validation with debouncing:

```text
User types: "john"
├── Debounce 500ms
├── Check format (3-30 chars, alphanumeric + underscore only)
├── Query: SELECT 1 FROM profiles WHERE LOWER(username) = 'john'
├── If exists → Show "This handle is taken"
└── If available → Show green checkmark
```

---

## Avatar Upload Flow

```text
User clicks upload area
├── Opens file picker (accepts: image/png, image/jpeg, image/webp)
├── Client-side validation (max 5MB, image type)
├── Preview shown immediately
├── On confirm → Upload to storage.avatars/{user_id}/avatar.{ext}
├── Get public URL
└── Update profiles.avatar_url
```

---

## Welcome Screen Content

The welcome step displays a warm, personal message:

```text
┌─────────────────────────────────────────────┐
│           🎉 Welcome, {firstName}!          │
│                                             │
│  "I'm Vatsal, founder of OutputLens.        │
│   I built this for traders who want to      │
│   understand risk before they enter."       │
│                                             │
│  ──────────────────────────────             │
│  What's next:                               │
│  • Run your first analysis in seconds       │
│  • Track assets you're watching             │
│  • Get alerts when conditions change        │
│                                             │
│         [Continue to Dashboard →]           │
└─────────────────────────────────────────────┘
```

Auto-advances after 2 seconds, or user can click to continue immediately.

---

## Validation Rules

### Handle Validation
- 3-30 characters
- Lowercase letters, numbers, underscores only
- Must be unique (case-insensitive)
- Starts with letter

### Date of Birth Validation
- User must be 18+ years old
- Cannot be in the future

### Avatar Validation
- Max file size: 5MB
- Accepted formats: PNG, JPEG, WebP
- Recommended size: 200x200px (auto-cropped/resized on display)

### Bio Validation
- Max 500 characters
- Optional field

---

## Route Protection

Dashboard will check onboarding status:

```text
User lands on /dashboard
├── Check if authenticated → No → Redirect to /auth
├── Check if onboarding_completed → No → Redirect to /onboarding
└── Yes → Show dashboard
```

---

## Future Community Context

The bio and handle fields prepare for:
- **Firm community pages**: Companies can create private communities
- **Admin roles**: Firm owners can manage members
- **Chat features**: Members can communicate within their firm
- **Public profiles**: Optional profile visibility to other users

---

## Files Summary

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/pages/Onboarding.tsx` | New onboarding page |
| Create | `src/components/onboarding/OnboardingWizard.tsx` | Step wizard container |
| Create | `src/components/onboarding/StepCredentials.tsx` | Email/password step |
| Create | `src/components/onboarding/StepProfile.tsx` | Name/handle/DOB step |
| Create | `src/components/onboarding/StepLegal.tsx` | Consent checkboxes |
| Create | `src/components/onboarding/StepWelcome.tsx` | Welcome animation |
| Create | `src/components/onboarding/StepComplete.tsx` | Avatar/bio step |
| Create | `src/components/onboarding/AvatarUpload.tsx` | Avatar upload component |
| Modify | `src/App.tsx` | Add `/onboarding` route |
| Modify | `src/pages/Auth.tsx` | Redirect to onboarding after signup |
| Modify | `src/pages/Dashboard.tsx` | Check onboarding status |
| Modify | `src/hooks/useProfile.tsx` | Add bio field |
| Modify | `src/components/account/ProfileSection.tsx` | Add bio editing |
| DB | Migration | Add `bio` column, storage bucket, username index |

---

## User Experience Summary

1. User visits `/auth?mode=signup`
2. Enters email + password → Account created
3. Redirected to `/onboarding`
4. Fills in personal details (name, unique handle, birthday)
5. Accepts legal agreements
6. Sees personalized welcome (2 seconds)
7. Optionally uploads avatar and adds bio
8. Clicks "Complete" → `onboarding_completed = true`
9. Redirected to `/dashboard` with full experience

