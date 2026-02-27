'use server';

import { createClient } from '@/lib/supabase/server';
import { auditRoomSchema } from '@/lib/validations/schemas';
import type { ActionResult, AuditRoom } from '@/types/database';

export async function fetchAuditRooms(
  orgId: string
): Promise<ActionResult<AuditRoom[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('audit_rooms')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as AuditRoom[] };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function createAuditRoom(
  orgId: string,
  formData: FormData
): Promise<ActionResult<AuditRoom>> {
  try {
    const raw = {
      title: formData.get('title') as string,
      auditor_firm: (formData.get('auditor_firm') as string) || null,
      audit_type: (formData.get('audit_type') as string) || null,
      target_date: (formData.get('target_date') as string) || null,
      framework_id: (formData.get('framework_id') as string) || null,
    };

    const validated = auditRoomSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('audit_rooms')
      .insert({
        org_id: orgId,
        ...validated.data,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as AuditRoom };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}
