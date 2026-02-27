'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { ActionResult, Deal, DealStage, DealHealth } from '@/types/database';
import { dealSchema } from '@/lib/validations/schemas';

export interface DealWithStage extends Deal {
  stage: DealStage;
}

export interface DealFilters {
  health?: DealHealth;
  stage_id?: string;
  owner_id?: string;
}

export async function fetchDeals(filters?: DealFilters): Promise<ActionResult<DealWithStage[]>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    // Get org_id from org_members
    const { data: membership, error: memberError } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (memberError || !membership) {
      return { success: false, error: 'No organization found' };
    }

    let query = supabase
      .from('deals')
      .select('*, stage:deal_stages(*)')
      .eq('org_id', membership.org_id);

    if (filters?.health) {
      query = query.eq('health', filters.health);
    }

    if (filters?.stage_id) {
      query = query.eq('stage_id', filters.stage_id);
    }

    if (filters?.owner_id) {
      query = query.eq('owner_id', filters.owner_id);
    }

    query = query.order('last_activity_at', { ascending: false, nullsFirst: false });

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data ?? []) as unknown as DealWithStage[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchDeal(dealId: string): Promise<ActionResult<DealWithStage>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    const { data, error } = await supabase
      .from('deals')
      .select('*, stage:deal_stages(*)')
      .eq('id', dealId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as unknown as DealWithStage };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function createDeal(formData: FormData): Promise<ActionResult<Deal>> {
  try {
    const raw = {
      name: formData.get('name') as string,
      company: formData.get('company') as string | null,
      amount: formData.get('amount') ? Number(formData.get('amount')) : null,
      stage_id: formData.get('stage_id') as string,
      close_date: formData.get('close_date') as string | null,
      forecast_category: (formData.get('forecast_category') as string) || 'pipeline',
      tags: formData.getAll('tags').map(String),
      next_steps: formData.get('next_steps') as string | null,
    };

    const parsed = dealSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    // Get org_id from org_members
    const { data: membership, error: memberError } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (memberError || !membership) {
      return { success: false, error: 'No organization found' };
    }

    const { data, error } = await supabase
      .from('deals')
      .insert({
        org_id: membership.org_id,
        owner_id: user.id,
        name: parsed.data.name,
        company: parsed.data.company ?? null,
        amount: parsed.data.amount ?? null,
        stage_id: parsed.data.stage_id,
        close_date: parsed.data.close_date ?? null,
        forecast_category: parsed.data.forecast_category,
        tags: parsed.data.tags,
        next_steps: parsed.data.next_steps ?? null,
        last_activity_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/deals');
    revalidatePath('/dashboard');
    return { success: true, data: data as Deal };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateDealStage(
  dealId: string,
  stageId: string
): Promise<ActionResult<Deal>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    const { data, error } = await supabase
      .from('deals')
      .update({ stage_id: stageId })
      .eq('id', dealId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/deals');
    revalidatePath(`/deals/${dealId}`);
    revalidatePath('/dashboard');
    return { success: true, data: data as Deal };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
