'use server';

import { createClient } from '@/lib/supabase/server';
import type { Org } from '@/types/database';

export async function getOrg(): Promise<Org | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('orgs')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (error || !data) return null;
  return data as Org;
}

export async function createOrg(formData: FormData): Promise<{ org: Org | null; error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { org: null, error: 'Not authenticated' };

  const name = formData.get('name') as string;
  const industry = formData.get('industry') as string;
  const targetAuditDate = formData.get('target_audit_date') as string | null;

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const { data, error } = await supabase
    .from('orgs')
    .insert({
      name,
      slug,
      industry,
      target_audit_date: targetAuditDate || null,
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) return { org: null, error: error.message };
  return { org: data as Org, error: null };
}

export async function updateOrg(
  id: string,
  updates: Partial<Pick<Org, 'name' | 'industry' | 'target_audit_date'>>
): Promise<{ org: Org | null; error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { org: null, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('orgs')
    .update(updates)
    .eq('id', id)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) return { org: null, error: error.message };
  return { org: data as Org, error: null };
}
