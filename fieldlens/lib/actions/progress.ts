'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, SkillMilestone } from '@/types/database';
import { milestoneSchema } from '@/lib/validations/schemas';

export async function fetchMilestones(trade?: string): Promise<ActionResult<SkillMilestone[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    let query = supabase
      .from('skill_milestones')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (trade && trade !== 'all') {
      query = query.eq('trade', trade);
    }

    const { data, error } = await query;

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as SkillMilestone[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

interface SkillProgress {
  trade: string;
  total: number;
  completed: number;
  percent: number;
}

export async function fetchSkillProgress(): Promise<ActionResult<SkillProgress[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('skill_milestones')
      .select('trade, completed')
      .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };

    const milestones = (data ?? []) as Array<{ trade: string; completed: boolean }>;
    const tradeMap = new Map<string, { total: number; completed: number }>();

    for (const m of milestones) {
      const existing = tradeMap.get(m.trade) ?? { total: 0, completed: 0 };
      existing.total += 1;
      if (m.completed) existing.completed += 1;
      tradeMap.set(m.trade, existing);
    }

    const progress: SkillProgress[] = Array.from(tradeMap.entries()).map(([trade, counts]) => ({
      trade,
      total: counts.total,
      completed: counts.completed,
      percent: counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0,
    }));

    return { success: true, data: progress };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function addMilestone(formData: FormData): Promise<ActionResult<SkillMilestone>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      trade: formData.get('trade') as string,
      skill: formData.get('skill') as string,
      description: formData.get('description') as string || null,
      skill_level: formData.get('skill_level') as string || 'beginner',
    };

    const parsed = milestoneSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('skill_milestones')
      .insert({
        user_id: user.id,
        ...parsed.data,
        completed: false,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as SkillMilestone };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
