import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/crypto';

/**
 * Xero OAuth2 callback handler.
 * Exchanges authorization code for tokens, fetches tenant info, encrypts, and stores.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const redirectTo = `${baseUrl}/settings/integrations`;

  // Handle error from Xero
  if (error) {
    return NextResponse.redirect(
      `${redirectTo}?error=${encodeURIComponent(error)}`
    );
  }

  // Validate required params
  if (!code || !state) {
    return NextResponse.redirect(
      `${redirectTo}?error=${encodeURIComponent('Missing required parameters from Xero')}`
    );
  }

  // Validate state (CSRF protection)
  let stateData: { userId: string; ts: number };
  try {
    stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
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
  const clientId = process.env.XERO_CLIENT_ID!;
  const clientSecret = process.env.XERO_CLIENT_SECRET!;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const redirectUri = `${baseUrl}/api/integrations/xero/callback`;

  let tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    id_token?: string;
  };

  try {
    const tokenRes = await fetch(
      'https://identity.xero.com/connect/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
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

  // Fetch connected tenants to get the tenant ID
  let tenantId: string | null = null;
  try {
    const tenantsRes = await fetch('https://api.xero.com/connections', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: 'application/json',
      },
    });

    if (tenantsRes.ok) {
      const tenants = (await tenantsRes.json()) as Array<{
        tenantId: string;
        tenantName: string;
        tenantType: string;
      }>;

      if (tenants.length === 0) {
        return NextResponse.redirect(
          `${redirectTo}?error=${encodeURIComponent('No Xero organisations found. Please ensure you have at least one organisation.')}`
        );
      }

      // Use the first organisation (most common case for SMBs)
      tenantId = tenants[0].tenantId;
    }
  } catch {
    // Non-fatal: we can still store the token, tenant can be set later
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
        provider: 'xero',
        encrypted_access_token: encryptedAccessToken,
        encrypted_refresh_token: encryptedRefreshToken,
        token_expires_at: tokenExpiresAt,
        tenant_id: tenantId,
        is_active: true,
      },
      { onConflict: 'user_id,provider' }
    );

  if (dbError) {
    return NextResponse.redirect(
      `${redirectTo}?error=${encodeURIComponent('Failed to save connection. Please try again.')}`
    );
  }

  return NextResponse.redirect(`${redirectTo}?connected=xero`);
}
