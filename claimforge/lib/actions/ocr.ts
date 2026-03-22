'use server';

import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface OcrResult {
  text: string;
  confidence: number;
  pageCount: number;
  documentType: 'invoice' | 'contract' | 'medical' | 'insurance' | 'legal' | 'unknown';
  extractedData: {
    dates?: string[];
    amounts?: string[];
    parties?: string[];
    caseReferences?: string[];
    keyFacts?: string[];
  };
}

export async function processDocumentOcr(
  fileUrl: string,
  fileName: string,
  caseId: string
): Promise<{ success: boolean; data?: OcrResult; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('case-documents')
      .download(fileUrl);

    if (downloadError || !fileData) {
      return { success: false, error: 'Failed to download document' };
    }

    const fileBuffer = await fileData.arrayBuffer();
    const base64 = Buffer.from(fileBuffer).toString('base64');
    const mimeType = fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';

    // Use OpenAI Vision for OCR and extraction
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are a legal document AI assistant. Extract all text from this document and analyze it for a legal case.

Return a JSON object with:
{
  "text": "full extracted text",
  "confidence": 0.95,
  "pageCount": 1,
  "documentType": "invoice|contract|medical|insurance|legal|unknown",
  "extractedData": {
    "dates": ["list of dates found"],
    "amounts": ["monetary amounts with context"],
    "parties": ["names of people/companies"],
    "caseReferences": ["case numbers, policy numbers, reference IDs"],
    "keyFacts": ["3-5 key facts relevant to a legal claim"]
  }
}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4096,
    });

    const result = JSON.parse(response.choices[0].message.content ?? '{}') as OcrResult;

    // Save OCR results to case_documents table
    await supabase
      .from('case_documents')
      .update({
        ocr_text: result.text,
        ocr_confidence: result.confidence,
        document_type: result.documentType,
        extracted_data: result.extractedData,
        status: 'processed',
        processed_at: new Date().toISOString(),
      })
      .eq('case_id', caseId)
      .eq('document_name', fileName);

    return { success: true, data: result };
  } catch (error) {
    console.error('OCR processing error:', error);
    return { success: false, error: 'OCR processing failed. Please try again.' };
  }
}

export async function bulkProcessDocuments(
  caseId: string,
  documentIds: string[]
): Promise<{ processed: number; failed: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { processed: 0, failed: 0 };

  const { data: documents } = await supabase
    .from('case_documents')
    .select('id, document_name, document_url')
    .in('id', documentIds)
    .eq('case_id', caseId);

  if (!documents) return { processed: 0, failed: 0 };

  let processed = 0;
  let failed = 0;

  for (const doc of documents) {
    const result = await processDocumentOcr(doc.document_url, doc.document_name, caseId);
    if (result.success) processed++;
    else failed++;
  }

  return { processed, failed };
}
