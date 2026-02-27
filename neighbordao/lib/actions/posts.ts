'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Post, PostCategory } from '@/types/database'

export async function getPosts(neighborhoodId?: string): Promise<{ data?: Post[]; error?: string }> {
  const supabase = await createClient()

  let query = supabase
    .from('posts')
    .select(`
      *,
      author:users(id, full_name, avatar_url, email)
    `)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (neighborhoodId) {
    query = query.eq('neighborhood_id', neighborhoodId)
  }

  const { data, error } = await query

  if (error) return { error: error.message }
  return { data: data as Post[] }
}

export async function getPost(id: string): Promise<{ data?: Post; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:users(id, full_name, avatar_url, email)
    `)
    .eq('id', id)
    .single()

  if (error) return { error: error.message }
  return { data: data as Post }
}

export async function createPost(input: {
  title: string
  content: string
  category: PostCategory
  neighborhoodId: string
}): Promise<{ data?: Post; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      title: input.title,
      content: input.content,
      category: input.category,
      neighborhood_id: input.neighborhoodId,
      author_id: user.id,
    })
    .select(`
      *,
      author:users(id, full_name, avatar_url, email)
    `)
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/posts')
  return { data: data as Post }
}

export async function updatePost(
  id: string,
  updates: Partial<Pick<Post, 'title' | 'content' | 'category' | 'is_pinned'>>
): Promise<{ data?: Post; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('posts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(`
      *,
      author:users(id, full_name, avatar_url, email)
    `)
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/posts')
  return { data: data as Post }
}

export async function deletePost(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .eq('author_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/posts')
  return {}
}

export async function likePost(postId: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.rpc('toggle_post_like', {
    p_post_id: postId,
    p_user_id: user.id,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/posts')
  return {}
}
