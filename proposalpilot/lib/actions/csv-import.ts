'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

interface CSVRow { [key: string]: string; }

const ClientRowSchema = z.object({
  name: z.string().min(1, 'name is required'),
  email: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function importClientsFromCSV(
  rows: CSVRow[]
): Promise<{ imported: number; errors: string[] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { imported: 0, errors: ['Not authenticated'] };

  // Get the user's org_id (proposalpilot uses org-scoped clients)
  const { data: orgMember } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!orgMember?.org_id) {
    return { imported: 0, errors: ['No organisation found — create or join an org first'] };
  }

  const orgId = orgMember.org_id;
  let imported = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const parsed = ClientRowSchema.safeParse(row);
    if (!parsed.success) {
      errors.push(`Row ${i + 1}: ${parsed.error.issues[0].message}`);
      continue;
    }

    const { name, email, company, phone, address } = parsed.data;

    const { error } = await supabase.from('clients').insert({
      org_id: orgId,
      name: name.trim(),
      industry: company?.trim() || null,
      notes: [
        email ? `Email: ${email.trim()}` : null,
        phone ? `Phone: ${phone.trim()}` : null,
        address ? `Address: ${address.trim()}` : null,
      ].filter(Boolean).join('\n') || null,
    });

    if (error) {
      errors.push(`Row ${i + 1}: ${error.message}`);
    } else {
      imported++;
    }
  }

  if (imported > 0) {
    revalidatePath('/clients');
  }

  return { imported, errors };
}
