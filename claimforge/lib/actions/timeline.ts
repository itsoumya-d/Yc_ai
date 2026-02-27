'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { TimelineEvent } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export type TimelineEventType =
  | 'document_submitted'
  | 'pattern_detected'
  | 'entity_identified'
  | 'court_filing'
  | 'settlement_offer'
  | 'investigation_step'
  | 'document'
  | 'payment'
  | 'communication'
  | 'regulatory'
  | 'milestone';

export interface TimelineEventInput {
  title: string;
  description: string;
  event_date: string;
  event_type: TimelineEventType;
  significance?: 'high' | 'medium' | 'low';
  amount?: number | null;
  flagged?: boolean;
}

export async function getTimelineEvents(caseId: string): Promise<ActionResult<TimelineEvent[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('case_id', caseId)
    .order('event_date', { ascending: false });

  if (error) return { error: error.message };
  return { data: data as TimelineEvent[] };
}

export async function createTimelineEvent(
  caseId: string,
  input: TimelineEventInput
): Promise<ActionResult<TimelineEvent>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('timeline_events')
    .insert({
      case_id: caseId,
      title: input.title,
      description: input.description,
      event_date: input.event_date,
      event_type: input.event_type,
      amount: input.amount ?? null,
      flagged: input.flagged ?? false,
      related_entities: [],
      related_documents: [],
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/cases/${caseId}`);
  return { data: data as TimelineEvent };
}

export async function deleteTimelineEvent(
  id: string,
  caseId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('timeline_events')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath(`/cases/${caseId}`);
  return {};
}

export async function updateTimelineEvent(
  id: string,
  caseId: string,
  updates: Partial<TimelineEventInput>
): Promise<ActionResult<TimelineEvent>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('timeline_events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/cases/${caseId}`);
  return { data: data as TimelineEvent };
}
