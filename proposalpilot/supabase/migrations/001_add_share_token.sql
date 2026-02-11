-- Add share_token column to proposals for public sharing
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_proposals_share_token ON proposals (share_token) WHERE share_token IS NOT NULL;

-- Allow public read access to shared proposals (by token)
CREATE POLICY "Public can view shared proposals" ON proposals
  FOR SELECT
  USING (share_token IS NOT NULL);
