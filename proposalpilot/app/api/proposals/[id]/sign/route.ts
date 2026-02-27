import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: proposalId } = await params;

  let body: { signerName: string; signerEmail: string; signatureDataUrl: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { signerName, signerEmail, signatureDataUrl } = body;

  if (!signerName?.trim() || !signerEmail?.trim() || !signatureDataUrl) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Verify the proposal exists and has a share_token (i.e., is shareable)
  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .select('id, share_token')
    .eq('id', proposalId)
    .not('share_token', 'is', null)
    .single();

  if (proposalError || !proposal) {
    return NextResponse.json({ error: 'Proposal not found or not shareable' }, { status: 404 });
  }

  // Convert base64 data URL to buffer
  const base64Data = signatureDataUrl.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  // Upload signature PNG to storage
  const fileName = `${proposalId}/${Date.now()}.png`;
  const { error: uploadError } = await supabase.storage
    .from('proposal-signatures')
    .upload(fileName, buffer, { contentType: 'image/png', upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: 'Failed to save signature image' }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from('proposal-signatures')
    .getPublicUrl(fileName);

  // Save signature record
  const { error: insertError } = await supabase.from('signatures').insert({
    proposal_id: proposalId,
    signer_name: signerName.trim(),
    signer_email: signerEmail.trim(),
    signature_url: publicUrl,
    ip_address: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null,
    user_agent: req.headers.get('user-agent') ?? null,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Update proposal status to 'won' if still in draft/sent/viewed
  await supabase
    .from('proposals')
    .update({ status: 'won', updated_at: new Date().toISOString() })
    .eq('id', proposalId)
    .in('status', ['draft', 'sent', 'viewed']);

  return NextResponse.json({ success: true });
}
