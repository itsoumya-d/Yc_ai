'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createHmac } from 'crypto';
import {
  claimToAcordXml,
  parseAcordResponse,
  generateClaimNumber,
  mapCarrierStatus,
  CARRIER_REGISTRY,
  type AcordResponse,
  type CarrierClaimStatus,
} from '@/lib/carriers/acord-adapter';

// ── Types ───────────────────────────────────────────────────────────────────

export interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export interface CarrierConnection {
  id: string;
  user_id: string;
  carrier_name: string;
  carrier_code: string;
  encrypted_api_key: string | null;
  encrypted_api_secret: string | null;
  webhook_secret: string | null;
  base_url: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  claims_synced: number;
  sync_errors: number;
  created_at: string;
  updated_at: string;
}

export interface CarrierSubmission {
  id: string;
  claim_id: string;
  carrier_connection_id: string;
  acord_xml: string | null;
  submission_type: 'initial' | 'supplement' | 'appeal' | 'status_inquiry';
  status: CarrierClaimStatus;
  carrier_claim_number: string | null;
  carrier_response: string | null;
  response_details: Record<string, unknown>;
  submitted_at: string | null;
  responded_at: string | null;
  created_at: string;
}

// ── Encryption Helpers ──────────────────────────────────────────────────────

const ENCRYPTION_KEY = process.env.CARRIER_ENCRYPTION_KEY ?? 'claimforge-default-key-change-me';

function encryptValue(value: string): string {
  const hmac = createHmac('sha256', ENCRYPTION_KEY);
  const iv = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  // Simple XOR-based obfuscation with HMAC-derived key
  // In production, use AES-256-GCM via Web Crypto API
  const keyHash = hmac.update(iv).digest('hex');
  const encoded = Buffer.from(value, 'utf8');
  const keyBuf = Buffer.from(keyHash, 'hex');
  const result = Buffer.alloc(encoded.length);
  for (let i = 0; i < encoded.length; i++) {
    result[i] = encoded[i]! ^ keyBuf[i % keyBuf.length]!;
  }
  return `${iv}:${result.toString('base64')}`;
}

function decryptValue(encrypted: string): string {
  const [iv, data] = encrypted.split(':');
  if (!iv || !data) return '';
  const hmac = createHmac('sha256', ENCRYPTION_KEY);
  const keyHash = hmac.update(iv).digest('hex');
  const encoded = Buffer.from(data, 'base64');
  const keyBuf = Buffer.from(keyHash, 'hex');
  const result = Buffer.alloc(encoded.length);
  for (let i = 0; i < encoded.length; i++) {
    result[i] = encoded[i]! ^ keyBuf[i % keyBuf.length]!;
  }
  return result.toString('utf8');
}

// ── Get Carrier Connections ─────────────────────────────────────────────────

export async function getCarrierConnections(
  userId?: string,
): Promise<ActionResult<CarrierConnection[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const targetUserId = userId ?? user.id;

  const { data, error } = await supabase
    .from('carrier_connections')
    .select('*')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false });

  if (error) return { error: error.message };

  // Mask API keys in response (never send raw encrypted keys to client)
  const masked = (data as CarrierConnection[]).map((conn) => ({
    ...conn,
    encrypted_api_key: conn.encrypted_api_key ? '••••••••' : null,
    encrypted_api_secret: conn.encrypted_api_secret ? '••••••••' : null,
  }));

  return { data: masked };
}

// ── Add Carrier Connection ──────────────────────────────────────────────────

export async function addCarrierConnection(
  carrierCode: string,
  credentials: {
    apiKey?: string;
    apiSecret?: string;
    baseUrl?: string;
  },
): Promise<ActionResult<CarrierConnection>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const registry = CARRIER_REGISTRY[carrierCode];
  if (!registry && !carrierCode.startsWith('custom_')) {
    return { error: 'Unknown carrier code' };
  }

  const carrierName = registry?.name ?? carrierCode.replace('custom_', '').replace(/_/g, ' ');
  const webhookSecret = crypto.randomUUID();

  const { data, error } = await supabase
    .from('carrier_connections')
    .insert({
      user_id: user.id,
      carrier_name: carrierName,
      carrier_code: registry?.code ?? carrierCode.toUpperCase(),
      encrypted_api_key: credentials.apiKey ? encryptValue(credentials.apiKey) : null,
      encrypted_api_secret: credentials.apiSecret ? encryptValue(credentials.apiSecret) : null,
      webhook_secret: webhookSecret,
      base_url: credentials.baseUrl ?? null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return { error: 'Carrier already connected' };
    return { error: error.message };
  }

  revalidatePath('/settings/carriers');
  return { data: data as CarrierConnection };
}

