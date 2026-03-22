'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

interface CSVRow { [key: string]: string; }

const validStatuses = ['draft', 'in_progress', 'completed', 'published'] as const;

const StoryRowSchema = z.object({
  title: z.string().min(1, 'title is required'),
  description: z.string().optional(),
  genre: z.string().optional(),
  status: z.string().optional(),
});

export async function importStoriesFromCSV(
  rows: CSVRow[]
): Promise<{ imported: number; errors: string[] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { imported: 0, errors: ['Not authenticated'] };

  let imported = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const parsed = StoryRowSchema.safeParse(row);
    if (!parsed.success) {
      errors.push(`Row ${i + 1}: ${parsed.error.issues[0].message}`);
      continue;
    }

    const { title, description, genre, status } = parsed.data;

    const statusRaw = (status ?? '').toLowerCase().trim() as typeof validStatuses[number];
    const resolvedStatus = validStatuses.includes(statusRaw) ? statusRaw : 'draft';

    const { error } = await supabase.from('stories').insert({
      user_id: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      genre: genre?.trim() || 'other',
      status: resolvedStatus,
    });

    if (error) {
      errors.push(`Row ${i + 1}: ${error.message}`);
    } else {
      imported++;
    }
  }

  if (imported > 0) {
    revalidatePath('/stories');
  }

  return { imported, errors };
}
