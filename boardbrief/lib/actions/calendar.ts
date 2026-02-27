'use server';

import { createClient } from '@/lib/supabase/server';
import type { Meeting } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

/**
 * Generate a Google Calendar "add event" URL for a meeting.
 */
export async function getGoogleCalendarUrl(meetingId: string): Promise<ActionResult<string>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: meeting, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', meetingId)
    .eq('user_id', user.id)
    .single();

  if (error || !meeting) return { error: 'Meeting not found' };

  const m = meeting as Meeting;
  if (!m.scheduled_at) return { error: 'Meeting has no scheduled date' };

  const start = new Date(m.scheduled_at);
  const end = new Date(start.getTime() + m.duration_minutes * 60 * 1000);

  const formatGCal = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const details = [
    `Meeting Type: ${m.meeting_type}`,
    m.video_link ? `Video Link: ${m.video_link}` : '',
    m.notes ? `Notes: ${m.notes}` : '',
  ].filter(Boolean).join('\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: m.title,
    dates: `${formatGCal(start)}/${formatGCal(end)}`,
    details,
    ...(m.location ? { location: m.location } : {}),
  });

  return { data: `https://calendar.google.com/calendar/render?${params.toString()}` };
}

/**
 * Get all upcoming meetings for calendar feed.
 */
export async function getUpcomingMeetingsForCalendar(): Promise<ActionResult<Meeting[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['draft', 'scheduled'])
    .gte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(20);

  if (error) return { error: error.message };
  return { data: (data ?? []) as Meeting[] };
}
