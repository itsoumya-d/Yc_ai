import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { recipientEmail, recipientName, personalMessage } = await request.json();

  if (!recipientEmail) {
    return NextResponse.json({ error: 'Recipient email required' }, { status: 400 });
  }

  // Fetch proposal and user profile
  const [proposalRes, profileRes] = await Promise.all([
    supabase.from('proposals').select('*, clients(name, company, email)').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('users').select('full_name, business_name, email').eq('id', user.id).single(),
  ]);

  if (proposalRes.error || !proposalRes.data) {
    return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
  }

  const proposal = proposalRes.data;
  const profile = profileRes.data;

  // Generate share token if not present
  let shareToken = proposal.share_token;
  if (!shareToken) {
    shareToken = randomBytes(16).toString('hex');
    await supabase.from('proposals').update({
      share_token: shareToken,
      status: 'sent',
      updated_at: new Date().toISOString(),
    }).eq('id', id);
  } else if (proposal.status === 'draft') {
    await supabase.from('proposals').update({
      status: 'sent',
      updated_at: new Date().toISOString(),
    }).eq('id', id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const shareUrl = `${appUrl}/share/${shareToken}`;
  const senderName = profile?.business_name ?? profile?.full_name ?? 'Your provider';
  const clientName = recipientName ?? (proposal.clients as { name: string } | null)?.name ?? 'there';

  if (!process.env.RESEND_API_KEY) {
    // Graceful degradation: return the share link even without email configured
    return NextResponse.json({
      success: true,
      shareUrl,
      warning: 'Email not sent: RESEND_API_KEY not configured. Share the link manually.',
    });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:32px 16px;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#1e3a5f;padding:32px;text-align:center;">
      <h1 style="color:#ffffff;font-size:24px;margin:0;">${senderName}</h1>
    </div>
    <div style="padding:32px;">
      <p style="font-size:16px;color:#374151;margin:0 0 16px;">Hi ${clientName},</p>
      ${personalMessage ? `<p style="font-size:15px;color:#374151;margin:0 0 24px;">${personalMessage}</p>` : ''}
      <p style="font-size:15px;color:#374151;margin:0 0 24px;">
        I'd like to share a proposal with you: <strong>${proposal.title}</strong>
      </p>
      <div style="background:#f0f4ff;border-radius:8px;padding:20px;margin:0 0 24px;">
        <p style="margin:0 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;font-weight:600;">Proposal Value</p>
        <p style="margin:0;font-size:24px;font-weight:700;color:#1e3a5f;">
          ${new Intl.NumberFormat('en-US', { style: 'currency', currency: proposal.currency ?? 'USD' }).format(proposal.value ?? 0)}
        </p>
      </div>
      <a href="${shareUrl}" style="display:inline-block;background:#1e3a5f;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
        View Proposal →
      </a>
      ${proposal.valid_until ? `<p style="font-size:13px;color:#9ca3af;margin:16px 0 0;">This proposal is valid until ${new Date(proposal.valid_until).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.</p>` : ''}
    </div>
    <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
      <p style="font-size:12px;color:#9ca3af;margin:0;">
        Sent by ${senderName}${profile?.email ? ` — Reply to <a href="mailto:${profile.email}" style="color:#1e3a5f;">${profile.email}</a>` : ''}
      </p>
    </div>
  </div>
</body>
</html>`;

  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'ProposalPilot <noreply@resend.dev>',
    to: recipientEmail,
    subject: `${senderName} sent you a proposal: ${proposal.title}`,
    html,
    replyTo: profile?.email ?? undefined,
  });

  if (emailError) {
    return NextResponse.json({ error: emailError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, shareUrl });
}
