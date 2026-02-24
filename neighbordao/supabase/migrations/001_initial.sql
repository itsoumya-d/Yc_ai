CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Neighborhoods
CREATE TABLE IF NOT EXISTS neighborhoods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  member_count INT NOT NULL DEFAULT 1,
  admin_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view neighborhood" ON neighborhoods FOR SELECT
  USING (id IN (SELECT neighborhood_id FROM neighborhood_members WHERE user_id = auth.uid()));
CREATE POLICY "Admin manages neighborhood" ON neighborhoods FOR ALL
  USING (admin_id = auth.uid());

-- Members
CREATE TABLE IF NOT EXISTS neighborhood_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin','moderator','member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(neighborhood_id, user_id)
);
ALTER TABLE neighborhood_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view members" ON neighborhood_members FOR SELECT
  USING (neighborhood_id IN (SELECT neighborhood_id FROM neighborhood_members WHERE user_id = auth.uid()));
CREATE POLICY "Users manage own membership" ON neighborhood_members FOR ALL
  USING (user_id = auth.uid());

-- Posts
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('general','event','alert','marketplace','request')),
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  ai_summary TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  likes INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view posts" ON posts FOR SELECT
  USING (neighborhood_id IN (SELECT neighborhood_id FROM neighborhood_members WHERE user_id = auth.uid()));
CREATE POLICY "Members create posts" ON posts FOR INSERT
  WITH CHECK (neighborhood_id IN (SELECT neighborhood_id FROM neighborhood_members WHERE user_id = auth.uid()) AND author_id = auth.uid());
CREATE POLICY "Authors manage own posts" ON posts FOR ALL USING (author_id = auth.uid());
CREATE INDEX idx_posts_neighborhood ON posts(neighborhood_id, created_at DESC);

-- Group Orders
CREATE TABLE IF NOT EXISTS group_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  organizer_name TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  vendor_name TEXT NOT NULL DEFAULT '',
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  minimum_units INT NOT NULL DEFAULT 1,
  current_units INT NOT NULL DEFAULT 0,
  deadline TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','minimum_met','ordering','delivered','cancelled')),
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE group_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view orders" ON group_orders FOR SELECT
  USING (neighborhood_id IN (SELECT neighborhood_id FROM neighborhood_members WHERE user_id = auth.uid()));
CREATE POLICY "Members create orders" ON group_orders FOR INSERT
  WITH CHECK (neighborhood_id IN (SELECT neighborhood_id FROM neighborhood_members WHERE user_id = auth.uid()));
CREATE POLICY "Organizers manage orders" ON group_orders FOR ALL USING (organizer_id = auth.uid());

-- Resources
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  owner_name TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'tools',
  deposit_amount NUMERIC(8,2) NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view resources" ON resources FOR SELECT
  USING (neighborhood_id IN (SELECT neighborhood_id FROM neighborhood_members WHERE user_id = auth.uid()));
CREATE POLICY "Members create resources" ON resources FOR INSERT
  WITH CHECK (neighborhood_id IN (SELECT neighborhood_id FROM neighborhood_members WHERE user_id = auth.uid()));
CREATE POLICY "Owners manage resources" ON resources FOR ALL USING (owner_id = auth.uid());

-- Resource Bookings
CREATE TABLE IF NOT EXISTS resource_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES resources ON DELETE CASCADE,
  resource_name TEXT NOT NULL DEFAULT '',
  borrower_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  borrower_name TEXT NOT NULL DEFAULT '',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','active','completed','cancelled')),
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE resource_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Borrowers manage bookings" ON resource_bookings FOR ALL USING (borrower_id = auth.uid());

-- Votes
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  options JSONB NOT NULL DEFAULT '[]',
  voting_method TEXT NOT NULL DEFAULT 'simple_majority'
    CHECK (voting_method IN ('simple_majority','supermajority','consensus')),
  quorum_percent INT NOT NULL DEFAULT 50,
  deadline TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  is_closed BOOLEAN NOT NULL DEFAULT false,
  total_votes INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view votes" ON votes FOR SELECT
  USING (neighborhood_id IN (SELECT neighborhood_id FROM neighborhood_members WHERE user_id = auth.uid()));
CREATE POLICY "Members create votes" ON votes FOR INSERT
  WITH CHECK (neighborhood_id IN (SELECT neighborhood_id FROM neighborhood_members WHERE user_id = auth.uid()));
CREATE POLICY "Creators manage votes" ON votes FOR ALL USING (creator_id = auth.uid());

-- Treasury
CREATE TABLE IF NOT EXISTS treasury_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('income','expense','transfer')),
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT NOT NULL DEFAULT '',
  amount NUMERIC(10,2) NOT NULL,
  approved_by UUID REFERENCES auth.users,
  created_by UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE treasury_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view treasury" ON treasury_entries FOR SELECT
  USING (neighborhood_id IN (SELECT neighborhood_id FROM neighborhood_members WHERE user_id = auth.uid()));
CREATE POLICY "Members add entries" ON treasury_entries FOR INSERT
  WITH CHECK (neighborhood_id IN (SELECT neighborhood_id FROM neighborhood_members WHERE user_id = auth.uid()));
