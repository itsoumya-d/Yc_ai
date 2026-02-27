'use server';

import { createClient } from '@/lib/supabase/server';
import { generateShareToken } from '@/lib/actions/sharing';

interface ActionResult<T = null> { data?: T; error?: string; success?: boolean; }

/**
 * Send a proposal to a client via email.
 * Generates a share token and sends the link.
 * Requires SENDGRID_API_KEY environment variable (or swap for Resend).
 */
export async function sendProposalEmail(
  proposalId: string,
  recipientEmail: string,
  recipientName?: string,
): Promise<ActionResult<{ shareUrl: string; token: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Generate share token (also sets status to 'sent')
  const tokenResult = await generateShareToken(proposalId);
  if (tokenResult.error || !tokenResult.data) {
    return { error: tokenResult.error ?? 'Failed to generate share link' };
  }

  const token = tokenResult.data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const shareUrl = `${baseUrl}/share/${token}`;

  // Get proposal and sender info
  const [proposalRes, profileRes] = await Promise.all([
    supabase.from('proposals').select('title, value, currency, valid_until').eq('id', proposalId).eq('user_id', user.id).single(),
    supabase.from('users').select('full_name, business_name, email').eq('id', user.id).single(),
  ]);

  if (proposalRes.error) return { error: 'Proposal not found' };

  const proposal = proposalRes.data;
  const profile = profileRes.data;
  const senderName = profile?.business_name ?? profile?.full_name ?? 'A business';

  // Send email via SendGrid if API key is configured
  const sendgridKey = process.env.SENDGRID_API_KEY;
  if (sendgridKey) {
    try {
      // Dynamic import to avoid build errors if @sendgrid/mail isn't installed
      const sgMail = await import('@sendgrid/mail');
      sgMail.default.setApiKey(sendgridKey);

      await sgMail.default.send({
        to: { email: recipientEmail, name: recipientName ?? recipientEmail },
        from: {
          email: process.env.SENDGRID_FROM_EMAIL ?? profile?.email ?? 'noreply@proposalpilot.app',
          name: senderName,
        },
        subject: `Proposal: ${proposal.title}`,
        html: buildProposalEmailHtml({
          proposalTitle: proposal.title,
          senderName,
          recipientName: recipientName ?? recipientEmail,
          shareUrl,
          validUntil: proposal.valid_until ?? undefined,
        }),
        text: `${senderName} has shared a proposal with you: "${proposal.title}"\n\nView it here: ${shareUrl}\n\n${proposal.valid_until ? `This proposal is valid until ${new Date(proposal.valid_until).toLocaleDateString()}.` : ''}`,
      });
    } catch (err) {
      console.error('SendGrid error:', err);
      // Don't fail the whole operation — still return the shareUrl
    }
  }

  return { success: true, data: { shareUrl, token } };
}

function buildProposalEmailHtml({
  proposalTitle,
  senderName,
  recipientName,
  shareUrl,
  validUntil,
}: {
  proposalTitle: string;
  senderName: string;
  recipientName: string;
  shareUrl: string;
  validUntil?: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${proposalTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:#2563eb;padding:32px 40px;">
      <p style="color:#bfdbfe;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px;">Proposal</p>
      <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;line-height:1.3;">${proposalTitle}</h1>
    </div>

    <!-- Body -->
    <div style="padding:40px;">
      <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Hi ${recipientName},
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
        <strong>${senderName}</strong> has sent you a proposal to review.
      </p>

      <!-- CTA Button -->
      <div style="text-align:center;margin:32px 0;">
        <a href="${shareUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:16px;font-weight:600;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:-0.01em;">
          View Proposal →
        </a>
      </div>

      ${validUntil ? `
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin:24px 0;">
        <p style="color:#92400e;font-size:13px;margin:0;">
          ⏰ This proposal is valid until <strong>${new Date(validUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
        </p>
      </div>
      ` : ''}

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">
      <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin:0;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${shareUrl}" style="color:#2563eb;">${shareUrl}</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
