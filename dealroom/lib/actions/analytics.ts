'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { ActionResult } from '@/types/database';

export interface StageConversion {
  stage_id: string;
  stage_name: string;
  sort_order: number;
  deal_count: number;
  total_amount: number;
}

export interface AnalyticsData {
  winRate: number;
  avgCycleTimeDays: number;
  avgDealSize: number;
  activityCount: number;
  stageConversions: StageConversion[];
}

export async function fetchAnalytics(): Promise<ActionResult<AnalyticsData>> {
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

    // Run all analytics queries in parallel
    const [
      closedDealsRes,
      allDealsRes,
      activityCountRes,
      stagesRes,
      dealsByStageRes,
    ] = await Promise.all([
      // Closed deals (won + lost) for win rate and cycle time
      supabase
        .from('deals')
        .select('id, amount, created_at, updated_at, stage:deal_stages!inner(is_won, is_lost)')
        .eq('org_id', orgId)
        .or('is_won.eq.true,is_lost.eq.true', { referencedTable: 'deal_stages' }),

      // All deals for avg deal size
      supabase
        .from('deals')
        .select('amount')
        .eq('org_id', orgId)
        .not('amount', 'is', null),

      // Activity count
      supabase
        .from('activities')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId),

      // Deal stages for conversion funnel
      supabase
        .from('deal_stages')
        .select('id, name, sort_order')
        .eq('org_id', orgId)
        .order('sort_order', { ascending: true }),

      // Deals grouped by stage
      supabase
        .from('deals')
        .select('stage_id, amount')
        .eq('org_id', orgId),
    ]);

    // Calculate win rate
    const closedDeals = closedDealsRes.data ?? [];
    const wonDeals = closedDeals.filter(
      (d) => (d.stage as unknown as { is_won: boolean }).is_won
    );
    const winRate =
      closedDeals.length > 0
        ? Math.round((wonDeals.length / closedDeals.length) * 100)
        : 0;

    // Calculate average cycle time (days from created to closed)
    let avgCycleTimeDays = 0;
    if (closedDeals.length > 0) {
      const totalDays = closedDeals.reduce((sum, deal) => {
        const created = new Date(deal.created_at).getTime();
        const closed = new Date(deal.updated_at).getTime();
        return sum + (closed - created) / (1000 * 60 * 60 * 24);
      }, 0);
      avgCycleTimeDays = Math.round(totalDays / closedDeals.length);
    }

    // Calculate average deal size
    const dealsWithAmount = allDealsRes.data ?? [];
    const avgDealSize =
      dealsWithAmount.length > 0
        ? Math.round(
            dealsWithAmount.reduce((sum, d) => sum + (d.amount ?? 0), 0) /
              dealsWithAmount.length
          )
        : 0;

    // Activity count
    const activityCount = activityCountRes.count ?? 0;

    // Stage conversion rates
    const stages = stagesRes.data ?? [];
    const dealsByStage = dealsByStageRes.data ?? [];

    const stageConversions: StageConversion[] = stages.map((stage) => {
      const stageDeals = dealsByStage.filter((d) => d.stage_id === stage.id);
      return {
        stage_id: stage.id,
        stage_name: stage.name,
        sort_order: stage.sort_order,
        deal_count: stageDeals.length,
        total_amount: stageDeals.reduce((sum, d) => sum + (d.amount ?? 0), 0),
      };
    });

    return {
      success: true,
      data: {
        winRate,
        avgCycleTimeDays,
        avgDealSize,
        activityCount,
        stageConversions,
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
