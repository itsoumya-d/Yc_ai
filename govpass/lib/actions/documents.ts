'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, ScannedDocument, DocumentVaultItem } from '@/types/database';
import { documentScanSchema, vaultItemSchema } from '@/lib/validations/schemas';

export async function fetchVaultItems(): Promise<ActionResult<DocumentVaultItem[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('document_vault_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as DocumentVaultItem[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchVaultItem(id: string): Promise<ActionResult<DocumentVaultItem>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('document_vault_items')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as DocumentVaultItem };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function scanDocument(formData: FormData): Promise<ActionResult<ScannedDocument>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      document_type: formData.get('document_type') as string,
    };

    const parsed = documentScanSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('scanned_documents')
      .insert({
        user_id: user.id,
        document_type: parsed.data.document_type,
        extraction_confidence: 0.85,
        field_confidences: {},
        is_in_vault: false,
        is_verified_by_user: false,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        scanned_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as ScannedDocument };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function addToVault(formData: FormData): Promise<ActionResult<DocumentVaultItem>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      document_type: formData.get('document_type') as string,
      display_name: formData.get('display_name') as string,
      display_name_es: formData.get('display_name_es') as string || null,
      document_date: formData.get('document_date') as string || null,
      document_expiry_date: formData.get('document_expiry_date') as string || null,
      tags: JSON.parse((formData.get('tags') as string) || '[]'),
      notes: formData.get('notes') as string || null,
    };

    const parsed = vaultItemSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const scannedDocId = formData.get('scanned_document_id') as string || null;

    const { data, error } = await supabase
      .from('document_vault_items')
      .insert({
        user_id: user.id,
        scanned_document_id: scannedDocId,
        ...parsed.data,
        storage_path: `vault/${user.id}/${Date.now()}`,
        is_expired: false,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    if (scannedDocId) {
      await supabase
        .from('scanned_documents')
        .update({ is_in_vault: true })
        .eq('id', scannedDocId)
        .eq('user_id', user.id);
    }

    return { success: true, data: data as DocumentVaultItem };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function deleteVaultItem(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('document_vault_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchScannedDocuments(): Promise<ActionResult<ScannedDocument[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('scanned_documents')
      .select('*')
      .eq('user_id', user.id)
      .order('scanned_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as ScannedDocument[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
