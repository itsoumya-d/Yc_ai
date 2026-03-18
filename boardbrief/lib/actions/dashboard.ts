'use server';

import { createClient } from '@/lib/supabase/server';
import type { Meeting, ActionItem } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

interface DashboardData {
  meetingCount: number;
  boardMemberCount: number;
  openActionItems: number;
  pendingResolutions: number;
  upcomingMeetings: Meeting[];
  recentActionItems: ActionItem[];
}

export async function getDashboardData(): Promise<ActionResult<DashboardData>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Run all dashboard queries in parallel with explicit column selection (avoids SELECT *)
  const [meetingsRes, membersRes, actionsRes, resolutionsRes] = await Promise.all([
    supabase.from('meetings').select('id, title, status, scheduled_at, location, agenda_id').eq('user_id', user.id).in('status', ['draft', 'scheduled']).order('scheduled_at', { ascending: true, nullsFirst: false }).limit(5),
    supabase.from('board_members').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_active', true),
    supabase.from('action_items').select('id, title, status, due_date, priority, assignee_id').eq('user_id', user.id).in('status', ['open', 'in_progress']).order('due_date', { ascending: true, nullsFirst: false }).limit(5),
    supabase.from('resolutions').select('id', { count: 'exact', head: true }).eq('user_id', user.id).in('status', ['draft', 'voting']),
  ]);

  return {
    data: {
      meetingCount: meetingsRes.data?.length ?? 0,
      boardMemberCount: membersRes.count ?? 0,
      openActionItems: actionsRes.data?.length ?? 0,
      pendingResolutions: resolutionsRes.count ?? 0,
      upcomingMeetings: (meetingsRes.data ?? []) as Meeting[],
      recentActionItems: (actionsRes.data ?? []) as ActionItem[],
    },
  };
}
