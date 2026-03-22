import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { parseAcordResponse, mapCarrierStatus } from '@/lib/carriers/acord-adapter';

// Use service-role client for webhook processing (no user session)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  );
}

// ── Verify Carrier Webhook Signature ────────────────────────────────────────

function verifyCarrierSignature(
  payload: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;
  try {
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    const received = signature.replace(/^sha256=/, '');
    return timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(received, 'hex'),
    );
  } catch {
    return false;
  }
}

// ── POST /api/webhooks/carrier ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-carrier-signature');
  const carrierConnectionId = req.headers.get('x-carrier-connection-id');
  const carrierClaimNumber = req.headers.get('x-carrier-claim-number');

  if (!carrierConnectionId) {
    return NextResponse.json(
      { error: 'Missing x-carrier-connection-id header' },
      { status: 400 },
    );
  }

  const supabase = getServiceClient();

  // Look up the carrier connection to get webhook secret
  const { data: connection, error: connErr } = await supabase
    .from('carrier_connections')
    .select('id, user_id, webhook_secret, carrier_name, carrier_code')
    .eq('id', carrierConnectionId)
    .single();

  if (connErr || !connection) {
    return NextResponse.json({ error: 'Unknown carrier connection' }, { status: 404 });
  }

  // Verify webhook signature
  if (connection.webhook_secret) {
    const isValid = verifyCarrierSignature(body, signature, connection.webhook_secret);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Parse the ACORD response
  const parsed = parseAcordResponse(body);
  const resolvedClaimNumber =
    carrierClaimNumber ??
    parsed.carrierClaimNumber;

  if (!resolvedClaimNumber) {
    return NextResponse.json(
      { error: 'Cannot determine carrier claim number from payload or headers' },
      { status: 400 },
    );
  }

  // Find the submission by carrier claim number
  const { data: submission, error: subErr } = await supabase
    .from('carrier_submissions')
    .select('id, claim_id, status')
    .eq('carrier_connection_id', connection.id)
    .eq('carrier_claim_number', resolvedClaimNumber)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (subErr || !submission) {
    return NextResponse.json(
      { error: `No submission found for claim number: ${resolvedClaimNumber}` },
      { status: 404 },
    );
  }

  // Map the carrier status
  const newStatus = mapCarrierStatus(parsed.claimStatus);
  const now = new Date().toISOString();

  // Update the submission
  const { error: updateErr } = await supabase
    .from('carrier_submissions')
    .update({
      status: newStatus,
      carrier_response: body,
      response_details: {
        statusCode: parsed.statusCode,
        statusDescription: parsed.statusDescription,
        errorMessages: parsed.errorMessages,
        webhookReceivedAt: now,
      },
      responded_at: now,
    })
    .eq('id', submission.id);

  if (updateErr) {
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }

  // Update the claim status in the claims table for terminal states
  if (newStatus === 'approved' || newStatus === 'denied') {
    const claimStatus = newStatus === 'approved' ? 'approved' : 'denied';
    await supabase
      .from('claims')
      .update({ status: claimStatus, updated_at: now })
      .eq('id', submission.claim_id);
  }

  // Create notification for claim owner
  const { data: claim } = await supabase
    .from('claims')
    .select('user_id, claim_number')
    .eq('id', submission.claim_id)
    .single();

  if (claim) {
    await supabase.from('notifications').insert({
      user_id: claim.user_id,
      title: `Carrier Update: ${claim.claim_number}`,
      message: `${connection.carrier_name} updated claim status to "${newStatus}". ${parsed.statusDescription}`,
      type: 'carrier_update',
      read: false,
      metadata: {
        claim_id: submission.claim_id,
        carrier_name: connection.carrier_name,
        carrier_claim_number: resolvedClaimNumber,
        new_status: newStatus,
      },
    });
  }

  // Update carrier connection last_synced_at
  await supabase
    .from('carrier_connections')
    .update({ last_synced_at: now })
    .eq('id', connection.id);

  return NextResponse.json({
    received: true,
    submissionId: submission.id,
    claimId: submission.claim_id,
    previousStatus: submission.status,
    newStatus,
  });
}
