-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create tracked_assets table for asset monitoring feature
CREATE TABLE public.tracked_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  market VARCHAR(20) NOT NULL DEFAULT 'US',
  entry_price NUMERIC NOT NULL,
  baseline_risk_score NUMERIC,
  monitoring_frequency VARCHAR(20) DEFAULT 'weekly',
  risk_threshold NUMERIC DEFAULT 2.0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_checked_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, symbol, market)
);

-- Create risk_alerts table for monitoring notifications
CREATE TABLE public.risk_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tracked_asset_id UUID REFERENCES public.tracked_assets(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  delta NUMERIC,
  current_value NUMERIC,
  threshold_value NUMERIC,
  read_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.tracked_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for tracked_assets
CREATE POLICY "Users can view their own tracked assets" 
ON public.tracked_assets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracked assets" 
ON public.tracked_assets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracked assets" 
ON public.tracked_assets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracked assets" 
ON public.tracked_assets 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for risk_alerts
CREATE POLICY "Users can view their own risk alerts" 
ON public.risk_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own risk alerts" 
ON public.risk_alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own risk alerts" 
ON public.risk_alerts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_tracked_assets_user_id ON public.tracked_assets(user_id);
CREATE INDEX idx_tracked_assets_symbol ON public.tracked_assets(symbol);
CREATE INDEX idx_risk_alerts_user_id ON public.risk_alerts(user_id);
CREATE INDEX idx_risk_alerts_tracked_asset_id ON public.risk_alerts(tracked_asset_id);
CREATE INDEX idx_risk_alerts_read_at ON public.risk_alerts(read_at) WHERE read_at IS NULL;

-- Trigger for updating tracked_assets.updated_at
CREATE TRIGGER update_tracked_assets_updated_at
BEFORE UPDATE ON public.tracked_assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();