-- InspectorAI Database Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  company TEXT,
  license_number TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- INSPECTIONS TABLE
-- ============================================================
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Property info (denormalized for simplicity)
  property_name TEXT NOT NULL,
  property_address TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('residential', 'commercial', 'industrial', 'vehicle', 'other')),
  owner_name TEXT,
  owner_email TEXT,
  owner_phone TEXT,
  insurance_policy TEXT,
  -- Inspection state
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'submitted')),
  total_estimate_min INTEGER NOT NULL DEFAULT 0,
  total_estimate_max INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_inspections_user_id ON inspections(user_id);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspections_created_at ON inspections(created_at DESC);

-- RLS for inspections
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inspections"
  ON inspections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create inspections"
  ON inspections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inspections"
  ON inspections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inspections"
  ON inspections FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- INSPECTION PHOTOS TABLE
-- ============================================================
CREATE TABLE inspection_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  uri TEXT NOT NULL,
  uploaded_url TEXT,
  analysis JSONB,
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_inspection_photos_inspection_id ON inspection_photos(inspection_id);

-- RLS for inspection_photos
ALTER TABLE inspection_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view photos of their inspections"
  ON inspection_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE inspections.id = inspection_photos.inspection_id
      AND inspections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add photos to their inspections"
  ON inspection_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE inspections.id = inspection_photos.inspection_id
      AND inspections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos from their inspections"
  ON inspection_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE inspections.id = inspection_photos.inspection_id
      AND inspections.user_id = auth.uid()
    )
  );

-- ============================================================
-- DAMAGE ITEMS TABLE
-- ============================================================
CREATE TABLE damage_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  damage_type TEXT NOT NULL CHECK (damage_type IN ('water', 'fire', 'wind', 'structural', 'vandalism', 'electrical', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'severe', 'total_loss')),
  urgency TEXT NOT NULL CHECK (urgency IN ('immediate', 'can_wait', 'cosmetic')),
  component TEXT NOT NULL,
  description TEXT NOT NULL,
  estimated_cost_min INTEGER NOT NULL DEFAULT 0,
  estimated_cost_max INTEGER NOT NULL DEFAULT 0,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_damage_items_inspection_id ON damage_items(inspection_id);
CREATE INDEX idx_damage_items_severity ON damage_items(severity);

-- RLS for damage_items
ALTER TABLE damage_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view damage items of their inspections"
  ON damage_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE inspections.id = damage_items.inspection_id
      AND inspections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add damage items to their inspections"
  ON damage_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE inspections.id = damage_items.inspection_id
      AND inspections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update damage items in their inspections"
  ON damage_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE inspections.id = damage_items.inspection_id
      AND inspections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete damage items from their inspections"
  ON damage_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM inspections
      WHERE inspections.id = damage_items.inspection_id
      AND inspections.user_id = auth.uid()
    )
  );

-- ============================================================
-- REPORTS TABLE
-- ============================================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  total_claim_amount INTEGER NOT NULL DEFAULT 0,
  pdf_url TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_inspection_id ON reports(inspection_id);
CREATE INDEX idx_reports_status ON reports(status);

-- RLS for reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
  ON reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
  ON reports FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Create storage bucket for inspection photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('inspection-photos', 'inspection-photos', false)
ON CONFLICT DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Users can upload inspection photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'inspection-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own inspection photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'inspection-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own inspection photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'inspection-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TRIGGER: Update updated_at on inspections
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inspections_updated_at
  BEFORE UPDATE ON inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
