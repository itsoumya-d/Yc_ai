'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  Entity,
  FraudPattern,
  FraudPatternType,
  ConfidenceLevel,
  EntityType,
  BenfordAnalysis,
  StatisticalAnomaly,
  NetworkNode,
  NetworkEdge,
  EntityRelationship,
} from '@/types/database';
import OpenAI from 'openai';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export interface FraudSummaryRow {
  type: FraudPatternType;
  count: number;
  total_amount: number;
  avg_confidence: number;
}

export interface AnalysisPageData {
  fraudSummary: FraudSummaryRow[];
  entities: Array<Entity & { connections: number; flagged: boolean }>;
  relationships: EntityRelationship[];
  benford: BenfordAnalysis[];
  anomalies: StatisticalAnomaly[];
  unprocessedDocCount: number;
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

/**
 * Fetches all cross-case analysis data for the analysis dashboard.
 * Aggregates fraud patterns, entities, relationships, Benford's Law analysis,
 * and statistical anomalies across all cases the user has access to.
 */
export async function getAnalysisPageData(): Promise<ActionResult<AnalysisPageData>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Fetch all fraud patterns, entities, relationships, and documents in parallel
  const [patternsResult, entitiesResult, relationshipsResult, docsResult] = await Promise.all([
    supabase
      .from('fraud_patterns')
      .select('*')
      .eq('false_positive', false)
      .order('confidence', { ascending: false }),
    supabase
      .from('entities')
      .select('*')
      .order('mention_count', { ascending: false })
      .limit(50),
    supabase
      .from('entity_relationships')
      .select('*')
      .order('strength', { ascending: false })
      .limit(100),
    supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('processed', false),
  ]);

  if (patternsResult.error) return { error: patternsResult.error.message };

  const patterns = (patternsResult.data ?? []) as FraudPattern[];
  const entities = (entitiesResult.data ?? []) as Entity[];
  const relationships = (relationshipsResult.data ?? []) as EntityRelationship[];

  // ── Fraud Summary: aggregate by pattern type ──
  const patternMap = new Map<FraudPatternType, { count: number; total_amount: number; total_confidence: number }>();
  for (const p of patterns) {
    const existing = patternMap.get(p.pattern_type) ?? { count: 0, total_amount: 0, total_confidence: 0 };
    existing.count += 1;
    existing.total_amount += p.affected_amount;
    existing.total_confidence += p.confidence;
    patternMap.set(p.pattern_type, existing);
  }

  const fraudSummary: FraudSummaryRow[] = Array.from(patternMap.entries())
    .map(([type, agg]) => ({
      type,
      count: agg.count,
      total_amount: agg.total_amount,
      avg_confidence: agg.count > 0 ? agg.total_confidence / agg.count : 0,
    }))
    .sort((a, b) => b.total_amount - a.total_amount);

  // ── Entities with connection counts ──
  const connectionCounts = new Map<string, number>();
  for (const r of relationships) {
    connectionCounts.set(r.source_entity_id, (connectionCounts.get(r.source_entity_id) ?? 0) + 1);
    connectionCounts.set(r.target_entity_id, (connectionCounts.get(r.target_entity_id) ?? 0) + 1);
  }

  // Determine which entities are flagged (appear in high-confidence patterns)
  const flaggedEntityIds = new Set<string>();
  for (const p of patterns) {
    if (p.confidence_level === 'critical' || p.confidence_level === 'high') {
      for (const eid of p.affected_entities) {
        flaggedEntityIds.add(eid);
      }
    }
  }

  const entitiesWithMeta = entities.map((e) => ({
    ...e,
    connections: connectionCounts.get(e.id) ?? 0,
    flagged: flaggedEntityIds.has(e.id),
  }));

  // ── Benford's Law Analysis ──
  // Compute from actual payment/amount data in patterns
  const BENFORD_EXPECTED = [0, 30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6];
  const digitCounts = new Array(10).fill(0);
  let totalAmounts = 0;

  for (const p of patterns) {
    if (p.affected_amount > 0) {
      const firstDigit = parseInt(String(p.affected_amount).replace(/[^1-9]/, '').charAt(0), 10);
      if (firstDigit >= 1 && firstDigit <= 9) {
        digitCounts[firstDigit]++;
        totalAmounts++;
      }
    }
  }

