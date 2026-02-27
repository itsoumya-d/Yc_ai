'use server';

import { createClient } from '@/lib/supabase/server';

interface UploadResult {
  url?: string;
  error?: string;
}

/**
 * Uploads an image to the specified Supabase Storage bucket.
 * Accepts a FormData object with a 'file' field.
 * Returns the public URL of the uploaded image.
 */
export async function uploadImage(
  formData: FormData,
  bucket: 'pet-photos' | 'symptom-photos' | 'health-attachments'
): Promise<UploadResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) return { error: 'No file provided' };

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.' };
  }

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    return { error: 'File too large. Maximum size is 10MB.' };
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return { url: urlData.publicUrl };
}

/**
 * Creates a signed URL for private buckets (symptom-photos, health-attachments).
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) return { error: error.message };
  return { url: data.signedUrl };
}
