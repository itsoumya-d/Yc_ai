'use server';
import { sendEmail, baseTemplate } from '@/lib/email';

const BRAND = 'BoardBrief';
const COLOR = '#1E40AF';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://boardbrief.app';

export async function sendWelcomeEmail(email: string, name: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `Board-ready reports, always ready — welcome ${name}`,
    content: `
      <h2>Welcome to BoardBrief, ${name}! 📊</h2>
      <p>Automatically compile board packs, financial summaries, and investor updates — pulled live from Stripe, QuickBooks, and your data sources.</p>
      <ul>
        <li>Connect Stripe to see live MRR, ARR, and churn</li>
        <li>Link QuickBooks for P&L snapshots</li>
        <li>Generate your first board deck in 60 seconds</li>
      </ul>
      <a href="${APP_URL}/dashboard/analytics" class="btn">Connect Data Sources →</a>
    `,
  });
  return sendEmail({ to: email, subject: `Welcome to BoardBrief, ${name}!`, html });
}

export async function sendWeeklyKPIDigestEmail(email: string, name: string, mrr: string, mrrGrowth: string, churnRate: string, newCustomers: number) {
  const growthPositive = !mrrGrowth.startsWith('-');
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `Weekly KPI digest — MRR: ${mrr}`,
    content: `
      <h2>Weekly KPI Digest 📈</h2>
      <p>Hi ${name}, here's your weekly snapshot.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr style="background:#EFF6FF;">
          <td style="padding:12px;font-weight:600;color:#1E40AF;">Monthly Recurring Revenue</td>
          <td style="text-align:right;font-weight:800;padding:12px;font-size:18px;">${mrr}</td>
        </tr>
        <tr>
          <td style="padding:12px;color:#6B7280;">MRR Growth</td>
          <td style="text-align:right;padding:12px;font-weight:700;color:${growthPositive ? '#059669' : '#DC2626'};">${mrrGrowth}</td>
        </tr>
        <tr style="background:#F9FAFB;">
          <td style="padding:12px;color:#6B7280;">Churn Rate</td>
          <td style="text-align:right;padding:12px;font-weight:700;">${churnRate}</td>
        </tr>
        <tr>
          <td style="padding:12px;color:#6B7280;">New Customers</td>
          <td style="text-align:right;padding:12px;font-weight:700;">+${newCustomers}</td>
        </tr>
      </table>
      <a href="${APP_URL}/dashboard/analytics" class="btn">View Full Dashboard →</a>
    `,
  });
  return sendEmail({ to: email, subject: `Weekly KPIs: MRR ${mrr} | Growth ${mrrGrowth}`, html });
}

export async function sendBoardPackReadyEmail(email: string, name: string, period: string, packUrl: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `Your ${period} board pack is ready`,
    content: `
      <h2>Board pack ready 📋</h2>
      <p>Hi ${name}, your <strong>${period}</strong> board pack has been compiled and is ready to share.</p>
      <p>It includes the latest financial summaries, KPIs, operational metrics, and strategic updates pulled automatically from your connected sources.</p>
      <a href="${packUrl}" class="btn">View Board Pack →</a>
    `,
  });
  return sendEmail({ to: email, subject: `${period} board pack is ready to share`, html });
}

export async function sendSubscriptionEmail(email: string, name: string, plan: string, amount: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `Your ${plan} plan is active`,
    content: `
      <h2>Subscription confirmed ✅</h2>
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
      subject: `BoardBrief: Your account is ready 🎉`,
      preheader: 'Here\'s how to get started in 5 minutes',
      headline: `Welcome to BoardBrief, ${name}!`,
      body: `<p>You're all set! Here's how to get the most value from BoardBrief in your first 24 hours:</p>
      <ol style="padding-left:20px;line-height:1.8">
        <li><strong>Complete your profile</strong> — this personalizes your experience</li>
        <li><strong>Explore the dashboard</strong> — your command center for everything</li>
        <li><strong>Try your first board meeting</strong> — it takes under 2 minutes</li>
      </ol>`,
      cta: 'Get Started →',
      ctaUrl: 'https://boardbrief.app/dashboard',
    },
    day3: {
      subject: `💡 BoardBrief tip: Board Pack Generation`,
      preheader: 'One feature most users miss',
      headline: `Did you know, ${name}?`,
      body: `<p>Most users who achieve results with BoardBrief do this one thing in their first week:</p>
      <p style="background:#F0FDF4;border-left:4px solid #22C55E;padding:16px;border-radius:0 8px 8px 0;margin:16px 0"><strong>After every meeting, click 'Download Board Pack' to get a professional PDF with agenda, resolutions, and action items. Send it to board members in one click.</strong></p>
      <p>Takes 2 minutes to set up and saves hours every week.</p>`,
      cta: 'Try It Now',
      ctaUrl: 'https://boardbrief.app/dashboard',
    },
    day7: {
      subject: `How's BoardBrief working for you?`,
      preheader: 'Your week-1 check-in',
      headline: `Your first week with BoardBrief`,
      body: `<p>Hi ${name}, it's been a week! Here's what successful users do by week 1:</p>
      <ul style="padding-left:20px;line-height:1.8">
        <li>✅ Complete the onboarding checklist</li>
        <li>✅ Try all core features at least once</li>
        <li>✅ Connect any integrations you need</li>
      </ul>
      <p>Need help getting the most out of BoardBrief? Reply to this email — we read every response.</p>`,
      cta: 'Go to Dashboard',
      ctaUrl: 'https://boardbrief.app/dashboard',
    },
    day14: {
      subject: `${name}, upgrade and unlock everything`,
      preheader: 'You\'ve been using the free plan — here\'s what you\'re missing',
      headline: `Unlock BoardBrief Pro`,
      body: `<p>Hi ${name}, you've been using BoardBrief for 2 weeks. Here's what Pro users get that you don't:</p>
      <ul style="padding-left:20px;line-height:1.8">
        <li>🚀 <strong>Unlimited usage</strong> — no caps on any feature</li>
        <li>🤖 <strong>Advanced AI features</strong> — 10x better results</li>
        <li>📊 <strong>Analytics & exports</strong> — full data access</li>
        <li>⚡ <strong>Priority support</strong> — response in under 4 hours</li>
      </ul>
      <p>Try Pro free for 14 days. No credit card required to start.</p>`,
      cta: 'Start Free Trial →',
      ctaUrl: 'https://boardbrief.app/settings/billing',
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
