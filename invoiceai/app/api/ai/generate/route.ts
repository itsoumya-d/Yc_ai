import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { aiRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

const SYSTEM_PROMPT =
  'You are a professional invoicing AI assistant. Help businesses write invoice descriptions, payment terms, follow-up emails, and financial summaries.';

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for') ??
      request.headers.get('x-real-ip') ??
      'anonymous';
    const rateLimitResult = aiRateLimit(ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            ...getRateLimitHeaders(rateLimitResult, 5),
            'Retry-After': String(
              Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        {
          status: 401,
          headers: {
            ...getRateLimitHeaders(rateLimitResult, 5),
          },
        }
      );
    }

    const { prompt, context } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        {
          status: 400,
          headers: {
            ...getRateLimitHeaders(rateLimitResult, 5),
          },
        }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        {
          status: 503,
          headers: {
            ...getRateLimitHeaders(rateLimitResult, 5),
          },
        }
      );
    }

    const openai = new OpenAI({ apiKey });

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: context ? `Context: ${context}\n\n${prompt}` : prompt,
        },
      ],
      max_tokens: 1000,
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
        ...getRateLimitHeaders(rateLimitResult, 5),
      },
    });
  } catch (err) {
    console.error('[AI Generate] Error:', err);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
