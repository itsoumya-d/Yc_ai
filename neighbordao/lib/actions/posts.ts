'use server';

import { createClient } from '@/lib/supabase/server';
import { postSchema } from '@/lib/validations/schemas';
import type { ActionResult, Post } from '@/types/database';

export async function fetchPosts(
  neighborhoodId: string,
  options?: { category?: string; limit?: number; offset?: number }
): Promise<ActionResult<Post[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  let query = supabase
    .from('posts')
    .select('*')
    .eq('neighborhood_id', neighborhoodId)
    .is('parent_id', null)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(options?.limit ?? 20);

  if (options?.category && options.category !== 'all') {
    query = query.eq('category', options.category);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1);
  }

  const { data, error } = await query;

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Post[] };
}

export async function createPost(
  neighborhoodId: string,
  formData: FormData
): Promise<ActionResult<Post>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const raw = {
    title: (formData.get('title') as string) || null,
    content: formData.get('content') as string,
    category: formData.get('category') as string || 'general',
    media_urls: [],
  };

  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      neighborhood_id: neighborhoodId,
      author_id: user.id,
      ...parsed.data,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Post };
}

export async function fetchPost(postId: string): Promise<ActionResult<Post>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Post };
}

export async function addReaction(
  postId: string,
  reactionType: string = 'like'
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('post_reactions')
    .insert({
      post_id: postId,
      user_id: user.id,
      reaction_type: reactionType,
    });

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function removeReaction(
  postId: string,
  reactionType: string = 'like'
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('post_reactions')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .eq('reaction_type', reactionType);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}
