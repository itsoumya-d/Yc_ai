'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { ActionResult, User, Activity, CoachingInsight } from '@/types/database';
import { profileSchema } from '@/lib/validations/schemas';
import { revalidatePath } from 'next/cache';

export interface DashboardStats {
  totalPipelineValue: number;
  dealsAtRiskCount: number;
  activeDealsCount: number;
  forecastThisQuarter: number;
  recentActivities: Activity[];
  coachingInsights: CoachingInsight[];
}

export async function fetchDashboardStats(): Promise<ActionResult<DashboardStats>> {
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

    const orgId = membership.org_id;

    // Calculate current quarter boundaries
    const now = new Date();
    const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
    const quarterStart = new Date(now.getFullYear(), quarterMonth, 1).toISOString();
    const quarterEnd = new Date(now.getFullYear(), quarterMonth + 3, 0, 23, 59, 59).toISOString();

    // Run all queries in parallel
    const [
      pipelineRes,
      atRiskRes,
      activeDealsRes,
      forecastRes,
      activitiesRes,
      coachingRes,
    ] = await Promise.all([
      // Total pipeline value: sum of deals.amount where stage is not closed (won/lost)
      supabase
        .from('deals')
        .select('amount, stage:deal_stages!inner(is_won, is_lost)')
        .eq('org_id', orgId)
        .eq('deal_stages.is_won', false)
        .eq('deal_stages.is_lost', false),

      // Deals at risk count
      supabase
        .from('deals')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .in('health', ['at_risk', 'critical']),

      // Active deals count (not in closed stages)
      supabase
        .from('deals')
        .select('id, stage:deal_stages!inner(is_won, is_lost)', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('deal_stages.is_won', false)
        .eq('deal_stages.is_lost', false),

      // Forecast this quarter
      supabase
        .from('forecasts')
        .select('ai_forecast_amount, commit_amount, best_case_amount')
        .eq('org_id', orgId)
        .gte('period_start', quarterStart)
        .lte('period_end', quarterEnd)
        .limit(1)
        .maybeSingle(),

      // Recent activities (limit 10)
      supabase
        .from('activities')
        .select('*')
        .eq('org_id', orgId)
        .order('occurred_at', { ascending: false })
        .limit(10),

      // Coaching insights (not dismissed, limit 5)
      supabase
        .from('coaching_insights')
        .select('*')
        .eq('org_id', orgId)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    // Calculate total pipeline value
    const totalPipelineValue = (pipelineRes.data ?? []).reduce(
      (sum, deal) => sum + (deal.amount ?? 0),
      0
    );

    // Extract forecast amount
    const forecastThisQuarter =
      forecastRes.data?.ai_forecast_amount ??
      forecastRes.data?.commit_amount ??
      0;

    return {
      success: true,
      data: {
        totalPipelineValue,
        dealsAtRiskCount: atRiskRes.count ?? 0,
        activeDealsCount: activeDealsRes.count ?? 0,
        forecastThisQuarter,
        recentActivities: (activitiesRes.data ?? []) as Activity[],
        coachingInsights: (coachingRes.data ?? []) as CoachingInsight[],
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchProfile(userId: string): Promise<ActionResult<User>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as User };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateProfile(formData: FormData): Promise<ActionResult<User>> {
  try {
    const raw = {
      full_name: formData.get('full_name') as string | null,
      job_title: formData.get('job_title') as string | null,
      avatar_url: formData.get('avatar_url') as string | null,
      quota_amount: formData.get('quota_amount')
        ? Number(formData.get('quota_amount'))
        : null,
    };

    const parsed = profileSchema.safeParse(raw);
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

    const { data, error } = await supabase
      .from('users')
      .update({
        full_name: parsed.data.full_name ?? undefined,
        job_title: parsed.data.job_title ?? undefined,
        avatar_url: parsed.data.avatar_url ?? undefined,
        quota_amount: parsed.data.quota_amount ?? undefined,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/settings');
    return { success: true, data: data as User };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
