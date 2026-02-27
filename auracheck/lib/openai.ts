import OpenAI from 'openai';
import type { SkinAnalysis, BodyArea } from '@/types/database';

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';
export const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

export async function analyzeSkin(
  imageBase64: string,
  bodyArea: BodyArea,
  fitzpatrickType: number,
  previousAnalysis?: string,
): Promise<SkinAnalysis> {
  const systemPrompt = `You are an expert dermatology AI assistant trained to analyze skin photos.
You are NOT a replacement for a dermatologist. Your role is to help users monitor their skin health.
IMPORTANT: Never use the word "diagnosis". Always recommend professional consultation for concerning findings.
Consider Fitzpatrick skin type ${fitzpatrickType} when analyzing color and pigmentation.`;

  const userPrompt = `Analyze this skin photo of the ${bodyArea.replace('_', ' ')} area.

${previousAnalysis ? `Previous analysis context: ${previousAnalysis}` : ''}

Provide:
1. Overall severity (stable/monitor/see_dermatologist)
2. Conditions observed with descriptions
3. For any moles/lesions: ABCDE assessment
4. Positive observations
5. Plain-language summary (no medical jargon)
6. Recommendation (home care / monitor / see dermatologist)

Return JSON only:
{
  "overall_severity": "stable" | "monitor" | "see_dermatologist",
  "conditions": [
    {
      "id": "1",
      "name": "Condition name",
      "description": "What was observed",
      "severity": "stable" | "monitor" | "see_dermatologist",
      "body_area_location": "upper left",
      "abcde": {
        "asymmetry": "Symmetric" (only for moles/lesions),
        "border": "Regular, well-defined",
        "color": "Uniform tan",
        "diameter": "Less than 6mm",
        "evolution": "Cannot assess from single image"
      }
    }
  ],
  "positive_observations": ["Clear, even skin tone in surrounding areas"],
  "summary": "Plain language 2-3 sentence summary",
  "recommendation": "home_care" | "monitor" | "see_dermatologist",
  "analyzed_at": "${new Date().toISOString()}"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'high' } },
          { type: 'text', text: userPrompt },
        ],
      },
    ],
    max_tokens: 1200,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No response from AI');
  return JSON.parse(content) as SkinAnalysis;
}

export function getMockAnalysis(bodyArea: BodyArea): SkinAnalysis {
  return {
    overall_severity: 'monitor',
    conditions: [
      {
        id: '1',
        name: 'Hyperpigmentation spot',
        description: 'Small area of increased pigmentation observed. Likely post-inflammatory or sun-related.',
        severity: 'monitor',
        body_area_location: 'center',
        abcde: {
          asymmetry: 'Slightly asymmetric',
          border: 'Relatively well-defined',
          color: 'Uniform darker brown',
          diameter: 'Approximately 4-5mm',
          evolution: 'Cannot assess from single image — compare with previous',
        },
      },
    ],
    positive_observations: [
      'Skin texture appears smooth in surrounding areas',
      'No signs of active inflammation',
    ],
    summary: `Skin on ${bodyArea.replace('_', ' ')} shows a small area of hyperpigmentation worth monitoring. No immediate concerns, but tracking changes over time is recommended.`,
    recommendation: 'monitor',
    analyzed_at: new Date().toISOString(),
  };
}
