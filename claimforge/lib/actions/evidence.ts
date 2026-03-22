'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface CSVRow { [key: string]: string; }

export async function importEvidenceFromCSV(
  rows: CSVRow[],
  caseId?: string
): Promise<{ imported: number; errors: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { imported: 0, errors: rows.length };

  let imported = 0;
  let errors = 0;

  for (const row of rows) {
    const documentName = row['document_name'] || row['name'] || row['filename'] || row['title'];
    const documentType = row['document_type'] || row['type'] || row['doc_type'] || 'other';
    const source = row['source'] || row['origin'] || '';
    const rawDate = row['date'] || row['document_date'] || row['created_date'] || '';
    const relevanceStr = row['relevance_score'] || row['relevance'] || row['score'] || '50';
    const notes = row['notes'] || row['description'] || row['summary'] || '';

    if (!documentName) {
      errors++;
      continue;
    }

    const relevanceScore = Math.min(100, Math.max(0, parseInt(relevanceStr) || 50));

    let documentDate: string | null = null;
    if (rawDate) {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        documentDate = parsed.toISOString();
      }
    }

    const { error } = await supabase.from('case_documents').insert({
      case_id: caseId ?? null,
      uploaded_by: user.id,
      document_name: documentName.trim(),
      document_type: documentType.trim().toLowerCase(),
      source: source.trim() || null,
      document_date: documentDate,
      relevance_score: relevanceScore,
      notes: notes.trim() || null,
      status: 'pending',
      import_source: 'csv',
    });

    if (error) {
      errors++;
    } else {
      imported++;
    }
  }

  if (imported > 0 && caseId) {
    revalidatePath(`/cases/${caseId}`);
  }
  if (imported > 0) {
    revalidatePath('/documents');
  }

  return { imported, errors };
}
