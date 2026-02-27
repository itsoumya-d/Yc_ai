'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Comment } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getComments(storyId: string, chapterId?: string): Promise<ActionResult<Comment[]>> {
  const supabase = await createClient();

  let query = supabase
    .from('comments')
    .select('*')
    .eq('story_id', storyId)
    .order('created_at', { ascending: true });

  if (chapterId) {
    query = query.eq('chapter_id', chapterId);
  } else {
    query = query.is('chapter_id', null);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data: (data ?? []) as Comment[] };
}

export async function getPublicComments(storyId: string): Promise<ActionResult<Comment[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('story_id', storyId)
    .order('created_at', { ascending: true });

  if (error) return { error: error.message };
  return { data: (data ?? []) as Comment[] };
}

export async function createComment(
  storyId: string,
  content: string,
  chapterId?: string,
  parentId?: string,
): Promise<ActionResult<Comment>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get user display name
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, pen_name')
    .eq('id', user.id)
    .single();

  const authorName = profile?.pen_name || profile?.full_name || user.email?.split('@')[0] || 'Anonymous';

  const { data, error } = await supabase.from('comments').insert({
    story_id: storyId,
    chapter_id: chapterId || null,
    user_id: user.id,
    parent_id: parentId || null,
    content,
    author_name: authorName,
  }).select().single();

  if (error) return { error: error.message };

  revalidatePath(`/read/${storyId}`);
  return { data: data as Comment };
}

export async function deleteComment(id: string, storyId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Only allow deleting own comments
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath(`/read/${storyId}`);
  return {};
}
