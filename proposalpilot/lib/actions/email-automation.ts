'use server';

import { createClient } from '@/lib/supabase/server';

interface ActionResult<T = null> { data?: T; error?: string; }

/**
 * Send a proposal via email with a shareable link.
 * Uses SendGrid if SENDGRID_API_KEY is set.
 */
export async function sendProposalEmail(
  proposalId: string,
  recipientEmail: string,
  recipientName: string,
  customMessage?: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get proposal + user profile
  const [proposalRes, profileRes] = await Promise.all([
    supabase.from('proposals').select('*, clients(name, company)').eq('id', proposalId).eq('user_id', user.id).single(),
    supabase.from('users').select('full_name, business_name, business_email').eq('id', user.id).single(),
  ]);

  if (proposalRes.error || !proposalRes.data) return { error: 'Proposal not found' };

  const proposal = proposalRes.data;
  const profile = profileRes.data;
  const senderName = profile?.full_name || profile?.business_name || user.email || 'A colleague';
  const shareToken = proposal.share_token;

  if (!shareToken) return { error: 'Generate a share link first before sending via email' };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://proposalpilot.app';
  const proposalUrl = `${appUrl}/share/${shareToken}`;

  const emailHtml = buildProposalEmail({
    senderName,
    recipientName,
    proposalTitle: proposal.title,
    proposalUrl,
    customMessage,
    value: proposal.value,
    currency: proposal.currency,
    validUntil: proposal.valid_until,
  });

  // Update proposal status to sent
  await supabase
    .from('proposals')
    .update({ status: 'sent', updated_at: new Date().toISOString() })
    .eq('id', proposalId)
    .eq('user_id', user.id)
    .eq('status', 'draft');

  if (!process.env.SENDGRID_API_KEY) {
    // Log intent without sending
    console.log(`[EMAIL] Would send proposal "${proposal.title}" to ${recipientEmail}`);
    return { data: null };
  }

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: [{ email: recipientEmail, name: recipientName }],
      from: {
        email: profile?.business_email || user.email || 'noreply@proposalpilot.app',
        name: senderName,
      },
      subject: `${senderName} has sent you a proposal: ${proposal.title}`,
      html: emailHtml,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { error: (err as any)?.errors?.[0]?.message ?? 'Failed to send email' };
  }

  return {};
}

/**
 * Send a follow-up reminder email for a proposal.
 */
export async function sendFollowUpEmail(
  proposalId: string,
  recipientEmail: string,
  recipientName: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const [proposalRes, profileRes] = await Promise.all([
    supabase.from('proposals').select('*, clients(name)').eq('id', proposalId).eq('user_id', user.id).single(),
    supabase.from('users').select('full_name, business_name, business_email').eq('id', user.id).single(),
  ]);

  if (proposalRes.error || !proposalRes.data) return { error: 'Proposal not found' };

  const proposal = proposalRes.data;
  const profile = profileRes.data;
  const senderName = profile?.full_name || profile?.business_name || user.email || 'Team';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://proposalpilot.app';
  const proposalUrl = `${appUrl}/share/${proposal.share_token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">ProposalPilot</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Follow-Up Reminder</p>
      </div>

      <p>Hi ${recipientName},</p>

      <p>I wanted to follow up on the proposal I sent you: <strong>${proposal.title}</strong>.</p>

      <p>Have you had a chance to review it? I'd love to answer any questions you might have or discuss next steps.</p>

      ${proposal.share_token ? `
      <a href="${proposalUrl}"
         style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
        View Proposal Again
      </a>
      ` : ''}

      <p style="margin-top: 24px;">Looking forward to hearing from you!</p>
      <p>Best regards,<br>${senderName}</p>

      <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
        Sent via <a href="${appUrl}" style="color: #6b7280;">ProposalPilot</a>
      </p>
    </body>
    </html>
  `;

  if (!process.env.SENDGRID_API_KEY) {
    console.log(`[EMAIL] Would send follow-up for "${proposal.title}" to ${recipientEmail}`);
    return {};
  }

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: [{ email: recipientEmail, name: recipientName }],
      from: {
        email: profile?.business_email || user.email || 'noreply@proposalpilot.app',
        name: senderName,
      },
      subject: `Following up on: ${proposal.title}`,
      html,
    }),
  });

  if (!res.ok) return { error: 'Failed to send follow-up email' };
  return {};
}

