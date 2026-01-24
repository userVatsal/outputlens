-- ================================================
-- Phase 1: Enhanced User Profile Schema
-- ================================================

-- 1. Extend profiles table with personal info, consent, and future-proof fields
ALTER TABLE public.profiles
  -- Personal Information (Core)
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  
  -- Consent Tracking (GDPR Compliance)
  ADD COLUMN IF NOT EXISTS consent_gdpr BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_privacy_version INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS consent_terms_version INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS consent_accepted_at TIMESTAMPTZ,
  
  -- Future-Proof Fields
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en-US',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS social_handles JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS contact_preferences JSONB DEFAULT '{"email": true, "push": false}',
  
  -- Profile Management
  ADD COLUMN IF NOT EXISTS profile_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- 2. Create unique index for username (allows NULL values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique 
  ON public.profiles(username) 
  WHERE username IS NOT NULL;

-- 3. Create profile_audit_log table for compliance tracking
CREATE TABLE IF NOT EXISTS public.profile_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMPTZ DEFAULT now(),
  change_source TEXT DEFAULT 'user'
);

-- 4. Create index for efficient audit log queries
CREATE INDEX IF NOT EXISTS idx_profile_audit_log_user_id 
  ON public.profile_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_audit_log_changed_at 
  ON public.profile_audit_log(changed_at DESC);

-- 5. Enable RLS on profile_audit_log
ALTER TABLE public.profile_audit_log ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for profile_audit_log
CREATE POLICY "Users can view own audit logs" 
  ON public.profile_audit_log 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own audit logs" 
  ON public.profile_audit_log 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 7. Update handle_new_user function to accept user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    full_name,
    date_of_birth,
    consent_gdpr,
    consent_privacy_version,
    consent_terms_version,
    consent_accepted_at,
    onboarding_completed
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    CASE 
      WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'date_of_birth')::DATE 
      ELSE NULL 
    END,
    COALESCE((NEW.raw_user_meta_data->>'consent_gdpr')::BOOLEAN, false),
    COALESCE((NEW.raw_user_meta_data->>'privacy_version')::INTEGER, 0),
    COALESCE((NEW.raw_user_meta_data->>'terms_version')::INTEGER, 0),
    CASE 
      WHEN NEW.raw_user_meta_data->>'consent_gdpr' IS NOT NULL 
      THEN now() 
      ELSE NULL 
    END,
    COALESCE((NEW.raw_user_meta_data->>'onboarding_completed')::BOOLEAN, false)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    date_of_birth = COALESCE(EXCLUDED.date_of_birth, profiles.date_of_birth),
    consent_gdpr = COALESCE(EXCLUDED.consent_gdpr, profiles.consent_gdpr),
    consent_privacy_version = GREATEST(EXCLUDED.consent_privacy_version, profiles.consent_privacy_version),
    consent_terms_version = GREATEST(EXCLUDED.consent_terms_version, profiles.consent_terms_version),
    consent_accepted_at = COALESCE(EXCLUDED.consent_accepted_at, profiles.consent_accepted_at),
    onboarding_completed = COALESCE(EXCLUDED.onboarding_completed, profiles.onboarding_completed),
    updated_at = now();
  RETURN NEW;
END;
$$;

-- 8. Create function to update profile_updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_profile_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.profile_updated_at = now();
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 9. Create trigger for profile updates
DROP TRIGGER IF EXISTS trigger_update_profile_timestamp ON public.profiles;
CREATE TRIGGER trigger_update_profile_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_timestamp();