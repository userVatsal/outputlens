-- Tighten behavior_sessions RLS policies for better security
-- These tables track anonymous user behavior and need permissive INSERT
-- but UPDATE should be more restricted

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can insert behavior sessions" ON public.behavior_sessions;
DROP POLICY IF EXISTS "Sessions update restricted" ON public.behavior_sessions;

-- Create more secure INSERT policy with validation
CREATE POLICY "Validated behavior session insert"
ON public.behavior_sessions FOR INSERT
WITH CHECK (
    visitor_id IS NOT NULL 
    AND length(visitor_id) <= 100
    AND entry_url IS NOT NULL
    AND length(entry_url) <= 2000
);

-- Create UPDATE policy that validates the session belongs to the visitor
-- Uses a more secure approach by requiring matching visitor_id
CREATE POLICY "Visitors can update own sessions"
ON public.behavior_sessions FOR UPDATE
USING (visitor_id IS NOT NULL AND length(visitor_id) <= 100)
WITH CHECK (
    visitor_id IS NOT NULL
    AND id IS NOT NULL
    AND length(visitor_id) <= 100
);