// ─────────────────────────────────────────────
// Template: save proposal as template
// ─────────────────────────────────────────────

export async function saveProposalAsTemplate(
  proposalId: string,
  templateName: string,
  category?: string
): Promise<ActionResult<{ templateId: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get proposal sections
  const [proposalRes, sectionsRes] = await Promise.all([
    supabase.from('proposals').select('*').eq('id', proposalId).eq('user_id', user.id).single(),
    supabase.from('proposal_sections').select('*').eq('proposal_id', proposalId).order('order_index'),
  ]);

  if (proposalRes.error || !proposalRes.data) return { error: 'Proposal not found' };

  const proposal = proposalRes.data;

  // Create template
  const { data: template, error: templateError } = await supabase
    .from('templates')
    .insert({
      user_id: user.id,
      name: templateName,
      description: `Created from proposal: ${proposal.title}`,
      category: category || 'custom',
      is_default: false,
    })
    .select()
    .single();

  if (templateError || !template) return { error: templateError?.message ?? 'Failed to create template' };

  // Copy sections as template sections
  const sections = (sectionsRes.data ?? []);
  if (sections.length > 0) {
    await supabase.from('template_sections').insert(
      sections.map((s: any, i: number) => ({
        template_id: template.id,
        title: s.title,
        content: s.content,
        order_index: i,
      }))
    );
  }

  return { data: { templateId: template.id } };
}

// ─────────────────────────────────────────────
// E-signature: mark proposal as signed
// ─────────────────────────────────────────────

export async function markProposalSigned(proposalId: string): Promise<ActionResult> {
  const supabase = await createClient();

  await supabase
    .from('proposals')
    .update({ status: 'won', updated_at: new Date().toISOString() })
    .eq('id', proposalId)
    .in('status', ['sent', 'viewed']);

  return {};
}

export async function markProposalDeclined(proposalId: string): Promise<ActionResult> {
  const supabase = await createClient();

  await supabase
    .from('proposals')
    .update({ status: 'lost', updated_at: new Date().toISOString() })
    .eq('id', proposalId)
    .in('status', ['sent', 'viewed']);

  return {};
}

// ─────────────────────────────────────────────
// Email template builder
// ─────────────────────────────────────────────

function buildProposalEmail({
  senderName,
  recipientName,
  proposalTitle,
  proposalUrl,
  customMessage,
  value,
  currency,
  validUntil,
}: {
  senderName: string;
  recipientName: string;
  proposalTitle: string;
  proposalUrl: string;
  customMessage?: string;
  value: number;
  currency: string;
  validUntil: string | null;
}): string {
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' });
  const validUntilStr = validUntil
    ? new Date(validUntil).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">ProposalPilot</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">New Proposal</p>
      </div>

      <p>Hi ${recipientName},</p>

      ${customMessage ? `<p>${customMessage}</p>` : `<p><strong>${senderName}</strong> has prepared a proposal for you.</p>`}

      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; color: #6b7280;">Proposal Details</h3>
        <p style="margin: 4px 0;"><strong>Project:</strong> ${proposalTitle}</p>
        <p style="margin: 4px 0;"><strong>Value:</strong> ${formatter.format(value)}</p>
        ${validUntilStr ? `<p style="margin: 4px 0;"><strong>Valid Until:</strong> ${validUntilStr}</p>` : ''}
      </div>

      <a href="${proposalUrl}"
         style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
        View Proposal
      </a>

      <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
        Click the button above to review your proposal. You'll be able to approve or request changes directly.
      </p>

      <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
        Sent via <a href="https://proposalpilot.app" style="color: #6b7280;">ProposalPilot</a>
      </p>
    </body>
    </html>
  `;
}
