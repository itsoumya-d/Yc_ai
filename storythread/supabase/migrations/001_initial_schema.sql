-- ============================================================
-- StoryThread: Initial Database Schema Migration
-- Generated for Supabase (PostgreSQL)
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- FUNCTION: update_updated_at_column (shared trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '{}',
  auth_provider TEXT NOT NULL DEFAULT 'email',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  role TEXT NOT NULL DEFAULT 'reader',
  is_writer BOOLEAN NOT NULL DEFAULT FALSE,
  total_words_written INTEGER NOT NULL DEFAULT 0,
  follower_count INTEGER NOT NULL DEFAULT 0,
  following_count INTEGER NOT NULL DEFAULT 0,
  reading_preferences JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_role_check CHECK (role IN ('reader', 'writer', 'admin'))
);

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: stories
-- ============================================================
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  genre TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  content_rating TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'draft',
  total_words INTEGER NOT NULL DEFAULT 0,
  chapter_count INTEGER NOT NULL DEFAULT 0,
  published_chapter_count INTEGER NOT NULL DEFAULT 0,
  read_count INTEGER NOT NULL DEFAULT 0,
  subscriber_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  is_collaborative BOOLEAN NOT NULL DEFAULT FALSE,
  ai_genre_settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  search_vector TSVECTOR,
  published_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT story_content_rating_check CHECK (content_rating IN ('general', 'teen', 'mature')),
  CONSTRAINT story_status_check CHECK (status IN ('draft', 'ongoing', 'completed', 'hiatus', 'archived'))
);

CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: chapters
-- ============================================================
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  content_text TEXT,
  chapter_number INTEGER NOT NULL,
  word_count INTEGER NOT NULL DEFAULT 0,
  reading_time_minutes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  author_note TEXT,
  private_notes TEXT,
  is_subscriber_only BOOLEAN NOT NULL DEFAULT FALSE,
  version INTEGER NOT NULL DEFAULT 1,
  version_history JSONB DEFAULT '[]',
  scheduled_publish_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (story_id, slug),
  UNIQUE (story_id, chapter_number),
  CONSTRAINT chapter_status_check CHECK (status IN ('draft', 'review', 'published', 'scheduled', 'archived'))
);

CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: characters
-- ============================================================
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  role TEXT NOT NULL DEFAULT 'supporting',
  appearance TEXT,
  personality TEXT,
  backstory TEXT,
  motivations TEXT,
  speech_patterns TEXT,
  portrait_url TEXT,
  first_appearance_chapter INTEGER,
  relationships JSONB DEFAULT '[]',
  arc_notes JSONB DEFAULT '[]',
  voice_samples JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT character_role_check CHECK (role IN ('protagonist', 'antagonist', 'supporting', 'mentioned'))
);

CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: worlds
-- ============================================================
CREATE TABLE IF NOT EXISTS worlds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT,
  map_image_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_worlds_updated_at
  BEFORE UPDATE ON worlds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: world_elements
-- ============================================================
CREATE TABLE IF NOT EXISTS world_elements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES world_elements(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  element_type TEXT NOT NULL,
  description TEXT,
  details JSONB DEFAULT '{}',
  chapter_appearances INTEGER[] DEFAULT '{}',
  map_coordinates JSONB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT element_type_check CHECK (element_type IN ('location', 'lore', 'rule', 'event', 'item', 'faction'))
);

CREATE TRIGGER update_world_elements_updated_at
  BEFORE UPDATE ON world_elements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: collaborators
-- ============================================================
CREATE TABLE IF NOT EXISTS collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'writer',
  permissions JSONB DEFAULT '{}',
  assigned_chapters INTEGER[] DEFAULT '{}',
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (story_id, user_id),
  CONSTRAINT collaborator_role_check CHECK (role IN ('owner', 'writer', 'editor', 'viewer')),
  CONSTRAINT collaborator_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'removed'))
);

CREATE TRIGGER update_collaborators_updated_at
  BEFORE UPDATE ON collaborators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: comments
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_spoiler BOOLEAN NOT NULL DEFAULT FALSE,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_writer_reply BOOLEAN NOT NULL DEFAULT FALSE,
  upvote_count INTEGER NOT NULL DEFAULT 0,
  report_count INTEGER NOT NULL DEFAULT 0,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: reactions
