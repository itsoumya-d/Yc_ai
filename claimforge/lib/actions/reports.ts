'use server';
import { createClient } from '@/lib/supabase/server';

export interface Report {
  id: string;
  title: string;
  case_id: string;
  created_at: string;
  status: 'draft' | 'final';
  pattern_count: number;
  affected_amount: number;
}

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getReports(): Promise<ActionResult<Report[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Reports are derived from cases with fraud patterns
  const { data: cases, error } = await supabase
    .from('cases')
    .select('id, title, created_at, status, pattern_count')
    .order('created_at', { ascending: false });

  if (error) return { error: error.message };

  const reports: Report[] = (cases || []).map((c) => ({
    id: c.id,
    title: `Investigation Report: ${c.title}`,
    case_id: c.id,
    created_at: c.created_at,
    status: c.status === 'closed' ? 'final' : 'draft',
    pattern_count: c.pattern_count || 0,
    affected_amount: 0,
  }));

  return { data: reports };
}
