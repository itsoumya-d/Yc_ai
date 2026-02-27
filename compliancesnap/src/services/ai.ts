import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface ViolationDetection {
  violationType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  oshaStandard: string;
  description: string;
  immediateAction: string;
  correctiveAction: string;
  estimatedFine?: string;
  areaAffected: string;
  workerRisk: 'minimal' | 'moderate' | 'serious' | 'imminent_danger';
}

export interface HazardAnalysis {
  overallRiskLevel: 'compliant' | 'low' | 'medium' | 'high' | 'critical';
  complianceScore: number;
  violations: ViolationDetection[];
  positivePractices: string[];
  summary: string;
}

export async function analyzeWorkplaceSafety(
  base64Image: string,
  facilityType: string,
  areaDescription: string,
): Promise<HazardAnalysis> {
  const prompt = `You are an OSHA-certified safety inspector conducting a workplace compliance inspection.

Facility type: ${facilityType}
Area being inspected: ${areaDescription}

Analyze this workplace photo for safety hazards and OSHA violations. Return JSON with:
- overallRiskLevel: compliant/low/medium/high/critical
- complianceScore: 0-100 (100 = fully compliant)
- violations: array of violations found (empty array if none):
  Each: { violationType, severity (low/medium/high/critical), oshaStandard (29 CFR citation), description, immediateAction, correctiveAction, estimatedFine, areaAffected, workerRisk }
- positivePractices: array of good safety practices observed
- summary: 1-2 sentence professional summary

Be specific about OSHA standards. Common issues: PPE compliance, emergency exit blockage, fire hazards, electrical safety, hazmat storage, machine guarding, fall protection, housekeeping.

Return ONLY valid JSON.`;

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
    max_tokens: 1200,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(
    response.choices[0]?.message?.content ?? '{}',
  ) as HazardAnalysis;
}

export async function generateComplianceReport(
  facilityName: string,
  inspectorName: string,
  inspectionDate: string,
  areas: Array<{ name: string; analysis: HazardAnalysis }>,
  overallScore: number,
): Promise<string> {
  const violationSummary = areas
    .flatMap((area) =>
      area.analysis.violations.map(
        (v) =>
          `- [${v.severity.toUpperCase()}] ${area.name}: ${v.violationType} (${v.oshaStandard})`,
      ),
    )
    .join('\n');

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: `Generate a formal OSHA compliance inspection report:

Facility: ${facilityName}
Inspector: ${inspectorName}
Date: ${inspectionDate}
Overall Compliance Score: ${overallScore}/100

Violations Found:
${violationSummary || 'No violations detected.'}

Format as a professional compliance report with: Executive Summary, Violations by Severity, Required Corrective Actions with deadlines, Positive Findings, and Inspector's Certification statement.`,
      },
    ],
    max_tokens: 1200,
  });

  return response.choices[0]?.message?.content ?? '';
}
