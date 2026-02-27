'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface ActionResult<T = null> { data?: T; error?: string; }

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  link?: string;
  source: 'google' | 'microsoft' | 'boardbrief';
}

// Export meetings as .ics file content
export async function exportMeetingsAsICS(): Promise<ActionResult<string>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: meetings, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', user.id)
    .not('scheduled_at', 'is', null)
    .order('scheduled_at');

  if (error) return { error: error.message };

  const now = new Date();
  const formatICSDate = (dateStr: string) => {
    return new Date(dateStr).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BoardBrief//Meeting Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:BoardBrief Meetings',
    'X-WR-TIMEZONE:UTC',
  ];

  for (const meeting of meetings ?? []) {
    const startDate = new Date(meeting.scheduled_at!);
    const endDate = new Date(startDate.getTime() + (meeting.duration_minutes || 60) * 60000);

    icsLines.push(
      'BEGIN:VEVENT',
      `UID:boardbrief-${meeting.id}@boardbrief.app`,
      `DTSTAMP:${formatICSDate(now.toISOString())}`,
      `DTSTART:${formatICSDate(startDate.toISOString())}`,
      `DTEND:${formatICSDate(endDate.toISOString())}`,
      `SUMMARY:${meeting.title.replace(/,/g, '\\,')}`,
      ...(meeting.notes ? [`DESCRIPTION:${meeting.notes.replace(/\n/g, '\\n').replace(/,/g, '\\,').slice(0, 500)}`] : []),
      ...(meeting.location ? [`LOCATION:${meeting.location.replace(/,/g, '\\,')}`] : []),
      ...(meeting.video_link ? [`URL:${meeting.video_link}`] : []),
      `STATUS:${meeting.status === 'canceled' ? 'CANCELLED' : 'CONFIRMED'}`,
      'END:VEVENT'
    );
  }

  icsLines.push('END:VCALENDAR');

  return { data: icsLines.join('\r\n') };
}

// Add an external calendar event as a meeting
export async function importCalendarEvent(event: {
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  location?: string;
  video_link?: string;
  notes?: string;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('meetings')
    .insert({
      user_id: user.id,
      title: event.title,
      meeting_type: 'regular',
      status: 'scheduled',
      scheduled_at: event.scheduled_at,
      duration_minutes: event.duration_minutes || 60,
      location: event.location || null,
      video_link: event.video_link || null,
      notes: event.notes || null,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };
  revalidatePath('/meetings');
  return { data: { id: data.id } };
}

// Generate Google Calendar add link for a meeting
export function getGoogleCalendarLink(meeting: {
  title: string;
  scheduled_at: string | null;
  duration_minutes: number;
  location?: string | null;
  notes?: string | null;
  video_link?: string | null;
}): string | null {
  if (!meeting.scheduled_at) return null;

  const start = new Date(meeting.scheduled_at);
  const end = new Date(start.getTime() + (meeting.duration_minutes || 60) * 60000);

  const format = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: meeting.title,
    dates: `${format(start)}/${format(end)}`,
    ...(meeting.location ? { location: meeting.location } : {}),
    ...(meeting.notes ? { details: meeting.notes.slice(0, 500) } : {}),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Generate Outlook/Microsoft Calendar add link for a meeting
export function getOutlookCalendarLink(meeting: {
  title: string;
  scheduled_at: string | null;
  duration_minutes: number;
  location?: string | null;
  notes?: string | null;
}): string | null {
  if (!meeting.scheduled_at) return null;

  const start = new Date(meeting.scheduled_at);
  const end = new Date(start.getTime() + (meeting.duration_minutes || 60) * 60000);

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: meeting.title,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    ...(meeting.location ? { location: meeting.location } : {}),
    ...(meeting.notes ? { body: meeting.notes.slice(0, 500) } : {}),
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

// Get upcoming meetings for calendar view
export async function getUpcomingMeetings(days = 30): Promise<ActionResult<CalendarEvent[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const from = new Date().toISOString();
  const to = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('meetings')
    .select('id, title, scheduled_at, duration_minutes, location, video_link, notes')
    .eq('user_id', user.id)
    .gte('scheduled_at', from)
    .lte('scheduled_at', to)
    .order('scheduled_at');

  if (error) return { error: error.message };

  const events: CalendarEvent[] = (data ?? []).map((m) => ({
    id: m.id,
    title: m.title,
    start: m.scheduled_at!,
    end: new Date(new Date(m.scheduled_at!).getTime() + (m.duration_minutes || 60) * 60000).toISOString(),
    description: m.notes ?? undefined,
    location: m.location ?? undefined,
    link: m.video_link ?? undefined,
    source: 'boardbrief',
  }));

  return { data: events };
}

// Save Google OAuth tokens for calendar sync
export async function saveCalendarIntegration(
  provider: 'google' | 'microsoft',
  accessToken: string,
  refreshToken: string,
  expiresAt: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Store as user metadata (in production, use a dedicated integrations table)
  const { error } = await supabase.auth.updateUser({
    data: {
      [`${provider}_calendar_token`]: accessToken,
      [`${provider}_calendar_refresh`]: refreshToken,
      [`${provider}_calendar_expires`]: expiresAt,
    },
  });

  if (error) return { error: error.message };
  revalidatePath('/settings');
  return {};
}

export async function disconnectCalendarIntegration(provider: 'google' | 'microsoft'): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.auth.updateUser({
    data: {
      [`${provider}_calendar_token`]: null,
      [`${provider}_calendar_refresh`]: null,
      [`${provider}_calendar_expires`]: null,
    },
  });

  if (error) return { error: error.message };
  revalidatePath('/settings');
  return {};
}
