'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

interface CSVRow { [key: string]: string; }

const validTypes = ['vaccination', 'medication', 'vet_visit', 'surgery', 'checkup', 'dental', 'lab_work'] as const;

// Map CSV-friendly labels to DB enum values
const typeMap: Record<string, typeof validTypes[number]> = {
  vaccination: 'vaccination',
  vaccine: 'vaccination',
  medication: 'medication',
  medicine: 'medication',
  med: 'medication',
  vet_visit: 'vet_visit',
  'vet visit': 'vet_visit',
  vet: 'vet_visit',
  surgery: 'surgery',
  checkup: 'checkup',
  'check-up': 'checkup',
  'check up': 'checkup',
  dental: 'dental',
  lab_work: 'lab_work',
  'lab work': 'lab_work',
  lab: 'lab_work',
};

const HealthRowSchema = z.object({
  pet_name: z.string().min(1, 'pet_name is required'),
  record_type: z.string().optional(),
  date: z.string().min(1, 'date is required'),
  notes: z.string().optional(),
  vet_name: z.string().optional(),
});

export async function importHealthRecordsFromCSV(
  rows: CSVRow[]
): Promise<{ imported: number; errors: string[] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { imported: 0, errors: ['Not authenticated'] };

  // Load user's pets for name lookup
  const { data: pets } = await supabase
    .from('pets')
    .select('id, name')
    .eq('user_id', user.id);

  const petsByName = new Map<string, string>(
    (pets ?? []).map((p: { id: string; name: string }) => [p.name.toLowerCase(), p.id])
  );

  // Get first pet as fallback
  const firstPetId = pets && pets.length > 0 ? pets[0].id : null;

  let imported = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const parsed = HealthRowSchema.safeParse(row);
    if (!parsed.success) {
      errors.push(`Row ${i + 1}: ${parsed.error.issues[0].message}`);
      continue;
    }

    const { pet_name, record_type, date, notes, vet_name } = parsed.data;

    // Resolve pet_id from name
    const petId = petsByName.get(pet_name.toLowerCase()) ?? firstPetId;
    if (!petId) {
      errors.push(`Row ${i + 1}: No pets found — add a pet first`);
      continue;
    }

    // Resolve record type
    const typeRaw = (record_type ?? '').toLowerCase().trim();
    const resolvedType: typeof validTypes[number] = typeMap[typeRaw] ?? 'checkup';

    // Parse date — accept YYYY-MM-DD or MM/DD/YYYY
    let resolvedDate = date.trim();
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(resolvedDate)) {
      const parts = resolvedDate.split('/');
      resolvedDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }

    const { error } = await supabase.from('health_records').insert({
      pet_id: petId,
      type: resolvedType,
      title: `${resolvedType.replace('_', ' ')} — ${pet_name}`,
      date: resolvedDate,
      notes: notes?.trim() || null,
      vet_name: vet_name?.trim() || null,
    });

    if (error) {
      errors.push(`Row ${i + 1}: ${error.message}`);
    } else {
      imported++;
    }
  }

  if (imported > 0) {
    revalidatePath('/health');
    revalidatePath('/dashboard');
  }

  return { imported, errors };
}
