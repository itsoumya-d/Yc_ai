import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { aiRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(request: Request) {
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
          'Retry-After': String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, content, context } = await request.json();

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const systemPrompt = context
    ? `You are a creative writing assistant. Story context: ${context}. Write in a literary fiction style.`
    : 'You are a creative writing assistant. Write in a literary fiction style.';

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `${action}.\n\nExisting text:\n${content}\n\nWrite 2-3 paragraphs only.` },
    ],
    max_tokens: 500,
    temperature: 0.8,
  });

  return NextResponse.json({ text: completion.choices[0]?.message?.content ?? '' });
}
