'use server';

import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface ActionResult<T = null> { data?: T; error?: string; }

function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function transcribeMeetingAudio(
  meetingId: string,
  formData: FormData
): Promise<ActionResult<{ transcript: string; transcript_url: string | null }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify meeting ownership
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .select('id, title')
    .eq('id', meetingId)
    .eq('user_id', user.id)
    .single();

  if (meetingError || !meeting) return { error: 'Meeting not found' };

  const audioFile = formData.get('audio') as File | null;
  if (!audioFile) return { error: 'No audio file provided' };

  // Validate file type
  const allowedTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/flac', 'video/mp4', 'video/webm'];
  if (!allowedTypes.includes(audioFile.type)) {
    return { error: 'Unsupported file type. Please upload MP3, MP4, WAV, WEBM, OGG, or FLAC.' };
  }

  // Validate file size (25MB limit for Whisper)
  if (audioFile.size > 25 * 1024 * 1024) {
    return { error: 'File too large. Maximum size is 25MB.' };
  }

  if (!process.env.OPENAI_API_KEY) {
    return { error: 'OpenAI API key not configured' };
  }

  try {
    const openai = getOpenAI();

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text',
    });

    const transcript = typeof transcription === 'string' ? transcription : (transcription as { text: string }).text;

    // Store transcript in Supabase Storage if bucket exists
    let transcriptUrl: string | null = null;
    try {
      const fileName = `transcripts/${user.id}/${meetingId}_${Date.now()}.txt`;
      const blob = new Blob([transcript], { type: 'text/plain' });
      const { data: uploadData } = await supabase.storage
        .from('meeting-recordings')
        .upload(fileName, blob, { upsert: true });

      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('meeting-recordings')
          .getPublicUrl(fileName);
        transcriptUrl = urlData?.publicUrl ?? null;
      }
    } catch {
      // Storage optional — continue without it
    }

    // Save transcript to meeting notes (append)
    const { data: existingMeeting } = await supabase
      .from('meetings')
      .select('notes')
      .eq('id', meetingId)
      .single();

    const currentNotes = existingMeeting?.notes || '';
    const transcriptSection = `\n\n---\n## Meeting Transcript\n${transcript}`;
    const updatedNotes = currentNotes.includes('## Meeting Transcript')
      ? currentNotes
      : currentNotes + transcriptSection;

    await supabase
      .from('meetings')
      .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
      .eq('id', meetingId)
      .eq('user_id', user.id);

    revalidatePath(`/meetings/${meetingId}`);

    return { data: { transcript, transcript_url: transcriptUrl } };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Transcription failed' };
  }
}

export async function generateMinutesFromTranscript(
  meetingId: string,
  transcript: string,
  meetingTitle: string
): Promise<ActionResult<string>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  if (!process.env.OPENAI_API_KEY) {
    return { error: 'OpenAI API key not configured' };
  }

  try {
    const openai = getOpenAI();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional board secretary. Generate formal meeting minutes from a transcript.
Structure the output as:
# Meeting Minutes: [Title]
**Date:** [if mentioned]
**Attendees:** [if mentioned]

## 1. Call to Order
## 2. Key Discussions
[List main topics discussed with brief summaries]

## 3. Decisions Made
[List explicit decisions or votes]

## 4. Action Items
[List any tasks assigned with owner if mentioned]

## 5. Next Steps
[Upcoming items or next meeting info]

Use professional governance language. Be concise and accurate.`,
        },
        {
          role: 'user',
          content: `Meeting Title: "${meetingTitle}"\n\nTranscript:\n${transcript}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const minutes = response.choices[0]?.message?.content;
    if (!minutes) return { error: 'Failed to generate minutes' };

    // Append generated minutes to meeting notes
    const { data: existingMeeting } = await supabase
      .from('meetings')
      .select('notes')
      .eq('id', meetingId)
      .single();

    const currentNotes = existingMeeting?.notes || '';
    const minutesSection = `\n\n---\n${minutes}`;

    // Replace existing minutes section if present
    const notesWithoutOldMinutes = currentNotes.replace(
      /\n\n---\n# Meeting Minutes:.*$/s,
      ''
    );

    await supabase
      .from('meetings')
      .update({
        notes: notesWithoutOldMinutes + minutesSection,
        updated_at: new Date().toISOString(),
      })
      .eq('id', meetingId)
      .eq('user_id', user.id);

    revalidatePath(`/meetings/${meetingId}`);

    return { data: minutes };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to generate minutes' };
  }
}
