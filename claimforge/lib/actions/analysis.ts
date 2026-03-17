'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Entity, FraudPattern, FraudPatternType, ConfidenceLevel } from '@/types/database';
import OpenAI from 'openai';
import { analyzeBenford, extractAmounts } from '@/lib/analysis/benford';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function getEntities(caseId: string): Promise<ActionResult<Entity[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .eq('case_id', caseId)
    .order('mention_count', { ascending: false });

  if (error) return { error: error.message };
  return { data: data as Entity[] };
}

export async function getFraudPatterns(caseId: string): Promise<ActionResult<FraudPattern[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('fraud_patterns')
    .select('*')
    .eq('case_id', caseId)
    .order('confidence', { ascending: false });

  if (error) return { error: error.message };
  return { data: data as FraudPattern[] };
}

interface AIExtractedEntity {
  name: string;
  type: 'person' | 'organization' | 'payment' | 'contract' | 'location' | 'date';
  confidence: number;
  context: string;
}

interface AIDetectedPattern {
  pattern_type: FraudPatternType;
  confidence: number;
  confidence_level: ConfidenceLevel;
  description: string;
  evidence_summary: string;
  affected_amount: number;
}

export async function analyzeDocument(documentId: string): Promise<ActionResult<{ entities: number; patterns: number }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get document
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (docError || !doc) return { error: 'Document not found' };

  // Get document content -- either OCR text or download and read
  let textContent = doc.ocr_text || '';

  if (!textContent && doc.file_path) {
    // Download file from storage
    const { data: fileData } = await supabase.storage
      .from('documents')
      .download(doc.file_path);

    if (fileData) {
      textContent = await fileData.text();
    }
  }

  if (!textContent) {
    return { error: 'No text content available for analysis' };
  }

  const openai = getOpenAI();

  // Extract entities
  const entityResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a forensic document analyst specializing in False Claims Act investigations.
