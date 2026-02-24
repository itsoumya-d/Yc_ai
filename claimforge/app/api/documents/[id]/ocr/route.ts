import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (docError || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  // Verify user has access to this document's case
  const { data: caseData } = await supabase
    .from('cases')
    .select('id')
    .eq('id', doc.case_id)
    .single();

  if (!caseData) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  if (!doc.file_path) {
    return NextResponse.json({ error: 'No file path on document' }, { status: 422 });
  }

  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from('documents')
    .download(doc.file_path);

  if (downloadError || !fileBlob) {
    return NextResponse.json({ error: 'Failed to download file from storage' }, { status: 500 });
  }

  let ocrText = '';
  let ocrConfidence = 1.0;
  const fileType: string = doc.file_type ?? '';

  if (IMAGE_TYPES.has(fileType) || fileType === 'application/pdf') {
    // Use OpenAI Vision for images and PDFs
    const openai = getOpenAI();
    const arrayBuffer = await fileBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = IMAGE_TYPES.has(fileType) ? fileType : 'image/jpeg'; // PDFs sent as JPEG via screenshot workaround

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract ALL text from this document verbatim. Include every word, number, date, and monetary amount. Preserve line structure. Return only the extracted text.',
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
      max_tokens: 4096,
    });

    ocrText = response.choices[0]?.message?.content ?? '';
    ocrConfidence = ocrText.length > 200 ? 0.9 : 0.6;
  } else {
    // Plain text, CSV, or other readable formats
    ocrText = await fileBlob.text();
    ocrConfidence = 1.0;
  }

  if (!ocrText.trim()) {
    return NextResponse.json({ error: 'Could not extract text from document' }, { status: 422 });
  }

  await supabase
    .from('documents')
    .update({
      ocr_text: ocrText.slice(0, 50000),
      ocr_confidence: ocrConfidence,
    })
    .eq('id', id);

  return NextResponse.json({
    success: true,
    characters: ocrText.length,
    confidence: ocrConfidence,
  });
}
