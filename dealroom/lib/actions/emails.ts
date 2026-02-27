'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { ActionResult, Email } from '@/types/database';

export async function fetchEmails(dealId?: string): Promise<ActionResult<Email[]>> {
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
      .from('emails')
      .select('*')
      .eq('org_id', membership.org_id)
      .order('sent_at', { ascending: false });

    if (dealId) {
      query = query.eq('deal_id', dealId);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data ?? []) as Email[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchEmailThread(threadId: string): Promise<ActionResult<Email[]>> {
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
      .from('emails')
      .select('*')
      .eq('org_id', membership.org_id)
      .eq('thread_id', threadId)
      .order('sent_at', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data ?? []) as Email[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
