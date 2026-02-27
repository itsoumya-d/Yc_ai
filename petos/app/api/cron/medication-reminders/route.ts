import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Cron job: Send medication refill reminders
 * Runs daily via Vercel Cron (configure in vercel.json)
 *
 * Sends email reminders for:
 * - Medications with refill_date within the next 7 days
 * - Appointments coming up within the next 48 hours
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    // Find medications with refill dates in the next 7 days
    const { data: medications } = await supabase
      .from('medications')
      .select(`
        id, name, dosage, frequency, refill_date,
        pet:pets(id, name, species, user_id),
        user:users!inner(id, email, full_name)
      `)
      .eq('is_active', true)
      .gte('refill_date', now.toISOString().split('T')[0])
      .lte('refill_date', sevenDaysFromNow.toISOString().split('T')[0])
      .not('refill_date', 'is', null);

    // Find upcoming appointments in the next 48 hours
    const { data: appointments } = await supabase
      .from('appointments')
      .select(`
        id, title, appointment_date, vet_name, clinic_name,
        pet:pets(id, name, user_id),
        user:users!inner(id, email, full_name)
      `)
      .gte('appointment_date', now.toISOString())
      .lte('appointment_date', twoDaysFromNow.toISOString())
      .eq('status', 'scheduled');

    const emailsSent = [];
    const errors = [];

    // Send medication reminder emails
    if (medications && medications.length > 0) {
      for (const med of medications) {
        const user = (med as any).user;
        const pet = (med as any).pet;
        if (!user?.email || !pet?.name) continue;

        const daysUntilRefill = Math.ceil(
          (new Date(med.refill_date!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        try {
          const emailBody = buildMedicationReminderEmail({
            userName: user.full_name ?? user.email,
            petName: pet.name,
            medicationName: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            refillDate: med.refill_date!,
            daysUntilRefill,
          });

          // Send via SendGrid
          if (process.env.SENDGRID_API_KEY) {
            const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: [{ email: user.email, name: user.full_name }],
                from: { email: 'noreply@petos.app', name: 'PetOS' },
                subject: `⏰ ${pet.name}'s ${med.name} needs a refill in ${daysUntilRefill} day${daysUntilRefill !== 1 ? 's' : ''}`,
                html: emailBody,
              }),
            });

            if (res.ok) {
              emailsSent.push({ type: 'medication', medId: med.id, petName: pet.name });
            }
          }
        } catch (err: any) {
          errors.push({ type: 'medication', medId: med.id, error: err.message });
        }
      }
    }

    // Send appointment reminder emails
    if (appointments && appointments.length > 0) {
      for (const appt of appointments) {
        const user = (appt as any).user;
        const pet = (appt as any).pet;
        if (!user?.email || !pet?.name) continue;

        const apptDate = new Date(appt.appointment_date);
        const hoursUntil = Math.ceil((apptDate.getTime() - now.getTime()) / (1000 * 60 * 60));

        try {
          if (process.env.SENDGRID_API_KEY) {
            const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: [{ email: user.email, name: user.full_name }],
                from: { email: 'noreply@petos.app', name: 'PetOS' },
                subject: `🏥 Reminder: ${pet.name}'s appointment in ${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''}`,
                html: buildAppointmentReminderEmail({
                  userName: user.full_name ?? user.email,
                  petName: pet.name,
                  appointmentTitle: appt.title,
                  appointmentDate: apptDate.toLocaleString(),
                  vetName: (appt as any).vet_name,
                  clinicName: (appt as any).clinic_name,
                }),
              }),
            });

            if (res.ok) {
              emailsSent.push({ type: 'appointment', apptId: appt.id, petName: pet.name });
            }
          }
        } catch (err: any) {
          errors.push({ type: 'appointment', apptId: appt.id, error: err.message });
        }
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent: emailsSent.length,
      errors: errors.length,
      details: { emailsSent, errors },
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function buildMedicationReminderEmail({
  userName,
  petName,
  medicationName,
  dosage,
  frequency,
  refillDate,
  daysUntilRefill,
}: {
  userName: string;
  petName: string;
  medicationName: string;
  dosage: string | null;
  frequency: string | null;
  refillDate: string;
  daysUntilRefill: number;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111;">
      <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">PetOS</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Medication Refill Reminder</p>
      </div>

      <p>Hi ${userName},</p>

      <p><strong>${petName}'s</strong> prescription for <strong>${medicationName}</strong> is due for a refill in <strong>${daysUntilRefill} day${daysUntilRefill !== 1 ? 's' : ''}</strong>.</p>

      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; color: #6b7280;">Medication Details</h3>
        <p style="margin: 4px 0;"><strong>Medication:</strong> ${medicationName}</p>
        ${dosage ? `<p style="margin: 4px 0;"><strong>Dosage:</strong> ${dosage}</p>` : ''}
        ${frequency ? `<p style="margin: 4px 0;"><strong>Frequency:</strong> ${frequency}</p>` : ''}
        <p style="margin: 4px 0;"><strong>Refill by:</strong> ${new Date(refillDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <p>Contact your vet to arrange a refill prescription before ${petName} runs out of medication.</p>

      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://petos.app'}/pets"
         style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
        View ${petName}'s Profile
      </a>

      <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
        You received this email because you have medication tracking enabled in PetOS.
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://petos.app'}/settings" style="color: #6b7280;">Manage notifications</a>
      </p>
    </body>
    </html>
  `;
}

function buildAppointmentReminderEmail({
  userName,
  petName,
  appointmentTitle,
  appointmentDate,
  vetName,
  clinicName,
}: {
  userName: string;
  petName: string;
  appointmentTitle: string;
  appointmentDate: string;
  vetName: string | null;
  clinicName: string | null;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111;">
      <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">PetOS</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Appointment Reminder</p>
      </div>

      <p>Hi ${userName},</p>

      <p>This is a reminder that <strong>${petName}</strong> has an upcoming appointment:</p>

      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; color: #6b7280;">Appointment Details</h3>
        <p style="margin: 4px 0;"><strong>Type:</strong> ${appointmentTitle}</p>
        <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${appointmentDate}</p>
        ${vetName ? `<p style="margin: 4px 0;"><strong>Vet:</strong> Dr. ${vetName}</p>` : ''}
        ${clinicName ? `<p style="margin: 4px 0;"><strong>Clinic:</strong> ${clinicName}</p>` : ''}
      </div>

      <p>Make sure ${petName} is ready for their appointment!</p>

      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://petos.app'}/appointments"
         style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
        View Appointments
      </a>

      <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
        You received this email because you have appointment reminders enabled in PetOS.
      </p>
    </body>
    </html>
  `;
}