-- ============================================================
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  paragraph_index INTEGER,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, chapter_id, paragraph_index, reaction_type),
  CONSTRAINT reaction_type_check CHECK (reaction_type IN ('like', 'love', 'surprised', 'sad', 'laughing'))
);

-- ============================================================
-- TABLE: reading_lists
-- ============================================================
CREATE TABLE IF NOT EXISTS reading_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  story_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_reading_lists_updated_at
  BEFORE UPDATE ON reading_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: reading_list_items
-- ============================================================
CREATE TABLE IF NOT EXISTS reading_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reading_list_id UUID NOT NULL REFERENCES reading_lists(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (reading_list_id, story_id)
);

-- ============================================================
-- TABLE: reading_progress
-- ============================================================
CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  last_chapter_number INTEGER NOT NULL DEFAULT 0,
  scroll_position NUMERIC(5,2) DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, story_id)
);

-- ============================================================
-- TABLE: followers
-- ============================================================
CREATE TABLE IF NOT EXISTS followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (follower_id, followed_id),
  CONSTRAINT no_self_follow CHECK (follower_id != followed_id)
);

-- ============================================================
-- TABLE: writer_subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS writer_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  writer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'basic',
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (subscriber_id, writer_id),
  CONSTRAINT writer_sub_status_check CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing'))
);

CREATE TRIGGER update_writer_subs_updated_at
  BEFORE UPDATE ON writer_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: ai_generations
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  input_text TEXT,
  output_text TEXT,
  tone TEXT,
  character_context JSONB DEFAULT '{}',
  model TEXT NOT NULL DEFAULT 'gpt-4o',
  tokens_used INTEGER DEFAULT 0,
  was_accepted BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ai_action_type_check CHECK (action_type IN ('continue', 'suggest_dialogue', 'rephrase', 'describe_scene', 'fix_prose', 'name_generator', 'expand_world', 'plot_outline', 'cover_art'))
);

-- ============================================================
-- TABLE: subscriptions (platform)
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ,
  ai_generations_remaining INTEGER DEFAULT 20,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT platform_plan_check CHECK (plan IN ('free', 'writer_pro', 'writer_unlimited')),
  CONSTRAINT platform_status_check CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing'))
);

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link_url TEXT,
  reference_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT notification_type_check CHECK (type IN ('new_chapter', 'comment', 'follow', 'milestone', 'tip', 'subscription', 'system'))
);

-- ============================================================
-- TABLE: audit_log
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_writer ON users(is_writer) WHERE is_writer = TRUE;
CREATE INDEX idx_users_search_vector ON users USING GIN(search_vector);

-- Stories
CREATE INDEX idx_stories_author_id ON stories(author_id);
CREATE INDEX idx_stories_slug ON stories(slug);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_genre ON stories USING GIN(genre);
CREATE INDEX idx_stories_tags ON stories USING GIN(tags);
CREATE INDEX idx_stories_read_count ON stories(read_count DESC);
CREATE INDEX idx_stories_published_at ON stories(published_at DESC NULLS LAST);
CREATE INDEX idx_stories_content_rating ON stories(content_rating);
CREATE INDEX idx_stories_search_vector ON stories USING GIN(search_vector);

-- Chapters
CREATE INDEX idx_chapters_story_id ON chapters(story_id);
CREATE INDEX idx_chapters_author_id ON chapters(author_id);
CREATE INDEX idx_chapters_status ON chapters(status);
CREATE INDEX idx_chapters_story_number ON chapters(story_id, chapter_number);
CREATE INDEX idx_chapters_published_at ON chapters(published_at DESC NULLS LAST);
CREATE INDEX idx_chapters_search_vector ON chapters USING GIN(search_vector);

-- Characters
CREATE INDEX idx_characters_story_id ON characters(story_id);
CREATE INDEX idx_characters_role ON characters(role);
CREATE INDEX idx_characters_search_vector ON characters USING GIN(search_vector);

-- Worlds
CREATE INDEX idx_worlds_story_id ON worlds(story_id);

