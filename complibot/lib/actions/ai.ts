'use server';

import OpenAI from 'openai';
import type { FrameworkType, Control } from '@/types/database';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generatePolicy(
  policyType: string,
  frameworkType: FrameworkType,
  organizationName: string,
  industryContext: string
): Promise<{ data?: string; error?: string }> {
  try {
    const frameworkLabels: Record<FrameworkType, string> = {
      soc2: 'SOC 2 Type II',
      gdpr: 'GDPR',
      hipaa: 'HIPAA',
      iso27001: 'ISO 27001',
    };

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a compliance expert specializing in ${frameworkLabels[frameworkType]}.
Generate a comprehensive, professional ${policyType} policy document.
The policy should:
- Include clear purpose, scope, roles & responsibilities sections
- Reference specific ${frameworkLabels[frameworkType]} controls and requirements
- Be written in formal, clear language suitable for enterprise use
- Include version history table, approval section, and review schedule
- Be practical and implementable
Format as a complete policy document with proper sections and subsections.`,
        },
        {
          role: 'user',
          content: `Organization: ${organizationName}
Industry: ${industryContext}
Framework: ${frameworkLabels[frameworkType]}
Policy Type: ${policyType}

Generate a complete, production-ready policy document.`,
        },
      ],
      temperature: 0.3,
    });

    return { data: response.choices[0].message.content ?? '' };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to generate policy' };
  }
}

export async function performGapAnalysis(
  controls: Control[],
  frameworkType: FrameworkType,
  organizationContext: string
): Promise<{
  data?: {
    overallScore: number;
    criticalGaps: string[];
    recommendations: string[];
    priorityActions: Array<{ action: string; controlId: string; impact: 'high' | 'medium' | 'low' }>;
  };
  error?: string;
}> {
  try {
    const notImplemented = controls.filter((c) => c.status === 'not_started' || c.status === 'in_progress');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a compliance gap analysis expert. Analyze control statuses and provide actionable gap analysis.
Return a JSON object with:
- overallScore (number 0-100)
- criticalGaps (string array - up to 5 critical gaps)
- recommendations (string array - up to 5 recommendations)
- priorityActions (array of { action: string, controlId: string, impact: "high"|"medium"|"low" })
Return ONLY JSON.`,
        },
        {
          role: 'user',
          content: `Framework: ${frameworkType}
Organization: ${organizationContext}
Total Controls: ${controls.length}
Not Implemented: ${notImplemented.length}
Controls needing attention: ${JSON.stringify(
  notImplemented.slice(0, 10).map((c) => ({
    id: c.control_id,
    title: c.title,
    severity: c.severity,
    status: c.status,
  }))
)}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content ?? '{}';
    return { data: JSON.parse(content) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Gap analysis failed' };
  }
}

export async function generateControlGuidance(
  controlTitle: string,
  controlDescription: string,
  frameworkType: FrameworkType,
  organizationContext: string
): Promise<{ data?: string; error?: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a compliance implementation expert. Provide practical implementation guidance for compliance controls.`,
        },
        {
          role: 'user',
          content: `Framework: ${frameworkType}
Control: ${controlTitle}
Description: ${controlDescription}
Organization Context: ${organizationContext}

Provide concise, practical implementation steps (3-5 bullet points) and what evidence to collect.`,
        },
      ],
      temperature: 0.4,
    });

    return { data: response.choices[0].message.content ?? '' };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to generate guidance' };
  }
}
