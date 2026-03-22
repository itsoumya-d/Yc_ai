/**
 * Supabase Edge Function: send-drips
 *
 * Processes pending drip email rows from user_drip_log whose
 * scheduled_at has passed. Invoked by pg_cron every 15 minutes.
 *
 * Environment variables required:
 *   SENDGRID_API_KEY   — SendGrid API key
 *   FROM_EMAIL         — sender address
 *   FROM_NAME          — sender display name
 *   SUPABASE_URL       — injected automatically
 *   SUPABASE_SERVICE_ROLE_KEY — injected automatically
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── Types ─────────────────────────────────────────────────────────────────────
type DripStep = 'day1' | 'day3' | 'day7' | 'day14';

interface DripRow {
  id: string;
  user_id: string;
  email: string;
  name: string;
  step: DripStep;
}

// ── Brand config ──────────────────────────────────────────────────────────────
const BRAND = 'ClaimForge';
const COLOR = '#DC2626';
const APP_URL = 'https://claimforge.app';

// ── Email sequences ───────────────────────────────────────────────────────────
const SEQUENCES: Record<DripStep, { subject: string; preheader: string; headline: string; body: string; cta: string; ctaUrl: string }> = {
  day1: {
    subject: `${BRAND}: Your account is ready 🎉`,
    preheader: "Here's how to get started in 5 minutes",
    headline: 'Get the most from ClaimForge',
    body: `<p>Here's how to hit the ground running:</p>
    <ol style="padding-left:20px;line-height:1.8">
      <li><strong>Create your first story</strong> — pick a genre and let AI shape the world</li>
      <li><strong>Build your cast</strong> — add characters with backstories and voice</li>
      <li><strong>Invite a co-author</strong> — collaboration unlocks the best stories</li>
    </ol>`,
    cta: 'Start Writing →',
    ctaUrl: `${APP_URL}/dashboard`,
  },
  day3: {
    subject: `💡 ${BRAND} tip: AI Character Voice`,
    preheader: 'One feature most writers miss',
    headline: "Did you know?",
    body: `<p>The writers who publish the most use this one trick:</p>
    <p style="background:#F5F3FF;border-left:4px solid ${COLOR};padding:16px;border-radius:0 8px 8px 0;margin:16px 0">
      <strong>Set a "voice" for each character in their profile. Every line of dialogue the AI generates for them stays perfectly in-character — no more editing for consistency.</strong>
    </p>
    <p>Takes 2 minutes per character and saves hours of editing.</p>`,
    cta: 'Try Character Voices →',
    ctaUrl: `${APP_URL}/dashboard`,
  },
  day7: {
    subject: `How's ${BRAND} working for you?`,
    preheader: 'Your week-1 check-in',
    headline: 'Your first week as a ClaimForge author',
    body: `<p>It's been a week! Here's what our most prolific writers do by week 1:</p>
    <ul style="padding-left:20px;line-height:1.8">
      <li>✅ Published at least one chapter</li>
      <li>✅ Built a character roster with voice profiles</li>
      <li>✅ Invited a reader or co-author for feedback</li>
    </ul>
    <p>Not there yet? No pressure — reply to this email and tell us where you're stuck. We read every message.</p>`,
    cta: 'Go to Your Stories →',
    ctaUrl: `${APP_URL}/dashboard`,
  },
  day14: {
    subject: `Unlock everything in ${BRAND} Pro`,
    preheader: "You've been on the free plan — here's what you're missing",
    headline: 'Ready for the full experience?',
    body: `<p>You've been writing for 2 weeks. Pro writers get:</p>
    <ul style="padding-left:20px;line-height:1.8">
      <li>🚀 <strong>Unlimited AI generation</strong> — no chapter limits</li>
      <li>🎨 <strong>Custom world maps & assets</strong> — bring your world to life</li>
      <li>📚 <strong>Publishing & export tools</strong> — EPUB, PDF, and more</li>
      <li>⚡ <strong>Priority support</strong> — response in under 4 hours</li>
    </ul>
    <p>Try Pro free for 14 days — no credit card required.</p>`,
    cta: 'Start Free Trial →',
    ctaUrl: `${APP_URL}/settings/billing`,
  },
};

// ── HTML template ─────────────────────────────────────────────────────────────
function buildHtml(seq: typeof SEQUENCES[DripStep], name: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<style>
body{margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.w{max-width:600px;margin:0 auto;padding:32px 16px}
.c{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.h{background:${COLOR};padding:32px;text-align:center}
.h h1{color:#fff;margin:0;font-size:24px;font-weight:800}
.b{padding:32px;color:#374151;font-size:15px;line-height:1.6}
.b h2{color:#111827;font-size:20px;margin-top:0}
.btn{display:inline-block;background:${COLOR};color:#fff!important;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;margin:20px 0}
.f{text-align:center;font-size:12px;color:#9CA3AF;padding:24px 16px}
</style></head><body>
<span style="display:none;font-size:1px;color:#F9FAFB;">${seq.preheader}</span>
<div class="w"><div class="c">
<div class="h"><h1>${BRAND}</h1></div>
<div class="b">
<h2>${seq.headline.replace('{name}', name)}</h2>
${seq.body.replace(/\{name\}/g, name)}
<a href="${seq.ctaUrl}" class="btn">${seq.cta}</a>
</div></div>
<div class="f">&copy; ${new Date().getFullYear()} ${BRAND}. All rights reserved.</div>
</div></body></html>`;
}

// ── SendGrid send ─────────────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = Deno.env.get('SENDGRID_API_KEY');
  if (!apiKey) {
    console.warn(`[send-drips] SENDGRID_API_KEY not set — skipping send to ${to}`);
    return;
  }
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: Deno.env.get('FROM_EMAIL') ?? 'noreply@claimforge.app', name: Deno.env.get('FROM_NAME') ?? BRAND },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SendGrid error ${res.status}: ${err}`);
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Fetch pending drip rows whose scheduled time has passed (process up to 50 at a time)
  const { data: pendingRows, error } = await supabase
    .from('user_drip_log')
    .select('id, user_id, email, name, step')
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .limit(50);

  if (error) {
    console.error('[send-drips] DB fetch error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const rows = (pendingRows ?? []) as DripRow[];
  const results = { sent: 0, failed: 0, skipped: 0 };

  for (const row of rows) {
    const seq = SEQUENCES[row.step];
    if (!seq) {
      await supabase.from('user_drip_log').update({ status: 'skipped' }).eq('id', row.id);
      results.skipped++;
      continue;
    }

    try {
      const html = buildHtml(seq, row.name);
      await sendEmail(row.email, seq.subject, html);
      await supabase.from('user_drip_log').update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      }).eq('id', row.id);
      results.sent++;
    } catch (err) {
      console.error(`[send-drips] Failed to send ${row.step} to ${row.email}:`, err);
      await supabase.from('user_drip_log').update({
        status: 'failed',
        error: String(err),
      }).eq('id', row.id);
      results.failed++;
    }
  }

  console.log(`[send-drips] done — sent:${results.sent} failed:${results.failed} skipped:${results.skipped}`);
  return new Response(JSON.stringify({ ok: true, processed: rows.length, ...results }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
