import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const body = await request.json().catch(() => null);
  if (!body || !body.action) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { action, signerName, signerEmail, signatureDataUrl, proposalTitle } = body;

  if (action !== 'accept' && action !== 'decline') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Verify proposal exists and has a share token (public access)
  const { data: proposal, error: fetchError } = await supabase
    .from('proposals')
    .select('id, status, share_token, user_id')
    .eq('id', id)
    .single();

  if (fetchError || !proposal) {
    return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
  }

  if (!proposal.share_token) {
    return NextResponse.json({ error: 'Proposal is not publicly accessible' }, { status: 403 });
  }

  if (proposal.status === 'won' || proposal.status === 'lost') {
    return NextResponse.json({ error: 'Proposal has already been actioned' }, { status: 409 });
  }

  const newStatus = action === 'accept' ? 'won' : 'lost';

  const updateData: Record<string, string> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabase
    .from('proposals')
    .update(updateData)
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 });
  }

  // Optionally notify the proposal owner via email (requires email service setup)
  // This is a placeholder that can be wired to SendGrid/Resend when ready
  if (action === 'accept' && signerName && signerEmail) {
    try {
      // Get owner's email for notification
      const { data: ownerProfile } = await supabase
        .from('users')
        .select('email, full_name, business_name')
        .eq('id', proposal.user_id)
        .single();

      // TODO: Wire to SendGrid/Resend when SENDGRID_API_KEY env var is available
      // await sendProposalAcceptedEmail({
      //   to: ownerProfile?.email,
      //   signerName,
      //   signerEmail,
      //   proposalTitle,
      //   signatureDataUrl,
      // });

      void ownerProfile; // suppress unused variable warning until email is wired
    } catch {
      // Email notification failure should not fail the acceptance
    }
  }

  return NextResponse.json({
    success: true,
    status: newStatus,
    message: action === 'accept'
      ? 'Proposal accepted successfully'
      : 'Proposal declined',
  });
}
