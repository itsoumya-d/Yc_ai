'use server';
import { sendEmail, baseTemplate } from '@/lib/email';

const BRAND = 'ClaimForge';
const COLOR = '#DC2626';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://claimforge.app';

export async function sendWelcomeEmail(email: string, name: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `Your fraud detection platform is ready — welcome ${name}`,
    content: `
      <h2>Welcome to ClaimForge, ${name}! 🔍</h2>
      <p>AI-powered claims analysis that detects fraud using Benford's Law, pattern recognition, and cross-referencing government spending databases.</p>
      <ul>
        <li>Upload your first case documents for OCR extraction</li>
        <li>Run Benford's Law analysis on financial claims</li>
        <li>Search USASpending.gov for verification</li>
      </ul>
      <a href="${APP_URL}/dashboard/cases/new" class="btn">Create Your First Case →</a>
    `,
  });
  return sendEmail({ to: email, subject: `Welcome to ClaimForge, ${name}!`, html });
}

export async function sendFraudAlertEmail(email: string, name: string, caseId: string, caseTitle: string, riskScore: number, anomalies: string[]) {
  const riskLabel = riskScore >= 80 ? 'Critical' : riskScore >= 60 ? 'High' : 'Medium';
  const riskColor = riskScore >= 80 ? '#DC2626' : riskScore >= 60 ? '#D97706' : '#2563EB';
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `⚠️ Fraud indicators detected in case ${caseId}`,
    content: `
      <h2>Fraud alert: ${riskLabel} risk detected ⚠️</h2>
      <p>Hi ${name}, Benford's Law analysis has flagged <strong>${caseTitle}</strong> with a <strong>${riskScore}/100</strong> fraud risk score.</p>
      <div style="background:#FEF2F2;border:2px solid #FECACA;border-radius:12px;padding:20px;margin:16px 0;text-align:center;">
        <p style="font-size:40px;font-weight:800;color:${riskColor};margin:0;">${riskScore}</p>
        <p style="color:#6B7280;margin:6px 0 0;">${riskLabel} Risk Score</p>
      </div>
      <p><strong>Anomalies detected:</strong></p>
      <ul>
        ${anomalies.map(a => `<li style="color:#4B5563;font-size:14px;margin-bottom:6px;">${a}</li>`).join('')}
      </ul>
      <a href="${APP_URL}/dashboard/cases/${caseId}" class="btn">Review Case →</a>
    `,
  });
  return sendEmail({ to: email, subject: `🚨 Fraud alert: ${riskLabel} risk in case ${caseId}`, html });
}

export async function sendCaseResolvedEmail(email: string, name: string, caseTitle: string, outcome: string) {
  const html = baseTemplate({
    brandName: BRAND, brandColor: COLOR,
    preheader: `Case "${caseTitle}" has been resolved`,
    content: `
      <h2>Case resolved 📁</h2>
      <p>Hi ${name}, the case <strong>"${caseTitle}"</strong> has been marked as resolved.</p>
      <div style="background:#F0FDF4;border-radius:10px;padding:16px;margin:16px 0;">
        <p style="font-weight:700;color:#15803D;margin:0;">Outcome</p>
        <p style="color:#4B5563;margin:8px 0 0;">${outcome}</p>
      </div>
      <a href="${APP_URL}/dashboard/cases" class="btn">View All Cases →</a>
    `,
  });
  return sendEmail({ to: email, subject: `Case resolved: "${caseTitle}"`, html });
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
      subject: `ClaimForge: Your account is ready 🎉`,
      preheader: 'Here\'s how to get started in 5 minutes',
      headline: `Welcome to ClaimForge, ${name}!`,
      body: `<p>You're all set! Here's how to get the most value from ClaimForge in your first 24 hours:</p>
      <ol style="padding-left:20px;line-height:1.8">
        <li><strong>Complete your profile</strong> — this personalizes your experience</li>
        <li><strong>Explore the dashboard</strong> — your command center for everything</li>
        <li><strong>Try your first fraud case</strong> — it takes under 2 minutes</li>
      </ol>`,
      cta: 'Get Started →',
      ctaUrl: 'https://claimforge.app/dashboard',
    },
    day3: {
      subject: `💡 ClaimForge tip: Entity Network Analysis`,
      preheader: 'One feature most users miss',
      headline: `Did you know, ${name}?`,
      body: `<p>Most users who achieve results with ClaimForge do this one thing in their first week:</p>
      <p style="background:#F0FDF4;border-left:4px solid #22C55E;padding:16px;border-radius:0 8px 8px 0;margin:16px 0"><strong>After uploading case documents, open the Network Graph tab. ClaimForge maps relationships between entities automatically, revealing fraud patterns invisible in spreadsheets.</strong></p>
      <p>Takes 2 minutes to set up and saves hours every week.</p>`,
      cta: 'Try It Now',
      ctaUrl: 'https://claimforge.app/dashboard',
    },
    day7: {
      subject: `How's ClaimForge working for you?`,
      preheader: 'Your week-1 check-in',
      headline: `Your first week with ClaimForge`,
      body: `<p>Hi ${name}, it's been a week! Here's what successful users do by week 1:</p>
      <ul style="padding-left:20px;line-height:1.8">
        <li>✅ Complete the onboarding checklist</li>
        <li>✅ Try all core features at least once</li>
        <li>✅ Connect any integrations you need</li>
      </ul>
      <p>Need help getting the most out of ClaimForge? Reply to this email — we read every response.</p>`,
      cta: 'Go to Dashboard',
      ctaUrl: 'https://claimforge.app/dashboard',
    },
    day14: {
      subject: `${name}, upgrade and unlock everything`,
      preheader: 'You\'ve been using the free plan — here\'s what you\'re missing',
      headline: `Unlock ClaimForge Pro`,
      body: `<p>Hi ${name}, you've been using ClaimForge for 2 weeks. Here's what Pro users get that you don't:</p>
      <ul style="padding-left:20px;line-height:1.8">
        <li>🚀 <strong>Unlimited usage</strong> — no caps on any feature</li>
        <li>🤖 <strong>Advanced AI features</strong> — 10x better results</li>
        <li>📊 <strong>Analytics & exports</strong> — full data access</li>
        <li>⚡ <strong>Priority support</strong> — response in under 4 hours</li>
      </ul>
      <p>Try Pro free for 14 days. No credit card required to start.</p>`,
      cta: 'Start Free Trial →',
      ctaUrl: 'https://claimforge.app/settings/billing',
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