  const benford: BenfordAnalysis[] = [];
  for (let d = 1; d <= 9; d++) {
    const actual = totalAmounts > 0 ? (digitCounts[d] / totalAmounts) * 100 : 0;
    const expected = BENFORD_EXPECTED[d] ?? 0;
    const deviation = actual - expected;
    // Flag as suspicious if deviation > 5 percentage points
    benford.push({
      digit: d,
      expected_frequency: expected,
      actual_frequency: Math.round(actual * 10) / 10,
      deviation: Math.round(deviation * 10) / 10,
      suspicious: Math.abs(deviation) > 5,
    });
  }

  // ── Statistical Anomalies ──
  // Compute basic statistical anomalies from pattern data
  const anomalies: StatisticalAnomaly[] = [];

  // 1. Check for amount clustering near round numbers
  const amountsNearThreshold = patterns.filter(
    (p) => p.affected_amount > 0 && p.affected_amount % 1000 < 50
  );
  if (amountsNearThreshold.length > 0 && patterns.length > 0) {
    const pct = (amountsNearThreshold.length / patterns.length) * 100;
    if (pct > 10) {
      anomalies.push({
        id: 'round-numbers',
        description: `${amountsNearThreshold.length} amounts cluster near round-number thresholds`,
        metric: 'Amount Distribution',
        expected_value: 5,
        actual_value: Math.round(pct * 10) / 10,
        z_score: (pct - 5) / 3,
        p_value: 0.01,
        significance: pct > 30 ? 'high' : pct > 15 ? 'medium' : 'low',
      });
    }
  }

  // 2. Check for high duplicate billing concentration
  const duplicates = patterns.filter((p) => p.pattern_type === 'duplicate_billing');
  if (duplicates.length >= 3) {
    anomalies.push({
      id: 'duplicate-concentration',
      description: `${duplicates.length} duplicate billing patterns detected across cases`,
      metric: 'Duplicate Billing Frequency',
      expected_value: 0,
      actual_value: duplicates.length,
      z_score: duplicates.length / 2,
      p_value: 0.005,
      significance: duplicates.length >= 8 ? 'high' : duplicates.length >= 5 ? 'medium' : 'low',
    });
  }

  // 3. Check for high-confidence pattern concentration
  const criticalPatterns = patterns.filter((p) => p.confidence_level === 'critical');
  if (criticalPatterns.length > 0) {
    anomalies.push({
      id: 'critical-patterns',
      description: `${criticalPatterns.length} critical-confidence fraud patterns require immediate review`,
      metric: 'Critical Pattern Count',
      expected_value: 0,
      actual_value: criticalPatterns.length,
      z_score: criticalPatterns.length * 2,
      p_value: 0.001,
      significance: 'high',
    });
  }

  // 4. Check for entity overlap across cases
  const entityCases = new Map<string, Set<string>>();
  for (const e of entities) {
    const cases = entityCases.get(e.name) ?? new Set();
    cases.add(e.case_id);
    entityCases.set(e.name, cases);
  }
  const crossCaseEntities = Array.from(entityCases.entries()).filter(([, cases]) => cases.size > 1);
  if (crossCaseEntities.length > 0) {
    anomalies.push({
      id: 'cross-case-entities',
      description: `${crossCaseEntities.length} entities appear across multiple cases (potential connected schemes)`,
      metric: 'Cross-Case Entity Overlap',
      expected_value: 0,
      actual_value: crossCaseEntities.length,
      z_score: crossCaseEntities.length,
      p_value: 0.01,
      significance: crossCaseEntities.length >= 5 ? 'high' : crossCaseEntities.length >= 2 ? 'medium' : 'low',
    });
  }

  return {
    data: {
      fraudSummary,
      entities: entitiesWithMeta,
      relationships,
      benford,
      anomalies,
      unprocessedDocCount: docsResult.count ?? 0,
    },
  };
}

/**
 * Triggers analysis on all unprocessed documents across all cases.
 */
