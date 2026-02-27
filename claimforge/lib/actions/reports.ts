'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import OpenAI from 'openai';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export type ReportType =
  | 'preliminary'
  | 'full_investigation'
  | 'evidence_package'
  | 'executive_summary'
  | 'whistleblower';

export type ReportStatus = 'draft' | 'review' | 'finalized';

export interface Report {
  id: string;
  title: string;
  case_id: string | null;
  case_number?: string;
  case_title?: string;
  report_type: ReportType;
  status: ReportStatus;
  content: string | null;
  sections: number;
  pages: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ReportFormData {
  title: string;
  case_id?: string;
  report_type: ReportType;
}

function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function getReports(caseId?: string): Promise<ActionResult<Report[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  let query = supabase
    .from('reports')
    .select('*, case:cases(title, case_number)')
    .order('updated_at', { ascending: false });

  if (caseId) {
    query = query.eq('case_id', caseId);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };

  const reports = (data ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    case_title: (r.case as { title?: string } | null)?.title ?? '',
    case_number: (r.case as { case_number?: string } | null)?.case_number ?? '',
  }));

  return { data: reports as Report[] };
}

export async function createReport(formData: ReportFormData): Promise<ActionResult<Report>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const { data, error } = await supabase
    .from('reports')
    .insert({
      title: formData.title,
      case_id: formData.case_id ?? null,
      report_type: formData.report_type,
      status: 'draft',
      content: null,
      sections: 0,
      pages: 0,
      created_by: profile?.full_name ?? user.email ?? 'Unknown',
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/reports');
  if (formData.case_id) revalidatePath(`/cases/${formData.case_id}`);
  return { data: data as Report };
}

export async function updateReportStatus(
  id: string,
  status: ReportStatus
): Promise<ActionResult<Report>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('reports')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/reports');
  return { data: data as Report };
}

export async function deleteReport(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.from('reports').delete().eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/reports');
  return {};
}

export async function generateReportContent(
  caseId: string,
  reportType: ReportType
): Promise<ActionResult<{ content: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Gather case context
  const [caseRes, entitiesRes, patternsRes, docsRes] = await Promise.all([
    supabase.from('cases').select('*').eq('id', caseId).single(),
    supabase.from('entities').select('*').eq('case_id', caseId).limit(30),
    supabase.from('fraud_patterns').select('*').eq('case_id', caseId).order('confidence', { ascending: false }),
    supabase.from('documents').select('id, title, document_type, processed, flagged').eq('case_id', caseId).limit(20),
  ]);

  if (caseRes.error || !caseRes.data) return { error: 'Case not found' };

  const caseData = caseRes.data;
  const entities = entitiesRes.data ?? [];
  const patterns = patternsRes.data ?? [];
  const docs = docsRes.data ?? [];

  const reportTypeDescriptions: Record<ReportType, string> = {
    preliminary: 'Preliminary Findings report — initial assessment of fraud indicators',
    full_investigation: 'Full Investigation Report — comprehensive analysis with complete evidence chain',
    evidence_package: 'Evidence Package — court-ready compilation with chain of custody',
    executive_summary: 'Executive Summary — high-level overview for stakeholders',
    whistleblower: 'Qui Tam / Whistleblower Filing — False Claims Act complaint package',
  };

  const contextSummary = `
CASE: ${caseData.title} (${caseData.case_number})
Defendant: ${caseData.defendant_name} (${caseData.defendant_type})
Jurisdiction: ${caseData.jurisdiction}
Status: ${caseData.status}
Estimated Fraud Amount: $${caseData.estimated_fraud_amount?.toLocaleString() ?? 'Unknown'}
Description: ${caseData.description}

DOCUMENTS ANALYZED: ${docs.length}
- Flagged: ${docs.filter((d) => d.flagged).length}
- Processed: ${docs.filter((d) => d.processed).length}

KEY ENTITIES (${entities.length} total):
${entities
  .slice(0, 15)
  .map((e) => `- ${e.name} (${e.entity_type}, confidence: ${Math.round((e.confidence ?? 0) * 100)}%)`)
  .join('\n')}

FRAUD PATTERNS DETECTED (${patterns.length} total):
${patterns
  .map(
    (p) =>
      `- ${p.pattern_type} [${p.confidence_level}]: ${p.description} | Amount: $${p.affected_amount?.toLocaleString() ?? 0}`
  )
  .join('\n')}
`.trim();

  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a legal analyst specializing in False Claims Act investigations.
Generate a professional ${reportTypeDescriptions[reportType]} in Markdown format.
Structure the report with clear sections, use professional legal language, and include specific findings from the data provided.
Include sections appropriate for the report type. Use ## for section headers, ### for subsections.
Make the report thorough, specific, and court-ready in tone.`,
      },
      {
        role: 'user',
        content: `Generate a ${reportTypeDescriptions[reportType]} based on this case data:\n\n${contextSummary}`,
      },
    ],
    temperature: 0.4,
    max_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content ?? '';

  return { data: { content } };
}

export async function saveReportContent(
  id: string,
  content: string
): Promise<ActionResult<Report>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Estimate pages from content length (rough: ~300 words/page, ~5 chars/word)
  const estimatedPages = Math.max(1, Math.round(content.length / 1500));
  // Count sections by ## headers
  const sectionCount = (content.match(/^##\s/gm) ?? []).length;

  const { data, error } = await supabase
    .from('reports')
    .update({
      content,
      pages: estimatedPages,
      sections: sectionCount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/reports');
  return { data: data as Report };
}
