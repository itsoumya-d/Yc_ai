import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface DamageAssessment {
  damageType: string; // 'water' | 'fire' | 'wind' | 'structural' | 'vandalism' | 'none'
  severity: 'none' | 'minor' | 'moderate' | 'severe' | 'total_loss';
  affectedArea: string; // e.g., "roof", "kitchen", "exterior wall"
  estimatedRepairCost: { min: number; max: number };
  description: string;
  coverageRelevance: string; // insurance coverage notes
  urgency: 'routine' | 'prompt' | 'emergency';
  conditionScore: number; // 1-100, where 100 is perfect condition
  findings: string[];
  recommendations: string[];
}

export async function analyzeDamage(
  base64Image: string,
  propertyType: string,
  area: string
): Promise<DamageAssessment> {
  const prompt = `You are a licensed property damage inspector and insurance adjuster expert.

Analyze this ${propertyType} property photo taken at the ${area} area.

Return JSON with:
- damageType: primary damage category (water/fire/wind/structural/vandalism/none)
- severity: none/minor/moderate/severe/total_loss
- affectedArea: specific area affected
- estimatedRepairCost: { min, max } in USD
- description: detailed professional description of damage
- coverageRelevance: notes on what insurance coverage typically applies
- urgency: routine/prompt/emergency (for repair timeline)
- conditionScore: 1-100 overall condition (100=perfect, 0=total loss)
- findings: array of specific findings observed
- recommendations: array of recommended actions

Be precise and professional. Return ONLY valid JSON.`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
              detail: 'high',
            },
          },
        ],
      },
    ],
    max_tokens: 800,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0]?.message?.content ?? '{}';
  return JSON.parse(raw) as DamageAssessment;
}

export async function generateInspectionReport(
  propertyAddress: string,
  claimNumber: string,
  inspectionDate: string,
  assessments: Array<{ area: string; assessment: DamageAssessment }>,
  overallScore: number
): Promise<string> {
  const findingsList = assessments
    .filter((a) => a.assessment.severity !== 'none')
    .map(
      (a) =>
        `- ${a.area}: ${a.assessment.severity} ${a.assessment.damageType} damage, ` +
        `~$${a.assessment.estimatedRepairCost.min.toLocaleString()}-$${a.assessment.estimatedRepairCost.max.toLocaleString()} repair`
    )
    .join('\n');

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: `Generate a professional property damage inspection report:

Property: ${propertyAddress}
Claim #: ${claimNumber}
Inspection Date: ${inspectionDate}
Overall Condition Score: ${overallScore}/100

Damage Findings:
${findingsList || 'No significant damage found.'}

Format as a professional insurance inspection report with sections:
1. Executive Summary
2. Property Information
3. Damage Assessment
4. Coverage Analysis
5. Repair Estimates (itemized)
6. Inspector Recommendations
7. Conclusion

Use clear, professional language suitable for insurance claims processing. Include a final total repair cost estimate range.`,
      },
    ],
    max_tokens: 1200,
  });

  return response.choices[0]?.message?.content ?? '';
}

export function calculateOverallScore(assessments: DamageAssessment[]): number {
  if (assessments.length === 0) return 100;
  const avg =
    assessments.reduce((sum, a) => sum + a.conditionScore, 0) / assessments.length;
  return Math.round(avg);
}

export function getScoreColor(score: number): string {
  if (score > 70) return '#16A34A'; // green
  if (score > 40) return '#D97706'; // amber
  return '#DC2626'; // red
}

export function getSeverityLabel(severity: DamageAssessment['severity']): string {
  const labels: Record<DamageAssessment['severity'], string> = {
    none: 'No Damage',
    minor: 'Minor',
    moderate: 'Moderate',
    severe: 'Severe',
    total_loss: 'Total Loss',
  };
  return labels[severity];
}
