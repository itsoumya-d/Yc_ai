'use server';

import { createClient } from '@/lib/supabase/server';
import { Post, PostCategory } from '@/types/database';
import OpenAI from 'openai';

export async function getPosts(neighborhoodId: string): Promise<Post[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('neighborhood_id', neighborhoodId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) return [];
  return data ?? [];
}

export async function createPost(data: {
  neighborhood_id: string;
  title: string;
  body: string;
  category: PostCategory;
}): Promise<{ error?: string; post?: Post }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { data: member } = await supabase
    .from('neighborhood_members')
    .select('display_name')
    .eq('user_id', user.id)
    .eq('neighborhood_id', data.neighborhood_id)
    .maybeSingle();

  const authorName = member?.display_name || user.email?.split('@')[0] || 'Member';

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      neighborhood_id: data.neighborhood_id,
      author_id: user.id,
      author_name: authorName,
      category: data.category,
      title: data.title,
      body: data.body,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { post };
}

export async function summarizePost(postId: string): Promise<{ error?: string; summary?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('title, body')
    .eq('id', postId)
    .single();

  if (fetchError || !post) return { error: 'Post not found' };

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that summarizes community neighborhood posts. Write a 1-2 sentence summary that captures the key information.',
      },
      {
        role: 'user',
        content: `Title: ${post.title}\n\nBody: ${post.body}`,
      },
    ],
    max_tokens: 100,
  });

  const summary = completion.choices[0]?.message?.content ?? '';

  await supabase
    .from('posts')
    .update({ ai_summary: summary })
    .eq('id', postId);

  return { summary };
}
