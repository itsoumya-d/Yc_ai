'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { ActionResult, Forecast } from '@/types/database';

export interface ForecastSummary {
  forecast: Forecast | null;
  dealsByCategory: {
    commit: { count: number; total: number };
    best_case: { count: number; total: number };
    pipeline: { count: number; total: number };
    omit: { count: number; total: number };
  };
}

export async function fetchForecast(
  periodType?: 'month' | 'quarter' | 'year'
): Promise<ActionResult<ForecastSummary>> {
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
    const type = periodType ?? 'quarter';

    // Calculate current period boundaries
    const now = new Date();
    let periodStart: string;
    let periodEnd: string;

    if (type === 'month') {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    } else if (type === 'year') {
      periodStart = new Date(now.getFullYear(), 0, 1).toISOString();
      periodEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59).toISOString();
    } else {
      // quarter
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
      periodStart = new Date(now.getFullYear(), quarterMonth, 1).toISOString();
      periodEnd = new Date(now.getFullYear(), quarterMonth + 3, 0, 23, 59, 59).toISOString();
    }

    // Fetch forecast record and deals grouped by category in parallel
    const [forecastRes, dealsRes] = await Promise.all([
      supabase
        .from('forecasts')
        .select('*')
        .eq('org_id', orgId)
        .eq('period_type', type)
        .gte('period_start', periodStart)
        .lte('period_end', periodEnd)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('deals')
        .select('forecast_category, amount')
        .eq('org_id', orgId)
        .not('amount', 'is', null),
    ]);

    // Aggregate deals by forecast category
    const dealsByCategory = {
      commit: { count: 0, total: 0 },
      best_case: { count: 0, total: 0 },
      pipeline: { count: 0, total: 0 },
      omit: { count: 0, total: 0 },
    };

    for (const deal of dealsRes.data ?? []) {
      const cat = deal.forecast_category as keyof typeof dealsByCategory;
      if (dealsByCategory[cat]) {
        dealsByCategory[cat].count += 1;
        dealsByCategory[cat].total += deal.amount ?? 0;
      }
    }

    return {
      success: true,
      data: {
        forecast: (forecastRes.data as Forecast) ?? null,
        dealsByCategory,
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchForecastHistory(): Promise<ActionResult<Forecast[]>> {
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

    const { data, error } = await supabase
      .from('forecasts')
      .select('*')
      .eq('org_id', membership.org_id)
      .order('period_start', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data ?? []) as Forecast[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
