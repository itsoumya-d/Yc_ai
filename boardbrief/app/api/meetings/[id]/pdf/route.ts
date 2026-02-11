import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import ReactPDF from '@react-pdf/renderer';
import { MeetingDocument } from '@/components/meetings/meeting-pdf';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch meeting with action items and resolutions
  const [meetingRes, actionsRes, resolutionsRes] = await Promise.all([
    supabase.from('meetings').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('action_items').select('*').eq('meeting_id', id).order('created_at'),
    supabase.from('resolutions').select('*').eq('meeting_id', id).order('created_at'),
  ]);

  if (meetingRes.error || !meetingRes.data) {
    return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
  }

  const meeting = {
    ...meetingRes.data,
    action_items: actionsRes.data ?? [],
    resolutions: resolutionsRes.data ?? [],
  };

  // Fetch user profile for organization name
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, business_name')
    .eq('id', user.id)
    .single();

  const pdfStream = await ReactPDF.renderToStream(
    MeetingDocument({ meeting, organizationName: profile?.business_name || profile?.full_name || '' })
  );

  const chunks: Uint8Array[] = [];
  const reader = pdfStream as unknown as NodeJS.ReadableStream;
  for await (const chunk of reader) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const pdfBuffer = Buffer.concat(chunks);

  const filename = `${meeting.title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-')}-minutes.pdf`;

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
