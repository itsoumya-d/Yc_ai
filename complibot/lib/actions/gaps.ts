'use server';

import { createClient } from '@/lib/supabase/server';
import type { Gap } from '@/types/database';
import { getOrg } from './orgs';

interface GetGapsOptions {
  resolved?: boolean;
}

export async function getGaps(options?: GetGapsOptions): Promise<Gap[]> {
  const supabase = await createClient();
  const org = await getOrg();
  if (!org) return [];

  let query = supabase
    .from('gaps')
    .select('*')
    .eq('org_id', org.id)
    .order('severity', { ascending: true }) // critical sorts first alphabetically... use custom order
    .order('created_at', { ascending: false });

  if (options?.resolved !== undefined) {
    query = query.eq('resolved', options.resolved);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  // Sort by severity: critical > high > medium > low
  const severityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  return (data as Gap[]).sort(
    (a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4)
  );
}

export async function resolveGap(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const org = await getOrg();
  if (!org) return { error: 'No organization found' };

  const { error } = await supabase
    .from('gaps')
    .update({ resolved: true, resolved_at: new Date().toISOString() })
    .eq('id', id)
    .eq('org_id', org.id);

  if (error) return { error: error.message };
  return { error: null };
}