Extract all relevant entities from the document text. Categorize each as person, organization, payment, contract, location, or date.
Return ONLY valid JSON: { "entities": [{ "name": "...", "type": "person|organization|payment|contract|location|date", "confidence": 0.0-1.0, "context": "brief context" }] }`,
      },
      { role: 'user', content: textContent.slice(0, 8000) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const entityContent = entityResponse.choices[0]?.message?.content;
  let extractedEntities: AIExtractedEntity[] = [];
  if (entityContent) {
    try {
      const parsed = JSON.parse(entityContent);
      extractedEntities = parsed.entities || [];
    } catch {
      // Failed to parse entities
    }
  }

  // Detect fraud patterns
  const patternResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a fraud detection specialist analyzing documents for False Claims Act violations.
Look for these fraud patterns: overbilling, duplicate_billing, phantom_vendor, quality_substitution, unbundling, upcoding, round_number, time_anomaly.
Return ONLY valid JSON: { "patterns": [{ "pattern_type": "...", "confidence": 0.0-1.0, "confidence_level": "critical|high|medium|low", "description": "...", "evidence_summary": "...", "affected_amount": 0 }] }
If no fraud patterns are detected, return { "patterns": [] }.`,
      },
      { role: 'user', content: textContent.slice(0, 8000) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const patternContent = patternResponse.choices[0]?.message?.content;
  let detectedPatterns: AIDetectedPattern[] = [];
  if (patternContent) {
    try {
      const parsed = JSON.parse(patternContent);
      detectedPatterns = parsed.patterns || [];
    } catch {
      // Failed to parse patterns
    }
  }

  // Save entities to database
  if (extractedEntities.length > 0) {
    const entityRecords = extractedEntities.map((e) => ({
      case_id: doc.case_id,
      document_id: documentId,
      name: e.name,
      entity_type: e.type,
      confidence: e.confidence,
      metadata: { context: e.context },
    }));

    await supabase.from('entities').insert(entityRecords);
  }

  // Save patterns to database
  if (detectedPatterns.length > 0) {
    const patternRecords = detectedPatterns.map((p) => ({
      case_id: doc.case_id,
      pattern_type: p.pattern_type,
      confidence: p.confidence,
      confidence_level: p.confidence_level,
      description: p.description,
      evidence_summary: p.evidence_summary,
      affected_amount: p.affected_amount,
      affected_documents: [documentId],
      detection_method: 'ai' as const,
    }));

    await supabase.from('fraud_patterns').insert(patternRecords);
  }

  // Mark document as processed and update counts
  await supabase
    .from('documents')
    .update({
      processed: true,
      entity_count: extractedEntities.length,
      ocr_text: textContent.slice(0, 50000),
      flagged: detectedPatterns.some((p) => p.confidence_level === 'critical' || p.confidence_level === 'high'),
    })
    .eq('id', documentId);

  // Update case counts
  const [entityCount, patternCount] = await Promise.all([
    supabase.from('entities').select('id', { count: 'exact', head: true }).eq('case_id', doc.case_id),
    supabase.from('fraud_patterns').select('id', { count: 'exact', head: true }).eq('case_id', doc.case_id),
  ]);

  await supabase
    .from('cases')
    .update({
      entity_count: entityCount.count ?? 0,
      pattern_count: patternCount.count ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', doc.case_id);

  revalidatePath(`/cases/${doc.case_id}`);
  revalidatePath('/documents');
  revalidatePath('/analysis');
  revalidatePath('/dashboard');

  return {
    data: {
      entities: extractedEntities.length,
      patterns: detectedPatterns.length,
    },
  };
}

// ─── Benford's Law Analysis ────────────────────────────────────────────────

export async function runBenfordAnalysis(caseId: string): Promise<ActionResult<ReturnType<typeof analyzeBenford>>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Collect all text from documents in this case
  const { data: docs } = await supabase
    .from('documents')
    .select('ocr_text, file_path')
    .eq('case_id', caseId)
    .not('ocr_text', 'is', null);

  if (!docs || docs.length === 0) return { error: 'No processed documents found' };

  const allText = docs.map((d: { ocr_text: string }) => d.ocr_text).join('\n');
  const amounts = extractAmounts(allText);
  const result = analyzeBenford(amounts);

  // Save result to case
  await supabase
    .from('cases')
    .update({ benford_result: result, updated_at: new Date().toISOString() })
    .eq('id', caseId);

  revalidatePath(`/cases/${caseId}`);
  return { data: result };
}

// ─── OpenAI Vision OCR for Image PDFs ─────────────────────────────────────

export async function ocrDocumentWithVision(documentId: string): Promise<ActionResult<string>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: doc } = await supabase
    .from('documents')
    .select('file_path, file_type, file_name')
    .eq('id', documentId)
    .single();

  if (!doc?.file_path) return { error: 'Document not found' };

  // Download from Supabase storage
  const { data: fileData } = await supabase.storage.from('documents').download(doc.file_path);
  if (!fileData) return { error: 'Could not download file' };

  // Convert to base64
  const buffer = await fileData.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mimeType = doc.file_type || 'application/pdf';

  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'high' },
          },
          {
            type: 'text',
            text: 'Extract ALL text from this document image verbatim. Include all numbers, amounts, dates, names, and addresses. Preserve the structure as much as possible.',
          },
        ],
      },
    ],
    max_tokens: 4096,
  });

  const extractedText = response.choices[0]?.message?.content ?? '';

  // Save OCR text to document
  await supabase
    .from('documents')
    .update({ ocr_text: extractedText, processed: false })
    .eq('id', documentId);

  return { data: extractedText };
}

// ─── USASpending.gov API Integration ──────────────────────────────────────

export async function searchUSASpending(query: string): Promise<ActionResult<{
  results: Array<{
    recipient_name: string;
    award_amount: number;
    awarding_agency_name: string;
    award_type: string;
    period_of_performance_start_date: string;
  }>;
  total: number;
}>> {
  try {
    const resp = await fetch('https://api.usaspending.gov/api/v2/search/spending_by_award/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filters: {
          keywords: [query],
          time_period: [{ start_date: '2020-01-01', end_date: new Date().toISOString().slice(0, 10) }],
          award_type_codes: ['A', 'B', 'C', 'D'],
        },
        fields: ['recipient_name', 'Award Amount', 'awarding_agency_name', 'award_type', 'period_of_performance_start_date'],
        sort: 'Award Amount',
        order: 'desc',
        limit: 25,
        page: 1,
      }),
    });

    if (!resp.ok) return { error: `USASpending API error: ${resp.status}` };

    const json = await resp.json();
    const results = (json.results ?? []).map((r: Record<string, unknown>) => ({
      recipient_name: r.recipient_name as string,
      award_amount: Number(r['Award Amount']),
      awarding_agency_name: r.awarding_agency_name as string,
      award_type: r.award_type as string,
      period_of_performance_start_date: r.period_of_performance_start_date as string,
    }));

    return { data: { results, total: json.page_metadata?.total ?? results.length } };
  } catch (err) {
    return { error: String(err) };
  }
}

