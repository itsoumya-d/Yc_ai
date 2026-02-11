'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Entity, FraudPattern, FraudPatternType, ConfidenceLevel } from '@/types/database';
import OpenAI from 'openai';

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
