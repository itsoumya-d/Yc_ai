import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/crypto';

/**
 * QuickBooks Online OAuth2 callback handler.
 * Exchanges authorization code for tokens, encrypts, and stores them.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const realmId = searchParams.get('realmId');
  const error = searchParams.get('error');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const redirectTo = `${baseUrl}/settings/integrations`;

  // Handle error from QBO
  if (error) {
    return NextResponse.redirect(
      `${redirectTo}?error=${encodeURIComponent(error)}`
    );
  }

  // Validate required params
  if (!code || !state || !realmId) {
    return NextResponse.redirect(
      `${redirectTo}?error=${encodeURIComponent('Missing required parameters from QuickBooks')}`
    );
  }

  // Validate state (CSRF protection)
  let stateData: { userId: string; ts: number };
  try {
    stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    // Reject if state is older than 10 minutes
    if (Date.now() - stateData.ts > 10 * 60 * 1000) {
      return NextResponse.redirect(
        `${redirectTo}?error=${encodeURIComponent('Authorization request expired. Please try again.')}`
      );
    }
  } catch {
    return NextResponse.redirect(
      `${redirectTo}?error=${encodeURIComponent('Invalid state parameter')}`
    );
  }

  // Verify user session matches state
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== stateData.userId) {
    return NextResponse.redirect(
      `${redirectTo}?error=${encodeURIComponent('Session mismatch. Please try connecting again.')}`
    );
  }

  // Exchange code for tokens
  const clientId = process.env.QBO_CLIENT_ID!;
  const clientSecret = process.env.QBO_CLIENT_SECRET!;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const redirectUri = `${baseUrl}/api/integrations/quickbooks/callback`;

  let tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  try {
    const tokenRes = await fetch(
      'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
          Accept: 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }),
      }
    );

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      throw new Error(`Token exchange failed: ${text}`);
    }

    tokens = await tokenRes.json();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Token exchange failed';
    return NextResponse.redirect(
      `${redirectTo}?error=${encodeURIComponent(msg)}`
    );
  }

  // Encrypt tokens and upsert integration record
  const encryptedAccessToken = encrypt(tokens.access_token);
  const encryptedRefreshToken = encrypt(tokens.refresh_token);
  const tokenExpiresAt = new Date(
    Date.now() + tokens.expires_in * 1000
  ).toISOString();

  const { error: dbError } = await supabase
    .from('accounting_integrations')
    .upsert(
      {
        user_id: user.id,
        provider: 'quickbooks',
        encrypted_access_token: encryptedAccessToken,
        encrypted_refresh_token: encryptedRefreshToken,
        token_expires_at: tokenExpiresAt,
        realm_id: realmId,
        is_active: true,
      },
      { onConflict: 'user_id,provider' }
    );

  if (dbError) {
    return NextResponse.redirect(
      `${redirectTo}?error=${encodeURIComponent('Failed to save connection. Please try again.')}`
    );
  }

  return NextResponse.redirect(`${redirectTo}?connected=quickbooks`);
}
