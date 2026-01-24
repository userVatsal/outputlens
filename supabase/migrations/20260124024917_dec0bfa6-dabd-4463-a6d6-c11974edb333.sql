-- Create market_data_cache table for caching API responses
CREATE TABLE public.market_data_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  market TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  quote_data JSONB,
  historical_prices JSONB,
  volatility_30d NUMERIC,
  atr_14 NUMERIC,
  sentiment_score NUMERIC,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create unique index for cache lookups
CREATE UNIQUE INDEX idx_market_data_cache_symbol_market ON public.market_data_cache (symbol, market);

-- Create index for expiration cleanup
CREATE INDEX idx_market_data_cache_expires ON public.market_data_cache (expires_at);

-- Enable RLS (public read for cache, service role write)
ALTER TABLE public.market_data_cache ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read cache (it's market data, not sensitive)
CREATE POLICY "Anyone can read market data cache"
ON public.market_data_cache
FOR SELECT
USING (true);

-- Create analysis_history table for storing user analyses
CREATE TABLE public.analysis_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset TEXT NOT NULL,
  market TEXT NOT NULL,
  direction TEXT NOT NULL,
  entry_price NUMERIC NOT NULL,
  time_horizon TEXT NOT NULL,
  user_confidence NUMERIC DEFAULT 5,
  user_assumptions TEXT,
  results JSONB NOT NULL,
  live_volatility NUMERIC,
  data_sources JSONB,
  simulation_stats JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for user lookups
CREATE INDEX idx_analysis_history_user_id ON public.analysis_history (user_id);
CREATE INDEX idx_analysis_history_created_at ON public.analysis_history (created_at DESC);

-- Enable RLS
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- Users can only view their own analysis history
CREATE POLICY "Users can view their own analysis history"
ON public.analysis_history
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own analysis history
CREATE POLICY "Users can create their own analysis history"
ON public.analysis_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own analysis history
CREATE POLICY "Users can delete their own analysis history"
ON public.analysis_history
FOR DELETE
USING (auth.uid() = user_id);