export async function runFullAnalysis(): Promise<ActionResult<{ processed: number; errors: number }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: docs, error } = await supabase
    .from('documents')
    .select('id')
    .eq('processed', false)
    .limit(20); // Batch limit

  if (error) return { error: error.message };
  if (!docs || docs.length === 0) return { data: { processed: 0, errors: 0 } };

  let processed = 0;
  let errors = 0;

  for (const doc of docs) {
    const result = await analyzeDocument(doc.id);
    if (result.error) {
      errors++;
    } else {
      processed++;
    }
  }

  revalidatePath('/analysis');
  revalidatePath('/dashboard');

  return { data: { processed, errors } };
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
  let ocrConfidence: number | null = null;

  if (!textContent && doc.file_path) {
    // Download file from storage
    const { data: fileData } = await supabase.storage
      .from('documents')
      .download(doc.file_path);

    if (fileData) {
      const isImage = doc.file_type?.startsWith('image/');
      const isScannedPdf = doc.file_type === 'application/pdf';

      if (isImage) {
        // Use GPT-4o vision for OCR on images
        const openai = getOpenAI();
        const arrayBuffer = await fileData.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const dataUrl = `data:${doc.file_type};base64,${base64}`;

        const ocrResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'Extract all text from this document image. Return ONLY valid JSON: { "text": "extracted text here", "confidence": 0.0-1.0, "page_count": 1 }',
            },
            {
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } },
              ],
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        });

        const ocrContent = ocrResponse.choices[0]?.message?.content;
        if (ocrContent) {
          try {
            const parsed = JSON.parse(ocrContent);
            textContent = parsed.text || '';
            ocrConfidence = parsed.confidence ?? 0.9;
          } catch {
            textContent = ocrContent;
            ocrConfidence = 0.8;
          }
        }
      } else {
        // Text-based files (PDFs with text layer, CSV, etc.)
        textContent = await fileData.text();
        if (textContent.trim()) {
          ocrConfidence = 0.99; // High confidence for text-extractable files
        }
      }
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

  // Save entities to database and collect IDs for evidence chains
  const savedEntityIds: string[] = [];
  if (extractedEntities.length > 0) {
    const entityRecords = extractedEntities.map((e) => ({
      case_id: doc.case_id,
      document_id: documentId,
      name: e.name,
      entity_type: e.type,
      confidence: e.confidence,
      metadata: { context: e.context },
    }));

    const { data: savedEntities } = await supabase.from('entities').insert(entityRecords).select('id');
    if (savedEntities) {
      savedEntityIds.push(...savedEntities.map((e) => e.id));
    }
  }

  // Save patterns with linked entities (evidence chain)
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
      affected_entities: savedEntityIds,
      detection_method: 'ai' as const,
    }));

    await supabase.from('fraud_patterns').insert(patternRecords);
  }

  // Build entity relationships (evidence chains) —
  // Link entities from this document to matching entities across the case
  if (extractedEntities.length > 0) {
    const { data: caseEntities } = await supabase
      .from('entities')
      .select('id, name, entity_type, document_id')
      .eq('case_id', doc.case_id)
      .neq('document_id', documentId);

    if (caseEntities && caseEntities.length > 0) {
      const relationships: Array<{
        case_id: string;
        source_entity_id: string;
        target_entity_id: string;
        relationship_type: string;
        strength: number;
        evidence_count: number;
      }> = [];

      // Match entities by name similarity (exact match or contains)
      for (const newEntity of extractedEntities) {
        const newEntityRecord = savedEntityIds.length > 0
          ? (await supabase.from('entities').select('id').eq('case_id', doc.case_id).eq('document_id', documentId).eq('name', newEntity.name).single()).data
          : null;

        if (!newEntityRecord) continue;

        for (const existing of caseEntities) {
          const nameMatch =
            existing.name.toLowerCase() === newEntity.name.toLowerCase() ||
            existing.name.toLowerCase().includes(newEntity.name.toLowerCase()) ||
            newEntity.name.toLowerCase().includes(existing.name.toLowerCase());

          if (nameMatch) {
            relationships.push({
              case_id: doc.case_id,
              source_entity_id: newEntityRecord.id,
              target_entity_id: existing.id,
              relationship_type: existing.entity_type === newEntity.type ? 'same_entity' : 'related',
              strength: existing.name.toLowerCase() === newEntity.name.toLowerCase() ? 0.95 : 0.7,
              evidence_count: 1,
            });
          }
        }
      }

      if (relationships.length > 0) {
        await supabase.from('entity_relationships').insert(relationships);
      }
    }
  }

  // Mark document as processed and update counts
  await supabase
    .from('documents')
    .update({
      processed: true,
      entity_count: extractedEntities.length,
      ocr_text: textContent.slice(0, 50000),
      ocr_confidence: ocrConfidence,
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
