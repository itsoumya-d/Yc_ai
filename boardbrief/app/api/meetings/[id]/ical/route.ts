import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { Meeting } from '@/types/database';

function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function formatICalDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function generateUID(id: string): string {
  return `${id}@boardbrief`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: meeting, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !meeting) {
    return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
  }

  const m = meeting as Meeting;

  if (!m.scheduled_at) {
    return NextResponse.json({ error: 'Meeting has no scheduled date' }, { status: 400 });
  }

  const startDate = new Date(m.scheduled_at);
  const endDate = new Date(startDate.getTime() + m.duration_minutes * 60 * 1000);
  const now = new Date();

  const description = [
    `Meeting Type: ${m.meeting_type}`,
    m.video_link ? `Video Link: ${m.video_link}` : '',
    m.notes ? `Notes: ${m.notes}` : '',
  ].filter(Boolean).join('\\n');

  const ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BoardBrief//Meeting Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${generateUID(m.id)}`,
    `DTSTAMP:${formatICalDate(now.toISOString())}`,
    `DTSTART:${formatICalDate(m.scheduled_at)}`,
    `DTEND:${formatICalDate(endDate.toISOString())}`,
    `SUMMARY:${escapeICalText(m.title)}`,
    `DESCRIPTION:${escapeICalText(description)}`,
    m.location ? `LOCATION:${escapeICalText(m.location)}` : '',
    `STATUS:${m.status === 'canceled' ? 'CANCELLED' : 'CONFIRMED'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');

  return new NextResponse(ical, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${m.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics"`,
    },
  });
}
