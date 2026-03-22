'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { encrypt, decrypt } from '@/lib/crypto';
import * as quickbooks from '@/lib/accounting/quickbooks';
import * as xero from '@/lib/accounting/xero';

// ── Types ────────────────────────────────────────────────────────────────────

export interface AccountingIntegration {
  id: string;
  user_id: string;
  provider: 'quickbooks' | 'xero';
  token_expires_at: string | null;
  tenant_id: string | null;
  realm_id: string | null;
  auto_sync: boolean;
  sync_frequency: 'realtime' | 'hourly' | 'daily';
  sync_direction: 'push' | 'pull' | 'bidirectional';
  last_synced_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: string;
  user_id: string;
  integration_id: string | null;
  provider: string;
  direction: string;
  status: 'started' | 'completed' | 'failed' | 'partial';
  items_synced: number;
  items_failed: number;
  error_message: string | null;
  details: Record<string, unknown>;
  started_at: string;
  completed_at: string | null;
}

interface ActionResult<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

// ── Get integrations ────────────────────────────────────────────────────────

export async function getIntegrations(
  userId?: string
): Promise<ActionResult<AccountingIntegration[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const uid = userId ?? user?.id;
  if (!uid) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('accounting_integrations')
    .select(
      'id, user_id, provider, token_expires_at, tenant_id, realm_id, auto_sync, sync_frequency, sync_direction, last_synced_at, is_active, created_at, updated_at'
    )
    .eq('user_id', uid)
    .eq('is_active', true);

  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as AccountingIntegration[] };
}

// ── Initiate QuickBooks OAuth2 ──────────────────────────────────────────────

export async function initiateQuickBooksConnect(): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const clientId = process.env.QBO_CLIENT_ID;
  if (!clientId) return { success: false, error: 'QuickBooks integration is not configured' };

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/quickbooks/callback`;
  const state = Buffer.from(
    JSON.stringify({ userId: user.id, ts: Date.now() })
  ).toString('base64url');

  const scopes = 'com.intuit.quickbooks.accounting';
  const url =
    `https://appcenter.intuit.com/connect/oauth2?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&state=${encodeURIComponent(state)}`;

  return { success: true, data: { url } };
}

// ── Initiate Xero OAuth2 ───────────────────────────────────────────────────

export async function initiateXeroConnect(): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const clientId = process.env.XERO_CLIENT_ID;
  if (!clientId) return { success: false, error: 'Xero integration is not configured' };

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/xero/callback`;
  const state = Buffer.from(
    JSON.stringify({ userId: user.id, ts: Date.now() })
  ).toString('base64url');

  const scopes = 'openid profile email accounting.transactions accounting.contacts offline_access';
  const url =
    `https://login.xero.com/identity/connect/authorize?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&state=${encodeURIComponent(state)}`;

  return { success: true, data: { url } };
}

// ── Disconnect integration ──────────────────────────────────────────────────

export async function disconnectIntegration(
  provider: 'quickbooks' | 'xero'
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  // Fetch tokens for revocation
  const { data: integration } = await supabase
    .from('accounting_integrations')
    .select('encrypted_access_token, encrypted_refresh_token')
    .eq('user_id', user.id)
    .eq('provider', provider)
    .single();

  if (integration?.encrypted_access_token) {
    try {
      const accessToken = decrypt(integration.encrypted_access_token);
      if (provider === 'quickbooks') {
        await quickbooks.revokeToken(accessToken);
      } else {
        await xero.revokeToken(accessToken);
      }
    } catch {
      // Token revocation is best-effort; continue with local cleanup
    }
  }

  // Soft-delete: mark inactive and clear tokens
  const { error } = await supabase
    .from('accounting_integrations')
    .update({
      is_active: false,
      encrypted_access_token: null,
      encrypted_refresh_token: null,
      token_expires_at: null,
    })
    .eq('user_id', user.id)
    .eq('provider', provider);

  if (error) return { success: false, error: error.message };

  revalidatePath('/settings/integrations');
  return { success: true };
}

