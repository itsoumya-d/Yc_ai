import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServerClient } from '@supabase/ssr';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const BUCKET = 'resumes';

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Allowed: PDF, Word documents, plain text.' },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'File too large. Maximum size is 5 MB.' },
      { status: 400 }
    );
  }

  const ext = file.name.split('.').pop() ?? 'pdf';
  const filename = `${user.id}/${Date.now()}.${ext}`;
  const buffer = await file.arrayBuffer();

  const adminSupabase = createServiceClient();
  const { error: uploadError } = await adminSupabase.storage
    .from(BUCKET)
    .upload(filename, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = adminSupabase.storage.from(BUCKET).getPublicUrl(filename);

  // Extract text content for PDF parsing (basic plain text extraction)
  let textContent = '';
  if (file.type === 'text/plain') {
    textContent = await file.text();
  }

  return NextResponse.json({ url: publicUrl, filename, textContent });
}
