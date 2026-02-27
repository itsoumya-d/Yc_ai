-- NeighborDAO: Complete Database Schema
-- Neighborhood coordination platform with group purchasing, resource sharing, voting, treasury

-- ============================================================================
-- Extensions
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- Tables
-- ============================================================================

-- Users (linked to Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT,
  full_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  address_line TEXT,
  address_verified BOOLEAN NOT NULL DEFAULT FALSE,
  auth_provider TEXT NOT NULL DEFAULT 'email',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  notification_preferences JSONB DEFAULT '{"in_app": true, "email": true, "sms": false}',
  privacy_settings JSONB DEFAULT '{"profile_visibility": "neighbors", "show_on_map": true, "show_in_directory": true, "allow_dms": true}',
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Neighborhoods
CREATE TABLE neighborhoods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  center_lat NUMERIC(10,7),
  center_lng NUMERIC(10,7),
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT NOT NULL DEFAULT 'US',
  member_count INTEGER NOT NULL DEFAULT 0,
  household_count INTEGER NOT NULL DEFAULT 0,
  max_households INTEGER NOT NULL DEFAULT 500,
  settings JSONB DEFAULT '{"quorum_percent": 50, "expense_approval_threshold": 500}',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  cover_image_url TEXT,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Neighborhood Members
CREATE TABLE neighborhood_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'active',
  household_address TEXT,
  household_lat NUMERIC(10,7),
  household_lng NUMERIC(10,7),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (neighborhood_id, user_id),
  CONSTRAINT member_role_check CHECK (role IN ('admin', 'moderator', 'treasurer', 'member')),
  CONSTRAINT member_status_check CHECK (status IN ('pending', 'active', 'suspended', 'left'))
);

-- Posts (community feed + comments via self-ref parent_id)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'general',
  title TEXT,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  comment_count INTEGER NOT NULL DEFAULT 0,
  reaction_count INTEGER NOT NULL DEFAULT 0,
  ai_summary TEXT,
  ai_summary_updated_at TIMESTAMPTZ,
  report_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT post_category_check CHECK (category IN ('general', 'event', 'alert', 'question', 'recommendation', 'lost_found', 'marketplace', 'safety'))
);

-- Post Reactions
CREATE TABLE post_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id, reaction_type),
  CONSTRAINT reaction_type_check CHECK (reaction_type IN ('like', 'helpful', 'thanks'))
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location_name TEXT,
  location_address TEXT,
  location_lat NUMERIC(10,7),
  location_lng NUMERIC(10,7),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  recurrence_rule TEXT,
  max_attendees INTEGER,
  rsvp_count INTEGER NOT NULL DEFAULT 0,
  contributions JSONB DEFAULT '[]',
  ai_logistics_plan JSONB,
  status TEXT NOT NULL DEFAULT 'upcoming',
  post_event_survey_url TEXT,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT event_status_check CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled'))
);

-- Event RSVPs
CREATE TABLE event_rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'going',
  contribution TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_id),
  CONSTRAINT rsvp_status_check CHECK (status IN ('going', 'maybe', 'not_going'))
);

-- Group Orders
CREATE TABLE group_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  vendor_name TEXT NOT NULL,
  vendor_contact TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  min_participants INTEGER NOT NULL DEFAULT 1,
  max_participants INTEGER,
  current_participants INTEGER NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  estimated_savings_percent NUMERIC(5,2),
  deadline TIMESTAMPTZ NOT NULL,
  estimated_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  ai_suggestion TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT order_status_check CHECK (status IN ('open', 'locked', 'ordered', 'delivered', 'completed', 'cancelled')),
  CONSTRAINT payment_status_check CHECK (payment_status IN ('pending', 'collecting', 'collected', 'refunded'))
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_order_id UUID NOT NULL REFERENCES group_orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  delivery_share NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT item_payment_status_check CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'failed'))
);

