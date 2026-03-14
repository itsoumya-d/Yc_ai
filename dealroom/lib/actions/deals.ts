'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface DealFormData {
  title: string;
  company: string;
  amount: number;
  currency?: string;
  close_date?: string;
  probability?: number;
  stage_id: string;
  description?: string;
}

export async function createDeal(data: DealFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase.from('users').select('organization_id').eq('id', user.id).single();
  if (!profile?.organization_id) throw new Error('No organization');

  const { data: deal, error } = await supabase
    .from('deals')
    .insert({
      ...data,
      owner_id: user.id,
      organization_id: profile.organization_id,
    })
    .select('id')
    .single();

  if (error) throw error;
  revalidatePath('/pipeline');
  return deal;
}

export async function updateDealStage(dealId: string, stageId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('deals')
    .update({ stage_id: stageId })
    .eq('id', dealId);

  if (error) throw error;
  revalidatePath('/pipeline');
}

export async function updateDeal(dealId: string, data: Partial<DealFormData>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase.from('deals').update(data).eq('id', dealId);
  if (error) throw error;
  revalidatePath('/pipeline');
  revalidatePath(`/deals/${dealId}`);
}

export async function deleteDeal(dealId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase.from('deals').delete().eq('id', dealId);
  if (error) throw error;
  revalidatePath('/pipeline');
}
