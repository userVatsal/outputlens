-- Fix Security Issues: Restrict public access to sensitive tables

-- 1. agent_runs - Internal system operations (service_role only)
DROP POLICY IF EXISTS "Anyone can read agent runs" ON public.agent_runs;
CREATE POLICY "Service role only access to agent_runs"
ON public.agent_runs
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 2. sentiment_scores - Proprietary AI analysis (authenticated users only)
DROP POLICY IF EXISTS "Anyone can read sentiment scores" ON public.sentiment_scores;
CREATE POLICY "Authenticated users can read sentiment scores"
ON public.sentiment_scores
FOR SELECT
USING (auth.role() = 'authenticated');

-- 3. aggregated_insights - Premium market intelligence (authenticated users only)
DROP POLICY IF EXISTS "Anyone can read aggregated insights" ON public.aggregated_insights;
CREATE POLICY "Authenticated users can read aggregated insights"
ON public.aggregated_insights
FOR SELECT
USING (auth.role() = 'authenticated');

-- 4. qualitative_signals - Curated data (service_role only for writes, authenticated for reads)
DROP POLICY IF EXISTS "Anyone can read qualitative signals" ON public.qualitative_signals;
CREATE POLICY "Authenticated users can read qualitative signals"
ON public.qualitative_signals
FOR SELECT
USING (auth.role() = 'authenticated');

-- 5. market_data_cache - Market data (authenticated users only)
DROP POLICY IF EXISTS "Anyone can read market data cache" ON public.market_data_cache;
CREATE POLICY "Authenticated users can read market data cache"
ON public.market_data_cache
FOR SELECT
USING (auth.role() = 'authenticated');

-- 6. platform_metrics - Business metrics (service_role only)
DROP POLICY IF EXISTS "Platform metrics are readable by authenticated users" ON public.platform_metrics;
CREATE POLICY "Service role only access to platform_metrics"
ON public.platform_metrics
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');