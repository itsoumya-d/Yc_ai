'use server';

import { createClient } from '@/lib/supabase/server';
import { eventSchema } from '@/lib/validations/schemas';
import type { ActionResult, Event, EventRsvp } from '@/types/database';

export async function fetchEvents(
  neighborhoodId: string,
  filter?: 'upcoming' | 'past'
): Promise<ActionResult<Event[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  let query = supabase
    .from('events')
    .select('*')
    .eq('neighborhood_id', neighborhoodId);

  if (filter === 'upcoming') {
    query = query.gte('starts_at', new Date().toISOString()).order('starts_at', { ascending: true });
  } else if (filter === 'past') {
    query = query.lt('starts_at', new Date().toISOString()).order('starts_at', { ascending: false });
  } else {
    query = query.order('starts_at', { ascending: true });
  }

  const { data, error } = await query;
  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Event[] };
}

export async function fetchEvent(eventId: string): Promise<ActionResult<Event>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Event };
}

export async function createEvent(
  neighborhoodId: string,
  formData: FormData
): Promise<ActionResult<Event>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const raw = {
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    location_name: (formData.get('location_name') as string) || null,
    location_address: (formData.get('location_address') as string) || null,
    starts_at: formData.get('starts_at') as string,
    ends_at: (formData.get('ends_at') as string) || null,
    max_attendees: formData.get('max_attendees') ? Number(formData.get('max_attendees')) : null,
    is_recurring: formData.get('is_recurring') === 'true',
  };

  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      neighborhood_id: neighborhoodId,
      organizer_id: user.id,
      ...parsed.data,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Event };
}

export async function rsvpEvent(
  eventId: string,
  status: 'going' | 'maybe' | 'not_going'
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('event_rsvps')
    .upsert({
      event_id: eventId,
      user_id: user.id,
      status,
    }, { onConflict: 'event_id,user_id' });

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}