-- World Elements
CREATE INDEX idx_world_elements_world_id ON world_elements(world_id);
CREATE INDEX idx_world_elements_parent_id ON world_elements(parent_id);
CREATE INDEX idx_world_elements_type ON world_elements(element_type);
CREATE INDEX idx_world_elements_search_vector ON world_elements USING GIN(search_vector);

-- Collaborators
CREATE INDEX idx_collaborators_story_id ON collaborators(story_id);
CREATE INDEX idx_collaborators_user_id ON collaborators(user_id);
CREATE INDEX idx_collaborators_status ON collaborators(status);

-- Comments
CREATE INDEX idx_comments_story_id ON comments(story_id);
CREATE INDEX idx_comments_chapter_id ON comments(chapter_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Reactions
CREATE INDEX idx_reactions_chapter_id ON reactions(chapter_id);
CREATE INDEX idx_reactions_user_id ON reactions(user_id);
CREATE INDEX idx_reactions_chapter_paragraph ON reactions(chapter_id, paragraph_index);

-- Reading Lists
CREATE INDEX idx_reading_lists_user_id ON reading_lists(user_id);
CREATE INDEX idx_reading_list_items_list_id ON reading_list_items(reading_list_id);
CREATE INDEX idx_reading_list_items_story_id ON reading_list_items(story_id);

-- Reading Progress
CREATE INDEX idx_reading_progress_user_id ON reading_progress(user_id);
CREATE INDEX idx_reading_progress_story_id ON reading_progress(story_id);
CREATE INDEX idx_reading_progress_last_read ON reading_progress(user_id, last_read_at DESC);

-- Followers
CREATE INDEX idx_followers_follower_id ON followers(follower_id);
CREATE INDEX idx_followers_followed_id ON followers(followed_id);

-- Writer Subscriptions
CREATE INDEX idx_writer_subs_subscriber_id ON writer_subscriptions(subscriber_id);
CREATE INDEX idx_writer_subs_writer_id ON writer_subscriptions(writer_id);
CREATE INDEX idx_writer_subs_status ON writer_subscriptions(status);

-- AI Generations
CREATE INDEX idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX idx_ai_generations_story_id ON ai_generations(story_id);
CREATE INDEX idx_ai_generations_created_at ON ai_generations(created_at DESC);

-- Subscriptions
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Audit Log
CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_record ON audit_log(record_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE writer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Users: public profile read, own write
CREATE POLICY "Public profiles are viewable" ON users
  FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Stories: published are public, drafts are author-only
CREATE POLICY "Published stories are public" ON stories
  FOR SELECT USING (status IN ('ongoing', 'completed', 'hiatus') OR author_id = auth.uid());
CREATE POLICY "Authors can manage own stories" ON stories
  FOR ALL USING (author_id = auth.uid());

-- Chapters: published are public, drafts via author/collaborator
CREATE POLICY "Published chapters are public" ON chapters
  FOR SELECT USING (
    status = 'published' OR
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM collaborators WHERE collaborators.story_id = chapters.story_id AND collaborators.user_id = auth.uid() AND collaborators.status = 'accepted')
  );
CREATE POLICY "Authors can manage chapters" ON chapters
  FOR ALL USING (
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM stories WHERE stories.id = chapters.story_id AND stories.author_id = auth.uid())
  );

-- Characters: viewable by story team
CREATE POLICY "Story team can view characters" ON characters
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM stories WHERE stories.id = characters.story_id AND stories.author_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM collaborators WHERE collaborators.story_id = characters.story_id AND collaborators.user_id = auth.uid() AND collaborators.status = 'accepted')
  );
CREATE POLICY "Creators can manage characters" ON characters
  FOR ALL USING (created_by = auth.uid());

-- Worlds: story team
CREATE POLICY "Story team can view worlds" ON worlds
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM stories WHERE stories.id = worlds.story_id AND stories.author_id = auth.uid())
  );
CREATE POLICY "Creators can manage worlds" ON worlds
  FOR ALL USING (created_by = auth.uid());

-- World Elements: via world ownership
CREATE POLICY "World elements readable by story team" ON world_elements
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM worlds JOIN stories ON stories.id = worlds.story_id WHERE worlds.id = world_elements.world_id AND (stories.author_id = auth.uid() OR worlds.created_by = auth.uid()))
  );

