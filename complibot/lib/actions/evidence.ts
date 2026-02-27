'use server';

import { createClient } from '@/lib/supabase/server';
import { evidenceSchema } from '@/lib/validations/schemas';
import type { ActionResult, EvidenceItem } from '@/types/database';

export async function fetchEvidence(
  orgId: string,
  options: { type?: string; freshness?: string } = {}
): Promise<ActionResult<EvidenceItem[]>> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('evidence_items')
      .select('*')
      .eq('org_id', orgId)
      .order('collected_at', { ascending: false });

    if (options.type) {
      query = query.eq('evidence_type', options.type);
    }

    if (options.freshness) {
      query = query.eq('freshness', options.freshness);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as EvidenceItem[] };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function createEvidence(
  orgId: string,
  formData: FormData
): Promise<ActionResult<EvidenceItem>> {
  try {
    const raw = {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      evidence_type: formData.get('evidence_type') as string,
      control_id: (formData.get('control_id') as string) || null,
      tags: formData.getAll('tags') as string[],
      collection_method: (formData.get('collection_method') as string) || 'manual',
    };

    const validated = evidenceSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('evidence_items')
      .insert({
        org_id: orgId,
        ...validated.data,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as EvidenceItem };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}