// ── Update sync settings ────────────────────────────────────────────────────

export async function updateSyncSettings(
  provider: 'quickbooks' | 'xero',
  settings: {
    auto_sync?: boolean;
    sync_frequency?: 'realtime' | 'hourly' | 'daily';
    sync_direction?: 'push' | 'pull' | 'bidirectional';
  }
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('accounting_integrations')
    .update(settings)
    .eq('user_id', user.id)
    .eq('provider', provider)
    .eq('is_active', true);

  if (error) return { success: false, error: error.message };

  revalidatePath('/settings/integrations');
  return { success: true };
}

// ── Helper: get decrypted tokens + refresh if expired ───────────────────────

async function getValidTokens(
  userId: string,
  provider: 'quickbooks' | 'xero'
): Promise<{
  accessToken: string;
  realmId?: string;
  tenantId?: string;
  integrationId: string;
} | null> {
  const supabase = await createClient();
  const { data: integration } = await supabase
    .from('accounting_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', provider)
    .eq('is_active', true)
    .single();

  if (!integration?.encrypted_access_token) return null;

  let accessToken = decrypt(integration.encrypted_access_token);
  const refreshTokenValue = integration.encrypted_refresh_token
    ? decrypt(integration.encrypted_refresh_token)
    : null;

  // Check if token expired (with 5-min buffer)
  const expiresAt = integration.token_expires_at
    ? new Date(integration.token_expires_at)
    : null;
  const isExpired = expiresAt && expiresAt.getTime() - 5 * 60 * 1000 < Date.now();

  if (isExpired && refreshTokenValue) {
    try {
      if (provider === 'quickbooks') {
        const tokens = await quickbooks.refreshToken(refreshTokenValue);
        accessToken = tokens.access_token;
        await supabase
          .from('accounting_integrations')
          .update({
            encrypted_access_token: encrypt(tokens.access_token),
            encrypted_refresh_token: encrypt(tokens.refresh_token),
            token_expires_at: new Date(
              Date.now() + tokens.expires_in * 1000
            ).toISOString(),
          })
          .eq('id', integration.id);
      } else {
        const tokens = await xero.refreshToken(refreshTokenValue);
        accessToken = tokens.access_token;
        await supabase
          .from('accounting_integrations')
          .update({
            encrypted_access_token: encrypt(tokens.access_token),
            encrypted_refresh_token: encrypt(tokens.refresh_token),
            token_expires_at: new Date(
              Date.now() + tokens.expires_in * 1000
            ).toISOString(),
          })
          .eq('id', integration.id);
      }
    } catch (err) {
      throw new Error(
        `Token refresh failed for ${provider}: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }

  return {
    accessToken,
    realmId: integration.realm_id ?? undefined,
    tenantId: integration.tenant_id ?? undefined,
    integrationId: integration.id,
  };
}

// ── Sync invoices ───────────────────────────────────────────────────────────

export async function syncInvoices(
  provider: 'quickbooks' | 'xero',
  direction?: 'push' | 'pull' | 'bidirectional'
): Promise<ActionResult<{ itemsSynced: number; itemsFailed: number }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const tokens = await getValidTokens(user.id, provider).catch((err) => {
    return { error: err instanceof Error ? err.message : 'Token error' } as { error: string };
  });

  if (!tokens || 'error' in tokens) {
    return {
      success: false,
      error: (tokens as { error: string })?.error ?? 'Integration not connected or tokens missing',
    };
  }

  // Determine sync direction
  const { data: integration } = await supabase
    .from('accounting_integrations')
    .select('sync_direction, last_synced_at')
    .eq('id', tokens.integrationId)
    .single();

  const syncDir = direction ?? integration?.sync_direction ?? 'push';

  // Create sync log entry
  const { data: syncLog } = await supabase
    .from('sync_logs')
    .insert({
      user_id: user.id,
      integration_id: tokens.integrationId,
      provider,
      direction: syncDir,
      status: 'started',
    })
    .select()
    .single();

  let itemsSynced = 0;
  let itemsFailed = 0;
  const errors: string[] = [];

  try {
    // ── PUSH: send InvoiceAI invoices to accounting system ──
    if (syncDir === 'push' || syncDir === 'bidirectional') {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*, client:clients(*), items:invoice_items(*)')
        .eq('user_id', user.id)
        .in('status', ['sent', 'paid', 'viewed', 'overdue', 'partial'])
        .order('updated_at', { ascending: false })
        .limit(100);

      for (const inv of invoices ?? []) {
        try {
          const invoiceData = {
            id: inv.id,
            invoice_number: inv.invoice_number,
            issue_date: inv.issue_date,
            due_date: inv.due_date,
            currency: inv.currency,
            notes: inv.notes,
            items: (inv.items ?? []).map(
              (i: { description: string; quantity: number; unit_price: number; amount: number }) => ({
                description: i.description,
                quantity: i.quantity,
                unit_price: i.unit_price,
                amount: i.amount,
              })
            ),
            client: inv.client
              ? {
                  name: inv.client.name,
                  email: inv.client.email,
                  company: inv.client.company,
                }
              : null,
          };

          if (provider === 'quickbooks') {
            await quickbooks.pushInvoice(
              tokens.accessToken,
              tokens.realmId!,
              invoiceData
            );
          } else {
            await xero.pushInvoice(
              tokens.accessToken,
              tokens.tenantId!,
              invoiceData
            );
          }
          itemsSynced++;
        } catch (err) {
          itemsFailed++;
          errors.push(
            `Invoice ${inv.invoice_number}: ${err instanceof Error ? err.message : 'Unknown error'}`
          );
        }
      }
    }

    // ── PULL: fetch invoices from accounting system ──
    if (syncDir === 'pull' || syncDir === 'bidirectional') {
      const sinceDate = integration?.last_synced_at
        ? new Date(integration.last_synced_at)
        : undefined;

      if (provider === 'quickbooks') {
        const pulled = await quickbooks.pullInvoices(
          tokens.accessToken,
          tokens.realmId!,
          sinceDate
        );
        itemsSynced += pulled.length;
      } else {
        const pulled = await xero.pullInvoices(
          tokens.accessToken,
          tokens.tenantId!,
          sinceDate
        );
        itemsSynced += pulled.length;
      }
    }

    // Update sync log
    const finalStatus = itemsFailed > 0 ? (itemsSynced > 0 ? 'partial' : 'failed') : 'completed';

    if (syncLog) {
      await supabase
        .from('sync_logs')
        .update({
          status: finalStatus,
          items_synced: itemsSynced,
          items_failed: itemsFailed,
          error_message: errors.length > 0 ? errors.join('; ') : null,
          details: { errors },
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncLog.id);
    }

    // Update last_synced_at
    await supabase
      .from('accounting_integrations')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', tokens.integrationId);

    revalidatePath('/settings/integrations');
    return { success: true, data: { itemsSynced, itemsFailed } };
  } catch (err) {
    // Update sync log with failure
    if (syncLog) {
      await supabase
        .from('sync_logs')
        .update({
          status: 'failed',
          items_synced: itemsSynced,
          items_failed: itemsFailed,
          error_message: err instanceof Error ? err.message : 'Unknown error',
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncLog.id);
    }

    return {
      success: false,
      error: err instanceof Error ? err.message : 'Sync failed',
      data: { itemsSynced, itemsFailed },
    };
  }
}

// ── Get sync history ────────────────────────────────────────────────────────

export async function getSyncHistory(): Promise<ActionResult<SyncLog[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('sync_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(20);

  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as SyncLog[] };
}
