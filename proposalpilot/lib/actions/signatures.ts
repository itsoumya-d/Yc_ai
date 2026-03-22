'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface SignatureRequest {
  signature_request_id: string;
  signing_url: string;
  status: string;
}

function getHelloSignBaseUrl() {
  return 'https://api.hellosign.com/v3';
}

function getAuthHeader() {
  const apiKey = process.env.HELLOSIGN_API_KEY;
  if (!apiKey) throw new Error('HELLOSIGN_API_KEY not configured');
  return `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`;
}

export async function sendForSignature(proposalId: string): Promise<{
  data?: { signatureRequestId: string; signingUrl: string };
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get proposal + client details
  const { data: proposal } = await supabase
    .from('proposals')
    .select(`
      id, title, client_name, client_email, share_token,
      clients(name, email, company)
    `)
    .eq('id', proposalId)
    .eq('user_id', user.id)
    .single();

  if (!proposal) return { error: 'Proposal not found' };

  const { data: userProfile } = await supabase
    .from('users')
    .select('full_name, email, business_name')
    .eq('id', user.id)
    .single();

  const signerEmail = (proposal.clients as { email?: string } | null)?.email ?? proposal.client_email;
  const signerName = (proposal.clients as { name?: string } | null)?.name ?? proposal.client_name ?? 'Client';

  if (!signerEmail) return { error: 'No client email found. Add an email to the client first.' };

  try {
    const authHeader = getAuthHeader();
    const formData = new FormData();
    formData.append('title', `${proposal.title} — Signature Request`);
    formData.append('subject', `Please sign: ${proposal.title}`);
    formData.append('message', `Hi ${signerName}, please review and sign the proposal "${proposal.title}" from ${userProfile?.business_name ?? userProfile?.full_name ?? 'your vendor'}.`);
    formData.append('signers[0][email_address]', signerEmail);
    formData.append('signers[0][name]', signerName);
    formData.append('signers[0][order]', '0');
    formData.append('metadata[proposal_id]', proposalId);
    formData.append('test_mode', process.env.NODE_ENV === 'production' ? '0' : '1');

    // Use a PDF URL if available, otherwise use file_url
    const proposalPdfUrl = `${process.env.NEXT_PUBLIC_APP_URL}/proposals/${proposalId}/pdf`;
    formData.append('file_url[0]', proposalPdfUrl);

    const resp = await fetch(`${getHelloSignBaseUrl()}/signature_request/send_with_template`, {
      method: 'POST',
      headers: { Authorization: authHeader },
      body: formData,
    });

    if (!resp.ok) {
      // Fallback: try basic send
      const errData = await resp.json().catch(() => ({}));
      return { error: errData.error?.error_msg ?? `HelloSign API error: ${resp.status}` };
    }

    const result: { signature_request: SignatureRequest } = await resp.json();
    const sigReq = result.signature_request;

    // Save signature request to DB
    await supabase
      .from('proposals')
      .update({
        signature_request_id: sigReq.signature_request_id,
        signature_status: 'sent',
        signature_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', proposalId);

    revalidatePath(`/proposals/${proposalId}`);
    revalidatePath('/proposals');
    return {
      data: {
        signatureRequestId: sigReq.signature_request_id,
        signingUrl: sigReq.signing_url,
      },
    };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function getSignatureStatus(proposalId: string): Promise<{
  data?: { status: string; viewedAt?: string; signedAt?: string };
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: proposal } = await supabase
    .from('proposals')
    .select('signature_request_id, signature_status, signature_sent_at, signature_signed_at')
    .eq('id', proposalId)
    .eq('user_id', user.id)
    .single();

  if (!proposal?.signature_request_id) return { error: 'No signature request found' };

  try {
    const resp = await fetch(
      `${getHelloSignBaseUrl()}/signature_request/${proposal.signature_request_id}`,
      { headers: { Authorization: getAuthHeader() } }
    );

    if (!resp.ok) return { error: `HelloSign API error: ${resp.status}` };

    const result = await resp.json();
    const status = result.signature_request?.signatures?.[0]?.status_code ?? proposal.signature_status ?? 'sent';

    // Map HelloSign statuses
    const statusMap: Record<string, string> = {
      awaiting_signature: 'sent',
      signed: 'signed',
      declined: 'declined',
    };

    const normalizedStatus = statusMap[status] ?? status;

    if (normalizedStatus !== proposal.signature_status) {
      await supabase
        .from('proposals')
        .update({
          signature_status: normalizedStatus,
          ...(normalizedStatus === 'signed' ? { signature_signed_at: new Date().toISOString() } : {}),
        })
        .eq('id', proposalId);
    }

    return {
      data: {
        status: normalizedStatus,
        viewedAt: proposal.signature_sent_at,
        signedAt: proposal.signature_signed_at,
      },
    };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function handleSignatureWebhook(payload: {
  event: {
    event_type: string;
    event_metadata: { related_signature_id: string };
  };
  signature_request?: { metadata?: { proposal_id?: string }; signature_request_id: string };
}): Promise<{ received: boolean }> {
  const supabase = createClient();
  const { event, signature_request: sigReq } = payload;
  const proposalId = sigReq?.metadata?.proposal_id;

  if (!proposalId) return { received: true };

  const db = await supabase;

  if (event.event_type === 'signature_request_signed') {
    await db.from('proposals').update({
      signature_status: 'signed',
      signature_signed_at: new Date().toISOString(),
      status: 'signed',
    }).eq('id', proposalId);
  } else if (event.event_type === 'signature_request_viewed') {
    await db.from('proposals').update({ signature_status: 'viewed' }).eq('id', proposalId);
  } else if (event.event_type === 'signature_request_declined') {
    await db.from('proposals').update({ signature_status: 'declined' }).eq('id', proposalId);
  }

  return { received: true };
}
