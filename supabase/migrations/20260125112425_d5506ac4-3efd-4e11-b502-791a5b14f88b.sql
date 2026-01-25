-- Fix Security Issues

-- 1. Market Data Cache - Add explicit restrictive policies for write operations
CREATE POLICY "Service role only can insert market data"
ON public.market_data_cache
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only can update market data"
ON public.market_data_cache
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only can delete market data"
ON public.market_data_cache
FOR DELETE
USING (auth.role() = 'service_role');

-- 2. IP Reputation - Add automatic data purging (anonymize old records)
-- Create function to purge old IP reputation data (older than 30 days)
CREATE OR REPLACE FUNCTION public.purge_old_ip_reputation()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete records older than 30 days that aren't permanently blocked
  DELETE FROM public.ip_reputation
  WHERE last_seen_at < now() - interval '30 days'
    AND permanent_block = false;
  
  -- Anonymize IP addresses for records older than 7 days (keep for analytics but remove PII)
  UPDATE public.ip_reputation
  SET ip_address = 'anonymized-' || LEFT(md5(ip_address), 8),
      metadata = '{}'::jsonb
  WHERE last_seen_at < now() - interval '7 days'
    AND permanent_block = false
    AND ip_address NOT LIKE 'anonymized-%';
END;
$$;

-- 3. Add similar policies for qualitative_signals, sentiment_scores, aggregated_insights write operations
CREATE POLICY "Service role only can insert qualitative signals"
ON public.qualitative_signals
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only can update qualitative signals"
ON public.qualitative_signals
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only can delete qualitative signals"
ON public.qualitative_signals
FOR DELETE
USING (auth.role() = 'service_role');

CREATE POLICY "Service role only can insert sentiment scores"
ON public.sentiment_scores
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only can update sentiment scores"
ON public.sentiment_scores
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only can delete sentiment scores"
ON public.sentiment_scores
FOR DELETE
USING (auth.role() = 'service_role');

CREATE POLICY "Service role only can insert aggregated insights"
ON public.aggregated_insights
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only can update aggregated insights"
ON public.aggregated_insights
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only can delete aggregated insights"
ON public.aggregated_insights
FOR DELETE
USING (auth.role() = 'service_role');