
-- Cost tracking
CREATE TABLE public.mcp_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  claude_messages INTEGER NOT NULL DEFAULT 0,
  tool_calls INTEGER NOT NULL DEFAULT 0,
  cache_hits INTEGER NOT NULL DEFAULT 0,
  tokens_input INTEGER NOT NULL DEFAULT 0,
  tokens_output INTEGER NOT NULL DEFAULT 0,
  estimated_cost NUMERIC(12,6) NOT NULL DEFAULT 0,
  model TEXT NOT NULL DEFAULT 'claude-haiku-4-5',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date, model)
);
CREATE INDEX idx_mcp_usage_user_date ON public.mcp_usage(user_id, date DESC);
CREATE INDEX idx_mcp_usage_date ON public.mcp_usage(date DESC);

ALTER TABLE public.mcp_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own usage" ON public.mcp_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins view all usage" ON public.mcp_usage
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages usage" ON public.mcp_usage
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER trg_mcp_usage_updated
  BEFORE UPDATE ON public.mcp_usage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Audit log
CREATE TABLE public.mcp_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  tool_name TEXT,
  args_hash TEXT,
  status TEXT NOT NULL,
  latency_ms INTEGER,
  ip TEXT,
  request_id TEXT,
  source TEXT NOT NULL DEFAULT 'in-app',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_mcp_audit_user ON public.mcp_audit_log(user_id, created_at DESC);
CREATE INDEX idx_mcp_audit_created ON public.mcp_audit_log(created_at DESC);

ALTER TABLE public.mcp_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages audit" ON public.mcp_audit_log
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins view audit" ON public.mcp_audit_log
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Tool result cache
CREATE TABLE public.mcp_tool_cache (
  cache_key TEXT NOT NULL PRIMARY KEY,
  tool_name TEXT NOT NULL,
  user_id UUID,
  payload JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_mcp_cache_expires ON public.mcp_tool_cache(expires_at);
CREATE INDEX idx_mcp_cache_tool_user ON public.mcp_tool_cache(tool_name, user_id);

ALTER TABLE public.mcp_tool_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages cache" ON public.mcp_tool_cache
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- In-app agent conversation
CREATE TABLE public.mcp_agent_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system','tool')),
  content JSONB NOT NULL,
  tool_calls JSONB,
  tokens_input INTEGER,
  tokens_output INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_mcp_msg_user_created ON public.mcp_agent_messages(user_id, created_at DESC);

ALTER TABLE public.mcp_agent_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own messages" ON public.mcp_agent_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own messages" ON public.mcp_agent_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own messages" ON public.mcp_agent_messages
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role manages messages" ON public.mcp_agent_messages
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
