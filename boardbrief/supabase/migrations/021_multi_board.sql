-- Multi-Board Management schema
-- Supports holding companies, investment firms, and nonprofits managing multiple board entities.

CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  organization_name TEXT,
  meeting_frequency TEXT DEFAULT 'monthly' CHECK (meeting_frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'annual')),
  fiscal_year_start INTEGER DEFAULT 1 CHECK (fiscal_year_start BETWEEN 1 AND 12),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS board_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'secretary', 'member', 'observer')),
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(board_id, email)
);

-- User preference: currently active board
CREATE TABLE IF NOT EXISTS user_board_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  active_board_id UUID REFERENCES boards(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_board_preferences ENABLE ROW LEVEL SECURITY;

-- Boards: members can read their boards
CREATE POLICY "Board members see their boards" ON boards FOR SELECT USING (
  id IN (SELECT board_id FROM board_memberships WHERE user_id = auth.uid() AND status = 'active')
  OR created_by = auth.uid()
);

-- Boards: admins can insert/update/delete
CREATE POLICY "Admins manage boards" ON boards FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Admins update boards" ON boards FOR UPDATE USING (
  id IN (SELECT board_id FROM board_memberships WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins delete boards" ON boards FOR DELETE USING (
  id IN (SELECT board_id FROM board_memberships WHERE user_id = auth.uid() AND role = 'admin')
);

-- Memberships: members can see other members of boards they belong to
CREATE POLICY "Members see board memberships" ON board_memberships FOR SELECT USING (
  board_id IN (SELECT board_id FROM board_memberships bm WHERE bm.user_id = auth.uid())
);

-- Memberships: admins can manage
CREATE POLICY "Admins insert memberships" ON board_memberships FOR INSERT WITH CHECK (
  board_id IN (SELECT board_id FROM board_memberships WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins update memberships" ON board_memberships FOR UPDATE USING (
  board_id IN (SELECT board_id FROM board_memberships WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins delete memberships" ON board_memberships FOR DELETE USING (
  board_id IN (SELECT board_id FROM board_memberships WHERE user_id = auth.uid() AND role = 'admin')
);

-- User board preferences: users manage their own
CREATE POLICY "Users manage own preferences" ON user_board_preferences FOR ALL USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_board_memberships_user ON board_memberships(user_id);
CREATE INDEX idx_board_memberships_board ON board_memberships(board_id);
CREATE INDEX idx_board_memberships_email ON board_memberships(email);
CREATE INDEX idx_boards_created_by ON boards(created_by);

-- Trigger for updated_at on boards
CREATE OR REPLACE FUNCTION update_boards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER boards_updated_at
  BEFORE UPDATE ON boards
  FOR EACH ROW EXECUTE FUNCTION update_boards_updated_at();
