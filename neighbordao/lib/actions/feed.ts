'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Post, PostReaction } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getPosts(
  neighborhoodId: string,
  filters?: { category?: string; search?: string }
): Promise<ActionResult<Post[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  let query = supabase
    .from('posts')
    .select('*, author:users!author_id(*)')
    .eq('neighborhood_id', neighborhoodId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data: data as Post[] };
}

export async function getPost(id: string): Promise<ActionResult<Post>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('posts')
    .select('*, author:users!author_id(*)')
    .eq('id', id)
    .single();

  if (error) return { error: error.message };
  return { data: data as Post };
}

export async function createPost(data: {
  neighborhood_id: string;
  title: string;
  content: string;
  category: Post['category'];
}): Promise<ActionResult<Post>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      ...data,
      author_id: user.id,
      is_pinned: false,
      reaction_count: 0,
      comment_count: 0,
    })
    .select('*, author:users!author_id(*)')
    .single();

  if (error) return { error: error.message };
  revalidatePath('/feed');
  return { data: post as Post };
}

export async function updatePost(
  id: string,
  data: Partial<Post>
): Promise<ActionResult<Post>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { id: _id, author_id, created_at, author, ...updateData } =
    data as Record<string, unknown>;

  const { data: post, error } = await supabase
    .from('posts')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('author_id', user.id)
    .select('*, author:users!author_id(*)')
    .single();

  if (error) return { error: error.message };
  revalidatePath('/feed');
  revalidatePath(`/feed/${id}`);
  return { data: post as Post };
}

export async function deletePost(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .eq('author_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/feed');
  return {};
}

export async function toggleReaction(
  postId: string,
  type: PostReaction['type']
): Promise<ActionResult<{ added: boolean }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Check if reaction already exists
  const { data: existing } = await supabase
    .from('post_reactions')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .eq('type', type)
    .single();

  if (existing) {
    // Remove reaction
    const { error: deleteError } = await supabase
      .from('post_reactions')
      .delete()
      .eq('id', existing.id);

    if (deleteError) return { error: deleteError.message };

    // Decrement reaction_count
    const { error: updateError } = await supabase.rpc('decrement_field', {
      table_name: 'posts',
      row_id: postId,
      field_name: 'reaction_count',
    });

    if (updateError) {
      // Fallback: manual update
      const { data: post } = await supabase
        .from('posts')
        .select('reaction_count')
        .eq('id', postId)
        .single();

      if (post) {
        await supabase
          .from('posts')
          .update({ reaction_count: Math.max(0, post.reaction_count - 1) })
          .eq('id', postId);
      }
    }

    revalidatePath('/feed');
    return { data: { added: false } };
  } else {
    // Add reaction
    const { error: insertError } = await supabase
      .from('post_reactions')
      .insert({ post_id: postId, user_id: user.id, type });

    if (insertError) return { error: insertError.message };

    // Increment reaction_count
    const { error: updateError } = await supabase.rpc('increment_field', {
      table_name: 'posts',
      row_id: postId,
      field_name: 'reaction_count',
    });

    if (updateError) {
      // Fallback: manual update
      const { data: post } = await supabase
        .from('posts')
        .select('reaction_count')
        .eq('id', postId)
        .single();

      if (post) {
        await supabase
          .from('posts')
          .update({ reaction_count: post.reaction_count + 1 })
          .eq('id', postId);
      }
    }

    revalidatePath('/feed');
    return { data: { added: true } };
  }
}

export async function getPostReactions(
  postId: string
): Promise<ActionResult<PostReaction[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('post_reactions')
    .select('*')
    .eq('post_id', postId);

  if (error) return { error: error.message };
  return { data: data as PostReaction[] };
}