// ─── Cross-Case Analysis Data ──────────────────────────────────────────────

export interface CrossAnalysisFraudSummary {
  type: string;
  count: number;
  total_amount: number;
  avg_confidence: number;
}

export interface CrossAnalysisEntity {
  id: string;
  label: string;
  type: string;
  connections: number;
  flagged: boolean;
}

export interface CrossAnalysisData {
  fraudSummary: CrossAnalysisFraudSummary[];
  benford: {
    digit: number;
    expected: number;
    actual: number;
    suspicious: boolean;
  }[];
  entities: CrossAnalysisEntity[];
  totalFraud: number;
  totalPatterns: number;
  sampleSize: number;
}

export async function getCrossAnalysisData(): Promise<ActionResult<CrossAnalysisData>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Fetch all fraud patterns across user's cases
  const { data: patterns, error: pErr } = await supabase
    .from('fraud_patterns')
    .select('pattern_type, confidence, affected_amount, verified, false_positive, case_id')
    .eq('false_positive', false);

  if (pErr) return { error: pErr.message };

  // Fetch all entities for network graph
  const { data: entities } = await supabase
    .from('entities')
    .select('id, name, entity_type, mention_count, flagged')
    .order('mention_count', { ascending: false })
    .limit(12);

  // Fetch claim amounts for Benford's Law analysis
  const { data: claims } = await supabase
    .from('claims')
    .select('estimated_amount, description')
    .eq('claimant_id', user.id);

  // ── Fraud pattern summary ────────────────────────────────────────────────
  const typeMap: Record<string, { count: number; totalAmount: number; confidenceSum: number }> = {};
  for (const p of patterns ?? []) {
    const t = p.pattern_type ?? 'unknown';
    if (!typeMap[t]) typeMap[t] = { count: 0, totalAmount: 0, confidenceSum: 0 };
    typeMap[t].count++;
    typeMap[t].totalAmount += Number(p.affected_amount ?? 0);
    typeMap[t].confidenceSum += Number(p.confidence ?? 0);
  }
  const fraudSummary: CrossAnalysisFraudSummary[] = Object.entries(typeMap).map(([type, v]) => ({
    type,
    count: v.count,
    total_amount: Math.round(v.totalAmount),
    avg_confidence: v.count > 0 ? parseFloat((v.confidenceSum / v.count).toFixed(2)) : 0,
  })).sort((a, b) => b.total_amount - a.total_amount);

  // ── Benford's Law ────────────────────────────────────────────────────────
  const amounts: number[] = [];
  for (const c of claims ?? []) {
    if (c.estimated_amount) amounts.push(Number(c.estimated_amount));
    if (c.description) amounts.push(...extractAmounts(c.description));
  }

  const BENFORDS_EXPECTED: Record<string, number> = {
    '1': 30.1, '2': 17.6, '3': 12.5, '4': 9.7,
    '5': 7.9, '6': 6.7, '7': 5.8, '8': 5.1, '9': 4.6,
  };

  let benfordRows;
  if (amounts.length >= 30) {
    const benfordResult = analyzeBenford(amounts);
    benfordRows = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => {
      const key = String(d);
      const actual = benfordResult.observed[key] ?? 0;
      const expected = BENFORDS_EXPECTED[key];
      return {
        digit: d,
        expected,
        actual,
        suspicious: Math.abs(actual - expected) > 4,
      };
    });
  } else {
    // Not enough data: show Benford expected values with zeroed actuals
    benfordRows = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => ({
      digit: d,
      expected: BENFORDS_EXPECTED[String(d)],
      actual: 0,
      suspicious: false,
    }));
  }

  // ── Entity network ───────────────────────────────────────────────────────
  const entityRows: CrossAnalysisEntity[] = (entities ?? []).map(e => ({
    id: e.id,
    label: e.name ?? 'Unknown',
    type: e.entity_type ?? 'organization',
    connections: e.mention_count ?? 0,
    flagged: e.flagged ?? false,
  }));

  const totalFraud = fraudSummary.reduce((s, f) => s + f.total_amount, 0);
  const totalPatterns = fraudSummary.reduce((s, f) => s + f.count, 0);

  return {
    data: {
      fraudSummary,
      benford: benfordRows,
      entities: entityRows,
      totalFraud,
      totalPatterns,
      sampleSize: amounts.length,
    },
  };
}
