import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import sgMail from '@sendgrid/mail';

// This route is called daily by a cron job (e.g., Vercel Cron / GitHub Actions)
// Configure: CRON_SECRET env var + vercel.json cron schedule

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  const supabase = createServiceClient();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Find medications that need a refill in the next 3 days
  const refillWarningDate = new Date(today);
  refillWarningDate.setDate(refillWarningDate.getDate() + 3);
  const refillWarningStr = refillWarningDate.toISOString().split('T')[0];

  const { data: dueMedications } = await supabase
    .from('medications')
    .select(`
      id, name, dosage, frequency, refill_date,
      pets(name, species, user_id,
        users:user_id(email, full_name)
      )
    `)
    .eq('is_active', true)
    .not('refill_date', 'is', null)
    .lte('refill_date', refillWarningStr)
    .gte('refill_date', todayStr);

  let sent = 0;
  let errors = 0;

  if (dueMedications && process.env.SENDGRID_API_KEY) {
    const fromEmail = process.env.SENDGRID_FROM_EMAIL ?? 'noreply@petos.app';

    for (const med of dueMedications) {
      const pet = (med.pets as unknown) as { name: string; species: string; user_id: string; users: { email: string; full_name: string } | null } | null;
      if (!pet?.users?.email) continue;

      const daysUntilRefill = Math.ceil(
        (new Date(med.refill_date!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      const subject =
        daysUntilRefill <= 0
          ? `Refill needed today: ${med.name} for ${pet.name}`
          : `Medication refill reminder: ${med.name} for ${pet.name} (${daysUntilRefill} day${daysUntilRefill === 1 ? '' : 's'})`;

      try {
        await sgMail.send({
          to: pet.users.email,
          from: fromEmail,
          subject,
          html: buildReminderEmail({
            ownerName: pet.users.full_name ?? 'Pet Owner',
            petName: pet.name,
            medicationName: med.name,
            dosage: med.dosage ?? '',
            frequency: med.frequency ?? '',
            refillDate: med.refill_date!,
            daysUntilRefill,
          }),
        });
        sent++;
      } catch (err) {
        console.error(`Failed to send reminder for medication ${med.id}:`, err);
        errors++;
      }
    }
  }

  return NextResponse.json({ sent, errors, total: dueMedications?.length ?? 0 });
}

function buildReminderEmail(params: {
  ownerName: string;
  petName: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  refillDate: string;
  daysUntilRefill: number;
}) {
  const urgencyColor = params.daysUntilRefill <= 0 ? '#dc2626' : params.daysUntilRefill <= 1 ? '#ea580c' : '#ca8a04';
  const urgencyText = params.daysUntilRefill <= 0
    ? 'Refill needed today!'
    : `Refill due in ${params.daysUntilRefill} day${params.daysUntilRefill === 1 ? '' : 's'}`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:white;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="color:#1e40af;margin:0 0 4px;">PetOS</h2>
      <p style="color:#6b7280;font-size:13px;margin:0 0 24px;">Medication Reminder</p>

      <p style="color:#111827;font-size:15px;">Hi ${params.ownerName},</p>

      <div style="background:#fef9c3;border:1px solid ${urgencyColor};border-radius:8px;padding:16px;margin:20px 0;">
        <p style="color:${urgencyColor};font-weight:600;margin:0 0 4px;">${urgencyText}</p>
        <p style="color:#374151;margin:0;font-size:14px;">
          <strong>${params.petName}</strong> needs a refill of <strong>${params.medicationName}</strong>
        </p>
        ${params.dosage ? `<p style="color:#6b7280;font-size:13px;margin:4px 0 0;">Dosage: ${params.dosage}</p>` : ''}
        ${params.frequency ? `<p style="color:#6b7280;font-size:13px;margin:2px 0 0;">Frequency: ${params.frequency}</p>` : ''}
      </div>

      <p style="color:#6b7280;font-size:13px;margin:16px 0 0;text-align:center;">
        Refill date: ${new Date(params.refillDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>

      <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:24px;">
        This reminder was sent by PetOS on behalf of your pet care schedule.
      </p>
    </div>
  </div>
</body>
</html>`;
}
