import OpenAI from 'openai';
import type { AIAnalysisResult, DamageType, Severity, Urgency } from '@/types';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not configured');
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export function setOpenAIKey(key: string) {
  openaiClient = new OpenAI({ apiKey: key });
}

export async function analyzeDamagePhoto(imageBase64: string): Promise<AIAnalysisResult> {
  const client = getOpenAIClient();

  const prompt = `Analyze this property damage photo. Identify:
1) Type of damage (water, fire, wind, structural, electrical, vandalism, or other)
2) Severity (minor/moderate/severe/total_loss)
3) Affected components (roof, walls, flooring, ceiling, foundation, electrical, plumbing, windows, doors, etc.)
4) Estimated repair cost range in USD
5) Urgency (immediate/can_wait/cosmetic)
6) Confidence percentage (0-100)
7) Specific recommendations for repair/mitigation

Return ONLY valid JSON in this exact format:
{
  "damage_type": "water",
  "severity": "moderate",
  "urgency": "immediate",
  "affected_components": ["ceiling", "walls"],
  "description": "Water damage visible on ceiling and upper walls, likely from roof leak",
  "estimated_cost_min": 2500,
  "estimated_cost_max": 5000,
  "confidence": 87,
  "recommendations": ["Identify and fix roof leak source", "Remove damaged drywall", "Check for mold"]
}`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
              detail: 'high',
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No response from AI');

  try {
    const parsed = JSON.parse(content);
    return {
      damage_type: (parsed.damage_type as DamageType) ?? 'other',
      severity: (parsed.severity as Severity) ?? 'moderate',
      urgency: (parsed.urgency as Urgency) ?? 'can_wait',
      affected_components: Array.isArray(parsed.affected_components) ? parsed.affected_components : [],
      description: parsed.description ?? 'Damage detected',
      estimated_cost_min: Number(parsed.estimated_cost_min) ?? 0,
      estimated_cost_max: Number(parsed.estimated_cost_max) ?? 0,
      confidence: Number(parsed.confidence) ?? 75,
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    };
  } catch {
    throw new Error('Failed to parse AI response');
  }
}

export async function estimateTotalCost(analysisResults: AIAnalysisResult[]): Promise<{
  total_min: number;
  total_max: number;
  breakdown: { component: string; cost_min: number; cost_max: number }[];
}> {
  const breakdown = analysisResults.map((r) => ({
    component: r.affected_components[0] ?? 'Unknown',
    cost_min: r.estimated_cost_min,
    cost_max: r.estimated_cost_max,
  }));

  const total_min = breakdown.reduce((sum, b) => sum + b.cost_min, 0);
  const total_max = breakdown.reduce((sum, b) => sum + b.cost_max, 0);

  return { total_min, total_max, breakdown };
}

export async function generateReportSummary(inspectionData: {
  property_type: string;
  damage_items: AIAnalysisResult[];
  total_cost_min: number;
  total_cost_max: number;
}): Promise<string> {
  const client = getOpenAIClient();

  const prompt = `Generate a professional insurance inspection report summary for the following damage assessment:

Property Type: ${inspectionData.property_type}
Total Damage Items: ${inspectionData.damage_items.length}
Damage Types: ${[...new Set(inspectionData.damage_items.map((d) => d.damage_type))].join(', ')}
Severity Levels: ${[...new Set(inspectionData.damage_items.map((d) => d.severity))].join(', ')}
Estimated Cost Range: $${inspectionData.total_cost_min.toLocaleString()} - $${inspectionData.total_cost_max.toLocaleString()}

Write a concise, professional 2-3 paragraph summary suitable for an insurance claim report. Focus on facts, damage extent, and recommended actions.`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
  });

  return response.choices[0]?.message?.content ?? 'Inspection completed. See attached damage items for details.';
}
