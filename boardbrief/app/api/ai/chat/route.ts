import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

const SYSTEM_PROMPT = `You are BoardBrief AI — an intelligent board governance assistant. You help board directors and executives manage board operations, interpret meeting minutes, draft resolutions, and ensure governance compliance.

You have access to the user's actual board data (meetings, documents, resolutions) shown below. Use this data to give specific, actionable answers. Be professional and concise.`;

async function getUserContext(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<string> {
  const [meetings, documents, resolutions] = await Promise.allSettled([
    supabase.from('meetings').select('title, meeting_date, status, agenda_items').eq('owner_id', userId).order('meeting_date', { ascending: false }).limit(5),
    supabase.from('documents').select('title, type, created_at').eq('owner_id', userId).limit(8),
    supabase.from('resolutions').select('title, decision_date, status').eq('owner_id', userId).order('decision_date', { ascending: false }).limit(5),
  ]);

  const lines: string[] = [];

  if (meetings.status === 'fulfilled' && meetings.value.data?.length) {
    lines.push('Recent board meetings: ' + meetings.value.data.map(m => `${m.title} on ${m.meeting_date} (${m.status})`).join('; '));
  }
  if (documents.status === 'fulfilled' && documents.value.data?.length) {
    lines.push('Board documents: ' + documents.value.data.map(d => `${d.title} (${d.type})`).join(', '));
  }
  if (resolutions.status === 'fulfilled' && resolutions.value.data?.length) {
    lines.push('Recent resolutions: ' + resolutions.value.data.map(r => `${r.title} — ${r.status} (${r.decision_date})`).join('; '));
  }

  return lines.length ? lines.join('\n') : 'No board data found yet.';
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages required' }), { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI not configured' }), { status: 503 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response('Unauthorized', { status: 401 });

    const context = await getUserContext(supabase, user.id);
    const openai = new OpenAI({ apiKey });

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      max_tokens: 800,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + '\n\nUser board data:\n' + context },
        ...messages.slice(-10),
      ],
    });

    const readable = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? '';
            if (text) controller.enqueue(enc.encode(text));
          }
        } finally {
          controller.close();
        }
      },
      cancel() { stream.controller.abort(); },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' },
    });
  } catch (err) {
    console.error('[AI Chat] Error:', err);
    return new Response(JSON.stringify({ error: 'Chat failed' }), { status: 500 });
  }
}
