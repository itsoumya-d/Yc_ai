'use server';

import { createClient } from '@/lib/supabase/server';
import type { TimelineEvent } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getTimelineEvents(caseId: string): Promise<ActionResult<TimelineEvent[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('case_id', caseId)
    .order('event_date', { ascending: false })
    .limit(50);

  if (error) return { error: error.message };
  return { data: data as TimelineEvent[] };
}
