import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// Called by a cron job scheduler (e.g., Vercel Cron, GitHub Actions, or supabase pg_cron)
// Endpoint: GET /api/cron/medication-reminders
// Authorization: CRON_SECRET header to prevent unauthorized access

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const today = new Date();
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Find active medications with refill_date within the next 7 days
  const { data: medications, error: medError } = await supabase
    .from('medications')
    .select('*, pets!inner(name, user_id, users!inner(email, full_name))')
    .eq('is_active', true)
    .not('refill_date', 'is', null)
    .lte('refill_date', in7Days.toISOString())
    .gte('refill_date', today.toISOString());

  if (medError) {
    console.error('Medication reminder query error:', medError.message);
    return NextResponse.json({ error: medError.message }, { status: 500 });
  }

  // Find upcoming appointments in the next 48 hours
  const in48h = new Date(today.getTime() + 48 * 60 * 60 * 1000);
  const { data: appointments, error: apptError } = await supabase
    .from('appointments')
    .select('*, pets!inner(name, user_id, users!inner(email, full_name))')
    .eq('status', 'scheduled')
    .lte('scheduled_at', in48h.toISOString())
    .gte('scheduled_at', today.toISOString());

  if (apptError) {
    console.error('Appointment reminder query error:', apptError.message);
  }

  const refillCount = medications?.length ?? 0;
  const apptCount = appointments?.length ?? 0;

  // TODO: Send email reminders via SendGrid/Resend when email service is configured.
  // For each item in `medications`, send refill reminder to the owner.
  // For each item in `appointments`, send appointment reminder to the owner.
  // The data is fully available above — owner email is at pet.users.email

  console.log(`[medication-reminders] Processed: ${refillCount} refill reminders, ${apptCount} appointment reminders`);

  return NextResponse.json({
    success: true,
    stats: {
      refill_reminders: refillCount,
      appointment_reminders: apptCount,
    },
  });
}
