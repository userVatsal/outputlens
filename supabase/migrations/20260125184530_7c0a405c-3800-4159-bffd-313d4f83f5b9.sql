-- Create behavior tracking tables for AI analytics

-- Main behavior events table (stores all tracking events)
CREATE TABLE public.behavior_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- 'page_view', 'click', 'hover', 'scroll', 'cursor_move', 'exit_intent', 'form_abandon'
  page_url TEXT NOT NULL,
  page_type TEXT, -- 'landing', 'methodology', 'pricing', 'demo', 'analyze', 'results', etc.
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sessions table (tracks individual user sessions)
CREATE TABLE public.behavior_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL, -- Anonymous identifier (hashed)
  entry_url TEXT NOT NULL,
  entry_referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  user_agent TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  exit_page TEXT,
  exit_reason TEXT,
  total_pages INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  converted BOOLEAN DEFAULT false,
  user_id UUID -- Optional link to authenticated user
);

-- Exit survey responses
CREATE TABLE public.exit_survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.behavior_sessions(id) ON DELETE CASCADE,
  exit_page TEXT NOT NULL,
  reason TEXT,
  looking_for TEXT,
  additional_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cursor heatmap data (aggregated positions for performance)
CREATE TABLE public.cursor_heatmap (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  page_url TEXT NOT NULL,
  positions JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {x, y, timestamp} objects
  viewport_width INTEGER,
  viewport_height INTEGER,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_behavior_events_session ON public.behavior_events(session_id);
CREATE INDEX idx_behavior_events_type ON public.behavior_events(event_type);
CREATE INDEX idx_behavior_events_created ON public.behavior_events(created_at);
CREATE INDEX idx_behavior_sessions_visitor ON public.behavior_sessions(visitor_id);
CREATE INDEX idx_behavior_sessions_started ON public.behavior_sessions(started_at);
CREATE INDEX idx_cursor_heatmap_page ON public.cursor_heatmap(page_url);

-- Enable RLS
ALTER TABLE public.behavior_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavior_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exit_survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursor_heatmap ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow anonymous inserts, service role for reads
-- Behavior events: Anyone can insert, only service role can read (internal analytics)
CREATE POLICY "Anyone can insert behavior events" 
ON public.behavior_events 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service role can read behavior events" 
ON public.behavior_events 
FOR SELECT 
USING (auth.role() = 'service_role');

-- Behavior sessions: Anyone can insert/update their session, service role for full access
CREATE POLICY "Anyone can insert behavior sessions" 
ON public.behavior_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update their own session" 
ON public.behavior_sessions 
FOR UPDATE 
USING (true);

CREATE POLICY "Service role can read behavior sessions" 
ON public.behavior_sessions 
FOR SELECT 
USING (auth.role() = 'service_role');

-- Exit survey: Anyone can insert, service role for reads
CREATE POLICY "Anyone can submit exit survey" 
ON public.exit_survey_responses 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service role can read exit surveys" 
ON public.exit_survey_responses 
FOR SELECT 
USING (auth.role() = 'service_role');

-- Cursor heatmap: Anyone can insert, service role for reads
CREATE POLICY "Anyone can insert cursor data" 
ON public.cursor_heatmap 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service role can read cursor data" 
ON public.cursor_heatmap 
FOR SELECT 
USING (auth.role() = 'service_role');