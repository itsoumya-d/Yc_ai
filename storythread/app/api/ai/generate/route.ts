import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

type GenerationType = 'continue' | 'dialogue' | 'rephrase' | 'fix_prose' | 'describe_scene';

const SYSTEM_PROMPTS: Record<GenerationType, string> = {
  continue:
    "You are a creative writing assistant helping authors continue their story. Match the established tone, style, and voice of the existing text. Write naturally flowing prose that fits seamlessly with what came before.",
  dialogue:
    "You are a creative writing assistant specializing in authentic character dialogue. Write dialogue that reveals character personality, advances the plot, and feels natural and distinct to each speaker.",
  rephrase:
    "You are a creative writing editor. Rephrase the provided text to improve flow, clarity, and style while preserving the original meaning and tone.",
  fix_prose:
    "You are a professional copy editor. Fix grammar, punctuation, word choice, and awkward phrasing in the provided text. Preserve the author's voice while improving quality.",
  describe_scene:
    "You are a creative writing assistant specializing in vivid scene descriptions. Create immersive, sensory descriptions that bring settings and moments to life.",
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  let body: { type: GenerationType; content: string; context?: string; extra?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { type, content, context, extra } = body;

  if (!type || !content?.trim()) {
    return NextResponse.json({ error: 'type and content are required' }, { status: 400 });
  }

  const systemPrompt = SYSTEM_PROMPTS[type] ?? SYSTEM_PROMPTS.continue;

  let userPrompt: string;
  switch (type) {
    case 'continue':
      userPrompt = `Story context:\n${context ?? ''}\n\nExisting text to continue from:\n${content}\n\nContinue the story naturally for 2-3 paragraphs:`;
      break;
    case 'dialogue':
      userPrompt = `Character: ${extra ?? 'the character'}\nContext: ${context ?? ''}\n\nWrite dialogue for this character in this scene:\n${content}`;
      break;
    case 'rephrase':
      userPrompt = `Rephrase this text in a ${extra ?? 'clearer'} tone:\n\n${content}`;
      break;
    case 'fix_prose':
      userPrompt = `Fix and improve this prose:\n\n${content}`;
      break;
    case 'describe_scene':
      userPrompt = `Describe this scene vividly:\n${content}\n\nAdditional context: ${context ?? ''}`;
      break;
    default:
      userPrompt = content;
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 600,
    stream: true,
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? '';
        if (text) {
          controller.enqueue(encoder.encode(text));
        }
      }
      controller.close();
    },
  });

  return new NextResponse(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
