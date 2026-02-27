'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import OpenAI from 'openai';
import { getOrg } from './orgs';
import type { Gap, Control } from '@/types/database';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

interface GapSuggestion {
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  remediation_steps: string;
  estimated_hours: number;
}

/**
 * Uses OpenAI to analyze non-compliant/partial controls and generate gap records.
 */
export async function analyzeGapsFromControls(): Promise<{
  gaps: Gap[];
  error: string | null;
}> {
  const supabase = await createClient();
  const org = await getOrg();
  if (!org) return { gaps: [], error: 'No organization found' };

  // Fetch non-compliant and partial controls
  const { data: controls, error: ctrlError } = await supabase
    .from('controls')
    .select('id, control_code, title, description, category, status, framework_id')
    .eq('org_id', org.id)
    .in('status', ['non_compliant', 'partial'])
    .limit(30);

  if (ctrlError || !controls || controls.length === 0) {
    return {
      gaps: [],
      error:
        controls?.length === 0
          ? 'No non-compliant controls found'
          : (ctrlError?.message ?? 'Failed to fetch controls'),
    };
  }

  const controlList = (controls as Control[])
    .map(
      (c) =>
        `[${c.control_code}] ${c.title} (status: ${c.status}): ${c.description}`
    )
    .join('\n');

  const openai = getOpenAI();

  let suggestions: GapSuggestion[];
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a compliance expert. Analyze compliance controls and generate actionable gap records. For each non-compliant or partial control, create a specific, actionable gap item with clear remediation steps.`,
        },
        {
          role: 'user',
          content: `Analyze these non-compliant compliance controls and generate specific gap records. For each control, create a gap with:
- A concise title describing the specific deficiency
- A clear description of what is missing or inadequate
- Severity (critical/high/medium/low) based on security impact
- Step-by-step remediation steps (as a single string with numbered steps)
- Estimated hours to remediate

Controls to analyze:
${controlList}

Respond ONLY with a valid JSON array (no markdown, no explanation):
[
  {
    "title": "...",
    "description": "...",
    "severity": "critical|high|medium|low",
    "remediation_steps": "1. Step one\\n2. Step two\\n3. Step three",
    "estimated_hours": <number>
  }
]

Create at most one gap per control. Focus on the most impactful deficiencies.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const raw = completion.choices[0]?.message?.content ?? '[]';
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      parsed = match ? JSON.parse(match[1]) : [];
    }
    suggestions = Array.isArray(parsed) ? (parsed as GapSuggestion[]) : [];
  } catch (err) {
    return { gaps: [], error: err instanceof Error ? err.message : 'AI analysis failed' };
  }

  if (suggestions.length === 0) return { gaps: [], error: null };

  // Map suggestions to gaps, linking to the corresponding control
  const rows = suggestions.map((s, i) => {
    const matchedControl = (controls as Control[])[i] ?? (controls as Control[])[0];
    return {
      org_id: org.id,
      control_id: matchedControl.id,
      title: s.title,
      description: s.description,
      severity: (['critical', 'high', 'medium', 'low'] as const).includes(s.severity)
        ? s.severity
        : ('medium' as const),
      remediation_steps: s.remediation_steps,
      estimated_hours: typeof s.estimated_hours === 'number' ? s.estimated_hours : 4,
      resolved: false,
    };
  });

  const { data: inserted, error: insertError } = await supabase
    .from('gaps')
    .insert(rows)
    .select();

  if (insertError) return { gaps: [], error: insertError.message };

  revalidatePath('/gaps');
  revalidatePath('/dashboard');

  return { gaps: (inserted ?? []) as Gap[], error: null };
}

/**
 * Generates gap analysis for a specific framework's non-compliant controls.
 */
export async function generateFrameworkGaps(_frameworkId: string): Promise<{
  count: number;
  error: string | null;
}> {
  const result = await analyzeGapsFromControls();
  return { count: result.gaps.length, error: result.error };
}
