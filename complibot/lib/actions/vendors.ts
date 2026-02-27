'use server';

import { createClient } from '@/lib/supabase/server';
import { vendorSchema } from '@/lib/validations/schemas';
import type { ActionResult, VendorAssessment } from '@/types/database';

export async function fetchVendors(
  orgId: string
): Promise<ActionResult<VendorAssessment[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('vendor_assessments')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as VendorAssessment[] };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function createVendor(
  orgId: string,
  formData: FormData
): Promise<ActionResult<VendorAssessment>> {
  try {
    const raw = {
      vendor_name: formData.get('vendor_name') as string,
      vendor_website: (formData.get('vendor_website') as string) || null,
      risk_level: (formData.get('risk_level') as string) || 'medium',
      has_soc2: formData.get('has_soc2') === 'true',
      data_access_level: (formData.get('data_access_level') as string) || null,
      criticality: (formData.get('criticality') as string) || 'medium',
      agreement_type: (formData.get('agreement_type') as string) || null,
      notes: (formData.get('notes') as string) || null,
    };

    const validated = vendorSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('vendor_assessments')
      .insert({
        org_id: orgId,
        ...validated.data,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as VendorAssessment };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}
