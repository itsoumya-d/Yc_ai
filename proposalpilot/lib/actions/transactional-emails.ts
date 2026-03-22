'use server';
import { sendEmail, baseTemplate } from '@/lib/email';

const BRAND = 'ProposalPilot';
const COLOR = '#0891B2';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://proposalpilot.app';

export async function sendWelcomeEmail(email: string, name: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `Win more clients with AI-powered proposals, ${name}`,
    content: `
      <h2>Welcome to ProposalPilot, ${name}! ✈️</h2>
      <p>Close more deals with beautiful, personalized proposals drafted by AI in minutes — not hours.</p>
      <ul>
        <li>Create your first proposal from a template</li>
        <li>Customize with your brand colors and logo</li>
        <li>Send for e-signature in one click</li>
      </ul>
      <a href="${APP_URL}/dashboard/proposals/new" class="btn">Create Your First Proposal →</a>
    `,
  });
  return sendEmail({ to: email, subject: `Welcome to ProposalPilot, ${name}!`, html });
}

export async function sendProposalSentEmail(email: string, senderName: string, clientName: string, proposalTitle: string, amount: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `"${proposalTitle}" sent to ${clientName}`,
    content: `
      <h2>Proposal delivered ✅</h2>
      <p>Your proposal has been sent to <strong>${clientName}</strong>.</p>
      <div style="background:#ECFEFF;border-radius:10px;padding:20px;margin:16px 0;">
        <p style="font-weight:700;color:#0E7490;margin:0;">${proposalTitle}</p>
        <p style="color:#6B7280;margin:8px 0 0;font-size:20px;font-weight:800;">${amount}</p>
      </div>
      <p>You'll be notified when ${clientName} opens, views, and signs the proposal.</p>
      <a href="${APP_URL}/dashboard/proposals" class="btn">Track Proposal Status →</a>
    `,
  });
  return sendEmail({ to: email, subject: `Proposal sent to ${clientName} — ${amount}`, html });
}

export async function sendProposalViewedEmail(email: string, clientName: string, proposalTitle: string, proposalUrl: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `${clientName} just opened your proposal — follow up now!`,
    content: `
      <h2>${clientName} opened your proposal 👀</h2>
      <p><strong>${clientName}</strong> just viewed <strong>"${proposalTitle}"</strong>. This is a great time to follow up!</p>
      <a href="${proposalUrl}" class="btn">View Proposal →</a>
    `,
  });
  return sendEmail({ to: email, subject: `🔔 ${clientName} viewed your proposal`, html });
}

export async function sendProposalSignedEmail(email: string, clientName: string, proposalTitle: string, amount: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `${clientName} signed! 🎉`,
    content: `
      <h2>Proposal signed! 🎉</h2>
      <p><strong>${clientName}</strong> has signed <strong>"${proposalTitle}"</strong>. You've won the deal!</p>
      <div style="background:#F0FDF4;border:2px solid #86EFAC;border-radius:12px;padding:24px;text-align:center;margin:16px 0;">
        <p style="font-size:32px;font-weight:800;color:#15803D;margin:0;">${amount}</p>
        <p style="color:#6B7280;margin:8px 0 0;">Deal closed ✓</p>
      </div>
      <a href="${APP_URL}/dashboard/proposals" class="btn">View Signed Contract →</a>
    `,
  });
  return sendEmail({ to: email, subject: `🎉 Deal closed! ${clientName} signed — ${amount}`, html });
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
      subject: `ProposalPilot: Your account is ready 🎉`,
      preheader: 'Here\'s how to get started in 5 minutes',
      headline: `Welcome to ProposalPilot, ${name}!`,
      body: `<p>You're all set! Here's how to get the most value from ProposalPilot in your first 24 hours:</p>
      <ol style="padding-left:20px;line-height:1.8">
        <li><strong>Complete your profile</strong> — this personalizes your experience</li>
        <li><strong>Explore the dashboard</strong> — your command center for everything</li>
        <li><strong>Try your first AI proposal</strong> — it takes under 2 minutes</li>
      </ol>`,
      cta: 'Get Started →',
      ctaUrl: 'https://proposalpilot.app/dashboard',
    },
    day3: {
      subject: `💡 ProposalPilot tip: Proposal Analytics`,
      preheader: 'One feature most users miss',
      headline: `Did you know, ${name}?`,
      body: `<p>Most users who achieve results with ProposalPilot do this one thing in their first week:</p>
      <p style="background:#F0FDF4;border-left:4px solid #22C55E;padding:16px;border-radius:0 8px 8px 0;margin:16px 0"><strong>Enable view tracking on every proposal you send. You'll know the exact moment a client opens it — perfect timing for your follow-up call.</strong></p>
      <p>Takes 2 minutes to set up and saves hours every week.</p>`,
      cta: 'Try It Now',
      ctaUrl: 'https://proposalpilot.app/dashboard',
    },
    day7: {
      subject: `How's ProposalPilot working for you?`,
      preheader: 'Your week-1 check-in',
      headline: `Your first week with ProposalPilot`,
      body: `<p>Hi ${name}, it's been a week! Here's what successful users do by week 1:</p>
      <ul style="padding-left:20px;line-height:1.8">
        <li>✅ Complete the onboarding checklist</li>
        <li>✅ Try all core features at least once</li>
        <li>✅ Connect any integrations you need</li>
      </ul>
      <p>Need help getting the most out of ProposalPilot? Reply to this email — we read every response.</p>`,
      cta: 'Go to Dashboard',
      ctaUrl: 'https://proposalpilot.app/dashboard',
    },
    day14: {
      subject: `${name}, upgrade and unlock everything`,
      preheader: 'You\'ve been using the free plan — here\'s what you\'re missing',
      headline: `Unlock ProposalPilot Pro`,
      body: `<p>Hi ${name}, you've been using ProposalPilot for 2 weeks. Here's what Pro users get that you don't:</p>
      <ul style="padding-left:20px;line-height:1.8">
        <li>🚀 <strong>Unlimited usage</strong> — no caps on any feature</li>
        <li>🤖 <strong>Advanced AI features</strong> — 10x better results</li>
        <li>📊 <strong>Analytics & exports</strong> — full data access</li>
        <li>⚡ <strong>Priority support</strong> — response in under 4 hours</li>
      </ul>
      <p>Try Pro free for 14 days. No credit card required to start.</p>`,
      cta: 'Start Free Trial →',
      ctaUrl: 'https://proposalpilot.app/settings/billing',
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
