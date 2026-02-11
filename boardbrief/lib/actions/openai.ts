'use server';

import OpenAI from 'openai';
import type { AIGenerationType } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

const SYSTEM_PROMPTS: Record<AIGenerationType, string> = {
  agenda: 'You are a board meeting preparation specialist for startup founders. Generate a structured meeting agenda with topics, time allocations, and presenter assignments. Format with clear sections and bullet points.',
  summary: 'You are a board secretary AI assistant. Generate a concise meeting summary with key decisions, discussion highlights, and next steps. Use professional governance language.',
  resolution: 'You are a corporate governance specialist. Draft a formal board resolution with proper legal language, WHEREAS clauses, and RESOLVED statements.',
};

export async function generateMeetingAI(
  generationType: AIGenerationType,
  content: string,
  context: string
): Promise<ActionResult<string>> {
  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS[generationType] },
        { role: 'user', content: `${content}\n\nContext: ${context}` },
      ],
      temperature: generationType === 'resolution' ? 0.3 : 0.5,
      max_tokens: 1500,
    });
    const result = response.choices[0]?.message?.content;
    if (!result) return { error: 'No content generated' };
    return { data: result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to generate content' };
  }
}
