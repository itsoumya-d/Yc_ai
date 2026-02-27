'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, Wish, DigitalAsset, TrustedContact, CheckIn } from '@/types/database';

interface DashboardStats {
  wishes_count: number;
  assets_count: number;
  documents_count: number;
  contacts_count: number;
  plan_completeness: number;
  next_check_in: string | null;
  missed_check_ins: number;
  legal_documents_count: number;
}

export async function fetchDashboardStats(): Promise<ActionResult<DashboardStats>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const [wishes, assets, documents, contacts, checkIns, legalDocs, profile] = await Promise.all([
      supabase.from('wishes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('digital_assets').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('documents').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('trusted_contacts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('check_ins').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'missed'),
      supabase.from('user_legal_documents').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('profiles').select('plan_completeness_percent, last_check_in_at').eq('id', user.id).single(),
    ]);

    return {
      success: true,
      data: {
        wishes_count: wishes.count ?? 0,
        assets_count: assets.count ?? 0,
        documents_count: documents.count ?? 0,
        contacts_count: contacts.count ?? 0,
        plan_completeness: (profile.data as { plan_completeness_percent: number } | null)?.plan_completeness_percent ?? 0,
        next_check_in: (profile.data as { last_check_in_at: string | null } | null)?.last_check_in_at ?? null,
        missed_check_ins: checkIns.count ?? 0,
        legal_documents_count: legalDocs.count ?? 0,
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchRecentWishes(): Promise<ActionResult<Wish[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('wishes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as Wish[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchRecentContacts(): Promise<ActionResult<TrustedContact[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as TrustedContact[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
