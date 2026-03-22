import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

const SYSTEM_PROMPTS: Record<string, string> = {
  agenda: 'You are a board meeting preparation specialist for startup founders. Generate a structured meeting agenda with numbered items, time allocations, presenter assignments, and brief descriptions. Use clear formatting with line breaks between sections.',
  summary: 'You are a board secretary AI assistant. Generate a concise meeting summary with key decisions, discussion highlights, and next steps. Use professional governance language with clear sections.',
  resolution: 'You are a corporate governance specialist. Draft a formal board resolution with proper legal language, WHEREAS clauses, and RESOLVED statements. Number each clause clearly.',
  investor_update: 'You are a startup communications expert. Write a professional investor update email covering highlights, metrics, challenges, and asks. Keep it concise and data-driven.',
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, content, context } = await request.json();

    const systemPrompt = SYSTEM_PROMPTS[type];
    if (!systemPrompt) {
      return NextResponse.json({ error: 'Invalid generation type' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 503 });
    }

    const openai = new OpenAI({ apiKey });

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${content}\n\nContext: ${context || 'No additional context.'}` },
      ],
      temperature: type === 'resolution' ? 0.3 : 0.6,
      max_tokens: 1500,
      stream: true,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? '';
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } finally {
          controller.close();
        }
      },
      cancel() {
        stream.controller.abort();
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    console.error('[AI Generate] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
