'use server';

import { createClient } from '@/lib/supabase/server';
import type { Story } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

interface DashboardData {
  storyCount: number;
  totalWordCount: number;
  totalChapters: number;
  recentStories: Story[];
}

export async function getDashboardData(): Promise<ActionResult<DashboardData>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: stories, error } = await supabase
    .from('stories')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) return { error: error.message };

  const allStories = (stories ?? []) as Story[];
  const storyCount = allStories.length;
  const totalWordCount = allStories.reduce((sum, s) => sum + (s.total_word_count || 0), 0);
  const totalChapters = allStories.reduce((sum, s) => sum + (s.chapter_count || 0), 0);
  const recentStories = allStories.slice(0, 5);

  return {
    data: {
      storyCount,
      totalWordCount,
      totalChapters,
      recentStories,
    },
  };
}
