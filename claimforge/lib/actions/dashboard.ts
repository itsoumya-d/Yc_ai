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

  const [casesRes, patternsRes, docsRes] = await Promise.all([
    supabase.from('cases').select('status, estimated_fraud_amount, actual_fraud_amount'),
    supabase.from('fraud_patterns').select('id'),
    supabase.from('documents').select('id, processed'),
  ]);

  const cases = casesRes.data ?? [];
  const patterns = patternsRes.data ?? [];
  const docs = docsRes.data ?? [];

  const activeStatuses = ['intake', 'investigation', 'analysis', 'review'];
  const activeCases = cases.filter((c) => activeStatuses.includes(c.status));
  const filedCases = cases.filter((c) => c.status === 'filed');
  const settledCases = cases.filter((c) => c.status === 'settled');

  const totalFraud = cases.reduce((sum, c) => sum + (c.estimated_fraud_amount || 0), 0);
  const recoveredAmount = settledCases.reduce((sum, c) => sum + (c.actual_fraud_amount || 0), 0);
  const recoveryRate = totalFraud > 0 ? Math.round((recoveredAmount / totalFraud) * 100) : 0;

  return {
    data: {
      total_cases: cases.length,
      active_investigations: activeCases.length,
      total_fraud_detected: totalFraud,
      documents_processed: docs.filter((d) => d.processed).length,
      patterns_identified: patterns.length,
      cases_filed: filedCases.length,
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
    .select('*')
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
    .select('*, case:cases(title)')
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
