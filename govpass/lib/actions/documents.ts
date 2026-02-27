import { supabase } from '../supabase';
import { extractDocumentFields } from './ai';
import type { DocumentType, ExtractedFields } from '../../types';

async function uriToBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function uploadAndExtractDocument(
  imageUri: string,
  documentType: DocumentType
): Promise<ExtractedFields> {
  const base64 = await uriToBase64(imageUri);
  const fields = await extractDocumentFields(base64, documentType);

  // Save to Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const fileName = `${user.id}/${documentType}_${Date.now()}.jpg`;
    await supabase.storage.from('documents').upload(
      fileName,
      Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)),
      { contentType: 'image/jpeg', upsert: false }
    );

    await supabase.from('documents').insert({
      user_id: user.id,
      document_type: documentType,
      storage_path: fileName,
      extracted_fields: fields,
      verified: false,
    });
  }

  return fields;
}

export async function getUserDocuments(userId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
