'use server';
import { sendEmail, baseTemplate } from '@/lib/email';

const BRAND = 'InvoiceAI';
const COLOR = '#0EA5E9';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://invoiceai.app';

export async function sendWelcomeEmail(email: string, name: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `Invoice smarter, get paid faster — welcome ${name}!`,
    content: `
      <h2>Welcome to InvoiceAI, ${name}! 💸</h2>
      <p>Create professional invoices, automate payment reminders, and track every dollar owed — all in one place.</p>
      <ul>
        <li>Create your first invoice in under 2 minutes</li>
        <li>Set up auto-reminders for overdue payments</li>
        <li>Connect your bank for automatic reconciliation</li>
      </ul>
      <a href="${APP_URL}/dashboard/invoices/new" class="btn">Create Your First Invoice →</a>
    `,
  });
  return sendEmail({ to: email, subject: `Welcome to InvoiceAI, ${name}!`, html });
}

export async function sendInvoiceSentEmail(email: string, clientName: string, invoiceNumber: string, amount: string, dueDate: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `Invoice ${invoiceNumber} sent to ${clientName}`,
    content: `
      <h2>Invoice sent ✅</h2>
      <p>Your invoice has been delivered to <strong>${clientName}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#F0F9FF;border-radius:10px;padding:16px;">
        <tr><td style="padding:8px;color:#6B7280;">Invoice #</td><td style="text-align:right;font-weight:700;">${invoiceNumber}</td></tr>
        <tr><td style="padding:8px;color:#6B7280;">Amount</td><td style="text-align:right;font-weight:700;color:${COLOR};">${amount}</td></tr>
        <tr><td style="padding:8px;color:#6B7280;">Due Date</td><td style="text-align:right;font-weight:700;">${dueDate}</td></tr>
      </table>
      <a href="${APP_URL}/dashboard/invoices" class="btn">Track Payment Status →</a>
    `,
  });
  return sendEmail({ to: email, subject: `Invoice ${invoiceNumber} sent — ${amount} due ${dueDate}`, html });
}

export async function sendInvoicePaidEmail(email: string, clientName: string, invoiceNumber: string, amount: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `Payment received from ${clientName}! 🎉`,
    content: `
      <h2>Payment received! 🎉</h2>
      <p><strong>${clientName}</strong> has paid invoice <strong>${invoiceNumber}</strong>.</p>
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:20px;text-align:center;margin:16px 0;">
        <p style="font-size:32px;font-weight:800;color:#059669;margin:0;">${amount}</p>
        <p style="color:#6B7280;margin:6px 0 0;">received and recorded</p>
      </div>
      <a href="${APP_URL}/dashboard" class="btn">View Dashboard →</a>
    `,
  });
  return sendEmail({ to: email, subject: `💰 Payment received: ${amount} from ${clientName}`, html });
}

export async function sendPaymentReminderEmail(clientEmail: string, clientName: string, invoiceNumber: string, amount: string, dueDate: string, paymentUrl: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `Friendly reminder: Invoice ${invoiceNumber} is due ${dueDate}`,
    content: `
      <h2>Payment reminder 📋</h2>
      <p>Hi ${clientName}, this is a friendly reminder that invoice <strong>${invoiceNumber}</strong> is due on <strong>${dueDate}</strong>.</p>
      <div style="background:#FEF3C7;border-radius:10px;padding:16px;text-align:center;margin:16px 0;">
        <p style="font-size:24px;font-weight:800;color:#92400E;margin:0;">${amount} due</p>
      </div>
      <a href="${paymentUrl}" class="btn">Pay Now →</a>
      <hr class="divider" />
      <p style="font-size:13px;color:#9CA3AF;">Questions about this invoice? Simply reply to this email.</p>
    `,
  });
  return sendEmail({ to: clientEmail, subject: `Payment reminder: Invoice ${invoiceNumber} — ${amount} due ${dueDate}`, html });
}

export async function sendSubscriptionEmail(email: string, name: string, plan: string, amount: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `Your ${plan} plan is active`,
    content: `
      <h2>Subscription confirmed ✅</h2>
      <p>Hi ${name}, your <span class="badge">${plan}</span> plan is now active.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 0;color:#6B7280;">Plan</td><td style="text-align:right;font-weight:700;">${plan}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7280;">Billing</td><td style="text-align:right;font-weight:700;">${amount}</td></tr>
      </table>
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
      subject: `InvoiceAI: Your account is ready 🎉`,
      preheader: 'Here\'s how to get started in 5 minutes',
      headline: `Welcome to InvoiceAI, ${name}!`,
      body: `<p>You're all set! Here's how to get the most value from InvoiceAI in your first 24 hours:</p>
      <ol style="padding-left:20px;line-height:1.8">
        <li><strong>Complete your profile</strong> — this personalizes your experience</li>
        <li><strong>Explore the dashboard</strong> — your command center for everything</li>
        <li><strong>Try your first invoice</strong> — it takes under 2 minutes</li>
      </ol>`,
      cta: 'Get Started →',
      ctaUrl: 'https://invoiceai.app/dashboard',
    },
    day3: {
      subject: `💡 InvoiceAI tip: Auto-Reminders`,
      preheader: 'One feature most users miss',
      headline: `Did you know, ${name}?`,
      body: `<p>Most users who achieve results with InvoiceAI do this one thing in their first week:</p>
      <p style="background:#F0FDF4;border-left:4px solid #22C55E;padding:16px;border-radius:0 8px 8px 0;margin:16px 0"><strong>Enable auto-reminders on every invoice. Users who do get paid 8 days faster on average — just flip the toggle in any invoice.</strong></p>
      <p>Takes 2 minutes to set up and saves hours every week.</p>`,
      cta: 'Try It Now',
      ctaUrl: 'https://invoiceai.app/dashboard',
    },
    day7: {
      subject: `How's InvoiceAI working for you?`,
      preheader: 'Your week-1 check-in',
      headline: `Your first week with InvoiceAI`,
      body: `<p>Hi ${name}, it's been a week! Here's what successful users do by week 1:</p>
      <ul style="padding-left:20px;line-height:1.8">
        <li>✅ Complete the onboarding checklist</li>
        <li>✅ Try all core features at least once</li>
        <li>✅ Connect any integrations you need</li>
      </ul>
      <p>Need help getting the most out of InvoiceAI? Reply to this email — we read every response.</p>`,
      cta: 'Go to Dashboard',
      ctaUrl: 'https://invoiceai.app/dashboard',
    },
    day14: {
      subject: `${name}, upgrade and unlock everything`,
      preheader: 'You\'ve been using the free plan — here\'s what you\'re missing',
      headline: `Unlock InvoiceAI Pro`,
      body: `<p>Hi ${name}, you've been using InvoiceAI for 2 weeks. Here's what Pro users get that you don't:</p>
      <ul style="padding-left:20px;line-height:1.8">
        <li>🚀 <strong>Unlimited usage</strong> — no caps on any feature</li>
        <li>🤖 <strong>Advanced AI features</strong> — 10x better results</li>
        <li>📊 <strong>Analytics & exports</strong> — full data access</li>
        <li>⚡ <strong>Priority support</strong> — response in under 4 hours</li>
      </ul>
      <p>Try Pro free for 14 days. No credit card required to start.</p>`,
      cta: 'Start Free Trial →',
      ctaUrl: 'https://invoiceai.app/settings/billing',
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
