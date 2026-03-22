import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { handleSignatureWebhook } from '@/lib/actions/signatures';

/**
 * Verify the Dropbox Sign webhook HMAC signature.
 * Dropbox Sign sends: X-Hs-Signature header with HMAC-SHA256(payload, webhookKey).
 * Reference: https://developers.hellosign.com/api/reference/operation/eventCallbackAccountPost/
 */
function verifyDropboxSignSignature(payload: string, signature: string | null): boolean {
  const webhookKey = process.env.HELLOSIGN_WEBHOOK_KEY;
  if (!webhookKey) {
    console.error('[hellosign-webhook] HELLOSIGN_WEBHOOK_KEY not set — rejecting webhook (configure env var)');
    return false;
  }
  if (!signature) return false;

  const expected = createHmac('sha256', webhookKey)
    .update(payload)
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(req: NextRequest) {
  try {
    // Dropbox Sign POSTs as multipart/form-data; the payload is in the `json` field
    const formData = await req.formData();
    const jsonPayload = formData.get('json') as string | null;

    if (!jsonPayload) {
      return NextResponse.json({ error: 'Missing payload' }, { status: 400 });
    }

    // Verify webhook signature
    const signature = req.headers.get('x-hs-signature');
    if (!verifyDropboxSignSignature(jsonPayload, signature)) {
      console.error('[hellosign-webhook] Invalid webhook signature — rejecting request');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(jsonPayload);
    const eventType: string = payload?.event?.event_type ?? '';

    // Handle relevant events
    if (['signature_request_signed', 'signature_request_viewed', 'signature_request_declined'].includes(eventType)) {
      await handleSignatureWebhook(payload);
    }

    // Dropbox Sign requires this exact response body to acknowledge receipt
    return new NextResponse('Hello API Event Received', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (err) {
    console.error('[hellosign-webhook] Processing error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
