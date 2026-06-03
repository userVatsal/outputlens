CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset TEXT NOT NULL,
  market TEXT NOT NULL DEFAULT 'US',
  direction TEXT NOT NULL CHECK (direction IN ('long','short')),
  entry_price NUMERIC NOT NULL,
  position_size NUMERIC,
  position_size_type TEXT DEFAULT 'dollars',
  entry_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  exit_date TIMESTAMPTZ,
  exit_price NUMERIC,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','cancelled')),
  var95_at_entry NUMERIC,
  win_prob_at_entry NUMERIC,
  expected_return_at_entry NUMERIC,
  risk_score_at_entry NUMERIC,
  regime_at_entry TEXT,
  actual_return_pct NUMERIC,
  actual_pnl NUMERIC,
  thesis TEXT,
  notes TEXT,
  analysis_id TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_journal_user_id ON public.journal_entries(user_id);
CREATE INDEX idx_journal_status ON public.journal_entries(user_id, status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_entries TO authenticated;
GRANT ALL ON public.journal_entries TO service_role;

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own journal" ON public.journal_entries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_journal_entries_updated_at
BEFORE UPDATE ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();