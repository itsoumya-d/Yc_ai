-- Categories table for expense classification
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  icon TEXT DEFAULT 'tag',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_tax_deductible BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories and defaults" ON categories
  FOR SELECT USING (user_id = auth.uid() OR is_default = TRUE);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (user_id = auth.uid() AND is_default = FALSE);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (user_id = auth.uid() AND is_default = FALSE);

-- Seed default categories
INSERT INTO categories (name, color, icon, is_default, is_tax_deductible) VALUES
  ('Software & Tools', '#3B82F6', 'monitor', TRUE, TRUE),
  ('Office Supplies', '#F59E0B', 'package', TRUE, TRUE),
  ('Travel', '#8B5CF6', 'plane', TRUE, TRUE),
  ('Meals & Entertainment', '#EC4899', 'utensils', TRUE, FALSE),
  ('Professional Services', '#059669', 'briefcase', TRUE, TRUE),
  ('Marketing & Advertising', '#EF4444', 'megaphone', TRUE, TRUE),
  ('Insurance', '#6366F1', 'shield', TRUE, TRUE),
  ('Rent & Utilities', '#14B8A6', 'building', TRUE, TRUE),
  ('Education & Training', '#F97316', 'graduation-cap', TRUE, TRUE),
  ('Miscellaneous', '#6B7280', 'tag', TRUE, FALSE);
