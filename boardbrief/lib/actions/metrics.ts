'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface CSVRow { [key: string]: string; }

export async function importMetricsFromCSV(
  rows: CSVRow[]
): Promise<{ imported: number; errors: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { imported: 0, errors: rows.length };

  let imported = 0;
  let errors = 0;

  for (const row of rows) {
    const metricName = row['metric_name'] || row['name'] || row['metric'];
    const value = row['value'] || row['amount'];
    const period = row['period'] || row['date'] || row['month'];
    const category = row['category'] || row['type'] || 'general';
    const source = row['source'] || 'csv_import';

    if (!metricName || !value || !period) {
      errors++;
      continue;
    }

    const numericValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (isNaN(numericValue)) {
      errors++;
      continue;
    }

    const { error } = await supabase.from('board_metrics').upsert({
      owner_id: user.id,
      metric_name: metricName.trim(),
      value: numericValue,
      period: period.trim(),
      category: category.trim().toLowerCase(),
      source: source.trim(),
      imported_at: new Date().toISOString(),
    }, { onConflict: 'owner_id,metric_name,period' });

    if (error) {
      errors++;
    } else {
      imported++;
    }
  }

  if (imported > 0) {
    revalidatePath('/analytics');
    revalidatePath('/dashboard');
  }

  return { imported, errors };
}
