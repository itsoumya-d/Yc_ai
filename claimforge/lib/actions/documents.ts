'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createHash } from 'crypto';
import type { Document, DocumentType } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getDocuments(options?: {
  caseId?: string;
  search?: string;
  type?: DocumentType;
}): Promise<ActionResult<Document[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  let query = supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.caseId) {
    query = query.eq('case_id', options.caseId);
  }

  if (options?.type) {
    query = query.eq('document_type', options.type);
  }

  if (options?.search) {
    query = query.or(
      `title.ilike.%${options.search}%,file_name.ilike.%${options.search}%`
    );
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data: data as Document[] };
}

export async function getDocument(id: string): Promise<ActionResult<Document>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return { error: error.message };
  return { data: data as Document };
}

export async function uploadDocument(
  caseId: string,
  formData: FormData
): Promise<ActionResult<Document>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const file = formData.get('file') as File;
  const documentType = (formData.get('document_type') as DocumentType) || 'other';
  const title = (formData.get('title') as string) || file.name;

  if (!file) return { error: 'No file provided' };

  // Compute SHA-256 hash for chain of custody
  const arrayBuffer = await file.arrayBuffer();
  const sha256 = createHash('sha256').update(Buffer.from(arrayBuffer)).digest('hex');

  // Upload to Supabase Storage
  const filepath = `${caseId}/${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filepath, file);

  if (uploadError) return { error: uploadError.message };

  // Create document record (sha256 stored if column exists)
  const { data, error } = await supabase
    .from('documents')
    .insert({
      case_id: caseId,
      title,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_path: filepath,
      document_type: documentType,
      uploaded_by: user.id,
      sha256_hash: sha256,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Increment case document count
  const { data: caseData } = await supabase
    .from('cases')
    .select('document_count')
    .eq('id', caseId)
    .single();

  if (caseData) {
    await supabase
      .from('cases')
      .update({
        document_count: (caseData.document_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', caseId);
  }

  revalidatePath(`/cases/${caseId}`);
  revalidatePath('/documents');
  revalidatePath('/dashboard');
  return { data: data as Document };
}

export async function deleteDocument(id: string, caseId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get file path for storage deletion
  const { data: doc } = await supabase
    .from('documents')
    .select('file_path')
    .eq('id', id)
    .single();

  if (doc?.file_path) {
    await supabase.storage.from('documents').remove([doc.file_path]);
  }

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath(`/cases/${caseId}`);
  revalidatePath('/documents');
  revalidatePath('/dashboard');
  return {};
}
