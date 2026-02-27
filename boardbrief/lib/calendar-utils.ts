// Client-safe calendar utility functions (no 'use server' directive)

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
