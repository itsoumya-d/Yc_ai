import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeICalText(text: string): string {
  return text.replace(/[\\;,]/g, (char) => `\\${char}`).replace(/\n/g, '\\n');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: meeting } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!meeting) {
    return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
  }

  const startDate = meeting.scheduled_at ? new Date(meeting.scheduled_at) : new Date();
  const endDate = new Date(startDate.getTime() + (meeting.duration_minutes ?? 60) * 60 * 1000);
  const now = new Date();

  const location = meeting.video_link ?? meeting.location ?? '';
  const description = meeting.notes ? escapeICalText(meeting.notes) : '';

  const ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BoardBrief//BoardBrief//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${formatICalDate(startDate)}`,
    `DTEND:${formatICalDate(endDate)}`,
    `DTSTAMP:${formatICalDate(now)}`,
    `UID:meeting-${meeting.id}@boardbrief`,
    `SUMMARY:${escapeICalText(meeting.title)}`,
    location ? `LOCATION:${escapeICalText(location)}` : null,
    description ? `DESCRIPTION:${description}` : null,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');

  const filename = `${meeting.title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-')}.ics`;

  return new NextResponse(ical, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
