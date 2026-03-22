-- Yjs document state persistence for collaborative editing
CREATE TABLE IF NOT EXISTS document_states (
  document_id TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: only authenticated users can access document states
ALTER TABLE document_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read document states"
  ON document_states FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can upsert document states"
  ON document_states FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update document states"
  ON document_states FOR UPDATE
  TO authenticated
  USING (true);
