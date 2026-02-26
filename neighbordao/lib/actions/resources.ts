'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Resource, ResourceBooking } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getResources(
  neighborhoodId: string
): Promise<ActionResult<Resource[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('resources')
    .select('*, owner:users!owner_id(*)')
    .eq('neighborhood_id', neighborhoodId);

  if (error) return { error: error.message };
  return { data: data as Resource[] };
}

export async function getResource(
  id: string
): Promise<ActionResult<Resource & { bookings: ResourceBooking[] }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: resource, error: resourceError } = await supabase
    .from('resources')
    .select('*, owner:users!owner_id(*)')
    .eq('id', id)
    .single();

  if (resourceError) return { error: resourceError.message };

  const { data: bookings, error: bookingsError } = await supabase
    .from('resource_bookings')
    .select('*, user:users!user_id(*)')
    .eq('resource_id', id);

  if (bookingsError) return { error: bookingsError.message };

  return {
    data: {
      ...resource,
      bookings: bookings as ResourceBooking[],
    } as Resource & { bookings: ResourceBooking[] },
  };
}

export async function createResource(data: {
  neighborhood_id: string;
  name: string;
  description?: string;
  category: Resource['category'];
  condition: Resource['condition'];
  deposit_amount?: number;
}): Promise<ActionResult<Resource>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: resource, error } = await supabase
    .from('resources')
    .insert({
      ...data,
      owner_id: user.id,
      is_available: true,
      description: data.description || null,
      deposit_amount: data.deposit_amount ?? null,
      image_url: null,
    })
    .select('*, owner:users!owner_id(*)')
    .single();

  if (error) return { error: error.message };
  revalidatePath('/resources');
  revalidatePath('/dashboard');
  return { data: resource as Resource };
}

export async function updateResource(
  id: string,
  data: Partial<Resource>
): Promise<ActionResult<Resource>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { id: _id, owner_id, created_at, owner, ...updateData } =
    data as Record<string, unknown>;

  const { data: resource, error } = await supabase
    .from('resources')
    .update(updateData)
    .eq('id', id)
    .eq('owner_id', user.id)
    .select('*, owner:users!owner_id(*)')
    .single();

  if (error) return { error: error.message };
  revalidatePath('/resources');
  revalidatePath(`/resources/${id}`);
  return { data: resource as Resource };
}

export async function deleteResource(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/resources');
  revalidatePath('/dashboard');
  return {};
}

export async function bookResource(data: {
  resource_id: string;
  start_date: string;
  end_date: string;
  notes?: string;
}): Promise<ActionResult<ResourceBooking>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: booking, error } = await supabase
    .from('resource_bookings')
    .insert({
      ...data,
      user_id: user.id,
      status: 'pending',
      notes: data.notes || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/resources');
  revalidatePath(`/resources/${data.resource_id}`);
  return { data: booking as ResourceBooking };
}

export async function updateBookingStatus(
  id: string,
  status: ResourceBooking['status']
): Promise<ActionResult<ResourceBooking>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: booking, error } = await supabase
    .from('resource_bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/resources');
  return { data: booking as ResourceBooking };
}

export async function getMyBookings(): Promise<ActionResult<ResourceBooking[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('resource_bookings')
    .select('*, resource:resources!resource_id(*)')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false });

  if (error) return { error: error.message };
  return { data: data as ResourceBooking[] };
}
