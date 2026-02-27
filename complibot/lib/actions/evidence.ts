'use server';

import { createClient } from '@/lib/supabase/server';
import type { EvidenceItem } from '@/types/database';
import { getOrg } from './orgs';

export async function getEvidenceItems(controlId?: string): Promise<EvidenceItem[]> {
  const supabase = await createClient();
  const org = await getOrg();
  if (!org) return [];

  let query = supabase
    .from('evidence_items')
    .select('*')
    .eq('org_id', org.id)
    .order('collected_at', { ascending: false });

  if (controlId) {
    query = query.eq('control_id', controlId);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as EvidenceItem[];
}

export async function createEvidenceItem(formData: FormData): Promise<{ item: EvidenceItem | null; error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { item: null, error: 'Not authenticated' };

  const org = await getOrg();
  if (!org) return { item: null, error: 'No organization found' };

  const { data, error } = await supabase
    .from('evidence_items')
    .insert({
      org_id: org.id,
      control_id: formData.get('control_id') as string,
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || '',
      evidence_type: formData.get('evidence_type') as EvidenceItem['evidence_type'],
      file_url: (formData.get('file_url') as string) || null,
      collected_by: user.id,
      collected_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return { item: null, error: error.message };
  return { item: data as EvidenceItem, error: null };
}
