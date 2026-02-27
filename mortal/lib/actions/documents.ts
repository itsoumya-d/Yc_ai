// Document upload and AI categorization
import { supabase } from "../supabase";
import { categorizeDocument } from "./ai";
import type { VaultDocument } from "../../types";

export async function getDocuments(): Promise<VaultDocument[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("vault_documents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((d: any) => ({ ...d, name: d.file_name || d.name }));
}

export async function uploadVaultDocument(
  uri: string,
  fileName: string,
  mimeType: string
): Promise<VaultDocument> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const path = `${user.id}/${Date.now()}_${fileName}`;
  const response = await fetch(uri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from("vault")
    .upload(path, blob, { contentType: mimeType });
  if (uploadError) throw uploadError;

  const { category, summary } = await categorizeDocument(fileName, mimeType);

  const { data, error } = await supabase
    .from("vault_documents")
    .insert({
      user_id: user.id,
      name: fileName,
      file_name: fileName,
      file_type: mimeType,
      storage_path: path,
      doc_type: category,
      category: category as VaultDocument['category'],
      ai_summary: summary,
      encrypted: false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDocument(doc: VaultDocument): Promise<void> {
  await supabase.storage.from("vault").remove([doc.storage_path]);
  const { error } = await supabase.from("vault_documents").delete().eq("id", doc.id);
  if (error) throw error;
}
