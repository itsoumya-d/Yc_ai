'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Event, EventRsvp } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getEvents(
  neighborhoodId: string,
  filters?: { category?: string; status?: string }
): Promise<ActionResult<Event[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  let query = supabase
    .from('events')
    .select('*, organizer:users!organizer_id(*)')
    .eq('neighborhood_id', neighborhoodId)
    .order('start_date', { ascending: true });

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data: data as Event[] };
}

export async function getEvent(
  id: string
): Promise<ActionResult<Event & { rsvps: EventRsvp[] }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*, organizer:users!organizer_id(*)')
    .eq('id', id)
    .single();

  if (eventError) return { error: eventError.message };

  const { data: rsvps, error: rsvpsError } = await supabase
    .from('event_rsvps')
    .select('*, user:users!user_id(*)')
    .eq('event_id', id);

  if (rsvpsError) return { error: rsvpsError.message };

  return {
    data: { ...event, rsvps: rsvps as EventRsvp[] } as Event & { rsvps: EventRsvp[] },
  };
}

export async function createEvent(data: {
  neighborhood_id: string;
  title: string;
  description: string;
  location?: string;
  start_date: string;
  end_date?: string;
  max_attendees?: number;
  category: Event['category'];
}): Promise<ActionResult<Event>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      ...data,
      organizer_id: user.id,
      status: 'upcoming',
      rsvp_count: 0,
      location: data.location || null,
      end_date: data.end_date || null,
      max_attendees: data.max_attendees ?? null,
    })
    .select('*, organizer:users!organizer_id(*)')
    .single();

  if (error) return { error: error.message };
  revalidatePath('/events');
  revalidatePath('/dashboard');
  return { data: event as Event };
}

export async function updateEvent(
  id: string,
  data: Partial<Event>
): Promise<ActionResult<Event>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { id: _id, organizer_id, created_at, organizer, ...updateData } =
    data as Record<string, unknown>;

  const { data: event, error } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', id)
    .eq('organizer_id', user.id)
    .select('*, organizer:users!organizer_id(*)')
    .single();

  if (error) return { error: error.message };
  revalidatePath('/events');
  revalidatePath(`/events/${id}`);
  return { data: event as Event };
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
    .eq('organizer_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/events');
  revalidatePath('/dashboard');
  return {};
}

export async function rsvpEvent(
  eventId: string,
  status: EventRsvp['status']
): Promise<ActionResult<EventRsvp>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Upsert RSVP based on user_id and event_id
  const { data: rsvp, error: rsvpError } = await supabase
    .from('event_rsvps')
    .upsert(
      { event_id: eventId, user_id: user.id, status },
      { onConflict: 'user_id,event_id' }
    )
    .select()
    .single();

  if (rsvpError) return { error: rsvpError.message };

  // Recalculate rsvp_count (count of 'going' rsvps)
  const { count, error: countError } = await supabase
    .from('event_rsvps')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('status', 'going');

  if (!countError && count !== null) {
    await supabase
      .from('events')
      .update({ rsvp_count: count })
      .eq('id', eventId);
  }

  revalidatePath('/events');
  revalidatePath(`/events/${eventId}`);
  return { data: rsvp as EventRsvp };
}

export async function getUserRsvp(
  eventId: string
): Promise<ActionResult<EventRsvp | null>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('event_rsvps')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return { data: null };
    return { error: error.message };
  }

  return { data: data as EventRsvp };
}
