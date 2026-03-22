'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getAvailableVets() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('vet_providers')
    .select('id, name, specialty, price_per_consultation, next_available_at, avatar_url, rating, reviews_count, bio')
    .eq('available', true)
    .order('next_available_at');

  return data ?? [];
}

export async function createTelehealthRoom(vetProviderId: string, petId: string): Promise<{
  data?: { roomUrl: string; appointmentId: string; token: string };
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const dailyApiKey = process.env.DAILY_API_KEY;
  if (!dailyApiKey) return { error: 'Telehealth not configured' };

  // Get vet details
  const { data: vet } = await supabase
    .from('vet_providers')
    .select('price_per_consultation, name')
    .eq('id', vetProviderId)
    .single();

  // Create Daily.co room (expires in 1 hour)
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  const roomResp = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${dailyApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      privacy: 'private',
      properties: {
        exp: expiresAt,
        max_participants: 2,
        enable_recording: 'local',
        enable_chat: true,
        start_video_off: false,
        start_audio_off: false,
      },
    }),
  });

  if (!roomResp.ok) {
    const err = await roomResp.json();
    return { error: err.error ?? 'Failed to create video room' };
  }

  const room = await roomResp.json();

  // Create participant token for the pet owner
  const tokenResp = await fetch('https://api.daily.co/v1/meeting-tokens', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${dailyApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        room_name: room.name,
        exp: expiresAt,
        user_name: user.email ?? 'Pet Owner',
        is_owner: false,
      },
    }),
  });

  const tokenData = tokenResp.ok ? await tokenResp.json() : null;

  // Create appointment record
  const { data: appt } = await supabase
    .from('appointments')
    .insert({
      pet_id: petId,
      type: 'telehealth',
      vet_name: vet?.name ?? 'Online Vet',
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      status: 'in_progress',
      telehealth_room_url: room.url,
      telehealth_room_name: room.name,
      cost: vet?.price_per_consultation ?? 0,
    })
    .select('id')
    .single();

  revalidatePath('/appointments');
  revalidatePath('/telehealth');

  return {
    data: {
      roomUrl: room.url,
      appointmentId: appt?.id ?? '',
      token: tokenData?.token ?? '',
    },
  };
}

export async function getBookings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('service_bookings')
    .select(`
      id, service_id, pet_id, booking_date, booking_time, status, total_price,
      service:marketplace_services(title, provider_name, service_type),
      pet:pets(name)
    `)
    .eq('user_id', user.id)
    .order('booking_date', { ascending: false });

  return data ?? [];
}

export async function bookMarketplaceService(
  serviceId: string,
  petId: string,
  bookingDate: string,
  bookingTime: string
): Promise<{ data?: { id: string }; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: service } = await supabase
    .from('marketplace_services')
    .select('price, title')
    .eq('id', serviceId)
    .single();

  const { data, error } = await supabase
    .from('service_bookings')
    .insert({
      user_id: user.id,
      service_id: serviceId,
      pet_id: petId,
      booking_date: bookingDate,
      booking_time: bookingTime,
      status: 'confirmed',
      total_price: service?.price ?? 0,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };
  revalidatePath('/booking');
  revalidatePath('/marketplace');
  return { data: { id: data.id } };
}
