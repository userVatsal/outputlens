CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS json
LANGUAGE sql SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_analyses', (SELECT COUNT(*) FROM public.analysis_history),
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'analyses_today', (SELECT COUNT(*) FROM public.analysis_history WHERE created_at > now() - interval '24 hours'),
    'analyses_this_week', (SELECT COUNT(*) FROM public.analysis_history WHERE created_at > now() - interval '7 days')
  );
$$;
GRANT EXECUTE ON FUNCTION public.get_platform_stats() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_daily_analysis_counts(days_back INT DEFAULT 7)
RETURNS TABLE(analysis_date DATE, cnt BIGINT)
LANGUAGE sql SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    created_at::date AS analysis_date,
    COUNT(*) AS cnt
  FROM public.analysis_history
  WHERE created_at > now() - make_interval(days => days_back)
  GROUP BY created_at::date
  ORDER BY analysis_date ASC;
$$;
GRANT EXECUTE ON FUNCTION public.get_daily_analysis_counts(INT) TO anon, authenticated;

ALTER TABLE public.analysis_history
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_analysis_history_public
  ON public.analysis_history(id) WHERE is_public = true;

DROP POLICY IF EXISTS "Anyone can view public analyses" ON public.analysis_history;
CREATE POLICY "Anyone can view public analyses"
  ON public.analysis_history
  FOR SELECT
  USING (is_public = true);

GRANT SELECT ON public.analysis_history TO anon;