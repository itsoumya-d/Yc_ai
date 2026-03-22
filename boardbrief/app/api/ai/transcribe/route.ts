import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 120; // 2 min for large audio files

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const meetingId = formData.get('meetingId') as string;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Whisper supports up to 25MB
    const MAX_SIZE = 25 * 1024 * 1024;
    if (audioFile.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Audio file exceeds 25MB limit. Please upload a shorter recording.' },
        { status: 413 }
      );
    }

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    });

    // Generate meeting summary with GPT-4o
    const summary = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a board meeting assistant. Extract: key decisions made, action items with owners, discussion topics, and a concise executive summary. Return JSON with keys: summary, decisions[], actionItems[{task, owner, deadline}], topics[]',
        },
        {
          role: 'user',
          content: `Meeting transcript:\n\n${transcription.text}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const structured = JSON.parse(summary.choices[0].message.content ?? '{}');

    // Save to meeting notes in Supabase if meetingId provided
    if (meetingId) {
      await supabase
        .from('meetings')
        .update({
          transcript: transcription.text,
          ai_summary: structured.summary,
          ai_action_items: structured.actionItems,
          ai_decisions: structured.decisions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', meetingId)
        .eq('board_id', user.id);
    }

    return NextResponse.json({
      transcript: transcription.text,
      segments: transcription.segments,
      structured,
      duration: transcription.duration,
    });
  } catch (error) {
    console.error('[Transcription] Error:', error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
