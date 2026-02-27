'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createEvent(formData: { title: string; description: string; location: string; starts_at: string; ends_at?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase.from('user_profiles').select('neighborhood_id').eq('id', user.id).single();
  if (!profile?.neighborhood_id) return { error: 'Join a neighborhood first' };

  const { error } = await supabase.from('events').insert({
    neighborhood_id: profile.neighborhood_id,
    user_id: user.id,
    ...formData,
  });
  if (error) return { error: error.message };
  revalidatePath('/events');
  return { success: true };
}

export async function rsvpEvent(eventId: string, status: 'going' | 'maybe' | 'not_going') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  await supabase.from('event_rsvps').upsert({ event_id: eventId, user_id: user.id, status }, { onConflict: 'event_id,user_id' });
  if (status === 'going') {
    await supabase.rpc('increment_rsvp', { event_id: eventId }).catch(() => {});
  }
  revalidatePath('/events');
  return { success: true };
}
