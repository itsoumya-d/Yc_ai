-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Neighborhoods
CREATE TABLE IF NOT EXISTS neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  boundary GEOGRAPHY(POLYGON, 4326),
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Neighborhood members
CREATE TABLE IF NOT EXISTS neighborhood_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(neighborhood_id, user_id)
);

-- User profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  neighborhood_id UUID REFERENCES neighborhoods(id),
  address TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'event', 'alert', 'question', 'marketplace', 'safety', 'recommendation')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  reactions JSONB DEFAULT '{"like": 0, "helpful": 0}'::jsonb,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_posts_neighborhood ON posts(neighborhood_id, created_at DESC);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  max_attendees INTEGER,
  rsvp_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event RSVPs
CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Proposals
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'voting', 'passed', 'failed', 'withdrawn')),
  voting_ends_at TIMESTAMPTZ,
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  votes_abstain INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('for', 'against', 'abstain')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proposal_id, user_id)
);

-- Group orders
CREATE TABLE IF NOT EXISTS group_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  vendor TEXT NOT NULL,
  total_cost DECIMAL(10,2) DEFAULT 0,
  deadline TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'fulfilled', 'cancelled')),
  participant_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  neighborhood_id UUID REFERENCES neighborhoods(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'community', 'hoa')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhood_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users manage own profile" ON user_profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Members can view neighborhood posts" ON posts FOR SELECT
  USING (neighborhood_id IN (SELECT neighborhood_id FROM neighborhood_members WHERE user_id = auth.uid()));
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Members can view neighborhood events" ON events FOR SELECT
  USING (neighborhood_id IN (SELECT neighborhood_id FROM neighborhood_members WHERE user_id = auth.uid()));
CREATE POLICY "Members can create events" ON events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own RSVPs" ON event_rsvps FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view RSVPs" ON event_rsvps FOR SELECT USING (true);

CREATE POLICY "Members can view proposals" ON proposals FOR SELECT
  USING (neighborhood_id IN (SELECT neighborhood_id FROM neighborhood_members WHERE user_id = auth.uid()));
CREATE POLICY "Members can create proposals" ON proposals FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own votes" ON votes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view votes" ON votes FOR SELECT USING (true);

CREATE POLICY "Members can view group orders" ON group_orders FOR SELECT
  USING (neighborhood_id IN (SELECT neighborhood_id FROM neighborhood_members WHERE user_id = auth.uid()));
CREATE POLICY "Members can create orders" ON group_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can view neighborhood members" ON neighborhood_members FOR SELECT USING (true);
CREATE POLICY "Users can join neighborhoods" ON neighborhood_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own subscription" ON subscriptions FOR ALL USING (auth.uid() = user_id);

INSERT INTO neighborhoods (id, name, city, state, zip_code, member_count) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Downtown Demo Neighborhood', 'Austin', 'TX', '78701', 0)
ON CONFLICT (id) DO NOTHING;
