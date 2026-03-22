-- StoryThread: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- stories: author's stories by status + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stories_user_status_created
  ON stories(user_id, status, created_at DESC);

-- stories: public published stories (discovery feed)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stories_published_created
  ON stories(created_at DESC) WHERE status = 'published';

-- chapters: story's chapters in order
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chapters_story_number
  ON chapters(story_id, chapter_number ASC);

-- comments: story comments by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_story_created
  ON comments(story_id, created_at DESC);

-- reading_progress: user progress per story
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_progress_user_story
  ON reading_progress(user_id, story_id);

-- reactions: story reactions count
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reactions_story
  ON reactions(story_id);

-- notifications: unread notifications per user
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, created_at DESC) WHERE is_read = FALSE;

-- followers: user's followers
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_followers_user
  ON followers(following_id, created_at DESC);

-- ai_generations: user AI usage by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_generations_user_created
  ON ai_generations(user_id, created_at DESC);
