'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, LegalTemplate, UserLegalDocument } from '@/types/database';
import { legalDocumentSchema } from '@/lib/validations/schemas';

export async function fetchLegalTemplates(): Promise<ActionResult<LegalTemplate[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('legal_templates')
      .select('*')
      .eq('is_active', true)
      .order('title', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as LegalTemplate[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchUserLegalDocuments(): Promise<ActionResult<UserLegalDocument[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('user_legal_documents')
      .select('*, template:legal_templates(*)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as UserLegalDocument[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function createLegalDocument(formData: FormData): Promise<ActionResult<UserLegalDocument>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      template_id: formData.get('template_id') as string || null,
      category: formData.get('category') as string,
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      field_values: JSON.parse((formData.get('field_values') as string) || '{}'),
      is_draft: formData.get('is_draft') !== 'false',
    };

    const parsed = legalDocumentSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('user_legal_documents')
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as UserLegalDocument };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function deleteLegalDocument(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('user_legal_documents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
