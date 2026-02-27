import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import { Readable } from 'stream';

export const runtime = 'nodejs';
// Allow up to 50MB audio upload
export const maxDuration = 60;

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: meetingId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // Verify meeting ownership
  const { data: meeting } = await supabase
    .from('meetings')
    .select('id, title')
    .eq('id', meetingId)
    .eq('user_id', user.id)
    .single();

  if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get('audio') as File | null;

  if (!file) return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });

  // Validate file type
  const validTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a', 'video/mp4', 'video/webm'];
  if (!validTypes.some((t) => file.type.startsWith(t.split('/')[0]))) {
    return NextResponse.json({ error: 'Invalid file type. Use MP3, MP4, WAV, or WebM.' }, { status: 400 });
  }

  // Upload to Supabase Storage (meeting-recordings bucket)
  const service = createServiceClient();
  const ext = file.name.split('.').pop() ?? 'mp3';
  const storagePath = `${user.id}/${meetingId}/${Date.now()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await service.storage
    .from('meeting-recordings')
    .upload(storagePath, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 });
  }

  // Transcribe with Whisper via OpenAI
  const openai = getOpenAI();

  // Convert buffer to a File-like object for OpenAI SDK
  const audioFile = new File([buffer], file.name, { type: file.type });

  let transcription: string;
  try {
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text',
      language: 'en',
    });
    transcription = typeof response === 'string' ? response : (response as { text: string }).text;
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Transcription failed' }, { status: 500 });
  }

  // Save transcription to the meeting's notes (appended) and store storage path
  const { error: updateError } = await supabase
    .from('meetings')
    .update({
      transcription,
      recording_url: storagePath,
      updated_at: new Date().toISOString(),
    })
    .eq('id', meetingId)
    .eq('user_id', user.id);

  if (updateError) {
    // Non-fatal: return transcription even if DB update fails
    console.error('Failed to save transcription to DB:', updateError.message);
  }

  return NextResponse.json({ transcription });
}
