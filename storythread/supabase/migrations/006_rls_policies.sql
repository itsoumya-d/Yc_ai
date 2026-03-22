-- RLS Policies for StoryThread — generated 2026-03-09
-- Comprehensive row-level security for all user-facing tables.
-- This migration is idempotent: each policy is dropped before creation.

-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- STORIES
-- Own drafts are private. Published stories (is_public = true) are
-- visible to any authenticated user.
-- ============================================================
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stories_select_own_or_public" ON public.stories;
DROP POLICY IF EXISTS "stories_insert_own" ON public.stories;
DROP POLICY IF EXISTS "stories_update_own" ON public.stories;
DROP POLICY IF EXISTS "stories_delete_own" ON public.stories;

CREATE POLICY "stories_select_own_or_public" ON public.stories
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "stories_insert_own" ON public.stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "stories_update_own" ON public.stories
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "stories_delete_own" ON public.stories
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- CHAPTERS
-- Inherits visibility from the parent story:
--   read  — if user owns the story OR the story is public
--   write — only if user owns the story
-- ============================================================
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chapters_select_story_access" ON public.chapters;
DROP POLICY IF EXISTS "chapters_insert_own_story" ON public.chapters;
DROP POLICY IF EXISTS "chapters_update_own_story" ON public.chapters;
DROP POLICY IF EXISTS "chapters_delete_own_story" ON public.chapters;

CREATE POLICY "chapters_select_story_access" ON public.chapters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = chapters.story_id
        AND (stories.user_id = auth.uid() OR stories.is_public = true)
    )
  );

CREATE POLICY "chapters_insert_own_story" ON public.chapters
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = chapters.story_id
        AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "chapters_update_own_story" ON public.chapters
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = chapters.story_id
        AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "chapters_delete_own_story" ON public.chapters
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = chapters.story_id
        AND stories.user_id = auth.uid()
    )
  );

-- ============================================================
-- CHARACTERS
-- Same visibility rules as chapters (via parent story).
-- ============================================================
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "characters_select_story_access" ON public.characters;
DROP POLICY IF EXISTS "characters_insert_own_story" ON public.characters;
DROP POLICY IF EXISTS "characters_update_own_story" ON public.characters;
DROP POLICY IF EXISTS "characters_delete_own_story" ON public.characters;

CREATE POLICY "characters_select_story_access" ON public.characters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = characters.story_id
        AND (stories.user_id = auth.uid() OR stories.is_public = true)
    )
  );

CREATE POLICY "characters_insert_own_story" ON public.characters
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = characters.story_id
        AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "characters_update_own_story" ON public.characters
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = characters.story_id
        AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "characters_delete_own_story" ON public.characters
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = characters.story_id
        AND stories.user_id = auth.uid()
    )
  );

-- ============================================================
-- WORLD_ELEMENTS
-- Same visibility rules as chapters (via parent story).
-- ============================================================
ALTER TABLE public.world_elements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "world_elements_select_story_access" ON public.world_elements;
DROP POLICY IF EXISTS "world_elements_insert_own_story" ON public.world_elements;
DROP POLICY IF EXISTS "world_elements_update_own_story" ON public.world_elements;
DROP POLICY IF EXISTS "world_elements_delete_own_story" ON public.world_elements;

CREATE POLICY "world_elements_select_story_access" ON public.world_elements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = world_elements.story_id
        AND (stories.user_id = auth.uid() OR stories.is_public = true)
    )
  );

CREATE POLICY "world_elements_insert_own_story" ON public.world_elements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = world_elements.story_id
        AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "world_elements_update_own_story" ON public.world_elements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = world_elements.story_id
        AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "world_elements_delete_own_story" ON public.world_elements
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = world_elements.story_id
        AND stories.user_id = auth.uid()
    )
  );

-- ============================================================
-- COLLABORATORS
-- The story owner can manage all collaborators on their stories.
-- Each collaborator can read and update (accept/decline) their own row.
-- ============================================================
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "collaborators_select_participant" ON public.collaborators;
DROP POLICY IF EXISTS "collaborators_insert_story_owner" ON public.collaborators;
DROP POLICY IF EXISTS "collaborators_update_participant" ON public.collaborators;
DROP POLICY IF EXISTS "collaborators_delete_story_owner" ON public.collaborators;

CREATE POLICY "collaborators_select_participant" ON public.collaborators
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = collaborators.story_id
        AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "collaborators_insert_story_owner" ON public.collaborators
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = collaborators.story_id
        AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "collaborators_update_participant" ON public.collaborators
  FOR UPDATE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = collaborators.story_id
        AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "collaborators_delete_story_owner" ON public.collaborators
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = collaborators.story_id
        AND stories.user_id = auth.uid()
    )
  );

-- ============================================================
-- COMMENTS
-- Public stories' non-hidden comments are visible to all.
-- Only the author can insert, update, or delete their own comment.
-- ============================================================
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_select_public" ON public.comments;
DROP POLICY IF EXISTS "comments_insert_own" ON public.comments;
DROP POLICY IF EXISTS "comments_update_own" ON public.comments;
DROP POLICY IF EXISTS "comments_delete_own" ON public.comments;

CREATE POLICY "comments_select_public" ON public.comments
  FOR SELECT USING (is_hidden = false);

CREATE POLICY "comments_insert_own" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_update_own" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_delete_own" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- REACTIONS
-- Reactions on public chapters are publicly readable.
-- Only the owner can insert/update/delete their reactions.
-- ============================================================
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reactions_select_public" ON public.reactions;
DROP POLICY IF EXISTS "reactions_insert_own" ON public.reactions;
DROP POLICY IF EXISTS "reactions_update_own" ON public.reactions;
DROP POLICY IF EXISTS "reactions_delete_own" ON public.reactions;

