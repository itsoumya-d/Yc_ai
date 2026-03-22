import { NextRequest } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  const { prompt, context } = await request.json();
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a legal AI assistant specializing in personal injury and insurance claims. Generate detailed case summaries, evidence analysis, and legal briefs.' },
      { role: 'user', content: `${prompt}\n\nContext: ${context || ''}` },
    ],
    max_tokens: 1500,
    stream: true,
  });

  const readableStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? '';
        if (text) controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
    cancel() { stream.controller.abort(); },
  });

  return new Response(readableStream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
