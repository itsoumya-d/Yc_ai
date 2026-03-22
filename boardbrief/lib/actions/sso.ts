'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SsoConfig {
  id: string;
  org_id: string;
  provider_type: 'saml' | 'oidc';
  saml_metadata_url: string | null;
  saml_entity_id: string | null;
  saml_sso_url: string | null;
  saml_certificate: string | null;
  oidc_discovery_url: string | null;
  oidc_issuer: string | null;
  oidc_auth_endpoint: string | null;
  oidc_token_endpoint: string | null;
  oidc_client_id: string | null;
  oidc_client_secret_encrypted: string | null;
  domain: string | null;
  domain_verified: boolean;
  domain_verification_token: string | null;
  require_sso: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SaveSsoConfigInput {
  provider_type: 'saml' | 'oidc';
  saml_metadata_url?: string;
  saml_entity_id?: string;
  saml_sso_url?: string;
  saml_certificate?: string;
  oidc_discovery_url?: string;
  oidc_issuer?: string;
  oidc_auth_endpoint?: string;
  oidc_token_endpoint?: string;
  oidc_client_id?: string;
  oidc_client_secret?: string;
  domain?: string;
  require_sso?: boolean;
  is_active?: boolean;
}

// ---------------------------------------------------------------------------
// Encryption helpers (AES-256-GCM for client secrets at rest)
// ---------------------------------------------------------------------------

const ENCRYPTION_KEY = process.env.SSO_ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 32) || '0'.repeat(32);

function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'utf-8').subarray(0, 32), iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(ciphertext: string): string {
  const [ivHex, authTagHex, encrypted] = ciphertext.split(':');
  if (!ivHex || !authTagHex || !encrypted) throw new Error('Invalid ciphertext format');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY, 'utf-8').subarray(0, 32),
    Buffer.from(ivHex, 'hex'),
  );
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ---------------------------------------------------------------------------
// Auth guard — returns org_id for the current user (must be admin)
// ---------------------------------------------------------------------------

