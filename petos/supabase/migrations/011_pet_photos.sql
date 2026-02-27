-- Pet photos with AI analysis
CREATE TABLE IF NOT EXISTS pet_photos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id         UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id),
  storage_path   TEXT NOT NULL,
  url            TEXT NOT NULL,
  category       TEXT NOT NULL DEFAULT 'general',
  caption        TEXT,
  ai_analysis    JSONB,
  taken_at       TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pet_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY pet_photos_owner ON pet_photos
  USING (user_id = auth.uid());

CREATE INDEX idx_pet_photos_pet_id     ON pet_photos(pet_id);
CREATE INDEX idx_pet_photos_user_id    ON pet_photos(user_id);
CREATE INDEX idx_pet_photos_created_at ON pet_photos(created_at DESC);