-- Resources
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'tools',
  condition TEXT DEFAULT 'good',
  photo_urls TEXT[] DEFAULT '{}',
  deposit_amount NUMERIC(10,2) DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT TRUE,
  daily_rate NUMERIC(10,2) DEFAULT 0,
  availability_schedule JSONB DEFAULT '{}',
  seasonal_availability JSONB,
  location_lat NUMERIC(10,7),
  location_lng NUMERIC(10,7),
  is_community_owned BOOLEAN NOT NULL DEFAULT FALSE,
  booking_count INTEGER NOT NULL DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available',
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT resource_category_check CHECK (category IN ('tools', 'equipment', 'spaces', 'vehicles', 'electronics', 'other')),
  CONSTRAINT resource_condition_check CHECK (condition IN ('excellent', 'good', 'fair', 'needs_repair')),
  CONSTRAINT resource_status_check CHECK (status IN ('available', 'booked', 'unavailable', 'maintenance', 'retired'))
);

-- Resource Bookings
CREATE TABLE resource_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  borrower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  deposit_paid BOOLEAN NOT NULL DEFAULT FALSE,
  deposit_refunded BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  return_condition TEXT,
  return_notes TEXT,
  rating INTEGER,
  review_text TEXT,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT booking_status_check CHECK (status IN ('pending', 'approved', 'active', 'returned', 'overdue', 'cancelled', 'disputed')),
  CONSTRAINT booking_rating_check CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT booking_time_check CHECK (ends_at > starts_at)
);

-- Votes
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  proposed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  voting_method TEXT NOT NULL DEFAULT 'simple_majority',
  quorum_percent INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'active',
  deadline TIMESTAMPTZ NOT NULL,
  total_eligible_voters INTEGER NOT NULL DEFAULT 0,
  total_votes_cast INTEGER NOT NULL DEFAULT 0,
  result JSONB,
  ai_impact_summary TEXT,
  linked_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  linked_treasury_entry_id UUID,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  closed_at TIMESTAMPTZ,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT vote_method_check CHECK (voting_method IN ('simple_majority', 'ranked_choice', 'approval')),
  CONSTRAINT vote_status_check CHECK (status IN ('draft', 'active', 'closed_passed', 'closed_failed', 'closed_no_quorum', 'cancelled'))
);

-- Vote Options
CREATE TABLE vote_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vote_id UUID NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  vote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vote Responses
CREATE TABLE vote_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vote_id UUID NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES vote_options(id) ON DELETE CASCADE,
  ranked_choices JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (vote_id, user_id)
);

-- Treasury Entries
CREATE TABLE treasury_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  receipt_url TEXT,
  related_vote_id UUID REFERENCES votes(id) ON DELETE SET NULL,
  related_order_id UUID REFERENCES group_orders(id) ON DELETE SET NULL,
  related_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  balance_after NUMERIC(10,2),
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT entry_type_check CHECK (entry_type IN ('income', 'expense')),
  CONSTRAINT treasury_category_check CHECK (category IN ('dues', 'group_purchase', 'event', 'maintenance', 'donation', 'general', 'refund'))
);

-- Service Providers
CREATE TABLE service_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  business_name TEXT,
  category TEXT NOT NULL,
  description TEXT,
  phone TEXT,
  email TEXT,
  website_url TEXT,
  service_area TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  is_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  claimed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  review_summary JSONB DEFAULT '{}',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT provider_category_check CHECK (category IN ('plumber', 'electrician', 'landscaper', 'handyman', 'cleaner', 'painter', 'roofer', 'hvac', 'pest_control', 'other'))
);

-- Provider Reviews
CREATE TABLE provider_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  quality_rating INTEGER,
  price_rating INTEGER,
  reliability_rating INTEGER,
  communication_rating INTEGER,
  review_text TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  project_description TEXT,
  project_cost NUMERIC(10,2),
  provider_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider_id, user_id),
  CONSTRAINT review_rating_check CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT sub_rating_check CHECK (
    (quality_rating IS NULL OR (quality_rating >= 1 AND quality_rating <= 5)) AND
    (price_rating IS NULL OR (price_rating >= 1 AND price_rating <= 5)) AND
    (reliability_rating IS NULL OR (reliability_rating >= 1 AND reliability_rating <= 5)) AND
    (communication_rating IS NULL OR (communication_rating >= 1 AND communication_rating <= 5))
  )
);

