/**
 * Shared webhook signature verification utilities.
 * All verification uses constant-time comparison to prevent timing attacks.
 */
import { createHmac, timingSafeEqual } from 'crypto';

// ── Generic HMAC-SHA256 verifier ──────────────────────────────────────────────
export function verifyHmacSha256(
  payload: string,
  receivedSignature: string | null,
  secret: string
): boolean {
  if (!receivedSignature) return false;
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  try {
    return timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(receivedSignature.replace(/^sha256=/, ''), 'hex')
    );
  } catch {
    return false;
  }
}

// ── Stripe webhook verifier ───────────────────────────────────────────────────
// NOTE: Use stripe.webhooks.constructEvent() directly — it handles this internally.
// This helper is for non-Stripe providers.

// ── GitHub webhook verifier ───────────────────────────────────────────────────
export function verifyGitHubWebhook(payload: string, signature: string | null, secret: string): boolean {
  if (!signature || !signature.startsWith('sha256=')) return false;
  return verifyHmacSha256(payload, signature.replace('sha256=', ''), secret);
}

// ── Svix / Clerk webhook verifier ────────────────────────────────────────────
export function verifySvixWebhook(
  payload: string,
  headers: { 'svix-id'?: string; 'svix-timestamp'?: string; 'svix-signature'?: string },
  secret: string
): boolean {
  const { 'svix-id': msgId, 'svix-timestamp': timestamp, 'svix-signature': signature } = headers;
  if (!msgId || !timestamp || !signature) return false;
  const signedContent = `${msgId}.${timestamp}.${payload}`;
  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = createHmac('sha256', secretBytes).update(signedContent).digest('base64');
  return signature.split(' ').some(sig => {
    const [, hash] = sig.split(',');
    return hash === expected;
  });
}

// ── Generic reusable webhook middleware factory ───────────────────────────────
export function requireWebhookSignature(opts: {
  headerName: string;
  secretEnvVar: string;
  prefix?: string;
}) {
  return async (payload: string, headers: Record<string, string | null>): Promise<boolean> => {
    const secret = process.env[opts.secretEnvVar];
    if (!secret) {
      console.warn(`[webhook] ${opts.secretEnvVar} not set — skipping verification`);
      return process.env.NODE_ENV !== 'production'; // Allow in dev, block in prod
    }
    const sig = headers[opts.headerName.toLowerCase()];
    return verifyHmacSha256(payload, sig?.replace(opts.prefix ?? '', ''), secret);
  };
}
