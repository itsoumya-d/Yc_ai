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
    // Invoices
    (async () => {
      try {
        const { data } = await supabase
          .from('invoices')
          .select('id, invoice_number, status, notes')
          .or(`invoice_number.ilike.%${term}%,notes.ilike.%${term}%`)
          .eq('user_id', user.id)
          .limit(5);
        if (data) {
          for (const row of data) {
            results.push({
              id: row.id,
              title: row.invoice_number,
              subtitle: row.status ?? undefined,
              href: `/invoices/${row.id}`,
              type: 'Invoice',
            });
          }
        }
      } catch {}
    })(),

    // Clients
    (async () => {
      try {
        const { data } = await supabase
          .from('clients')
          .select('id, name, email, company')
          .or(`name.ilike.%${term}%,email.ilike.%${term}%`)
          .eq('user_id', user.id)
          .limit(5);
        if (data) {
          for (const row of data) {
            results.push({
              id: row.id,
              title: row.name,
              subtitle: row.company ?? row.email ?? undefined,
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
