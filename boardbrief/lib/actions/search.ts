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
    // Meetings
    (async () => {
      try {
        const { data } = await supabase
          .from('meetings')
          .select('id, title, status, meeting_type')
          .ilike('title', `%${term}%`)
          .eq('user_id', user.id)
          .limit(5);
        if (data) {
          for (const row of data) {
            results.push({
              id: row.id,
              title: row.title,
              subtitle: row.meeting_type ?? row.status ?? undefined,
              href: `/meetings/${row.id}`,
              type: 'Meeting',
            });
          }
        }
      } catch {}
    })(),

    // Action Items
    (async () => {
      try {
        const { data } = await supabase
          .from('action_items')
          .select('id, title, status, priority')
          .ilike('title', `%${term}%`)
          .eq('user_id', user.id)
          .limit(5);
        if (data) {
          for (const row of data) {
            results.push({
              id: row.id,
              title: row.title,
              subtitle: row.priority ?? row.status ?? undefined,
              href: `/action-items`,
              type: 'Action Item',
            });
          }
        }
      } catch {}
    })(),

    // Resolutions (in lieu of documents)
    (async () => {
      try {
        const { data } = await supabase
          .from('resolutions')
          .select('id, title, status')
          .ilike('title', `%${term}%`)
          .eq('user_id', user.id)
          .limit(5);
        if (data) {
          for (const row of data) {
            results.push({
              id: row.id,
              title: row.title,
              subtitle: row.status ?? undefined,
              href: `/resolutions`,
              type: 'Resolution',
            });
          }
        }
      } catch {}
    })(),
  ]);

  return results;
}
