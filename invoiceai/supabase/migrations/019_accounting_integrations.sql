-- Accounting integrations (QuickBooks Online + Xero)
-- Stores encrypted OAuth2 tokens and sync configuration per user

CREATE TABLE accounting_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('quickbooks', 'xero')),
  encrypted_access_token TEXT,
  encrypted_refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  tenant_id TEXT,        -- Xero tenant/organisation ID
  realm_id TEXT,         -- QBO company/realm ID
  auto_sync BOOLEAN DEFAULT true,
  sync_frequency TEXT DEFAULT 'hourly' CHECK (sync_frequency IN ('realtime', 'hourly', 'daily')),
  sync_direction TEXT DEFAULT 'push' CHECK (sync_direction IN ('push', 'pull', 'bidirectional')),
  last_synced_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, provider)
);

CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES accounting_integrations(id) ON DELETE SET NULL,
  provider TEXT NOT NULL CHECK (provider IN ('quickbooks', 'xero')),
  direction TEXT NOT NULL CHECK (direction IN ('push', 'pull', 'bidirectional')),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'partial')),
  items_synced INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  error_message TEXT,
  details JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_accounting_integrations_user ON accounting_integrations(user_id);
CREATE INDEX idx_accounting_integrations_user_provider ON accounting_integrations(user_id, provider) WHERE is_active = true;
CREATE INDEX idx_sync_logs_user ON sync_logs(user_id);
CREATE INDEX idx_sync_logs_integration ON sync_logs(integration_id);
CREATE INDEX idx_sync_logs_started_at ON sync_logs(started_at DESC);

-- RLS
ALTER TABLE accounting_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own integrations"
  ON accounting_integrations FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users view own sync logs"
  ON sync_logs FOR ALL
  USING (user_id = auth.uid());

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_accounting_integration_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_accounting_integrations_updated
  BEFORE UPDATE ON accounting_integrations
  FOR EACH ROW EXECUTE FUNCTION update_accounting_integration_timestamp();
