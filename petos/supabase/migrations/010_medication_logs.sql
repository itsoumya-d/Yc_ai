-- Medication administration logs
CREATE TABLE IF NOT EXISTS medication_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  pet_id        UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  given_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  skipped       BOOLEAN NOT NULL DEFAULT FALSE,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY medication_logs_owner ON medication_logs
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE user_id = auth.uid()
    )
  );

CREATE INDEX idx_medication_logs_pet_id        ON medication_logs(pet_id);
CREATE INDEX idx_medication_logs_medication_id ON medication_logs(medication_id);
CREATE INDEX idx_medication_logs_given_at      ON medication_logs(given_at DESC);
