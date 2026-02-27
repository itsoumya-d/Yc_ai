'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, OrgMember, User } from '@/types/database';

export interface DashboardStats {
  gapCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  taskCounts: {
    todo: number;
    in_progress: number;
    in_review: number;
    done: number;
    archived: number;
    total: number;
  };
  policyCount: number;
  evidenceCount: number;
  integrationCount: number;
  complianceScore: number;
}

export async function fetchDashboardStats(orgId: string): Promise<ActionResult<DashboardStats>> {
  try {
    const supabase = await createClient();

    const [gapsResult, tasksResult, policiesResult, evidenceResult, integrationsResult] =
      await Promise.all([
        supabase
          .from('gaps')
          .select('severity, status')
          .eq('org_id', orgId),
        supabase
          .from('tasks')
          .select('status')
          .eq('org_id', orgId),
        supabase
          .from('policies')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId),
        supabase
          .from('evidence_items')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId),
        supabase
          .from('integrations')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId),
      ]);

    if (gapsResult.error) return { success: false, error: gapsResult.error.message };
    if (tasksResult.error) return { success: false, error: tasksResult.error.message };
    if (policiesResult.error) return { success: false, error: policiesResult.error.message };
    if (evidenceResult.error) return { success: false, error: evidenceResult.error.message };
    if (integrationsResult.error) return { success: false, error: integrationsResult.error.message };

    const gaps = gapsResult.data || [];
    const tasks = tasksResult.data || [];

    const gapCounts = {
      critical: gaps.filter((g) => g.severity === 'critical').length,
      high: gaps.filter((g) => g.severity === 'high').length,
      medium: gaps.filter((g) => g.severity === 'medium').length,
      low: gaps.filter((g) => g.severity === 'low').length,
      total: gaps.length,
    };

    const taskCounts = {
      todo: tasks.filter((t) => t.status === 'todo').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      in_review: tasks.filter((t) => t.status === 'in_review').length,
      done: tasks.filter((t) => t.status === 'done').length,
      archived: tasks.filter((t) => t.status === 'archived').length,
      total: tasks.length,
    };

    const resolvedGaps = gaps.filter(
      (g) => g.status === 'resolved' || g.status === 'accepted_risk'
    ).length;
    const complianceScore =
      gaps.length > 0 ? Math.round((resolvedGaps / gaps.length) * 100) : 0;

    return {
      success: true,
      data: {
        gapCounts,
        taskCounts,
        policyCount: policiesResult.count ?? 0,
        evidenceCount: evidenceResult.count ?? 0,
        integrationCount: integrationsResult.count ?? 0,
        complianceScore,
      },
    };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function fetchOrgMembers(
  orgId: string
): Promise<ActionResult<(OrgMember & { user: User })[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('org_members')
      .select('*, user:users(*)')
      .eq('org_id', orgId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as (OrgMember & { user: User })[] };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}
