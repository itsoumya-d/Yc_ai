import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      pet_id,
      provider_id,
      appointment_type,
      preferred_date,
      preferred_time,
      notes,
    } = await request.json();

    if (!pet_id || !appointment_type || !preferred_date) {
      return NextResponse.json(
        { error: 'pet_id, appointment_type, and preferred_date are required' },
        { status: 400 }
      );
    }

    // Insert appointment record
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        user_id: user.id,
        pet_id,
        provider_id: provider_id ?? null,
        appointment_type,
        scheduled_at: `${preferred_date}T${preferred_time ?? '09:00'}:00`,
        status: 'pending',
        notes: notes ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: Integrate with real vet booking APIs (VetHero, Vetspire, etc.)
    // For now, return the created appointment with a confirmation number
    return NextResponse.json({
      appointment,
      confirmation_number: `PET-${Date.now().toString(36).toUpperCase()}`,
      message: 'Appointment request submitted. You will receive a confirmation email shortly.',
    });
  } catch (err) {
    console.error('[Appointments Book]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Booking failed' },
      { status: 500 }
    );
  }
}
