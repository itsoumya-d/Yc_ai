import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const claim_id = formData.get('claim_id') as string | null;
    const document_type = formData.get('document_type') as string ?? 'claim_document';

    if (!file) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }

    // Upload document to Supabase Storage
    const buffer = await file.arrayBuffer();
    const storagePath = `claims/${user.id}/${claim_id ?? 'intake'}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('claim-docs')
      .upload(storagePath, buffer, { contentType: file.type });
    if (uploadError) throw uploadError;

    // Get public URL for OpenAI Vision
    const { data: urlData } = supabase.storage.from('claim-docs').getPublicUrl(storagePath);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 503 });
    }

    const openai = new OpenAI({ apiKey });

    // Use base64 for vision
    const base64 = Buffer.from(buffer).toString('base64');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a document OCR and extraction AI for insurance claims. Extract all relevant fields from the document. Return JSON: { document_type, extracted_fields: Record<string, string>, claimant_name, policy_number, incident_date, claim_amount, insurer, confidence_score: 0-100, summary }',
        },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${file.type};base64,${base64}`, detail: 'high' } },
            { type: 'text', text: `Extract all fields from this ${document_type}.` },
          ],
        },
      ],
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    const extracted = JSON.parse(completion.choices[0].message.content ?? '{}');

    // Store document record
    const { data: doc } = await supabase
      .from('claim_documents')
      .insert({
        user_id: user.id,
        claim_id: claim_id ?? null,
        file_name: file.name,
        storage_path: storagePath,
        document_type,
        extracted_data: extracted,
        ocr_confidence: extracted.confidence_score ?? null,
        status: 'processed',
      })
      .select()
      .single();

    return NextResponse.json({ document_id: doc?.id, extracted, storage_path: storagePath });
  } catch (err) {
    console.error('[Documents OCR]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'OCR failed' },
      { status: 500 }
    );
  }
}
