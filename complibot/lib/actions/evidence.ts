'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Evidence } from '@/types/database';

export async function getEvidence(controlId?: string): Promise<{ data?: Evidence[]; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
  if (!profile?.organization_id) return { data: [] };

  let query = supabase
    .from('evidence')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false });

  if (controlId) {
    query = query.eq('control_id', controlId);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data: data as Evidence[] };
}

export async function addEvidence(params: {
  title: string;
  description?: string;
  controlId?: string;
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  collectionDate: string;
}): Promise<{ data?: Evidence; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, full_name')
    .eq('id', user.id)
    .single();

  if (!profile?.organization_id) return { error: 'No organization found' };

  const { data, error } = await supabase
    .from('evidence')
    .insert({
      organization_id: profile.organization_id,
      control_id: params.controlId ?? null,
      title: params.title,
      description: params.description ?? null,
      file_name: params.fileName ?? null,
      file_url: params.fileUrl ?? null,
      file_type: params.fileType ?? null,
      file_size: params.fileSize ?? null,
      collected_by: profile.full_name ?? user.email ?? null,
      collection_date: params.collectionDate,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/evidence');
  return { data: data as Evidence };
}

export async function deleteEvidence(evidenceId: string): Promise<{ error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.from('evidence').delete().eq('id', evidenceId);
  if (error) return { error: error.message };

  revalidatePath('/evidence');
  return {};
}
