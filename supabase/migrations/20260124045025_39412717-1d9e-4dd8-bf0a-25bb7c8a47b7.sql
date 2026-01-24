-- SentinelAI Security Infrastructure
-- Phase 1: Core security tables for real-time threat detection and captcha management

-- 1. Security Events - Centralized security event logging
CREATE TABLE public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'failed_login', 'rate_limit', 'suspicious_pattern', 'captcha_failed', 'data_access', 'blocked'
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID, -- NULL for anonymous/pre-auth events
  ip_address TEXT,
  user_agent TEXT,
  endpoint TEXT,
  request_metadata JSONB DEFAULT '{}',
  threat_score NUMERIC DEFAULT 0 CHECK (threat_score >= 0 AND threat_score <= 100),
  action_taken TEXT CHECK (action_taken IN ('logged', 'challenged', 'blocked', 'alerted')),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for real-time queries
CREATE INDEX idx_security_events_type_time ON public.security_events(event_type, created_at DESC);
CREATE INDEX idx_security_events_ip ON public.security_events(ip_address, created_at DESC);
CREATE INDEX idx_security_events_user ON public.security_events(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_security_events_severity ON public.security_events(severity, created_at DESC) WHERE severity IN ('high', 'critical');
CREATE INDEX idx_security_events_unresolved ON public.security_events(created_at DESC) WHERE resolved = false;

-- Enable RLS
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access security events (admin only)
CREATE POLICY "Service role full access to security_events"
  ON public.security_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 2. IP Reputation - Track IP behavior for rate limiting and blocking
CREATE TABLE public.ip_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT UNIQUE NOT NULL,
  reputation_score NUMERIC DEFAULT 50 CHECK (reputation_score >= 0 AND reputation_score <= 100),
  total_requests INTEGER DEFAULT 0,
  failed_attempts INTEGER DEFAULT 0,
  successful_attempts INTEGER DEFAULT 0,
  captcha_challenges INTEGER DEFAULT 0,
  captcha_failures INTEGER DEFAULT 0,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  blocked_until TIMESTAMPTZ,
  permanent_block BOOLEAN DEFAULT false,
  block_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ip_reputation_score ON public.ip_reputation(reputation_score) WHERE reputation_score < 30;
CREATE INDEX idx_ip_reputation_blocked ON public.ip_reputation(blocked_until) WHERE blocked_until IS NOT NULL;
CREATE INDEX idx_ip_reputation_address ON public.ip_reputation(ip_address);

-- Enable RLS
ALTER TABLE public.ip_reputation ENABLE ROW LEVEL SECURITY;

-- Only service role can access IP reputation
CREATE POLICY "Service role full access to ip_reputation"
  ON public.ip_reputation
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 3. Captcha Challenges - Track captcha issuance and verification
CREATE TABLE public.captcha_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_token TEXT UNIQUE NOT NULL,
  ip_address TEXT NOT NULL,
  user_id UUID,
  challenge_type TEXT DEFAULT 'invisible' CHECK (challenge_type IN ('invisible', 'checkbox', 'puzzle')),
  action TEXT NOT NULL, -- 'login', 'signup', 'analyze', 'api_call'
  issued_at TIMESTAMPTZ DEFAULT now(),
  verified_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ DEFAULT (now() + interval '5 minutes'),
  success BOOLEAN,
  score NUMERIC CHECK (score IS NULL OR (score >= 0 AND score <= 1)),
  failure_reason TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_captcha_pending ON public.captcha_challenges(ip_address, issued_at DESC) WHERE verified_at IS NULL;
CREATE INDEX idx_captcha_token ON public.captcha_challenges(challenge_token);
CREATE INDEX idx_captcha_action ON public.captcha_challenges(action, issued_at DESC);

-- Enable RLS
ALTER TABLE public.captcha_challenges ENABLE ROW LEVEL SECURITY;

-- Only service role can access captcha challenges
CREATE POLICY "Service role full access to captcha_challenges"
  ON public.captcha_challenges
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 4. Security Thresholds - Configurable thresholds for SentinelAI (auto-tuned by CI AI)
CREATE TABLE public.security_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threshold_name TEXT UNIQUE NOT NULL,
  threshold_value NUMERIC NOT NULL,
  description TEXT,
  min_value NUMERIC,
  max_value NUMERIC,
  auto_tune_enabled BOOLEAN DEFAULT true,
  last_tuned_at TIMESTAMPTZ,
  tuned_by TEXT, -- 'manual' or 'ci_ai'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_thresholds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to security_thresholds"
  ON public.security_thresholds
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Insert default thresholds
INSERT INTO public.security_thresholds (threshold_name, threshold_value, description, min_value, max_value) VALUES
  ('failed_login_captcha_trigger', 3, 'Failed logins before captcha required', 1, 10),
  ('failed_login_block_trigger', 10, 'Failed logins before temporary block', 5, 20),
  ('block_duration_minutes', 15, 'Duration of temporary IP block in minutes', 5, 60),
  ('rate_limit_free_per_minute', 30, 'API calls per minute for free tier', 10, 100),
  ('rate_limit_paid_per_minute', 100, 'API calls per minute for paid tier', 50, 500),
  ('threat_score_captcha_threshold', 40, 'Threat score to trigger captcha', 20, 60),
  ('threat_score_block_threshold', 85, 'Threat score to block request', 70, 95),
  ('captcha_failure_block_count', 3, 'Captcha failures before block', 2, 10),
  ('ip_reputation_decay_hours', 24, 'Hours for reputation to recover', 6, 72);

-- Function to update IP reputation
CREATE OR REPLACE FUNCTION public.update_ip_reputation(
  p_ip_address TEXT,
  p_delta NUMERIC,
  p_event_type TEXT DEFAULT 'request'
)
RETURNS public.ip_reputation
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result public.ip_reputation;
BEGIN
  INSERT INTO public.ip_reputation (ip_address, reputation_score, total_requests)
  VALUES (p_ip_address, GREATEST(0, LEAST(100, 50 + p_delta)), 1)
  ON CONFLICT (ip_address) DO UPDATE SET
    reputation_score = GREATEST(0, LEAST(100, ip_reputation.reputation_score + p_delta)),
    total_requests = ip_reputation.total_requests + 1,
    failed_attempts = CASE WHEN p_event_type = 'failed' THEN ip_reputation.failed_attempts + 1 ELSE ip_reputation.failed_attempts END,
    successful_attempts = CASE WHEN p_event_type = 'success' THEN ip_reputation.successful_attempts + 1 ELSE ip_reputation.successful_attempts END,
    last_seen_at = now(),
    updated_at = now()
  RETURNING * INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Function to check if IP is blocked
CREATE OR REPLACE FUNCTION public.is_ip_blocked(p_ip_address TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_blocked BOOLEAN := false;
BEGIN
  SELECT 
    (permanent_block = true OR (blocked_until IS NOT NULL AND blocked_until > now()))
  INTO v_blocked
  FROM public.ip_reputation
  WHERE ip_address = p_ip_address;
  
  RETURN COALESCE(v_blocked, false);
END;
$$;