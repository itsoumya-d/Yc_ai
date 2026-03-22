'use server';

import { createClient } from '@/lib/supabase/server';

export async function importClientsFromCSV(rows: Record<string, string>[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { imported: 0, errors: 0 };

  let imported = 0;
  let errors = 0;

  for (const row of rows) {
    const name = row.name || row.Name || row.client_name || row['Client Name'];
    const email = row.email || row.Email || row.contact_email || row['Contact Email'];
    if (!name?.trim() || !email?.trim()) { errors++; continue; }

    const { error } = await supabase.from('clients').insert({
      user_id: user.id,
      name: name.trim(),
      email: email.trim(),
      company: (row.company || row.Company || row.organization || '').trim() || null,
      phone: (row.phone || row.Phone || row.telephone || '').trim() || null,
      address: (row.address || row.Address || '').trim() || null,
      notes: (row.notes || row.Notes || '').trim() || null,
      default_currency: (row.currency || row.Currency || 'USD').trim(),
    });
    if (error) errors++;
    else imported++;
  }

  return { imported, errors };
}
