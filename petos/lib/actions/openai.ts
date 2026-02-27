'use server';

import OpenAI from 'openai';
import type { ChatCompletionContentPart } from 'openai/resources/chat/completions';

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

export async function analyzeSymptoms(
  description: string,
  species: string,
  breed: string,
  age: string,
  severity: string,
  photoUrl?: string
): Promise<ActionResult<{ analysis: string; recommendation: string }>> {
  try {
    const openai = getOpenAI();

    // Build user message — include image if provided (GPT-4o Vision)
    const userContent: ChatCompletionContentPart[] = [
      {
        type: 'text',
        text: `My ${species} (${breed}, ${age}) is experiencing the following symptoms with ${severity} severity:\n\n${description}\n\nPlease analyze these symptoms and provide a recommendation.`,
      },
    ];

    if (photoUrl) {
      userContent.push({
        type: 'image_url',
        image_url: { url: photoUrl, detail: 'high' },
      });
    }

    const response = await openai.chat.completions.create({
      // Use gpt-4o when a photo is provided (Vision), gpt-4o-mini for text-only
      model: photoUrl ? 'gpt-4o' : 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a veterinary health assistant. Analyze pet symptoms${photoUrl ? ', including any photo provided,' : ''} and provide helpful guidance. Always recommend consulting a veterinarian for serious concerns. Format your response as JSON with "analysis" and "recommendation" fields. Keep each field under 300 words.`,
        },
        {
          role: 'user',
          content: userContent,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return { error: 'No response from AI' };

    const parsed = JSON.parse(content) as { analysis: string; recommendation: string };
    return { data: parsed };
  } catch (error) {
    console.error('OpenAI error:', error);
    return { error: 'Failed to analyze symptoms. Please try again.' };
  }
}
