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

  // Fetch aggregates and recent stories in parallel
  const [countRes, recentRes] = await Promise.all([
    // Count-only query — no data transfer, uses idx_stories_user_status_created
    supabase
      .from('stories')
      .select('total_word_count, chapter_count', { count: 'exact' })
      .eq('user_id', user.id),
    // Recent 5 stories — specific columns only, avoids fetching content/cover_url etc.
    supabase
      .from('stories')
      .select('id, title, description, genre, status, total_word_count, chapter_count, is_public, share_token, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(5),
  ]);

  if (countRes.error) return { error: countRes.error.message };
  if (recentRes.error) return { error: recentRes.error.message };

  const allStorySummaries = countRes.data ?? [];
  const storyCount = countRes.count ?? 0;
  const totalWordCount = allStorySummaries.reduce((sum, s) => sum + (s.total_word_count || 0), 0);
  const totalChapters = allStorySummaries.reduce((sum, s) => sum + (s.chapter_count || 0), 0);
  const recentStories = (recentRes.data ?? []) as Story[];

  return {
    data: {
      storyCount,
      totalWordCount,
      totalChapters,
      recentStories,
    },
  };
}
