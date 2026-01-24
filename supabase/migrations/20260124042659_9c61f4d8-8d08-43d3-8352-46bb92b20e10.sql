-- Phase 1: Database Indexes for Performance Optimization
-- Add composite indexes for frequently queried tables

-- Sentiment scores: frequently queried by asset and time
CREATE INDEX IF NOT EXISTS idx_sentiment_scores_asset_processed 
ON sentiment_scores(asset, processed_at DESC);

-- Qualitative signals: used for unprocessed batch queries
CREATE INDEX IF NOT EXISTS idx_qualitative_signals_processed_fetched 
ON qualitative_signals(processed, fetched_at DESC);

-- Aggregated insights: cache lookup optimization
CREATE INDEX IF NOT EXISTS idx_aggregated_insights_asset_market_expires 
ON aggregated_insights(asset, market, expires_at);

-- Analysis history: user-scoped queries with ordering
CREATE INDEX IF NOT EXISTS idx_analysis_history_user_created 
ON analysis_history(user_id, created_at DESC);

-- Market data cache: symbol lookup with expiry
CREATE INDEX IF NOT EXISTS idx_market_data_cache_symbol_expires 
ON market_data_cache(symbol, expires_at);

-- Phase 6: Continuous Improvement AI Tables

-- Platform metrics collection table
CREATE TABLE IF NOT EXISTS platform_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL, -- 'edge_function', 'ai_cost', 'usage', 'conversion', 'cache'
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  dimensions JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;

-- Public read for metrics (internal data, no user PII)
CREATE POLICY "Platform metrics are readable by authenticated users"
ON platform_metrics FOR SELECT
TO authenticated
USING (true);

-- AI optimization recommendations table
CREATE TABLE IF NOT EXISTS optimization_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'cost', 'performance', 'feature', 'security'
  priority TEXT NOT NULL, -- 'critical', 'high', 'medium', 'low'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_estimate JSONB, -- {"cost_reduction": 0.15, "performance_gain": 0.2}
  action_type TEXT DEFAULT 'manual', -- 'automated', 'manual', 'review'
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'implemented', 'rejected'
  implemented_at TIMESTAMPTZ,
  result_metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE optimization_recommendations ENABLE ROW LEVEL SECURITY;

-- Readable by authenticated users
CREATE POLICY "Optimization recommendations are readable by authenticated users"
ON optimization_recommendations FOR SELECT
TO authenticated
USING (true);

-- Optimization results for learning loop
CREATE TABLE IF NOT EXISTS optimization_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id UUID REFERENCES optimization_recommendations(id) ON DELETE CASCADE,
  before_metrics JSONB NOT NULL,
  after_metrics JSONB NOT NULL,
  improvement_pct NUMERIC,
  measured_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE optimization_results ENABLE ROW LEVEL SECURITY;

-- Readable by authenticated users
CREATE POLICY "Optimization results are readable by authenticated users"
ON optimization_results FOR SELECT
TO authenticated
USING (true);

-- Index for metrics queries
CREATE INDEX IF NOT EXISTS idx_platform_metrics_type_recorded 
ON platform_metrics(metric_type, recorded_at DESC);

-- Index for recommendations by status
CREATE INDEX IF NOT EXISTS idx_optimization_recommendations_status 
ON optimization_recommendations(status, created_at DESC);