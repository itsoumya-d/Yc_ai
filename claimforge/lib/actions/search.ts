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
    // Cases by title or description
    (async () => {
      try {
        const { data } = await supabase
          .from('cases')
          .select('id, title, description, status')
          .or(`title.ilike.%${term}%,description.ilike.%${term}%`)
          .eq('lead_investigator_id', user.id)
          .limit(5);
        if (data) {
          for (const row of data) {
            results.push({
              id: row.id,
              title: row.title,
              subtitle: row.status ?? undefined,
              href: `/cases/${row.id}`,
              type: 'Case',
            });
          }
        }
      } catch {}
    })(),

    // Claims by claim_number, claim_type, or description
    (async () => {
      try {
        const { data } = await supabase
          .from('claims')
          .select('id, claim_number, claim_type, status, description')
          .or(`claim_number.ilike.%${term}%,claim_type.ilike.%${term}%,description.ilike.%${term}%`)
          .eq('claimant_id', user.id)
          .limit(5);
        if (data) {
          for (const row of data) {
            results.push({
              id: row.id,
              title: row.claim_number ?? row.claim_type ?? 'Claim',
              subtitle: row.claim_type ?? row.status ?? undefined,
              href: `/claims/${row.id}`,
              type: 'Claim',
            });
          }
        }
      } catch {}
    })(),

    // Documents by title or file_name
    (async () => {
      try {
        const { data } = await supabase
          .from('documents')
          .select('id, title, file_name, case_id')
          .or(`title.ilike.%${term}%,file_name.ilike.%${term}%`)
          .eq('uploaded_by', user.id)
          .limit(5);
        if (data) {
          for (const row of data) {
            results.push({
              id: row.id,
              title: row.title ?? row.file_name,
              subtitle: row.file_name ?? undefined,
              href: row.case_id ? `/cases/${row.case_id}` : `/documents`,
              type: 'Document',
            });
          }
        }
      } catch {}
    })(),
  ]);

  return results;
}
