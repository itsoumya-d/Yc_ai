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
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

const SYSTEM_PROMPTS: Record<AIActionType, string> = {
  continue:
    'You are a creative fiction writing assistant. Continue the story naturally, maintaining the established voice, tone, and style. Write 150-300 words that flow seamlessly from the provided text.',
  continue_dramatic:
    'You are a dramatic fiction writer. Continue the story with heightened emotional intensity, vivid sensory details, and tension-building prose. Write 150-300 words.',
  continue_subtle:
    'You are a literary fiction writer. Continue the story with subtle, understated prose. Focus on subtext, implication, and quiet observation rather than overt action. Write 150-300 words.',
  continue_action:
    'You are an action/thriller fiction writer. Continue with fast-paced, kinetic prose: short sentences, active verbs, visceral details. Write 150-300 words.',
  continue_dialogue:
    'You are a dialogue-focused fiction writer. Continue the scene with natural, revealing dialogue that advances character and plot. Include minimal action beats. Write 150-300 words.',
  dialogue:
    'You are a dialogue specialist for fiction writing. Generate natural, character-appropriate dialogue based on the character voice description and situation. Include dialogue tags and brief action beats.',
  improve_dialogue:
    'You are a dialogue editor. Rewrite the provided dialogue to sound more natural, character-distinct, and emotionally resonant. Fix stilted phrasing and add subtext. Return only the improved dialogue.',
  rephrase:
    'You are an expert prose editor. Rephrase the provided text while maintaining its meaning. Improve clarity, rhythm, and word choice. Return only the rephrased text.',
  fix_prose:
    'You are a meticulous prose editor. Fix grammar, punctuation, awkward phrasing, and improve sentence flow. Maintain the original voice and style. Return only the corrected text.',
  enhance_description:
    'You are a descriptive writing specialist. Enhance the provided passage with richer sensory details, more evocative language, and deeper scene-setting. Return the enhanced version.',
  consistency_check:
    'You are a story continuity editor. Analyze the provided text for internal inconsistencies in character names, locations, timelines, or established facts. List each issue found as a bullet point. If no issues found, say "No consistency issues detected."',
  plot_hole_detect:
    'You are a story structure analyst. Identify potential plot holes, unresolved threads, or logical gaps in the provided story excerpt. Format each finding as a numbered list with a brief explanation.',
  readability_score:
    'You are a readability analyst. Analyze the provided text and return a JSON object with: { score: number (0-100), grade_level: string, avg_sentence_length: number, complex_word_percent: number, suggestions: string[] }',
  tone_analyze:
    'You are a tone and mood analyst for creative writing. Analyze the emotional tone of the provided text and return a JSON object with: { primary_tone: string, secondary_tones: string[], mood: string, formality: string, suggestions: string[] }',
  pacing_analyze:
    'You are a narrative pacing expert. Analyze the pacing of the provided text and return a JSON object with: { pacing: string (slow/medium/fast/variable), scene_types: string[], tension_level: number (1-10), suggestions: string[] }',
};

const TOKEN_LIMITS: Partial<Record<AIActionType, number>> = {
  continue: 500,
  continue_dramatic: 500,
  continue_subtle: 500,
  continue_action: 500,
  continue_dialogue: 500,
  readability_score: 200,
  tone_analyze: 200,
  pacing_analyze: 200,
  consistency_check: 400,
  plot_hole_detect: 400,
};

const TEMPERATURE_MAP: Partial<Record<AIActionType, number>> = {
  fix_prose: 0.2,
  consistency_check: 0.2,
  plot_hole_detect: 0.3,
  readability_score: 0.1,
  tone_analyze: 0.1,
  pacing_analyze: 0.1,
  rephrase: 0.5,
};

export async function generateWritingAssistance(
  actionType: AIActionType,
  content: string,
  context: string,
  extra: string,
): Promise<ActionResult<string>> {
  try {
    const openai = getOpenAI();

    let userMessage: string;
    if (actionType === 'continue' || actionType.startsWith('continue_')) {
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
      temperature: TEMPERATURE_MAP[actionType] ?? 0.7,
      max_tokens: TOKEN_LIMITS[actionType] ?? 300,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) return { error: 'No response from AI' };

    return { data: result };
  } catch (error) {
    console.error('OpenAI error:', error);
    return { error: 'Failed to generate text. Please try again.' };
  }
}
