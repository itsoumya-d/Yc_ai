'use server';
import { sendEmail, baseTemplate } from '@/lib/email';

const BRAND = 'PetOS';
const COLOR = '#F59E0B';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://petos.app';

export async function sendWelcomeEmail(email: string, name: string, petName?: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: petName ? `Welcome! ${petName}'s health journey starts here.` : `Welcome to PetOS, ${name}!`,
    content: `
      <h2>Welcome to PetOS, ${name}! 🐾</h2>
      <p>${petName ? `${petName} is lucky to have such a caring owner!` : 'Your pets deserve the best care.'} PetOS keeps all your pets' health records, reminders, and vet visits in one place.</p>
      <ul>
        <li>Add your pet's health records and vaccination history</li>
        <li>Set medication and appointment reminders</li>
        <li>Connect with a vet via telehealth anytime</li>
      </ul>
      <a href="${APP_URL}/dashboard/pets/new" class="btn">${petName ? `Set Up ${petName}'s Profile →` : 'Add Your Pet →'}</a>
    `,
  });
  return sendEmail({ to: email, subject: `Welcome to PetOS, ${name}! 🐾`, html });
}

export async function sendAppointmentReminderEmail(email: string, petName: string, vetName: string, appointmentDate: string, appointmentTime: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `Reminder: ${petName}'s appointment with ${vetName} tomorrow`,
    content: `
      <h2>Appointment reminder 🏥</h2>
      <p>This is a reminder that <strong>${petName}</strong> has an appointment tomorrow.</p>
      <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:20px;margin:16px 0;">
        <table style="width:100%;">
          <tr><td style="color:#6B7280;padding:4px 0;">Pet</td><td style="font-weight:700;text-align:right;">${petName}</td></tr>
          <tr><td style="color:#6B7280;padding:4px 0;">Vet</td><td style="font-weight:700;text-align:right;">${vetName}</td></tr>
          <tr><td style="color:#6B7280;padding:4px 0;">Date</td><td style="font-weight:700;text-align:right;">${appointmentDate}</td></tr>
          <tr><td style="color:#6B7280;padding:4px 0;">Time</td><td style="font-weight:700;text-align:right;">${appointmentTime}</td></tr>
        </table>
      </div>
      <a href="${APP_URL}/dashboard/appointments" class="btn">View Appointment Details →</a>
    `,
  });
  return sendEmail({ to: email, subject: `Reminder: ${petName}'s vet appointment ${appointmentDate}`, html });
}

export async function sendMedicationReminderEmail(email: string, petName: string, medication: string, dosage: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `Time to give ${petName} their ${medication}`,
    content: `
      <h2>Medication reminder 💊</h2>
      <p>It's time to give <strong>${petName}</strong> their scheduled medication.</p>
      <div style="background:#FFFBEB;border-left:4px solid ${COLOR};padding:16px;border-radius:0 10px 10px 0;margin:16px 0;">
        <p style="font-weight:700;color:#92400E;margin:0;">${medication} — ${dosage}</p>
      </div>
      <a href="${APP_URL}/dashboard/medications" class="btn">Mark as Given →</a>
    `,
  });
  return sendEmail({ to: email, subject: `Medication reminder: ${petName}'s ${medication}`, html });
}

export async function sendSubscriptionEmail(email: string, name: string, plan: string, amount: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `Your ${plan} plan is active`,
    content: `
      <h2>Subscription confirmed 🎉</h2>
      <p>Hi ${name}, your <span class="badge">${plan}</span> plan is active.</p>
      <a href="${APP_URL}/dashboard/settings/billing" class="btn">Manage Billing →</a>
    `,
  });
  return sendEmail({ to: email, subject: `${BRAND} ${plan} subscription confirmed`, html });
}

export async function sendDripEmail(
  to: string,
  name: string,
  step: 'day1' | 'day3' | 'day7' | 'day14'
): Promise<void> {
  const sequences: Record<typeof step, { subject: string; preheader: string; headline: string; body: string; cta: string; ctaUrl: string }> = {
    day1: {
      subject: `Petos: Your account is ready 🎉`,
      preheader: 'Here\'s how to get started in 5 minutes',
      headline: `Welcome to Petos, ${name}!`,
      body: `<p>You're all set! Here's how to get the most value from Petos in your first 24 hours:</p>
      <ol style="padding-left:20px;line-height:1.8">
        <li><strong>Complete your profile</strong> — this personalizes your experience</li>
        <li><strong>Explore the dashboard</strong> — your command center for everything</li>
        <li><strong>Try your first pet health check</strong> — it takes under 2 minutes</li>
      </ol>`,
      cta: 'Get Started →',
      ctaUrl: 'https://petos.app/dashboard',
    },
    day3: {
      subject: `💡 Petos tip: Vaccination Reminders`,
      preheader: 'One feature most users miss',
      headline: `Did you know, ${name}?`,
      body: `<p>Most users who achieve results with Petos do this one thing in their first week:</p>
      <p style="background:#F0FDF4;border-left:4px solid #22C55E;padding:16px;border-radius:0 8px 8px 0;margin:16px 0"><strong>Add all your pet's vaccinations with due dates. Petos will remind you 2 weeks before each one is due — never miss a shot again.</strong></p>
      <p>Takes 2 minutes to set up and saves hours every week.</p>`,
      cta: 'Try It Now',
      ctaUrl: 'https://petos.app/dashboard',
    },
    day7: {
      subject: `How's Petos working for you?`,
      preheader: 'Your week-1 check-in',
      headline: `Your first week with Petos`,
      body: `<p>Hi ${name}, it's been a week! Here's what successful users do by week 1:</p>
      <ul style="padding-left:20px;line-height:1.8">
        <li>✅ Complete the onboarding checklist</li>
        <li>✅ Try all core features at least once</li>
        <li>✅ Connect any integrations you need</li>
      </ul>
      <p>Need help getting the most out of Petos? Reply to this email — we read every response.</p>`,
      cta: 'Go to Dashboard',
      ctaUrl: 'https://petos.app/dashboard',
    },
    day14: {
      subject: `${name}, upgrade and unlock everything`,
      preheader: 'You\'ve been using the free plan — here\'s what you\'re missing',
      headline: `Unlock Petos Pro`,
      body: `<p>Hi ${name}, you've been using Petos for 2 weeks. Here's what Pro users get that you don't:</p>
      <ul style="padding-left:20px;line-height:1.8">
        <li>🚀 <strong>Unlimited usage</strong> — no caps on any feature</li>
        <li>🤖 <strong>Advanced AI features</strong> — 10x better results</li>
        <li>📊 <strong>Analytics & exports</strong> — full data access</li>
        <li>⚡ <strong>Priority support</strong> — response in under 4 hours</li>
      </ul>
      <p>Try Pro free for 14 days. No credit card required to start.</p>`,
      cta: 'Start Free Trial →',
      ctaUrl: 'https://petos.app/settings/billing',
    },
  };

  const seq = sequences[step];
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: seq.preheader,
    content: `<h2>${seq.headline}</h2>${seq.body}<a href="${seq.ctaUrl}" class="btn">${seq.cta}</a>`,
  });
  await sendEmail({ to, subject: seq.subject, html });
}
