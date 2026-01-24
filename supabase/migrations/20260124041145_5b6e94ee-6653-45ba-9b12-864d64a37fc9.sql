-- Extend profiles table for subscription management
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

-- Add unique constraint for Stripe customer lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_stripe_customer 
  ON profiles(stripe_customer_id) 
  WHERE stripe_customer_id IS NOT NULL;

-- Extend usage_tracking for granular usage limits
ALTER TABLE usage_tracking 
  ADD COLUMN IF NOT EXISTS portfolio_analysis_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS api_call_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS extra_credits INTEGER DEFAULT 0;