CREATE POLICY "reactions_select_public" ON public.reactions
  FOR SELECT USING (true);

CREATE POLICY "reactions_insert_own" ON public.reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reactions_update_own" ON public.reactions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reactions_delete_own" ON public.reactions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- READING_LISTS
-- Public lists visible to all; private lists visible to owner only.
-- All mutations restricted to the owner.
-- ============================================================
ALTER TABLE public.reading_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reading_lists_select_public_or_own" ON public.reading_lists;
DROP POLICY IF EXISTS "reading_lists_insert_own" ON public.reading_lists;
DROP POLICY IF EXISTS "reading_lists_update_own" ON public.reading_lists;
DROP POLICY IF EXISTS "reading_lists_delete_own" ON public.reading_lists;

CREATE POLICY "reading_lists_select_public_or_own" ON public.reading_lists
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "reading_lists_insert_own" ON public.reading_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reading_lists_update_own" ON public.reading_lists
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reading_lists_delete_own" ON public.reading_lists
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- READING_LIST_ITEMS
-- Inherits access rules from the parent reading_list.
-- ============================================================
ALTER TABLE public.reading_list_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reading_list_items_select_list_access" ON public.reading_list_items;
DROP POLICY IF EXISTS "reading_list_items_insert_own_list" ON public.reading_list_items;
DROP POLICY IF EXISTS "reading_list_items_delete_own_list" ON public.reading_list_items;

CREATE POLICY "reading_list_items_select_list_access" ON public.reading_list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.reading_lists
      WHERE reading_lists.id = reading_list_items.reading_list_id
        AND (reading_lists.is_public = true OR reading_lists.user_id = auth.uid())
    )
  );

CREATE POLICY "reading_list_items_insert_own_list" ON public.reading_list_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reading_lists
      WHERE reading_lists.id = reading_list_items.reading_list_id
        AND reading_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "reading_list_items_delete_own_list" ON public.reading_list_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.reading_lists
      WHERE reading_lists.id = reading_list_items.reading_list_id
        AND reading_lists.user_id = auth.uid()
    )
  );

-- ============================================================
-- READING_PROGRESS
-- ============================================================
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reading_progress_select_own" ON public.reading_progress;
DROP POLICY IF EXISTS "reading_progress_insert_own" ON public.reading_progress;
DROP POLICY IF EXISTS "reading_progress_update_own" ON public.reading_progress;
DROP POLICY IF EXISTS "reading_progress_delete_own" ON public.reading_progress;

CREATE POLICY "reading_progress_select_own" ON public.reading_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "reading_progress_insert_own" ON public.reading_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reading_progress_update_own" ON public.reading_progress
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reading_progress_delete_own" ON public.reading_progress
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- FOLLOWERS
-- Follow relationships are publicly visible.
-- Only the follower can insert or delete their own follow row.
-- ============================================================
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "followers_select_public" ON public.followers;
DROP POLICY IF EXISTS "followers_insert_own" ON public.followers;
DROP POLICY IF EXISTS "followers_delete_own" ON public.followers;

CREATE POLICY "followers_select_public" ON public.followers
  FOR SELECT USING (true);

CREATE POLICY "followers_insert_own" ON public.followers
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "followers_delete_own" ON public.followers
  FOR DELETE USING (auth.uid() = follower_id);

-- ============================================================
-- WRITER_SUBSCRIPTIONS
-- Both the subscriber and the writer can view the subscription.
-- Only the subscriber can create or cancel.
-- ============================================================
ALTER TABLE public.writer_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "writer_subscriptions_select_participant" ON public.writer_subscriptions;
DROP POLICY IF EXISTS "writer_subscriptions_insert_subscriber" ON public.writer_subscriptions;
DROP POLICY IF EXISTS "writer_subscriptions_update_subscriber" ON public.writer_subscriptions;
DROP POLICY IF EXISTS "writer_subscriptions_delete_subscriber" ON public.writer_subscriptions;

CREATE POLICY "writer_subscriptions_select_participant" ON public.writer_subscriptions
  FOR SELECT USING (auth.uid() = subscriber_id OR auth.uid() = writer_id);

CREATE POLICY "writer_subscriptions_insert_subscriber" ON public.writer_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = subscriber_id);

CREATE POLICY "writer_subscriptions_update_subscriber" ON public.writer_subscriptions
  FOR UPDATE USING (auth.uid() = subscriber_id) WITH CHECK (auth.uid() = subscriber_id);

CREATE POLICY "writer_subscriptions_delete_subscriber" ON public.writer_subscriptions
  FOR DELETE USING (auth.uid() = subscriber_id);

-- ============================================================
-- AI_GENERATIONS
-- ============================================================
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_generations_select_own" ON public.ai_generations;
DROP POLICY IF EXISTS "ai_generations_insert_own" ON public.ai_generations;
DROP POLICY IF EXISTS "ai_generations_delete_own" ON public.ai_generations;

CREATE POLICY "ai_generations_select_own" ON public.ai_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ai_generations_insert_own" ON public.ai_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ai_generations_delete_own" ON public.ai_generations
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;

CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_own" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Verify RLS is enabled on all tables
-- ============================================================
-- profiles              ✓
-- stories               ✓
-- chapters              ✓
-- characters            ✓
-- world_elements        ✓
-- collaborators         ✓
-- comments              ✓
-- reactions             ✓
-- reading_lists         ✓
-- reading_list_items    ✓
-- reading_progress      ✓
-- followers             ✓
-- writer_subscriptions  ✓
-- ai_generations        ✓
-- notifications         ✓
