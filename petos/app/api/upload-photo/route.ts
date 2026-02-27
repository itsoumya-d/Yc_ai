import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const petId = formData.get('pet_id') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File must be a JPEG, PNG, WebP, or GIF image' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 5MB' }, { status: 400 });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() ?? 'jpg';
    const filename = `${user.id}/${petId ?? 'unknown'}/${Date.now()}.${ext}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('pet-photos')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 });
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('pet-photos').getPublicUrl(filename);

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('Photo upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
