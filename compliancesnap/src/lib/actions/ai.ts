import type { SeverityLevel } from '@/types/database';

export interface HazardDetection {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  regulation: string;
  location: string;
  confidence: number;
  recommendations: string[];
}

export interface ComplianceAnalysisResult {
  hazards: HazardDetection[];
  overall_risk_score: number;
  compliance_score: number;
  summary: string;
  analyzed_at: string;
}

/**
 * Analyze an image for safety/compliance hazards using OpenAI Vision.
 * In production this calls the OpenAI API; here we have the prompt documented.
 */
export async function analyzeWorkplaceImage(
  imageBase64: string,
  apiKey: string,
): Promise<ComplianceAnalysisResult> {
  const prompt = `You are an expert EHS (Environmental Health & Safety) compliance inspector.
Analyze this workplace image and identify safety and compliance hazards.

For each hazard found, provide:
1. Title: brief name of the hazard
2. Description: what exactly was observed
3. Severity: critical / major / minor / observation
4. OSHA/regulatory citation (e.g., "29 CFR 1910.212")
5. Location in the image (e.g., "foreground left", "background center")
6. Confidence: percentage (0-100) you are certain about this hazard
7. Recommendations: specific corrective actions

Also provide:
- Overall risk score (0-100, higher = more dangerous)
- Compliance score (0-100, higher = more compliant)
- Brief summary paragraph

Return ONLY valid JSON in this format:
{
  "hazards": [
    {
      "id": "1",
      "title": "Missing machine guard",
      "description": "Rotating machinery parts exposed without guard",
      "severity": "critical",
      "regulation": "29 CFR 1910.212",
      "location": "center foreground",
      "confidence": 95,
      "recommendations": ["Install machine guard immediately", "Lockout/tagout until guard installed"]
    }
  ],
  "overall_risk_score": 75,
  "compliance_score": 42,
  "summary": "Several critical safety violations detected...",
  "analyzed_at": "2024-01-01T00:00:00Z"
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
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
            { type: 'text', text: prompt },
          ],
        },
      ],
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('No response from AI');

  const parsed = JSON.parse(content);

  return {
    hazards: (parsed.hazards ?? []).map((h: HazardDetection, i: number) => ({
      id: h.id ?? String(i + 1),
      title: h.title ?? 'Unknown hazard',
      description: h.description ?? '',
      severity: (h.severity as SeverityLevel) ?? 'observation',
      regulation: h.regulation ?? 'N/A',
      location: h.location ?? '',
      confidence: Number(h.confidence) ?? 75,
      recommendations: Array.isArray(h.recommendations) ? h.recommendations : [],
    })),
    overall_risk_score: Number(parsed.overall_risk_score) ?? 50,
    compliance_score: Number(parsed.compliance_score) ?? 50,
    summary: parsed.summary ?? 'Analysis complete.',
    analyzed_at: parsed.analyzed_at ?? new Date().toISOString(),
  };
}

/**
 * Convert file to base64 string for API upload
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix (data:image/jpeg;base64,...)
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Mock analysis for demo / when no API key is configured
 */
export function getMockAnalysisResult(): ComplianceAnalysisResult {
  return {
    hazards: [
      {
        id: '1',
        title: 'Missing safety guard on press machine',
        description: 'Rotating parts of the press machine are exposed without adequate guarding, posing a serious entanglement risk.',
        severity: 'critical',
        regulation: '29 CFR 1910.212',
        location: 'center foreground',
        confidence: 94,
        recommendations: [
          'Install machine guard immediately',
          'Apply LOTO (lockout/tagout) until guard is in place',
          'Post warning signs',
        ],
      },
      {
        id: '2',
        title: 'Worker without safety glasses',
        description: 'Employee observed working with machinery without required eye protection in an area with projectile hazards.',
        severity: 'major',
        regulation: '29 CFR 1910.133',
        location: 'left foreground',
        confidence: 87,
        recommendations: [
          'Immediately provide safety glasses',
          'Reinforce PPE policy training',
          'Post PPE requirement signs',
        ],
      },
      {
        id: '3',
        title: 'Cluttered emergency exit path',
        description: 'Materials stored partially blocking designated emergency exit route.',
        severity: 'minor',
        regulation: '29 CFR 1910.37',
        location: 'background right',
        confidence: 78,
        recommendations: ['Remove all materials from exit path', 'Mark exit path with floor tape'],
      },
    ],
    overall_risk_score: 72,
    compliance_score: 58,
    summary: 'Analysis detected 3 violations including 1 critical machine guarding issue requiring immediate attention. The facility shows moderate compliance risk with PPE and emergency egress concerns.',
    analyzed_at: new Date().toISOString(),
  };
}
