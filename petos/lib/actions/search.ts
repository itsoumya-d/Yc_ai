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
    // Pets by name
    (async () => {
      try {
        const { data } = await supabase
          .from('pets')
          .select('id, name, species, breed')
          .ilike('name', `%${term}%`)
          .eq('user_id', user.id)
          .limit(5);
        if (data) {
          for (const row of data) {
            results.push({
              id: row.id,
              title: row.name,
              subtitle: row.breed ?? row.species ?? undefined,
              href: `/pets/${row.id}`,
              type: 'Pet',
            });
          }
        }
      } catch {}
    })(),

    // Appointments by vet_name or clinic_name (owned via pet.user_id)
    (async () => {
      try {
        const { data } = await supabase
          .from('appointments')
          .select('id, vet_name, clinic_name, type, pets!inner(user_id, name)')
          .or(`vet_name.ilike.%${term}%,clinic_name.ilike.%${term}%`)
          .eq('pets.user_id', user.id)
          .limit(5);
        if (data) {
          for (const row of data) {
            const petName = Array.isArray(row.pets) ? row.pets[0]?.name : (row.pets as { name?: string })?.name;
            results.push({
              id: row.id,
              title: row.vet_name ?? row.clinic_name ?? row.type,
              subtitle: petName ?? row.type ?? undefined,
              href: `/appointments`,
              type: 'Appointment',
            });
          }
        }
      } catch {}
    })(),

    // Health records by title or notes (owned via pet.user_id)
    (async () => {
      try {
        const { data } = await supabase
          .from('health_records')
          .select('id, title, notes, type, pets!inner(user_id, name)')
          .or(`title.ilike.%${term}%,notes.ilike.%${term}%`)
          .eq('pets.user_id', user.id)
          .limit(5);
        if (data) {
          for (const row of data) {
            const petName = Array.isArray(row.pets) ? row.pets[0]?.name : (row.pets as { name?: string })?.name;
            results.push({
              id: row.id,
              title: row.title,
              subtitle: petName ?? row.type ?? undefined,
              href: `/health`,
              type: 'Health Record',
            });
          }
        }
      } catch {}
    })(),
  ]);

  return results;
}
