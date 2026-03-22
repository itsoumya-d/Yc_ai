'use server';
import { sendEmail, baseTemplate } from '@/lib/email';

const BRAND = 'StoryThread';
const COLOR = '#7C3AED';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://storythread.app';

// ── Welcome email ─────────────────────────────────────────────────────────────
export async function sendWelcomeEmail(email: string, name: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `Welcome to StoryThread, ${name}! Your first chapter starts here.`,
    content: `
      <h2>Welcome to StoryThread, ${name}! 📖</h2>
      <p>You've joined a community of writers building rich worlds, vibrant characters, and unforgettable stories with AI assistance.</p>
      <p>Here's what to do first:</p>
      <ul>
        <li><strong>Create your first story</strong> — start with a genre and let AI help shape the world</li>
        <li><strong>Build your cast</strong> — add characters with backstories, goals, and voice</li>
        <li><strong>Invite a co-author</strong> — writing is more fun together</li>
      </ul>
      <a href="${APP_URL}/dashboard" class="btn">Start Writing →</a>
      <hr class="divider" />
      <p style="font-size:13px;color:#6B7280;">Questions? Reply to this email — we read every message.</p>
    `,
  });
  return sendEmail({ to: email, subject: `Welcome to StoryThread, ${name}!`, html });
}

// ── Story published ───────────────────────────────────────────────────────────
export async function sendStoryPublishedEmail(email: string, name: string, storyTitle: string, storyUrl: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `Your story "${storyTitle}" is now live!`,
    content: `
      <h2>Your story is live! 🎉</h2>
      <p>Hi ${name}, <strong>"${storyTitle}"</strong> has been published and is now visible to readers.</p>
      <p>Share it with your followers and get feedback from the community.</p>
      <a href="${storyUrl}" class="btn">View Your Story →</a>
      <hr class="divider" />
      <p style="font-size:13px;color:#6B7280;">Keep the momentum — start your next chapter or explore reader comments.</p>
    `,
  });
  return sendEmail({ to: email, subject: `"${storyTitle}" is now live on StoryThread!`, html });
}

// ── Co-author invite ──────────────────────────────────────────────────────────
export async function sendCoAuthorInviteEmail(inviterName: string, inviteeEmail: string, storyTitle: string, inviteUrl: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `${inviterName} invited you to co-write "${storyTitle}"`,
    content: `
      <h2>You've been invited to co-write a story ✍️</h2>
      <p><strong>${inviterName}</strong> is building <strong>"${storyTitle}"</strong> on StoryThread and wants you as a co-author.</p>
      <p>Accept the invitation to start contributing scenes, characters, and plot twists together.</p>
      <a href="${inviteUrl}" class="btn">Accept Invitation →</a>
      <hr class="divider" />
      <p style="font-size:13px;color:#6B7280;">This invitation expires in 7 days.</p>
    `,
  });
  return sendEmail({ to: inviteeEmail, subject: `${inviterName} invited you to co-write on StoryThread`, html });
}

// ── Subscription confirmation ─────────────────────────────────────────────────
export async function sendSubscriptionEmail(email: string, name: string, plan: string, amount: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `Your ${plan} subscription is active!`,
    content: `
      <h2>Subscription confirmed 🎊</h2>
      <p>Hi ${name}, your <span class="badge">${plan}</span> subscription is now active.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 0;color:#6B7280;font-size:14px;">Plan</td><td style="text-align:right;font-weight:700;">${plan}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7280;font-size:14px;">Amount</td><td style="text-align:right;font-weight:700;">${amount}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7280;font-size:14px;">Renews</td><td style="text-align:right;font-weight:700;">Monthly</td></tr>
      </table>
      <a href="${APP_URL}/dashboard/settings/billing" class="btn">Manage Subscription →</a>
    `,
  });
  return sendEmail({ to: email, subject: `Your ${BRAND} ${plan} subscription is active`, html });
}

export async function sendDripEmail(
  to: string,
  name: string,
  step: 'day1' | 'day3' | 'day7' | 'day14'
): Promise<void> {
  const sequences: Record<typeof step, { subject: string; preheader: string; headline: string; body: string; cta: string; ctaUrl: string }> = {
    day1: {
      subject: `StoryThread: Your account is ready 🎉`,
      preheader: 'Here\'s how to get started in 5 minutes',
      headline: `Welcome to StoryThread, ${name}!`,
      body: `<p>You're all set! Here's how to get the most value from StoryThread in your first 24 hours:</p>
      <ol style="padding-left:20px;line-height:1.8">
        <li><strong>Complete your profile</strong> — this personalizes your experience</li>
        <li><strong>Explore the dashboard</strong> — your command center for everything</li>
        <li><strong>Try your first story chapter</strong> — it takes under 2 minutes</li>
      </ol>`,
      cta: 'Get Started →',
      ctaUrl: 'https://storythread.app/dashboard',
    },
    day3: {
      subject: `💡 StoryThread tip: Character Consistency`,
      preheader: 'One feature most users miss',
      headline: `Did you know, ${name}?`,
      body: `<p>Most users who achieve results with StoryThread do this one thing in their first week:</p>
      <p style="background:#F0FDF4;border-left:4px solid #22C55E;padding:16px;border-radius:0 8px 8px 0;margin:16px 0"><strong>Add detailed character profiles before writing. StoryThread's AI uses them to keep characters consistent across 100+ chapters.</strong></p>
      <p>Takes 2 minutes to set up and saves hours every week.</p>`,
      cta: 'Try It Now',
      ctaUrl: 'https://storythread.app/dashboard',
    },
    day7: {
      subject: `How's StoryThread working for you?`,
      preheader: 'Your week-1 check-in',
      headline: `Your first week with StoryThread`,
      body: `<p>Hi ${name}, it's been a week! Here's what successful users do by week 1:</p>
      <ul style="padding-left:20px;line-height:1.8">
        <li>✅ Complete the onboarding checklist</li>
        <li>✅ Try all core features at least once</li>
        <li>✅ Connect any integrations you need</li>
      </ul>
      <p>Need help getting the most out of StoryThread? Reply to this email — we read every response.</p>`,
      cta: 'Go to Dashboard',
      ctaUrl: 'https://storythread.app/dashboard',
    },
    day14: {
      subject: `${name}, upgrade and unlock everything`,
      preheader: 'You\'ve been using the free plan — here\'s what you\'re missing',
      headline: `Unlock StoryThread Pro`,
      body: `<p>Hi ${name}, you've been using StoryThread for 2 weeks. Here's what Pro users get that you don't:</p>
      <ul style="padding-left:20px;line-height:1.8">
        <li>🚀 <strong>Unlimited usage</strong> — no caps on any feature</li>
        <li>🤖 <strong>Advanced AI features</strong> — 10x better results</li>
        <li>📊 <strong>Analytics & exports</strong> — full data access</li>
        <li>⚡ <strong>Priority support</strong> — response in under 4 hours</li>
      </ul>
      <p>Try Pro free for 14 days. No credit card required to start.</p>`,
      cta: 'Start Free Trial →',
      ctaUrl: 'https://storythread.app/settings/billing',
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
