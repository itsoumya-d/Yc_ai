'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { generatePolicy } from './ai';
import type { Policy, FrameworkType } from '@/types/database';

export async function getPolicies(): Promise<{ data?: Policy[]; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
  if (!profile?.organization_id) return { data: [] };

  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false });

  if (error) return { error: error.message };
  return { data: data as Policy[] };
}

export async function generateAndSavePolicy(params: {
  policyType: string;
  frameworkType: FrameworkType;
  frameworkId?: string;
  category: string;
}): Promise<{ data?: Policy; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile?.organization_id) return { error: 'No organization found' };

  const { data: org } = await supabase
    .from('organizations')
    .select('name, industry')
    .eq('id', profile.organization_id)
    .single();

  const aiResult = await generatePolicy(
    params.policyType,
    params.frameworkType,
    org?.name ?? 'Our Organization',
    org?.industry ?? 'Technology'
  );

  if (aiResult.error || !aiResult.data) return { error: aiResult.error ?? 'AI error' };

  const { data, error } = await supabase
    .from('policies')
    .insert({
      organization_id: profile.organization_id,
      framework_id: params.frameworkId ?? null,
      title: `${params.policyType} Policy`,
      content: aiResult.data,
      category: params.category,
      version: '1.0',
      status: 'draft',
      owner: null,
      approved_by: null,
      approved_at: null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/policies');
  return { data: data as Policy };
}

export async function updatePolicy(
  policyId: string,
  updates: Partial<Pick<Policy, 'title' | 'content' | 'status' | 'owner' | 'approved_by' | 'approved_at' | 'version'>>
): Promise<{ error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('policies')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', policyId);

  if (error) return { error: error.message };
  revalidatePath('/policies');
  return {};
}

export async function deletePolicy(policyId: string): Promise<{ error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.from('policies').delete().eq('id', policyId);
  if (error) return { error: error.message };
  revalidatePath('/policies');
  return {};
}
