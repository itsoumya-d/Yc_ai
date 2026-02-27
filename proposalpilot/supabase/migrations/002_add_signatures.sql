-- Create signatures table for e-sign on public share pages
CREATE TABLE IF NOT EXISTS signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  signature_url TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast proposal lookup
CREATE INDEX IF NOT EXISTS idx_signatures_proposal_id ON signatures(proposal_id);

-- RLS: proposal owners can view signatures on their proposals
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Proposal owners can view signatures" ON signatures
  FOR SELECT
  USING (
    proposal_id IN (
      SELECT id FROM proposals WHERE user_id = auth.uid()
    )
  );

-- Public (anon) can insert signatures (required for share page)
CREATE POLICY "Anyone can sign a shared proposal" ON signatures
  FOR INSERT
  WITH CHECK (
    proposal_id IN (
      SELECT id FROM proposals WHERE share_token IS NOT NULL
    )
  );

-- Storage bucket for signature images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proposal-signatures',
  'proposal-signatures',
  false,
  512000,  -- 500KB max per signature PNG
  ARRAY['image/png']
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS: allow public insert (anon client)
CREATE POLICY "Anyone can upload a signature" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'proposal-signatures');

-- Storage RLS: proposal owners can read
CREATE POLICY "Owners can read signatures" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'proposal-signatures'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM proposals WHERE user_id = auth.uid()
    )
  );
