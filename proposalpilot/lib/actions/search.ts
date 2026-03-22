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

  // Get user's org_id via org_members
  let orgId: string | null = null;
  try {
    const { data } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();
    orgId = data?.org_id ?? null;
  } catch {}

  await Promise.all([
    // Proposals by title
    (async () => {
      try {
        let q = supabase
          .from('proposals')
          .select('id, title, status')
          .ilike('title', `%${term}%`)
          .limit(5);
        if (orgId) {
          q = q.eq('org_id', orgId);
        } else {
          q = q.eq('created_by', user.id);
        }
        const { data } = await q;
        if (data) {
          for (const row of data) {
            results.push({
              id: row.id,
              title: row.title,
              subtitle: row.status ?? undefined,
              href: `/proposals/${row.id}`,
              type: 'Proposal',
            });
          }
        }
      } catch {}
    })(),

    // Clients by name
    (async () => {
      try {
        let q = supabase
          .from('clients')
          .select('id, name, industry')
          .ilike('name', `%${term}%`)
          .limit(5);
        if (orgId) q = q.eq('org_id', orgId);
        const { data } = await q;
        if (data) {
          for (const row of data) {
            results.push({
              id: row.id,
              title: row.name,
              subtitle: row.industry ?? undefined,
              href: `/clients/${row.id}`,
              type: 'Client',
            });
          }
        }
      } catch {}
    })(),
  ]);

  return results;
}
