'use server';

import OpenAI from 'openai';
import type { AIActionType } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

const SYSTEM_PROMPTS: Record<AIActionType, string> = {
  continue: 'You are a creative fiction writing assistant. Continue the story naturally, maintaining the established voice, tone, and style. Write 150-300 words that flow seamlessly from the provided text.',
  dialogue: 'You are a dialogue specialist for fiction writing. Generate natural, character-appropriate dialogue based on the character voice description and situation. Include dialogue tags and brief action beats.',
  rephrase: 'You are an expert prose editor. Rephrase the provided text while maintaining its meaning. Improve clarity, rhythm, and word choice. Return only the rephrased text.',
  fix_prose: 'You are a meticulous prose editor. Fix grammar, punctuation, awkward phrasing, and improve sentence flow. Maintain the original voice and style. Return only the corrected text.',
};

export async function generateWritingAssistance(
  actionType: AIActionType,
  content: string,
  context: string,
  extra: string
): Promise<ActionResult<string>> {
  try {
    const openai = getOpenAI();

    let userMessage: string;
    if (actionType === 'continue') {
      userMessage = `Story context:\n${context}\n\nCharacters:\n${extra}\n\nCurrent text (continue from here):\n${content}`;
    } else if (actionType === 'dialogue') {
      userMessage = `Character: ${context}\nVoice/Situation: ${extra}\n\nScene context:\n${content}\n\nGenerate dialogue for this character.`;
    } else {
      userMessage = content;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS[actionType] },
        { role: 'user', content: userMessage },
      ],
      temperature: actionType === 'fix_prose' ? 0.2 : 0.7,
      max_tokens: actionType === 'continue' ? 500 : 300,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) return { error: 'No response from AI' };

    return { data: result };
  } catch (error) {
    console.error('OpenAI error:', error);
    return { error: 'Failed to generate text. Please try again.' };
  }
}
