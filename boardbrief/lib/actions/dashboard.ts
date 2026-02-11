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

  const [meetingsRes, membersRes, actionsRes, resolutionsRes] = await Promise.all([
    supabase.from('meetings').select('*').eq('user_id', user.id).in('status', ['draft', 'scheduled']).order('scheduled_at', { ascending: true, nullsFirst: false }).limit(5),
    supabase.from('board_members').select('id').eq('user_id', user.id).eq('is_active', true),
    supabase.from('action_items').select('*').eq('user_id', user.id).in('status', ['open', 'in_progress']).order('due_date', { ascending: true, nullsFirst: false }).limit(5),
    supabase.from('resolutions').select('id').eq('user_id', user.id).in('status', ['draft', 'voting']),
  ]);

  return {
    data: {
      meetingCount: (meetingsRes.data ?? []).length,
      boardMemberCount: (membersRes.data ?? []).length,
      openActionItems: (actionsRes.data ?? []).length,
      pendingResolutions: (resolutionsRes.data ?? []).length,
      upcomingMeetings: (meetingsRes.data ?? []) as Meeting[],
      recentActionItems: (actionsRes.data ?? []) as ActionItem[],
    },
  };
}
