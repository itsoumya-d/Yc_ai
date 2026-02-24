'use server';

import { createClient } from '@/lib/supabase/server';
import { Resource, ResourceBooking } from '@/types/database';

export async function getResources(neighborhoodId: string): Promise<Resource[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('neighborhood_id', neighborhoodId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function createResource(data: {
  neighborhood_id: string;
  name: string;
  description: string;
  category: string;
  deposit_amount: number;
}): Promise<{ error?: string; resource?: Resource }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { data: member } = await supabase
    .from('neighborhood_members')
    .select('display_name')
    .eq('user_id', user.id)
    .eq('neighborhood_id', data.neighborhood_id)
    .maybeSingle();

  const ownerName = member?.display_name || user.email?.split('@')[0] || 'Member';

  const { data: resource, error } = await supabase
    .from('resources')
    .insert({
      neighborhood_id: data.neighborhood_id,
      owner_id: user.id,
      owner_name: ownerName,
      name: data.name,
      description: data.description,
      category: data.category,
      deposit_amount: data.deposit_amount,
      is_available: true,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { resource };
}

export async function bookResource(
  resourceId: string,
  booking: { starts_at: string; ends_at: string; notes: string }
): Promise<{ error?: string; booking?: ResourceBooking }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { data: resource, error: resourceError } = await supabase
    .from('resources')
    .select('name, is_available, neighborhood_id')
    .eq('id', resourceId)
    .single();

  if (resourceError || !resource) return { error: 'Resource not found' };
  if (!resource.is_available) return { error: 'Resource is not available' };

  const { data: member } = await supabase
    .from('neighborhood_members')
    .select('display_name')
    .eq('user_id', user.id)
    .eq('neighborhood_id', resource.neighborhood_id)
    .maybeSingle();

  const borrowerName = member?.display_name || user.email?.split('@')[0] || 'Member';

  const { data: newBooking, error: bookingError } = await supabase
    .from('resource_bookings')
    .insert({
      resource_id: resourceId,
      resource_name: resource.name,
      borrower_id: user.id,
      borrower_name: borrowerName,
      starts_at: booking.starts_at,
      ends_at: booking.ends_at,
      notes: booking.notes,
      status: 'pending',
    })
    .select()
    .single();

  if (bookingError) return { error: bookingError.message };

  await supabase
    .from('resources')
    .update({ is_available: false })
    .eq('id', resourceId);

  return { booking: newBooking };
}
