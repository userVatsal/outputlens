-- =============================================
-- AI AGENTIC SYSTEM: Qualitative Signal Pipeline
-- =============================================

-- Table: Raw qualitative signals from various sources
CREATE TABLE public.qualitative_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset TEXT,
  asset_type TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('news', 'social', 'video', 'research', 'forum', 'analyst')),
  source_name TEXT NOT NULL,
  source_url TEXT,
  title TEXT,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  author TEXT,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed BOOLEAN DEFAULT FALSE,
  processing_error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicates
CREATE UNIQUE INDEX idx_qualitative_signals_hash ON public.qualitative_signals (content_hash);

-- Create indexes for efficient querying
CREATE INDEX idx_qualitative_signals_asset ON public.qualitative_signals (asset);
CREATE INDEX idx_qualitative_signals_source_type ON public.qualitative_signals (source_type);
CREATE INDEX idx_qualitative_signals_processed ON public.qualitative_signals (processed);
CREATE INDEX idx_qualitative_signals_fetched ON public.qualitative_signals (fetched_at DESC);

-- Enable RLS
ALTER TABLE public.qualitative_signals ENABLE ROW LEVEL SECURITY;

-- Public read for cached signals (market data is not sensitive)
CREATE POLICY "Anyone can read qualitative signals"
ON public.qualitative_signals FOR SELECT USING (true);

-- =============================================
-- Table: Processed sentiment scores per signal
-- =============================================
CREATE TABLE public.sentiment_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  signal_id UUID NOT NULL REFERENCES public.qualitative_signals(id) ON DELETE CASCADE,
  asset TEXT NOT NULL,
  sentiment_score NUMERIC NOT NULL CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  expected_impact NUMERIC,
  impact_timeframe TEXT,
  entities JSONB DEFAULT '[]',
  keywords JSONB DEFAULT '[]',
  reasoning TEXT,
  model_used TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sentiment_scores_asset ON public.sentiment_scores (asset);
CREATE INDEX idx_sentiment_scores_signal ON public.sentiment_scores (signal_id);
CREATE INDEX idx_sentiment_scores_processed ON public.sentiment_scores (processed_at DESC);

ALTER TABLE public.sentiment_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sentiment scores"
ON public.sentiment_scores FOR SELECT USING (true);

-- =============================================
-- Table: Aggregated insights per asset (rolling window)
-- =============================================
CREATE TABLE public.aggregated_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset TEXT NOT NULL,
  market TEXT NOT NULL DEFAULT 'US',
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  
  -- Aggregated sentiment metrics
  avg_sentiment NUMERIC,
  weighted_sentiment NUMERIC,
  sentiment_stddev NUMERIC,
  bullish_count INTEGER DEFAULT 0,
  bearish_count INTEGER DEFAULT 0,
  neutral_count INTEGER DEFAULT 0,
  total_signals INTEGER DEFAULT 0,
  
  -- Derived quantitative adjustments
  volatility_adjustment NUMERIC DEFAULT 1.0,
  probability_shift NUMERIC DEFAULT 0,
  tail_risk_multiplier NUMERIC DEFAULT 1.0,
  expected_move_adjustment NUMERIC DEFAULT 0,
  
  -- Confidence and quality
  data_quality_score NUMERIC,
  source_diversity_score NUMERIC,
  conflict_detected BOOLEAN DEFAULT FALSE,
  
  -- Source breakdown
  source_breakdown JSONB DEFAULT '{}',
  top_signals JSONB DEFAULT '[]',
  
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_aggregated_insights_asset_window 
ON public.aggregated_insights (asset, market, window_start, window_end);

CREATE INDEX idx_aggregated_insights_asset ON public.aggregated_insights (asset);
CREATE INDEX idx_aggregated_insights_expires ON public.aggregated_insights (expires_at);

ALTER TABLE public.aggregated_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read aggregated insights"
ON public.aggregated_insights FOR SELECT USING (true);

-- =============================================
-- Table: Agent run logs for monitoring
-- =============================================
CREATE TABLE public.agent_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('ingestion', 'nlp', 'aggregation', 'seo')),
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  items_processed INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_runs_agent ON public.agent_runs (agent_name);
CREATE INDEX idx_agent_runs_status ON public.agent_runs (status);
CREATE INDEX idx_agent_runs_started ON public.agent_runs (started_at DESC);

ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read agent runs"
ON public.agent_runs FOR SELECT USING (true);