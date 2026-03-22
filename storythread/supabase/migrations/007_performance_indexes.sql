-- 007_performance_indexes.sql
-- Performance indexes for common query patterns

-- stories: primary dashboard query (user's stories, ordered by update time)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stories_user_status_created
  ON public.stories (user_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stories_user_updated
  ON public.stories (user_id, updated_at DESC);

-- stories: public discovery queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stories_public_genre_created
  ON public.stories (is_public, genre, created_at DESC)
  WHERE is_public = true;

-- chapters: ordered listing within a story
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chapters_story_status_order
  ON public.chapters (story_id, status, order_index);

-- collaborators: finding stories a user collaborates on
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_collaborators_user_status
  ON public.collaborators (user_id, status);

-- comments: listing by story/chapter with recency
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_story_created
  ON public.comments (story_id, created_at DESC)
  WHERE is_hidden = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_chapter_created
  ON public.comments (chapter_id, created_at DESC)
  WHERE chapter_id IS NOT NULL AND is_hidden = false;

-- reading_progress: resume reading lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_progress_user_story
  ON public.reading_progress (user_id, story_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_progress_user_last_read
  ON public.reading_progress (user_id, last_read_at DESC);

-- ai_generations: usage tracking per user/story
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_generations_user_created
  ON public.ai_generations (user_id, created_at DESC);

-- notifications: unread feed (partial index — only unread rows)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read_created
  ON public.notifications (user_id, is_read, created_at DESC);

-- writer_subscriptions: subscription status lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_writer_subs_subscriber_status
  ON public.writer_subscriptions (subscriber_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_writer_subs_writer_status
  ON public.writer_subscriptions (writer_id, status);
