'use server';

import { createClient } from '@/lib/supabase/server';
import type { DashboardStats, Case, FraudPattern } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getDashboardStats(): Promise<ActionResult<DashboardStats>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const activeStatuses = ['intake', 'investigation', 'analysis', 'review'];

  // All independent aggregation queries run in parallel.
  // Use count-only requests where we only need a number, and select only
  // the minimal columns needed for the few value-sum computations.
  const [
    totalCasesRes,
    activeCasesRes,
    fraudAmountsRes,
    settledAmountsRes,
    { count: patternsCount },
    { count: filedCount },
    { count: docsProcessed },
    { count: docsTotal },
  ] = await Promise.all([
    // Total case count
    supabase
      .from('cases')
      .select('id', { count: 'exact', head: true }),

    // Active investigations count
    supabase
      .from('cases')
      .select('id', { count: 'exact', head: true })
      .in('status', activeStatuses),

    // Estimated fraud amounts for all cases (needed for totalFraud sum)
    supabase
      .from('cases')
      .select('estimated_fraud_amount'),

    // Actual fraud amounts for settled cases (needed for recoveredAmount sum)
    supabase
      .from('cases')
      .select('actual_fraud_amount')
      .eq('status', 'settled'),

    // Patterns count only
    supabase
      .from('fraud_patterns')
      .select('id', { count: 'exact', head: true }),

    // Filed cases count only
    supabase
      .from('cases')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'filed'),

    // Processed documents count (partial index candidate)
    supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('processed', true),

    // Total documents count
    supabase
      .from('documents')
      .select('id', { count: 'exact', head: true }),
  ]);

  const totalFraud = (fraudAmountsRes.data ?? []).reduce(
    (sum, c) => sum + (c.estimated_fraud_amount || 0),
    0
  );
  const recoveredAmount = (settledAmountsRes.data ?? []).reduce(
    (sum, c) => sum + (c.actual_fraud_amount || 0),
    0
  );
  const recoveryRate = totalFraud > 0 ? Math.round((recoveredAmount / totalFraud) * 100) : 0;

  return {
    data: {
      total_cases: totalCasesRes.count ?? 0,
      active_investigations: activeCasesRes.count ?? 0,
      total_fraud_detected: totalFraud,
      documents_processed: docsProcessed ?? 0,
      patterns_identified: patternsCount ?? 0,
      cases_filed: filedCount ?? 0,
      recovery_rate: recoveryRate,
    },
  };
}

export async function getRecentCases(): Promise<ActionResult<Case[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('cases')
    .select('id, title, case_number, status, defendant_name, estimated_fraud_amount, document_count, pattern_count, created_at, updated_at')
    .in('status', ['intake', 'investigation', 'analysis', 'review'])
    .order('updated_at', { ascending: false })
    .limit(5);

  if (error) return { error: error.message };
  return { data: data as Case[] };
}

export async function getRecentPatterns(): Promise<ActionResult<(FraudPattern & { case_title?: string })[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('fraud_patterns')
    .select('id, case_id, pattern_type, confidence, confidence_level, description, affected_amount, verified, false_positive, created_at, case:cases(title)')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) return { error: error.message };

  // Flatten case title
  const enriched = (data ?? []).map((p: Record<string, unknown>) => ({
    ...p,
    case_title: (p.case as { title?: string } | null)?.title ?? '',
  }));

  return { data: enriched as (FraudPattern & { case_title?: string })[] };
}