-- Subscriptions (per neighborhood)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  member_limit INTEGER NOT NULL DEFAULT 50,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (neighborhood_id),
  CONSTRAINT sub_plan_check CHECK (plan IN ('free', 'community', 'hoa')),
  CONSTRAINT sub_status_check CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing'))
);

-- Audit Log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_search_vector ON users USING GIN(search_vector);
CREATE INDEX idx_users_skills ON users USING GIN(skills);

-- Neighborhoods
CREATE INDEX idx_neighborhoods_slug ON neighborhoods(slug);
CREATE INDEX idx_neighborhoods_search_vector ON neighborhoods USING GIN(search_vector);

-- Neighborhood Members
CREATE INDEX idx_nm_neighborhood_id ON neighborhood_members(neighborhood_id);
CREATE INDEX idx_nm_user_id ON neighborhood_members(user_id);
CREATE INDEX idx_nm_role ON neighborhood_members(role);
CREATE INDEX idx_nm_status ON neighborhood_members(status);

-- Posts
CREATE INDEX idx_posts_neighborhood_id ON posts(neighborhood_id);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_parent_id ON posts(parent_id);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_pinned ON posts(neighborhood_id, is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX idx_posts_search_vector ON posts USING GIN(search_vector);
CREATE INDEX idx_posts_metadata ON posts USING GIN(metadata);

-- Post Reactions
CREATE INDEX idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX idx_post_reactions_user_id ON post_reactions(user_id);

-- Events
CREATE INDEX idx_events_neighborhood_id ON events(neighborhood_id);
CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_starts_at ON events(starts_at);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_search_vector ON events USING GIN(search_vector);

-- Event RSVPs
CREATE INDEX idx_event_rsvps_event_id ON event_rsvps(event_id);
CREATE INDEX idx_event_rsvps_user_id ON event_rsvps(user_id);

-- Group Orders
CREATE INDEX idx_group_orders_neighborhood_id ON group_orders(neighborhood_id);
CREATE INDEX idx_group_orders_organizer_id ON group_orders(organizer_id);
CREATE INDEX idx_group_orders_status ON group_orders(status);
CREATE INDEX idx_group_orders_deadline ON group_orders(deadline);
CREATE INDEX idx_group_orders_search_vector ON group_orders USING GIN(search_vector);

-- Order Items
CREATE INDEX idx_order_items_order_id ON order_items(group_order_id);
CREATE INDEX idx_order_items_user_id ON order_items(user_id);
CREATE INDEX idx_order_items_payment ON order_items(payment_status);

-- Resources
CREATE INDEX idx_resources_neighborhood_id ON resources(neighborhood_id);
CREATE INDEX idx_resources_owner_id ON resources(owner_id);
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_search_vector ON resources USING GIN(search_vector);

-- Resource Bookings
CREATE INDEX idx_bookings_resource_id ON resource_bookings(resource_id);
CREATE INDEX idx_bookings_borrower_id ON resource_bookings(borrower_id);
CREATE INDEX idx_bookings_status ON resource_bookings(status);
CREATE INDEX idx_bookings_dates ON resource_bookings(starts_at, ends_at);

-- Votes
CREATE INDEX idx_votes_neighborhood_id ON votes(neighborhood_id);
CREATE INDEX idx_votes_status ON votes(status);
CREATE INDEX idx_votes_deadline ON votes(deadline);
CREATE INDEX idx_votes_search_vector ON votes USING GIN(search_vector);

-- Vote Options & Responses
CREATE INDEX idx_vote_options_vote_id ON vote_options(vote_id);
CREATE INDEX idx_vote_responses_vote_id ON vote_responses(vote_id);
CREATE INDEX idx_vote_responses_user_id ON vote_responses(user_id);

-- Treasury
CREATE INDEX idx_treasury_neighborhood_id ON treasury_entries(neighborhood_id);
CREATE INDEX idx_treasury_type ON treasury_entries(entry_type);
CREATE INDEX idx_treasury_category ON treasury_entries(category);
CREATE INDEX idx_treasury_created_at ON treasury_entries(created_at DESC);

-- Service Providers
CREATE INDEX idx_providers_neighborhood_id ON service_providers(neighborhood_id);
CREATE INDEX idx_providers_category ON service_providers(category);
CREATE INDEX idx_providers_rating ON service_providers(average_rating DESC);
CREATE INDEX idx_providers_search_vector ON service_providers USING GIN(search_vector);

-- Provider Reviews
CREATE INDEX idx_provider_reviews_provider_id ON provider_reviews(provider_id);
CREATE INDEX idx_provider_reviews_user_id ON provider_reviews(user_id);

-- Subscriptions
CREATE INDEX idx_subscriptions_neighborhood_id ON subscriptions(neighborhood_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Audit Log
CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_record ON audit_log(record_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhood_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper function: check neighborhood membership (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION is_neighborhood_member(n_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM neighborhood_members
    WHERE neighborhood_id = n_id AND user_id = auth.uid() AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Users
CREATE POLICY "Users can view neighbors" ON users
  FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Neighborhoods
CREATE POLICY "Neighborhoods are publicly viewable" ON neighborhoods
  FOR SELECT USING (TRUE);

-- Neighborhood Members
CREATE POLICY "Members can view neighborhood members" ON neighborhood_members
  FOR SELECT USING (is_neighborhood_member(neighborhood_id));
CREATE POLICY "Users can manage own membership" ON neighborhood_members
  FOR ALL USING (auth.uid() = user_id);

-- Posts
CREATE POLICY "Members can view neighborhood posts" ON posts
  FOR SELECT USING (is_neighborhood_member(neighborhood_id) AND is_hidden = FALSE);
CREATE POLICY "Members can create posts" ON posts
  FOR INSERT WITH CHECK (is_neighborhood_member(neighborhood_id) AND auth.uid() = author_id);
CREATE POLICY "Authors can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = author_id);

-- Post Reactions
CREATE POLICY "Members can manage reactions" ON post_reactions
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Reactions are viewable" ON post_reactions
  FOR SELECT USING (TRUE);

-- Events
CREATE POLICY "Members can view events" ON events
  FOR SELECT USING (is_neighborhood_member(neighborhood_id));
CREATE POLICY "Members can create events" ON events
  FOR INSERT WITH CHECK (is_neighborhood_member(neighborhood_id) AND auth.uid() = organizer_id);
CREATE POLICY "Organizers can update events" ON events
  FOR UPDATE USING (auth.uid() = organizer_id);

-- Event RSVPs
CREATE POLICY "Members can view RSVPs" ON event_rsvps
  FOR SELECT USING (TRUE);
CREATE POLICY "Users can manage own RSVPs" ON event_rsvps
  FOR ALL USING (auth.uid() = user_id);

-- Group Orders
CREATE POLICY "Members can view orders" ON group_orders
  FOR SELECT USING (is_neighborhood_member(neighborhood_id));
CREATE POLICY "Members can create orders" ON group_orders
  FOR INSERT WITH CHECK (is_neighborhood_member(neighborhood_id));
CREATE POLICY "Organizers can update orders" ON group_orders
  FOR UPDATE USING (auth.uid() = organizer_id);

-- Order Items
CREATE POLICY "Members can view order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM group_orders WHERE group_orders.id = order_items.group_order_id AND is_neighborhood_member(group_orders.neighborhood_id))
  );
CREATE POLICY "Users can manage own items" ON order_items
  FOR ALL USING (auth.uid() = user_id);

-- Resources
CREATE POLICY "Members can view resources" ON resources
  FOR SELECT USING (is_neighborhood_member(neighborhood_id));
CREATE POLICY "Members can create resources" ON resources
  FOR INSERT WITH CHECK (is_neighborhood_member(neighborhood_id) AND auth.uid() = owner_id);
CREATE POLICY "Owners can manage resources" ON resources
  FOR UPDATE USING (auth.uid() = owner_id);

-- Resource Bookings
CREATE POLICY "Participants can view bookings" ON resource_bookings
  FOR SELECT USING (
    auth.uid() = borrower_id OR
    EXISTS (SELECT 1 FROM resources WHERE resources.id = resource_bookings.resource_id AND resources.owner_id = auth.uid())
  );
CREATE POLICY "Members can create bookings" ON resource_bookings
  FOR INSERT WITH CHECK (auth.uid() = borrower_id);
CREATE POLICY "Participants can update bookings" ON resource_bookings
  FOR UPDATE USING (
    auth.uid() = borrower_id OR
    EXISTS (SELECT 1 FROM resources WHERE resources.id = resource_bookings.resource_id AND resources.owner_id = auth.uid())
  );

-- Votes
CREATE POLICY "Members can view votes" ON votes
  FOR SELECT USING (is_neighborhood_member(neighborhood_id));
CREATE POLICY "Members can create votes" ON votes
  FOR INSERT WITH CHECK (is_neighborhood_member(neighborhood_id));

-- Vote Options
CREATE POLICY "Vote options are viewable by members" ON vote_options
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM votes WHERE votes.id = vote_options.vote_id AND is_neighborhood_member(votes.neighborhood_id))
  );

-- Vote Responses
CREATE POLICY "Users can manage own vote responses" ON vote_responses
  FOR ALL USING (auth.uid() = user_id);

-- Treasury
CREATE POLICY "Members can view treasury" ON treasury_entries
  FOR SELECT USING (is_neighborhood_member(neighborhood_id));

-- Service Providers
CREATE POLICY "Members can view providers" ON service_providers
  FOR SELECT USING (is_neighborhood_member(neighborhood_id) OR neighborhood_id IS NULL);
CREATE POLICY "Members can create providers" ON service_providers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Provider Reviews
CREATE POLICY "Reviews are publicly readable" ON provider_reviews
  FOR SELECT USING (TRUE);
CREATE POLICY "Users can manage own reviews" ON provider_reviews
  FOR ALL USING (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "Members can view neighborhood subscription" ON subscriptions
  FOR SELECT USING (is_neighborhood_member(neighborhood_id));

-- ============================================================================
-- Functions & Triggers
-- ============================================================================

-- Updated At trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_neighborhoods_updated_at BEFORE UPDATE ON neighborhoods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nm_updated_at BEFORE UPDATE ON neighborhood_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_rsvps_updated_at BEFORE UPDATE ON event_rsvps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_group_orders_updated_at BEFORE UPDATE ON group_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON resource_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_votes_updated_at BEFORE UPDATE ON votes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vote_responses_updated_at BEFORE UPDATE ON vote_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_treasury_updated_at BEFORE UPDATE ON treasury_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON service_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON provider_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Full-Text Search Triggers
CREATE OR REPLACE FUNCTION update_users_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.full_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.display_name, '')), 'A') ||
    setweight(to_tsvector('english', array_to_string(COALESCE(NEW.skills, '{}'), ' ')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.bio, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_search BEFORE INSERT OR UPDATE OF full_name, display_name, skills, bio ON users
  FOR EACH ROW EXECUTE FUNCTION update_users_search_vector();

CREATE OR REPLACE FUNCTION update_posts_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_posts_search BEFORE INSERT OR UPDATE OF title, content ON posts
  FOR EACH ROW EXECUTE FUNCTION update_posts_search_vector();

CREATE OR REPLACE FUNCTION update_resources_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_resources_search BEFORE INSERT OR UPDATE OF name, description ON resources
  FOR EACH ROW EXECUTE FUNCTION update_resources_search_vector();

CREATE OR REPLACE FUNCTION update_providers_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.business_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_providers_search BEFORE INSERT OR UPDATE OF name, business_name, description, category ON service_providers
  FOR EACH ROW EXECUTE FUNCTION update_providers_search_vector();

-- Audit Log Trigger (SECURITY DEFINER for proper access)
CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, action, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_treasury AFTER INSERT OR UPDATE OR DELETE ON treasury_entries
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();
CREATE TRIGGER audit_votes AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();
CREATE TRIGGER audit_group_orders AFTER INSERT OR UPDATE OR DELETE ON group_orders
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

-- Auto-create user row on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- Seed Data
-- ============================================================================

-- Sample neighborhood for development (requires a user to exist first — triggered by auth signup)
-- INSERT INTO neighborhoods (name, slug, description, city, state, zip_code, created_by)
-- VALUES ('Oak Hills', 'oak-hills', 'A friendly suburban neighborhood in Oak Hills.', 'Portland', 'OR', '97201',
--   (SELECT id FROM users LIMIT 1));
