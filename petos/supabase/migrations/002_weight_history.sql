-- Migration: Add Weight History Tracking
-- Created: 2026-02-09

-- Create weight_history table for tracking weight over time
CREATE TABLE IF NOT EXISTS weight_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  weight DECIMAL(8, 2) NOT NULL,
  weight_unit TEXT NOT NULL CHECK (weight_unit IN ('lbs', 'kg')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX idx_weight_history_pet_id ON weight_history(pet_id);
CREATE INDEX idx_weight_history_date ON weight_history(date);

-- Create RLS policies
ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view weight history for their pets"
ON weight_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pets
    WHERE pets.id = weight_history.pet_id
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert weight history for their pets"
ON weight_history FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pets
    WHERE pets.id = weight_history.pet_id
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update weight history for their pets"
ON weight_history FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM pets
    WHERE pets.id = weight_history.pet_id
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete weight history for their pets"
ON weight_history FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM pets
    WHERE pets.id = weight_history.pet_id
    AND pets.user_id = auth.uid()
  )
);

-- Add comment
COMMENT ON TABLE weight_history IS 'Tracks pet weight over time for health trend analysis';
