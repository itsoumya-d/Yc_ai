-- SSO (SAML/OIDC) configuration for enterprise organizations
CREATE TABLE IF NOT EXISTS sso_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('saml', 'oidc')),
  -- SAML fields
  saml_metadata_url TEXT,
  saml_entity_id TEXT,
  saml_sso_url TEXT,
  saml_certificate TEXT,
  -- OIDC fields
  oidc_discovery_url TEXT,
  oidc_issuer TEXT,
  oidc_auth_endpoint TEXT,
  oidc_token_endpoint TEXT,
  oidc_client_id TEXT,
  oidc_client_secret_encrypted TEXT,
  -- Domain verification
  domain TEXT,
  domain_verified BOOLEAN DEFAULT false,
  domain_verification_token TEXT DEFAULT encode(gen_random_bytes(16), 'hex'),
  -- Enforcement
  require_sso BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id)
);

-- Index for domain lookups during login
CREATE INDEX idx_sso_configurations_domain ON sso_configurations(domain) WHERE domain_verified = true AND is_active = true;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_sso_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sso_configurations_updated_at
  BEFORE UPDATE ON sso_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_sso_configurations_updated_at();

-- RLS
ALTER TABLE sso_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can manage SSO" ON sso_configurations
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
