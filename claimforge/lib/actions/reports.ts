'use server';

import { createClient } from '@/lib/supabase/server';
import type { Case, Entity, FraudPattern } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getCases() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: null };

  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) return { data: [] as Case[], error: error.message };
  return { data: (data ?? []) as Case[], error: undefined };
}

export interface ReportData {
  caseInfo: Case;
  entities: Entity[];
  patterns: FraudPattern[];
  generatedAt: string;
}

export async function getCaseReportData(caseId: string): Promise<ActionResult<ReportData>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const [caseRes, entitiesRes, patternsRes] = await Promise.all([
    supabase.from('cases').select('*').eq('id', caseId).single(),
    supabase.from('entities').select('*').eq('case_id', caseId).order('mention_count', { ascending: false }).limit(30),
    supabase.from('fraud_patterns').select('*').eq('case_id', caseId).order('confidence', { ascending: false }),
  ]);

  if (caseRes.error || !caseRes.data) return { error: 'Case not found' };

  return {
    data: {
      caseInfo: caseRes.data as Case,
      entities: (entitiesRes.data ?? []) as Entity[],
      patterns: (patternsRes.data ?? []) as FraudPattern[],
      generatedAt: new Date().toISOString(),
    },
  };
}
