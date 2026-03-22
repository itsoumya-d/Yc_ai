'use server';

import { createClient } from '@/lib/supabase/server';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  type: string;
}

export async function searchApp(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const term = query.trim();
  const results: SearchResult[] = [];

  await Promise.all([
    // Stories by this author
    (async () => {
      try {
        const { data } = await supabase
          .from('stories')
          .select('id, title, status, genre')
          .ilike('title', `%${term}%`)
          .eq('user_id', user.id)
          .limit(5);
        if (data) {
          for (const row of data) {
            results.push({
              id: row.id,
              title: row.title,
              subtitle: row.genre ?? row.status ?? undefined,
              href: `/stories/${row.id}`,
              type: 'Story',
            });
          }
        }
      } catch {}
    })(),

    // Chapters belonging to the user's stories
    (async () => {
      try {
        const { data } = await supabase
          .from('chapters')
          .select('id, title, story_id, stories!inner(user_id)')
          .ilike('title', `%${term}%`)
          .eq('stories.user_id', user.id)
          .limit(5);
        if (data) {
          for (const row of data) {
            results.push({
              id: row.id,
              title: row.title,
              subtitle: `Chapter`,
              href: `/stories/${row.story_id}/chapters/${row.id}`,
              type: 'Chapter',
            });
          }
        }
      } catch {}
    })(),
  ]);

  return results;
}
