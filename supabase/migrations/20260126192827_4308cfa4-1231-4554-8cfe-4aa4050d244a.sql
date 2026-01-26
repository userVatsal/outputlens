-- =====================================================
-- Phase 1: Fix tracked_assets table - Add missing columns
-- =====================================================

-- Add missing columns to tracked_assets
ALTER TABLE public.tracked_assets 
  ADD COLUMN IF NOT EXISTS asset_name text,
  ADD COLUMN IF NOT EXISTS direction varchar(10) NOT NULL DEFAULT 'long',
  ADD COLUMN IF NOT EXISTS position_size numeric,
  ADD COLUMN IF NOT EXISTS position_type varchar(20),
  ADD COLUMN IF NOT EXISTS track_frequency varchar(20) DEFAULT 'weekly',
  ADD COLUMN IF NOT EXISTS alert_on_risk_change boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS risk_threshold_delta numeric DEFAULT 2.0,
  ADD COLUMN IF NOT EXISTS risk_score_at_track numeric,
  ADD COLUMN IF NOT EXISTS win_prob_at_track numeric,
  ADD COLUMN IF NOT EXISTS var95_at_track numeric,
  ADD COLUMN IF NOT EXISTS tail_risk_at_track numeric,
  ADD COLUMN IF NOT EXISTS current_risk_score numeric,
  ADD COLUMN IF NOT EXISTS current_win_prob numeric,
  ADD COLUMN IF NOT EXISTS current_var95 numeric,
  ADD COLUMN IF NOT EXISTS current_tail_risk numeric,
  ADD COLUMN IF NOT EXISTS last_analysis_at timestamptz,
  ADD COLUMN IF NOT EXISTS risk_delta numeric,
  ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'active';

-- Add unique constraint for upsert support (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tracked_assets_user_symbol_market_key'
  ) THEN
    ALTER TABLE public.tracked_assets 
      ADD CONSTRAINT tracked_assets_user_symbol_market_key 
      UNIQUE (user_id, symbol, market);
  END IF;
END $$;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_tracked_assets_user_status 
  ON public.tracked_assets(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tracked_assets_status_analysis 
  ON public.tracked_assets(status, last_analysis_at);

-- =====================================================
-- Phase 2: Fix risk_alerts table - Add missing columns
-- =====================================================

ALTER TABLE public.risk_alerts
  ADD COLUMN IF NOT EXISTS severity varchar(20) DEFAULT 'info',
  ADD COLUMN IF NOT EXISTS previous_value numeric;

-- =====================================================
-- Phase 3: Create saved_portfolios table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.saved_portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name varchar(100) NOT NULL,
  description text,
  time_horizon varchar(50) DEFAULT '3-7 days',
  is_default boolean DEFAULT false,
  last_analyzed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT saved_portfolios_user_name_key UNIQUE (user_id, name)
);

-- Enable RLS on saved_portfolios
ALTER TABLE public.saved_portfolios ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_portfolios
CREATE POLICY "Users can view their own portfolios"
  ON public.saved_portfolios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolios"
  ON public.saved_portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios"
  ON public.saved_portfolios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios"
  ON public.saved_portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger for saved_portfolios
CREATE TRIGGER update_saved_portfolios_updated_at
  BEFORE UPDATE ON public.saved_portfolios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Phase 4: Create portfolio_assets junction table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.portfolio_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid NOT NULL REFERENCES public.saved_portfolios(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  symbol varchar(20) NOT NULL,
  asset_name text,
  market varchar(10) DEFAULT 'US',
  direction varchar(10) DEFAULT 'long',
  weight numeric NOT NULL DEFAULT 10,
  entry_price numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT portfolio_assets_portfolio_symbol_market_key UNIQUE (portfolio_id, symbol, market)
);

-- Enable RLS on portfolio_assets
ALTER TABLE public.portfolio_assets ENABLE ROW LEVEL SECURITY;

-- RLS policies for portfolio_assets
CREATE POLICY "Users can view their own portfolio assets"
  ON public.portfolio_assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolio assets"
  ON public.portfolio_assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio assets"
  ON public.portfolio_assets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio assets"
  ON public.portfolio_assets FOR DELETE
  USING (auth.uid() = user_id);

-- Add indexes for portfolio_assets
CREATE INDEX IF NOT EXISTS idx_portfolio_assets_portfolio_id 
  ON public.portfolio_assets(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_assets_user_id 
  ON public.portfolio_assets(user_id);