async function requireOrgAdmin(): Promise<{ supabase: Awaited<ReturnType<typeof createClient>>; orgId: string }> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect('/login');

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .single();

  if (!membership) {
    throw new Error('You must be an organization admin to manage SSO settings.');
  }

  return { supabase, orgId: membership.org_id };
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function getSsoConfig(orgId?: string): Promise<{ data: SsoConfig | null; error: string | null }> {
  try {
    const { supabase, orgId: resolvedOrgId } = await requireOrgAdmin();
    const targetOrgId = orgId || resolvedOrgId;

    const { data, error } = await supabase
      .from('sso_configurations')
      .select('*')
      .eq('org_id', targetOrgId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { data: null, error: error.message };
    }

    return { data: data as SsoConfig | null, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function saveSsoConfig(
  config: SaveSsoConfigInput,
  orgId?: string,
): Promise<{ data: SsoConfig | null; error: string | null }> {
  try {
    const { supabase, orgId: resolvedOrgId } = await requireOrgAdmin();
    const targetOrgId = orgId || resolvedOrgId;

    // Build the row to upsert
    const row: Record<string, unknown> = {
      org_id: targetOrgId,
      provider_type: config.provider_type,
      require_sso: config.require_sso ?? false,
      is_active: config.is_active ?? false,
      domain: config.domain?.toLowerCase().trim() || null,
    };

    if (config.provider_type === 'saml') {
      row.saml_metadata_url = config.saml_metadata_url || null;
      row.saml_entity_id = config.saml_entity_id || null;
      row.saml_sso_url = config.saml_sso_url || null;
      row.saml_certificate = config.saml_certificate || null;
      // Clear OIDC fields
      row.oidc_discovery_url = null;
      row.oidc_issuer = null;
      row.oidc_auth_endpoint = null;
      row.oidc_token_endpoint = null;
      row.oidc_client_id = null;
      row.oidc_client_secret_encrypted = null;
    } else {
      row.oidc_discovery_url = config.oidc_discovery_url || null;
      row.oidc_issuer = config.oidc_issuer || null;
      row.oidc_auth_endpoint = config.oidc_auth_endpoint || null;
      row.oidc_token_endpoint = config.oidc_token_endpoint || null;
      row.oidc_client_id = config.oidc_client_id || null;
      row.oidc_client_secret_encrypted = config.oidc_client_secret
        ? encrypt(config.oidc_client_secret)
        : null;
      // Clear SAML fields
      row.saml_metadata_url = null;
      row.saml_entity_id = null;
      row.saml_sso_url = null;
      row.saml_certificate = null;
    }

    const { data, error } = await supabase
      .from('sso_configurations')
      .upsert(row, { onConflict: 'org_id' })
      .select()
      .single();

    if (error) return { data: null, error: error.message };

    revalidatePath('/settings/sso', 'page');
    return { data: data as SsoConfig, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function deleteSsoConfig(orgId?: string): Promise<{ error: string | null }> {
  try {
    const { supabase, orgId: resolvedOrgId } = await requireOrgAdmin();
    const targetOrgId = orgId || resolvedOrgId;

    const { error } = await supabase
      .from('sso_configurations')
      .delete()
      .eq('org_id', targetOrgId);

    if (error) return { error: error.message };

    revalidatePath('/settings/sso', 'page');
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ---------------------------------------------------------------------------
// Domain verification — checks for DNS TXT record _boardbrief-verify=<token>
// ---------------------------------------------------------------------------

export async function verifyDomain(
  domain: string,
  orgId?: string,
): Promise<{ verified: boolean; error: string | null }> {
  try {
    const { supabase, orgId: resolvedOrgId } = await requireOrgAdmin();
    const targetOrgId = orgId || resolvedOrgId;

    // Get the existing config to read the verification token
    const { data: config } = await supabase
      .from('sso_configurations')
      .select('domain_verification_token')
      .eq('org_id', targetOrgId)
      .single();

    if (!config?.domain_verification_token) {
      return { verified: false, error: 'No SSO configuration found. Save your SSO settings first.' };
    }

    const expectedValue = `_boardbrief-verify=${config.domain_verification_token}`;

    // Use DNS-over-HTTPS to resolve TXT records (works in serverless)
    const dnsUrl = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=TXT`;
    const dnsResponse = await fetch(dnsUrl, {
      headers: { Accept: 'application/dns-json' },
      signal: AbortSignal.timeout(10_000),
    });

    if (!dnsResponse.ok) {
      return { verified: false, error: 'DNS lookup failed. Please try again.' };
    }

    const dnsData = await dnsResponse.json();
    const txtRecords: string[] = (dnsData.Answer || [])
      .filter((r: { type: number }) => r.type === 16)
      .map((r: { data: string }) => r.data.replace(/"/g, ''));

    const found = txtRecords.some((txt) => txt.includes(expectedValue));

    if (found) {
      await supabase
        .from('sso_configurations')
        .update({ domain_verified: true })
        .eq('org_id', targetOrgId);

      revalidatePath('/settings/sso', 'page');
      return { verified: true, error: null };
    }

    return {
      verified: false,
      error: `TXT record not found. Add a TXT record to ${domain} with value: ${expectedValue}`,
    };
  } catch (err: any) {
    return { verified: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// Test connection — validates that the IdP endpoint is reachable
// ---------------------------------------------------------------------------

export async function testSsoConnection(
  orgId?: string,
): Promise<{ success: boolean; error: string | null; details?: string }> {
  try {
    const { supabase, orgId: resolvedOrgId } = await requireOrgAdmin();
    const targetOrgId = orgId || resolvedOrgId;

    const { data: config } = await supabase
      .from('sso_configurations')
      .select('*')
      .eq('org_id', targetOrgId)
      .single();

    if (!config) {
      return { success: false, error: 'No SSO configuration found.' };
    }

    if (config.provider_type === 'saml') {
      return await testSamlConnection(config as SsoConfig);
    } else {
      return await testOidcConnection(config as SsoConfig);
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

async function testSamlConnection(
  config: SsoConfig,
): Promise<{ success: boolean; error: string | null; details?: string }> {
  const metadataUrl = config.saml_metadata_url;

  if (metadataUrl) {
    try {
      const res = await fetch(metadataUrl, {
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        return {
          success: false,
          error: `SAML metadata URL returned HTTP ${res.status}`,
        };
      }

      const body = await res.text();

      // Basic XML validation: must contain EntityDescriptor
      if (!body.includes('EntityDescriptor')) {
        return {
          success: false,
          error: 'Response does not appear to be valid SAML metadata (missing EntityDescriptor).',
        };
      }

      return {
        success: true,
        error: null,
        details: `SAML metadata fetched successfully (${body.length} bytes). EntityDescriptor found.`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Could not reach SAML metadata URL: ${err.message}`,
      };
    }
  }

  // Manual config — validate that entity ID and SSO URL are present
  if (!config.saml_entity_id || !config.saml_sso_url) {
    return {
      success: false,
      error: 'SAML Entity ID and SSO URL are required when metadata URL is not provided.',
    };
  }

  // Try to reach the SSO URL
  try {
    const res = await fetch(config.saml_sso_url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10_000),
      redirect: 'manual',
    });

    // Any response (even redirects) means the endpoint is reachable
    return {
      success: true,
      error: null,
      details: `SAML SSO endpoint reachable (HTTP ${res.status}). Entity ID: ${config.saml_entity_id}`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Could not reach SAML SSO URL: ${err.message}`,
    };
  }
}

async function testOidcConnection(
  config: SsoConfig,
): Promise<{ success: boolean; error: string | null; details?: string }> {
  // Try discovery URL first
  const discoveryUrl = config.oidc_discovery_url
    || (config.oidc_issuer ? `${config.oidc_issuer.replace(/\/$/, '')}/.well-known/openid-configuration` : null);

  if (discoveryUrl) {
    try {
      const res = await fetch(discoveryUrl, {
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        return {
          success: false,
          error: `OIDC discovery endpoint returned HTTP ${res.status}`,
        };
      }

      const body = await res.json();

      if (!body.issuer || !body.authorization_endpoint || !body.token_endpoint) {
        return {
          success: false,
          error: 'OIDC discovery response is missing required fields (issuer, authorization_endpoint, token_endpoint).',
        };
      }

      return {
        success: true,
        error: null,
        details: `OIDC discovery successful. Issuer: ${body.issuer}. ${Object.keys(body).length} fields discovered.`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Could not reach OIDC discovery endpoint: ${err.message}`,
      };
    }
  }

  // Manual config — check required fields
  if (!config.oidc_auth_endpoint || !config.oidc_token_endpoint || !config.oidc_client_id) {
    return {
      success: false,
      error: 'OIDC requires at minimum: authorization endpoint, token endpoint, and client ID.',
    };
  }

  // Try to reach the auth endpoint
  try {
    const res = await fetch(config.oidc_auth_endpoint, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10_000),
      redirect: 'manual',
    });

    return {
      success: true,
      error: null,
      details: `OIDC authorization endpoint reachable (HTTP ${res.status}). Client ID configured.`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Could not reach OIDC authorization endpoint: ${err.message}`,
    };
  }
}
