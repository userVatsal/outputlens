-- Phase 14: Add decision_outcome column to analysis_history table
-- This tracks whether users avoided, entered, or ignored the trade after seeing risk analysis

ALTER TABLE public.analysis_history 
ADD COLUMN IF NOT EXISTS decision_outcome TEXT;

-- Add constraint for valid values
ALTER TABLE public.analysis_history 
ADD CONSTRAINT analysis_history_decision_outcome_check 
CHECK (decision_outcome IS NULL OR decision_outcome IN ('avoided', 'entered', 'ignored'));

-- Add index for filtering by outcome
CREATE INDEX IF NOT EXISTS idx_analysis_history_decision_outcome 
ON public.analysis_history(decision_outcome) 
WHERE decision_outcome IS NOT NULL;