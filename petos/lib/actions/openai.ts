'use server';

import OpenAI from 'openai';

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

export async function analyzeSymptomPhoto(
  imageUrl: string,
  species: string,
  breed: string,
  age: string,
  symptomDescription: string,
  severity: string
): Promise<ActionResult<{ analysis: string; recommendation: string; urgency: string }>> {
  try {
    const openai = getOpenAI();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a veterinary visual assessment assistant. Analyze the pet photo along with the symptom description to provide helpful guidance. Always recommend consulting a veterinarian for serious concerns. Format your response as JSON with "analysis" (visual assessment + symptom analysis, max 400 words), "recommendation" (actionable next steps, max 200 words), and "urgency" (one of: "routine", "soon", "urgent", "emergency") fields.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `My ${species} (${breed}, ${age}) is experiencing the following symptoms with ${severity} severity:\n\n${symptomDescription}\n\nPlease analyze the attached photo along with the symptoms described above.`,
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl, detail: 'low' },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return { error: 'No response from AI' };

    const parsed = JSON.parse(content) as { analysis: string; recommendation: string; urgency: string };
    return { data: parsed };
  } catch (error) {
    console.error('OpenAI Vision error:', error);
    return { error: 'Failed to analyze photo. Please try again.' };
  }
}

export async function analyzeSymptoms(
  description: string,
  species: string,
  breed: string,
  age: string,
  severity: string
): Promise<ActionResult<{ analysis: string; recommendation: string }>> {
  try {
    const openai = getOpenAI();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a veterinary health assistant. Analyze pet symptoms and provide helpful guidance. Always recommend consulting a veterinarian for serious concerns. Format your response as JSON with "analysis" and "recommendation" fields. Keep each field under 300 words.`,
        },
        {
          role: 'user',
          content: `My ${species} (${breed}, ${age}) is experiencing the following symptoms with ${severity} severity:\n\n${description}\n\nPlease analyze these symptoms and provide a recommendation.`,
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
