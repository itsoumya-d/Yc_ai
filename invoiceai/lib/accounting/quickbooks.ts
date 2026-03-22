/**
 * QuickBooks Online API adapter.
 * Handles invoice/payment/customer CRUD and token refresh.
 *
 * API docs: https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities
 */

const QBO_BASE_URL = process.env.QBO_API_BASE_URL ?? 'https://quickbooks.api.intuit.com';
const QBO_SANDBOX_URL = 'https://sandbox-quickbooks.api.intuit.com';

function getBaseUrl(): string {
  return process.env.NODE_ENV === 'production' ? QBO_BASE_URL : QBO_SANDBOX_URL;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface QBOTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface QBOInvoiceLine {
  DetailType: 'SalesItemLineDetail';
  Amount: number;
  Description?: string;
  SalesItemLineDetail: {
    Qty: number;
    UnitPrice: number;
    ItemRef?: { value: string; name: string };
  };
}

interface QBOInvoice {
  Id?: string;
  SyncToken?: string;
  DocNumber?: string;
  TxnDate?: string;
  DueDate?: string;
  CustomerRef: { value: string; name?: string };
  Line: QBOInvoiceLine[];
  CurrencyRef?: { value: string };
  TotalAmt?: number;
  Balance?: number;
  EmailStatus?: string;
  BillEmail?: { Address: string };
  CustomerMemo?: { value: string };
  PrivateNote?: string;
  MetaData?: { CreateTime: string; LastUpdatedTime: string };
}

interface QBOCustomer {
  Id?: string;
  SyncToken?: string;
  DisplayName: string;
  CompanyName?: string;
  PrimaryEmailAddr?: { Address: string };
  PrimaryPhone?: { FreeFormNumber: string };
  BillAddr?: {
    Line1?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
  };
}

interface QBOPayment {
  Id?: string;
  TotalAmt: number;
  CustomerRef: { value: string };
  CurrencyRef?: { value: string };
  TxnDate?: string;
  Line: Array<{
    Amount: number;
    LinkedTxn: Array<{ TxnId: string; TxnType: 'Invoice' }>;
  }>;
  PaymentMethodRef?: { value: string };
  PrivateNote?: string;
}

// ── Helper: API request ─────────────────────────────────────────────────────

async function qboRequest<T>(
  method: 'GET' | 'POST',
  path: string,
  accessToken: string,
  realmId: string,
  body?: unknown
): Promise<T> {
  const url = `${getBaseUrl()}/v3/company/${realmId}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
  };

  const init: RequestInit = { method, headers };

  if (body) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  const res = await fetch(url, init);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`QBO API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ── Token refresh ───────────────────────────────────────────────────────────

export async function refreshToken(refreshToken: string): Promise<QBOTokens> {
  const clientId = process.env.QBO_CLIENT_ID!;
  const clientSecret = process.env.QBO_CLIENT_SECRET!;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`QBO token refresh failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<QBOTokens>;
}

// ── Revoke token ────────────────────────────────────────────────────────────

export async function revokeToken(token: string): Promise<void> {
  const clientId = process.env.QBO_CLIENT_ID!;
  const clientSecret = process.env.QBO_CLIENT_SECRET!;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  await fetch('https://developer.api.intuit.com/v2/oauth2/tokens/revoke', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify({ token }),
  });
}

// ── Invoice operations ──────────────────────────────────────────────────────

/**
 * Map an InvoiceAI invoice to QBO invoice format and create/update in QuickBooks.
 */
export async function pushInvoice(
  accessToken: string,
  realmId: string,
  invoice: {
    id: string;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    currency: string;
    notes: string | null;
    items: Array<{ description: string; quantity: number; unit_price: number; amount: number }>;
    client: { name: string; email: string; company: string | null } | null;
    qbo_invoice_id?: string;
    qbo_sync_token?: string;
  }
): Promise<{ qboInvoiceId: string; syncToken: string }> {
  const lines: QBOInvoiceLine[] = invoice.items.map((item) => ({
    DetailType: 'SalesItemLineDetail' as const,
    Amount: item.amount,
    Description: item.description,
    SalesItemLineDetail: {
      Qty: item.quantity,
      UnitPrice: item.unit_price,
    },
  }));

  // Add a subtotal line required by QBO
  lines.push({
    DetailType: 'SalesItemLineDetail' as const,
    Amount: invoice.items.reduce((sum, i) => sum + i.amount, 0),
    SalesItemLineDetail: { Qty: 1, UnitPrice: 0 },
  });

  const qboInvoice: QBOInvoice = {
    DocNumber: invoice.invoice_number,
    TxnDate: invoice.issue_date,
    DueDate: invoice.due_date,
    CustomerRef: { value: '1', name: invoice.client?.name ?? 'Customer' },
    CurrencyRef: { value: invoice.currency },
    Line: lines,
    CustomerMemo: invoice.notes ? { value: invoice.notes } : undefined,
  };

  // Update existing
  if (invoice.qbo_invoice_id && invoice.qbo_sync_token) {
    qboInvoice.Id = invoice.qbo_invoice_id;
    qboInvoice.SyncToken = invoice.qbo_sync_token;
  }

  const result = await qboRequest<{ Invoice: QBOInvoice }>(
    'POST',
    '/invoice?minorversion=73',
    accessToken,
    realmId,
    qboInvoice
  );

  return {
    qboInvoiceId: result.Invoice.Id!,
    syncToken: result.Invoice.SyncToken!,
  };
}

/**
 * Fetch invoices from QBO created/updated since a given date.
 */
export async function pullInvoices(
  accessToken: string,
  realmId: string,
  since?: Date
): Promise<Array<{
  id: string;
  docNumber: string;
  txnDate: string;
  dueDate: string;
  customerName: string;
  customerId: string;
  total: number;
  balance: number;
  currency: string;
  lines: Array<{ description: string; quantity: number; unitPrice: number; amount: number }>;
}>> {
  let query = "SELECT * FROM Invoice";
  if (since) {
    query += ` WHERE MetaData.LastUpdatedTime > '${since.toISOString()}'`;
  }
  query += " ORDERBY MetaData.LastUpdatedTime DESC MAXRESULTS 100";

  const result = await qboRequest<{
    QueryResponse: { Invoice?: QBOInvoice[] };
  }>('GET', `/query?query=${encodeURIComponent(query)}&minorversion=73`, accessToken, realmId);

  const invoices = result.QueryResponse.Invoice ?? [];

  return invoices.map((inv) => ({
    id: inv.Id!,
    docNumber: inv.DocNumber ?? '',
    txnDate: inv.TxnDate ?? '',
    dueDate: inv.DueDate ?? '',
    customerName: inv.CustomerRef.name ?? '',
    customerId: inv.CustomerRef.value,
    total: inv.TotalAmt ?? 0,
    balance: inv.Balance ?? 0,
    currency: inv.CurrencyRef?.value ?? 'USD',
    lines: inv.Line.filter((l) => l.DetailType === 'SalesItemLineDetail' && l.SalesItemLineDetail?.Qty).map(
      (l) => ({
        description: l.Description ?? '',
        quantity: l.SalesItemLineDetail.Qty,
        unitPrice: l.SalesItemLineDetail.UnitPrice,
        amount: l.Amount,
      })
    ),
  }));
}

// ── Payment operations ──────────────────────────────────────────────────────

/**
 * Record a payment in QBO against an invoice.
 */
export async function pushPayment(
  accessToken: string,
  realmId: string,
  payment: {
    amount: number;
    currency: string;
    customer_id: string;
    qbo_invoice_id: string;
    date?: string;
    note?: string;
  }
): Promise<{ qboPaymentId: string }> {
  const qboPayment: QBOPayment = {
    TotalAmt: payment.amount,
    CustomerRef: { value: payment.customer_id },
    CurrencyRef: { value: payment.currency },
    TxnDate: payment.date ?? new Date().toISOString().split('T')[0],
    Line: [
      {
        Amount: payment.amount,
        LinkedTxn: [{ TxnId: payment.qbo_invoice_id, TxnType: 'Invoice' }],
      },
    ],
    PrivateNote: payment.note,
  };

  const result = await qboRequest<{ Payment: { Id: string } }>(
    'POST',
    '/payment?minorversion=73',
    accessToken,
    realmId,
    qboPayment
  );

  return { qboPaymentId: result.Payment.Id };
}

// ── Customer operations ─────────────────────────────────────────────────────

/**
 * Sync InvoiceAI clients to QBO customers. Creates or updates by DisplayName match.
 */
export async function syncCustomers(
  accessToken: string,
  realmId: string,
  customers: Array<{
    name: string;
    company: string | null;
    email: string;
    phone: string | null;
    address: string | null;
  }>
): Promise<{ created: number; updated: number; errors: string[] }> {
  const stats = { created: 0, updated: 0, errors: [] as string[] };

  for (const customer of customers) {
    try {
      // Check if customer exists
      const query = `SELECT * FROM Customer WHERE DisplayName = '${customer.name.replace(/'/g, "\\'")}'`;
      const existing = await qboRequest<{
        QueryResponse: { Customer?: QBOCustomer[] };
      }>('GET', `/query?query=${encodeURIComponent(query)}&minorversion=73`, accessToken, realmId);

      const qboCustomer: QBOCustomer = {
        DisplayName: customer.name,
        CompanyName: customer.company ?? undefined,
        PrimaryEmailAddr: { Address: customer.email },
        PrimaryPhone: customer.phone ? { FreeFormNumber: customer.phone } : undefined,
        BillAddr: customer.address ? { Line1: customer.address } : undefined,
      };

      if (existing.QueryResponse.Customer?.length) {
        // Update
        qboCustomer.Id = existing.QueryResponse.Customer[0].Id;
        qboCustomer.SyncToken = existing.QueryResponse.Customer[0].SyncToken;
        await qboRequest('POST', '/customer?minorversion=73', accessToken, realmId, qboCustomer);
        stats.updated++;
      } else {
        // Create
        await qboRequest('POST', '/customer?minorversion=73', accessToken, realmId, qboCustomer);
        stats.created++;
      }
    } catch (err) {
      stats.errors.push(`${customer.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return stats;
}
