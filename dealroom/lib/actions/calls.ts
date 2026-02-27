'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { ActionResult, Call, CallTranscript, CallStatus } from '@/types/database';

export interface CallWithTranscript extends Call {
  transcript: CallTranscript | null;
}

export interface CallFilters {
  status?: CallStatus;
  deal_id?: string;
}

export async function fetchCalls(filters?: CallFilters): Promise<ActionResult<Call[]>> {
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

    let query = supabase
      .from('calls')
      .select('*')
      .eq('org_id', membership.org_id)
      .order('scheduled_at', { ascending: false, nullsFirst: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.deal_id) {
      query = query.eq('deal_id', filters.deal_id);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data ?? []) as Call[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchCall(callId: string): Promise<ActionResult<CallWithTranscript>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    // Fetch the call and its transcript in parallel
    const [callRes, transcriptRes] = await Promise.all([
      supabase
        .from('calls')
        .select('*')
        .eq('id', callId)
        .single(),
      supabase
        .from('call_transcripts')
        .select('*')
        .eq('call_id', callId)
        .maybeSingle(),
    ]);

    if (callRes.error) {
      return { success: false, error: callRes.error.message };
    }

    const callWithTranscript: CallWithTranscript = {
      ...(callRes.data as Call),
      transcript: (transcriptRes.data as CallTranscript) ?? null,
    };

    return { success: true, data: callWithTranscript };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