-- Comments: public read on published content, own write
CREATE POLICY "Comments are publicly readable" ON comments
  FOR SELECT USING (is_hidden = FALSE);
CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Reactions: public read, own write
CREATE POLICY "Reactions are publicly readable" ON reactions
  FOR SELECT USING (TRUE);
CREATE POLICY "Users can manage own reactions" ON reactions
  FOR ALL USING (auth.uid() = user_id);

-- Reading Lists: public lists readable, own lists manageable
CREATE POLICY "Public reading lists are viewable" ON reading_lists
  FOR SELECT USING (is_public = TRUE OR user_id = auth.uid());
CREATE POLICY "Users can manage own lists" ON reading_lists
  FOR ALL USING (auth.uid() = user_id);

-- Reading List Items: via list ownership
CREATE POLICY "Viewable via list access" ON reading_list_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM reading_lists WHERE reading_lists.id = reading_list_items.reading_list_id AND (reading_lists.is_public = TRUE OR reading_lists.user_id = auth.uid()))
  );
CREATE POLICY "Manageable via list ownership" ON reading_list_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM reading_lists WHERE reading_lists.id = reading_list_items.reading_list_id AND reading_lists.user_id = auth.uid())
  );

-- Reading Progress: own data only
CREATE POLICY "Users can manage own progress" ON reading_progress
  FOR ALL USING (auth.uid() = user_id);

-- Followers: public read, own write
CREATE POLICY "Followers are publicly readable" ON followers
  FOR SELECT USING (TRUE);
CREATE POLICY "Users can manage own follows" ON followers
  FOR ALL USING (auth.uid() = follower_id);

-- Writer Subscriptions: participants can view
CREATE POLICY "Participants can view writer subs" ON writer_subscriptions
  FOR SELECT USING (auth.uid() = subscriber_id OR auth.uid() = writer_id);
CREATE POLICY "Subscribers can manage own subs" ON writer_subscriptions
  FOR ALL USING (auth.uid() = subscriber_id);

-- AI Generations: own data only
CREATE POLICY "Users can manage own AI generations" ON ai_generations
  FOR ALL USING (auth.uid() = user_id);

-- Subscriptions: own data only
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Notifications: own data only
CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- FULL-TEXT SEARCH TRIGGERS
-- ============================================================

-- Users search vector
CREATE OR REPLACE FUNCTION update_users_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.username, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.display_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.bio, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_search_vector
  BEFORE INSERT OR UPDATE OF username, display_name, bio ON users
  FOR EACH ROW EXECUTE FUNCTION update_users_search_vector();

-- Stories search vector
CREATE OR REPLACE FUNCTION update_stories_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(COALESCE(NEW.tags, '{}'), ' ')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stories_search_vector
  BEFORE INSERT OR UPDATE OF title, description, tags ON stories
  FOR EACH ROW EXECUTE FUNCTION update_stories_search_vector();

-- Chapters search vector
CREATE OR REPLACE FUNCTION update_chapters_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content_text, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_chapters_search_vector
  BEFORE INSERT OR UPDATE OF title, content_text ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_chapters_search_vector();

-- Characters search vector
CREATE OR REPLACE FUNCTION update_characters_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.backstory, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_characters_search_vector
  BEFORE INSERT OR UPDATE OF name, backstory ON characters
  FOR EACH ROW EXECUTE FUNCTION update_characters_search_vector();

-- World elements search vector
CREATE OR REPLACE FUNCTION update_world_elements_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_world_elements_search_vector
  BEFORE INSERT OR UPDATE OF name, description ON world_elements
  FOR EACH ROW EXECUTE FUNCTION update_world_elements_search_vector();

-- ============================================================
-- AUDIT LOG TRIGGER
-- ============================================================
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

CREATE TRIGGER audit_stories
  AFTER INSERT OR UPDATE OR DELETE ON stories
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_chapters
  AFTER INSERT OR UPDATE OR DELETE ON chapters
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_writer_subscriptions
  AFTER INSERT OR UPDATE OR DELETE ON writer_subscriptions
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();
