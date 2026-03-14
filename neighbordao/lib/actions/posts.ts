'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPost(formData: { title: string; content: string; category: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase.from('user_profiles').select('neighborhood_id').eq('id', user.id).single();
  if (!profile?.neighborhood_id) return { error: 'You must join a neighborhood first' };

  const { error } = await supabase.from('posts').insert({
    neighborhood_id: profile.neighborhood_id,
    user_id: user.id,
    title: formData.title,
    content: formData.content,
    category: formData.category,
  });
  if (error) return { error: error.message };
  revalidatePath('/feed');
  return { success: true };
}

export async function getFeedPosts(category?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: 'Unauthorized' };

  const { data: profile } = await supabase.from('user_profiles').select('neighborhood_id').eq('id', user.id).single();
  if (!profile?.neighborhood_id) return { data: [], error: null };

  let query = supabase
    .from('posts')
    .select('*, user_profile:user_profiles(full_name, avatar_url)')
    .eq('neighborhood_id', profile.neighborhood_id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (category && category !== 'all') query = query.eq('category', category);

  const { data, error } = await query;
  return { data: data ?? [], error: error?.message };
}
