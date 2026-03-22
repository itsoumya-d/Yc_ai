import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pet_id, medication_name, dosage, frequency, start_date, end_date, notes } =
      await request.json();

    if (!pet_id || !medication_name || !dosage || !frequency || !start_date) {
      return NextResponse.json(
        { error: 'pet_id, medication_name, dosage, frequency, and start_date are required' },
        { status: 400 }
      );
    }

    const { data: schedule, error } = await supabase
      .from('medication_schedules')
      .insert({
        user_id: user.id,
        pet_id,
        medication_name,
        dosage,
        frequency,
        start_date,
        end_date: end_date ?? null,
        notes: notes ?? null,
        active: true,
      })
      .select()
      .single();

    if (error) throw error;

    // Generate upcoming reminder timestamps
    const reminders: string[] = [];
    const start = new Date(start_date);
    const end = end_date ? new Date(end_date) : new Date(Date.now() + 30 * 24 * 3600 * 1000);
    const intervalMap: Record<string, number> = {
      daily: 1,
      twice_daily: 0.5,
      weekly: 7,
      monthly: 30,
    };
    const intervalDays = intervalMap[frequency] ?? 1;
    const current = new Date(start);
    while (current <= end && reminders.length < 10) {
      reminders.push(current.toISOString());
      current.setTime(current.getTime() + intervalDays * 24 * 3600 * 1000);
    }

    return NextResponse.json({ schedule, reminders });
  } catch (err) {
    console.error('[Medications Remind]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create reminder' },
      { status: 500 }
    );
  }
}
