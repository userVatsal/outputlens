-- Fix security vulnerabilities by restricting access to sensitive tables

-- 1. Drop existing overly permissive policies on optimization tables
DROP POLICY IF EXISTS "Optimization recommendations are readable by authenticated user" ON public.optimization_recommendations;
DROP POLICY IF EXISTS "Optimization results are readable by authenticated users" ON public.optimization_results;

-- 2. Add service-role only access to optimization tables (hide internal strategies)
CREATE POLICY "Service role only access to optimization_recommendations" 
  ON public.optimization_recommendations FOR ALL 
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only access to optimization_results" 
  ON public.optimization_results FOR ALL 
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 3. Add explicit authenticated-only wrapper policies to sensitive user tables
-- These ensure anonymous users cannot access data even if they somehow bypass other checks

-- For profiles: Add explicit denial for non-authenticated users
CREATE POLICY "Only authenticated users can access profiles"
  ON public.profiles FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- For usage_tracking: Add explicit denial for non-authenticated users  
CREATE POLICY "Only authenticated users can access usage_tracking"
  ON public.usage_tracking FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- For profile_audit_log: Add explicit denial for non-authenticated users
CREATE POLICY "Only authenticated users can access profile_audit_log"
  ON public.profile_audit_log FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- For analysis_history: Add explicit denial for non-authenticated users
CREATE POLICY "Only authenticated users can access analysis_history"
  ON public.analysis_history FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');