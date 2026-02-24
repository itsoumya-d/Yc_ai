import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

export async function POST(
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

  // Verify meeting belongs to user
  const { data: meeting } = await supabase
    .from('meetings')
    .select('id, notes')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!meeting) {
    return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
  }

  const formData = await request.formData();
  const audioFile = formData.get('audio') as File | null;

  if (!audioFile) {
    return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const transcription = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: audioFile,
    response_format: 'text',
  });

  const transcript = typeof transcription === 'string' ? transcription : (transcription as { text: string }).text;

  // Append transcript to meeting notes
  const existingNotes = meeting.notes ?? '';
  const separator = existingNotes ? '\n\n---\n\n' : '';
  const updatedNotes = `${existingNotes}${separator}**Meeting Transcript:**\n${transcript}`;

  await supabase
    .from('meetings')
    .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id);

  return NextResponse.json({ transcript });
}
