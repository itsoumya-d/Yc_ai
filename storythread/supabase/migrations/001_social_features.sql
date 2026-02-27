-- Social features migration for StoryThread
-- Run this in your Supabase SQL editor

-- Comments on stories
CREATE TABLE IF NOT EXISTS story_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES story_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_story_comments_story_id ON story_comments(story_id);
CREATE INDEX idx_story_comments_parent_id ON story_comments(parent_id);
CREATE INDEX idx_story_comments_user_id ON story_comments(user_id);

-- Reactions on stories
CREATE TABLE IF NOT EXISTS story_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'fire', 'mind_blown', 'sad')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id)
);

CREATE INDEX idx_story_reactions_story_id ON story_reactions(story_id);
CREATE INDEX idx_story_reactions_user_id ON story_reactions(user_id);

-- Author follows
CREATE TABLE IF NOT EXISTS story_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, author_id),
  CHECK (follower_id != author_id)
);

CREATE INDEX idx_story_follows_follower ON story_follows(follower_id);
CREATE INDEX idx_story_follows_author ON story_follows(author_id);

-- Row Level Security
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_follows ENABLE ROW LEVEL SECURITY;

-- Comments: public readable, auth write own
CREATE POLICY "Comments are publicly readable" ON story_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON story_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON story_comments FOR DELETE USING (auth.uid() = user_id);

-- Reactions: public readable, auth write own
CREATE POLICY "Reactions are publicly readable" ON story_reactions FOR SELECT USING (true);
CREATE POLICY "Users can manage own reactions" ON story_reactions FOR ALL USING (auth.uid() = user_id);

-- Follows: public readable, auth write own
CREATE POLICY "Follows are publicly readable" ON story_follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON story_follows FOR ALL USING (auth.uid() = follower_id);

-- Also need to make users table readable for author info
-- (Only if not already done)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Public profiles are viewable by everyone'
  ) THEN
    CREATE POLICY "Public profiles are viewable by everyone" ON users FOR SELECT USING (true);
  END IF;
END $$;