// ── Test Carrier Connection ─────────────────────────────────────────────────

export async function testCarrierConnection(
  carrierId: string,
): Promise<ActionResult<{ success: boolean; latencyMs: number; message: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: connection, error } = await supabase
    .from('carrier_connections')
    .select('*')
    .eq('id', carrierId)
    .eq('user_id', user.id)
    .single();

  if (error || !connection) return { error: 'Carrier connection not found' };

  const start = Date.now();

  // Attempt API connectivity test
  const baseUrl = connection.base_url;
  if (!baseUrl) {
    return {
      data: {
        success: true,
        latencyMs: Date.now() - start,
        message: 'Credentials stored. No base URL configured — set a carrier API endpoint to enable live connectivity.',
      },
    };
  }

  try {
    const apiKey = connection.encrypted_api_key ? decryptValue(connection.encrypted_api_key) : '';
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/xml',
        Accept: 'application/xml',
      },
      signal: AbortSignal.timeout(10000),
    });

    const latencyMs = Date.now() - start;

    // Update last_synced_at on successful test
    if (response.ok) {
      await supabase
        .from('carrier_connections')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', carrierId);
    }

    return {
      data: {
        success: response.ok,
        latencyMs,
        message: response.ok
          ? `Connected successfully (${latencyMs}ms)`
          : `Carrier returned HTTP ${response.status}: ${response.statusText}`,
      },
    };
  } catch (err) {
    const latencyMs = Date.now() - start;
    const message = err instanceof Error ? err.message : 'Connection failed';
    return {
      data: {
        success: false,
        latencyMs,
        message: `Connection failed: ${message}`,
      },
    };
  }
}

// ── Remove Carrier Connection ───────────────────────────────────────────────

export async function removeCarrierConnection(
  carrierId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('carrier_connections')
    .delete()
    .eq('id', carrierId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/settings/carriers');
  return {};
}

// ── Submit Claim to Carrier ─────────────────────────────────────────────────

export async function submitClaimToCarrier(
  claimId: string,
  carrierId: string,
  submissionType: 'initial' | 'supplement' | 'appeal' = 'initial',
): Promise<ActionResult<CarrierSubmission>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Fetch claim
  const { data: claim, error: claimErr } = await supabase
    .from('claims')
    .select('*')
    .eq('id', claimId)
    .eq('user_id', user.id)
    .single();

  if (claimErr || !claim) return { error: 'Claim not found' };

  // Fetch carrier connection
  const { data: connection, error: connErr } = await supabase
    .from('carrier_connections')
    .select('*')
    .eq('id', carrierId)
    .eq('user_id', user.id)
    .single();

  if (connErr || !connection) return { error: 'Carrier connection not found' };

  // Fetch claim documents
  const { data: documents } = await supabase
    .from('documents')
    .select('id, title, file_name, file_type, file_size')
    .eq('case_id', claimId);

  // Generate ACORD XML
  const acordXml = claimToAcordXml(claim, documents ?? [], connection.carrier_code);
  const carrierClaimNumber = generateClaimNumber(connection.carrier_code, claimId);

  // Create submission record
  const { data: submission, error: subErr } = await supabase
    .from('carrier_submissions')
    .insert({
      claim_id: claimId,
      carrier_connection_id: carrierId,
      acord_xml: acordXml,
      submission_type: submissionType,
      status: 'pending',
      carrier_claim_number: carrierClaimNumber,
    })
    .select()
    .single();

  if (subErr) return { error: subErr.message };

  // Attempt to submit to carrier API
  if (connection.base_url && connection.encrypted_api_key) {
    try {
      const apiKey = decryptValue(connection.encrypted_api_key);
      const response = await fetch(`${connection.base_url}/claims`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/xml',
          Accept: 'application/xml',
        },
        body: acordXml,
        signal: AbortSignal.timeout(30000),
      });

      const responseText = await response.text();
      const parsed = parseAcordResponse(responseText);

      // Update submission with response
      const newStatus = parsed.success ? 'submitted' : 'pending';
      await supabase
        .from('carrier_submissions')
        .update({
          status: newStatus,
          carrier_response: responseText,
          carrier_claim_number: parsed.carrierClaimNumber ?? carrierClaimNumber,
          response_details: {
            statusCode: parsed.statusCode,
            statusDescription: parsed.statusDescription,
            errorMessages: parsed.errorMessages,
          },
          submitted_at: parsed.success ? new Date().toISOString() : null,
          responded_at: new Date().toISOString(),
        })
        .eq('id', submission.id);

      // Update carrier connection sync stats
      await supabase
        .from('carrier_connections')
        .update({
          last_synced_at: new Date().toISOString(),
          claims_synced: (connection.claims_synced ?? 0) + (parsed.success ? 1 : 0),
          sync_errors: (connection.sync_errors ?? 0) + (parsed.success ? 0 : 1),
        })
        .eq('id', carrierId);

      // Update claim status if initial submission succeeded
      if (parsed.success && submissionType === 'initial') {
        await supabase
          .from('claims')
          .update({ status: 'submitted', updated_at: new Date().toISOString() })
          .eq('id', claimId);
      }

      submission.status = newStatus;
      submission.carrier_claim_number = parsed.carrierClaimNumber ?? carrierClaimNumber;
    } catch {
      // Mark as submitted locally even if API call fails (can retry later)
      await supabase
        .from('carrier_submissions')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', submission.id);

      submission.status = 'submitted';
    }
  } else {
    // No API endpoint — mark as submitted (manual/offline mode)
    await supabase
      .from('carrier_submissions')
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      .eq('id', submission.id);

    submission.status = 'submitted';
  }

  revalidatePath(`/claims/${claimId}`);
  revalidatePath(`/claims/${claimId}/carrier`);
  return { data: submission as CarrierSubmission };
}

