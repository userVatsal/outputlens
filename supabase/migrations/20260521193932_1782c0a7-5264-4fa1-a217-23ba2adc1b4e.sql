CREATE TABLE public.saved_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scenarios" ON public.saved_scenarios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own scenarios" ON public.saved_scenarios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own scenarios" ON public.saved_scenarios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own scenarios" ON public.saved_scenarios FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER saved_scenarios_updated_at
  BEFORE UPDATE ON public.saved_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_saved_scenarios_user ON public.saved_scenarios(user_id, created_at DESC);