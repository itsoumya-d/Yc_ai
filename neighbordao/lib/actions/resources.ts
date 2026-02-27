'use server';

import { createClient } from '@/lib/supabase/server';
import { resourceSchema, bookingSchema } from '@/lib/validations/schemas';
import type { ActionResult, Resource, ResourceBooking } from '@/types/database';

export async function fetchResources(
  neighborhoodId: string,
  category?: string
): Promise<ActionResult<Resource[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  let query = supabase
    .from('resources')
    .select('*')
    .eq('neighborhood_id', neighborhoodId)
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Resource[] };
}

export async function fetchResource(resourceId: string): Promise<ActionResult<Resource>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('id', resourceId)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Resource };
}

export async function createResource(
  neighborhoodId: string,
  formData: FormData
): Promise<ActionResult<Resource>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const raw = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    category: formData.get('category') as string || 'tools',
    condition: formData.get('condition') as string || 'good',
    deposit_amount: Number(formData.get('deposit_amount')) || 0,
    is_free: formData.get('is_free') === 'true',
    daily_rate: Number(formData.get('daily_rate')) || 0,
  };

  const parsed = resourceSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from('resources')
    .insert({
      neighborhood_id: neighborhoodId,
      owner_id: user.id,
      ...parsed.data,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Resource };
}

export async function createBooking(
  resourceId: string,
  formData: FormData
): Promise<ActionResult<ResourceBooking>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const raw = {
    starts_at: formData.get('starts_at') as string,
    ends_at: formData.get('ends_at') as string,
    notes: (formData.get('notes') as string) || null,
  };

  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from('resource_bookings')
    .insert({
      resource_id: resourceId,
      borrower_id: user.id,
      ...parsed.data,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as ResourceBooking };
}

export async function updateBookingStatus(
  bookingId: string,
  status: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('resource_bookings')
    .update({ status })
    .eq('id', bookingId);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}
