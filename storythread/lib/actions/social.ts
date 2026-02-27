'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  CommentWithAuthor,
  ReactionCounts,
  ReactionType,
  PublicStoryCard,
  PublicAuthor,
} from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

// ─────────────────────────────────────────────
// Discovery Feed
// ─────────────────────────────────────────────

export async function getDiscoveryStories(opts?: {
  genre?: string;
  search?: string;
  sortBy?: 'latest' | 'popular' | 'trending';
  limit?: number;
  offset?: number;
}): Promise<ActionResult<{ stories: PublicStoryCard[]; total: number }>> {
  const supabase = await createClient();

  const genre = opts?.genre;
  const search = opts?.search;
  const sortBy = opts?.sortBy ?? 'latest';
  const limit = opts?.limit ?? 20;
  const offset = opts?.offset ?? 0;

  let query = supabase
    .from('stories')
    .select('*, users!inner(full_name, pen_name)', { count: 'exact' })
    .eq('status', 'published');

  if (genre && genre !== 'all') {
    query = query.eq('genre', genre);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (sortBy === 'latest') {
    query = query.order('updated_at', { ascending: false });
  } else {
    // For popular/trending, order by word count as proxy
    query = query.order('total_word_count', { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) return { error: error.message };

  const stories: PublicStoryCard[] = (data ?? []).map((s: any) => ({
    id: s.id,
    user_id: s.user_id,
    title: s.title,
    description: s.description,
    genre: s.genre,
    status: s.status,
    cover_url: s.cover_url,
    tags: s.tags ?? [],
    total_word_count: s.total_word_count,
    chapter_count: s.chapter_count,
    created_at: s.created_at,
    updated_at: s.updated_at,
    author_name: s.users?.full_name ?? null,
    author_pen_name: s.users?.pen_name ?? null,
    reaction_count: 0,
    comment_count: 0,
  }));

  return { data: { stories, total: count ?? 0 } };
}

// ─────────────────────────────────────────────
// Comments
// ─────────────────────────────────────────────

export async function getComments(storyId: string): Promise<ActionResult<CommentWithAuthor[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('story_comments')
    .select('*, users!inner(full_name, pen_name)')
    .eq('story_id', storyId)
    .is('parent_id', null)
    .order('created_at', { ascending: true });

  if (error) return { error: error.message };

  const topLevel: CommentWithAuthor[] = (data ?? []).map((c: any) => ({
    id: c.id,
    story_id: c.story_id,
    chapter_id: c.chapter_id,
    user_id: c.user_id,
    parent_id: c.parent_id,
    content: c.content,
    created_at: c.created_at,
    updated_at: c.updated_at,
    author_name: c.users?.full_name ?? null,
    author_pen_name: c.users?.pen_name ?? null,
    replies: [],
  }));

  // Fetch replies
  const { data: replyData } = await supabase
    .from('story_comments')
    .select('*, users!inner(full_name, pen_name)')
    .eq('story_id', storyId)
    .not('parent_id', 'is', null)
    .order('created_at', { ascending: true });

  const replies: CommentWithAuthor[] = (replyData ?? []).map((c: any) => ({
    id: c.id,
    story_id: c.story_id,
    chapter_id: c.chapter_id,
    user_id: c.user_id,
    parent_id: c.parent_id,
    content: c.content,
    created_at: c.created_at,
    updated_at: c.updated_at,
    author_name: c.users?.full_name ?? null,
    author_pen_name: c.users?.pen_name ?? null,
  }));

  // Attach replies to parents
  const replyMap: Record<string, CommentWithAuthor[]> = {};
  for (const r of replies) {
    if (r.parent_id) {
      if (!replyMap[r.parent_id]) replyMap[r.parent_id] = [];
      replyMap[r.parent_id].push(r);
    }
  }

  for (const c of topLevel) {
    c.replies = replyMap[c.id] ?? [];
  }

  return { data: topLevel };
}

export async function addComment(
  storyId: string,
  content: string,
  parentId?: string,
  chapterId?: string
): Promise<ActionResult<CommentWithAuthor>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('story_comments')
    .insert({
      story_id: storyId,
      user_id: user.id,
      content,
      parent_id: parentId ?? null,
      chapter_id: chapterId ?? null,
    })
    .select('*, users!inner(full_name, pen_name)')
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/read/${storyId}`);

  const comment: CommentWithAuthor = {
    id: data.id,
    story_id: data.story_id,
    chapter_id: data.chapter_id,
    user_id: data.user_id,
    parent_id: data.parent_id,
    content: data.content,
    created_at: data.created_at,
    updated_at: data.updated_at,
    author_name: (data as any).users?.full_name ?? null,
    author_pen_name: (data as any).users?.pen_name ?? null,
    replies: [],
  };

  return { data: comment };
}

export async function deleteComment(commentId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('story_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  return {};
}

// ─────────────────────────────────────────────
// Reactions
// ─────────────────────────────────────────────

export async function getReactions(storyId: string): Promise<ActionResult<ReactionCounts>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('story_reactions')
    .select('reaction_type, user_id')
    .eq('story_id', storyId);

  if (error) return { error: error.message };

  const counts: ReactionCounts = {
    like: 0, love: 0, fire: 0, mind_blown: 0, sad: 0,
    userReaction: null,
  };

  for (const r of (data ?? [])) {
    if (r.reaction_type in counts) {
      (counts as any)[r.reaction_type]++;
    }
    if (user && r.user_id === user.id) {
      counts.userReaction = r.reaction_type as ReactionType;
    }
  }

  return { data: counts };
}

export async function toggleReaction(
  storyId: string,
  reactionType: ReactionType
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Check if user already reacted
  const { data: existing } = await supabase
    .from('story_reactions')
    .select('id, reaction_type')
    .eq('story_id', storyId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    if (existing.reaction_type === reactionType) {
      // Remove reaction
      await supabase.from('story_reactions').delete().eq('id', existing.id);
    } else {
      // Change reaction
      await supabase
        .from('story_reactions')
        .update({ reaction_type: reactionType })
        .eq('id', existing.id);
    }
  } else {
    // Add reaction
    await supabase.from('story_reactions').insert({
      story_id: storyId,
      user_id: user.id,
      reaction_type: reactionType,
    });
  }

  revalidatePath(`/read/${storyId}`);
  return {};
}

// ─────────────────────────────────────────────
// Follow / Unfollow Authors
// ─────────────────────────────────────────────

export async function followAuthor(authorId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  if (user.id === authorId) return { error: 'Cannot follow yourself' };

  const { error } = await supabase
    .from('story_follows')
    .upsert({ follower_id: user.id, author_id: authorId }, { onConflict: 'follower_id,author_id' });

  if (error) return { error: error.message };
  return {};
}

export async function unfollowAuthor(authorId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('story_follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('author_id', authorId);

  if (error) return { error: error.message };
  return {};
}

export async function isFollowingAuthor(authorId: string): Promise<ActionResult<boolean>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: false };

  const { data } = await supabase
    .from('story_follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('author_id', authorId)
    .single();

  return { data: !!data };
}

export async function getAuthorProfile(authorId: string): Promise<ActionResult<PublicAuthor>> {
  const supabase = await createClient();

  const [userRes, storiesRes, followRes] = await Promise.all([
    supabase.from('users').select('id, full_name, pen_name, bio, avatar_url').eq('id', authorId).single(),
    supabase.from('stories').select('total_word_count').eq('user_id', authorId).eq('status', 'published'),
    supabase.from('story_follows').select('id', { count: 'exact' }).eq('author_id', authorId),
  ]);

  if (userRes.error || !userRes.data) return { error: 'Author not found' };

  const stories = storiesRes.data ?? [];
  const totalWordCount = stories.reduce((sum: number, s: any) => sum + (s.total_word_count ?? 0), 0);

  return {
    data: {
      id: userRes.data.id,
      full_name: userRes.data.full_name,
      pen_name: userRes.data.pen_name,
      bio: userRes.data.bio,
      avatar_url: userRes.data.avatar_url,
      story_count: stories.length,
      total_word_count: totalWordCount,
      follower_count: (followRes as any).count ?? 0,
    },
  };
}

// ─────────────────────────────────────────────
// Writing Analytics
// ─────────────────────────────────────────────

export async function getWeeklyWordCount(): Promise<ActionResult<number>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: 0 };

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('chapters')
    .select('word_count, updated_at, story_id')
    .eq('stories.user_id', user.id)
    .gte('updated_at', sevenDaysAgo.toISOString());

  // Fallback: query stories and calculate from last 7 days activity
  if (error || !data) {
    // Try via stories table join
    const { data: stories } = await supabase
      .from('stories')
      .select('total_word_count, updated_at')
      .eq('user_id', user.id)
      .gte('updated_at', sevenDaysAgo.toISOString());

    const weeklyTotal = (stories ?? []).reduce((sum, s) => sum + (s.total_word_count || 0), 0);
    return { data: weeklyTotal };
  }

  const weeklyTotal = (data ?? []).reduce((sum, c) => sum + (c.word_count || 0), 0);
  return { data: weeklyTotal };
}

export async function getDailyWordCounts(days = 30): Promise<ActionResult<{ date: string; words: number }[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [] };

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('stories')
    .select('updated_at, total_word_count')
    .eq('user_id', user.id)
    .gte('updated_at', startDate.toISOString())
    .order('updated_at', { ascending: true });

  if (error) return { error: error.message };

  // Group by date
  const byDate: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    byDate[d.toISOString().split('T')[0]] = 0;
  }

  for (const story of (data ?? [])) {
    const date = story.updated_at.split('T')[0];
    if (date in byDate) {
      byDate[date] = (byDate[date] ?? 0) + (story.total_word_count ?? 0);
    }
  }

  const result = Object.entries(byDate).map(([date, words]) => ({ date, words }));
  return { data: result };
}