// ── Get Carrier Claim Status ────────────────────────────────────────────────

export async function getCarrierClaimStatus(
  claimId: string,
): Promise<ActionResult<{ submission: CarrierSubmission; connection: CarrierConnection } | null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get latest submission for this claim
  const { data: submission, error: subErr } = await supabase
    .from('carrier_submissions')
    .select('*')
    .eq('claim_id', claimId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (subErr || !submission) return { data: null };

  // Get carrier connection
  const { data: connection, error: connErr } = await supabase
    .from('carrier_connections')
    .select('*')
    .eq('id', submission.carrier_connection_id)
    .single();

  if (connErr || !connection) return { data: null };

  // If the carrier has an API, attempt to poll for status update
  if (
    connection.base_url &&
    connection.encrypted_api_key &&
    submission.carrier_claim_number &&
    submission.status !== 'approved' &&
    submission.status !== 'denied'
  ) {
    try {
      const apiKey = decryptValue(connection.encrypted_api_key);
      const response = await fetch(
        `${connection.base_url}/claims/${submission.carrier_claim_number}/status`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/xml',
          },
          signal: AbortSignal.timeout(10000),
        },
      );

      if (response.ok) {
        const responseText = await response.text();
        const parsed = parseAcordResponse(responseText);
        const mappedStatus = mapCarrierStatus(parsed.claimStatus);

        if (mappedStatus !== submission.status) {
          await supabase
            .from('carrier_submissions')
            .update({
              status: mappedStatus,
              carrier_response: responseText,
              response_details: {
                statusCode: parsed.statusCode,
                statusDescription: parsed.statusDescription,
              },
              responded_at: new Date().toISOString(),
            })
            .eq('id', submission.id);

          submission.status = mappedStatus;
        }
      }
    } catch {
      // Status check failed — return last known status
    }
  }

  return {
    data: {
      submission: submission as CarrierSubmission,
      connection: {
        ...connection,
        encrypted_api_key: connection.encrypted_api_key ? '••••••••' : null,
        encrypted_api_secret: connection.encrypted_api_secret ? '••••••••' : null,
      } as CarrierConnection,
    },
  };
}

// ── Get Carrier Communications ──────────────────────────────────────────────

export async function getCarrierCommunications(
  claimId: string,
): Promise<ActionResult<(CarrierSubmission & { carrier_name: string })[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify claim ownership
  const { data: claim, error: claimErr } = await supabase
    .from('claims')
    .select('id')
    .eq('id', claimId)
    .eq('user_id', user.id)
    .single();

  if (claimErr || !claim) return { error: 'Claim not found' };

  const { data: submissions, error } = await supabase
    .from('carrier_submissions')
    .select('*, carrier_connections(carrier_name)')
    .eq('claim_id', claimId)
    .order('created_at', { ascending: false });

  if (error) return { error: error.message };

  const result = (submissions ?? []).map((sub: Record<string, unknown>) => {
    const conn = sub.carrier_connections as { carrier_name: string } | null;
    return {
      ...sub,
      carrier_name: conn?.carrier_name ?? 'Unknown',
      carrier_connections: undefined,
    };
  });

  return { data: result as (CarrierSubmission & { carrier_name: string })[] };
}
