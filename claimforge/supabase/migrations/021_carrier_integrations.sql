-- Carrier integrations for insurance API connectivity
-- Stores carrier connections (API credentials) and submission history (ACORD XML)

CREATE TABLE carrier_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  carrier_name TEXT NOT NULL,
  carrier_code TEXT NOT NULL,
  encrypted_api_key TEXT,
  encrypted_api_secret TEXT,
  webhook_secret TEXT,
  base_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  claims_synced INTEGER DEFAULT 0,
  sync_errors INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, carrier_code)
);

CREATE TABLE carrier_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  carrier_connection_id UUID NOT NULL REFERENCES carrier_connections(id) ON DELETE CASCADE,
  acord_xml TEXT,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('initial', 'supplement', 'appeal', 'status_inquiry')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'acknowledged', 'under_review', 'approved', 'denied', 'appealed')),
  carrier_claim_number TEXT,
  carrier_response TEXT,
  response_details JSONB DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_carrier_connections_user ON carrier_connections(user_id);
CREATE INDEX idx_carrier_submissions_claim ON carrier_submissions(claim_id);
CREATE INDEX idx_carrier_submissions_connection ON carrier_submissions(carrier_connection_id);
CREATE INDEX idx_carrier_submissions_status ON carrier_submissions(status);

-- RLS
ALTER TABLE carrier_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own carriers"
  ON carrier_connections FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users manage own submissions"
  ON carrier_submissions FOR ALL
  USING (
    claim_id IN (SELECT id FROM claims WHERE user_id = auth.uid())
  );

-- Updated_at trigger for carrier_connections
CREATE OR REPLACE FUNCTION update_carrier_connection_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER carrier_connection_updated_at
  BEFORE UPDATE ON carrier_connections
  FOR EACH ROW EXECUTE FUNCTION update_carrier_connection_updated_at();
