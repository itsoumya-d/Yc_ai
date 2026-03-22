/**
 * Xero Accounting API adapter.
 * Handles invoice/payment/contact CRUD and token refresh.
 *
 * API docs: https://developer.xero.com/documentation/api/accounting
 */

const XERO_API_URL = 'https://api.xero.com/api.xro/2.0';
const XERO_IDENTITY_URL = 'https://identity.xero.com';

// ── Types ────────────────────────────────────────────────────────────────────

export interface XeroTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  id_token?: string;
}

export interface XeroTenant {
  id: string;
  authEventId: string;
  tenantId: string;
  tenantType: string;
  tenantName: string;
}

interface XeroLineItem {
  Description: string;
  Quantity: number;
  UnitAmount: number;
  LineAmount: number;
  AccountCode?: string;
  TaxType?: string;
}

interface XeroInvoice {
  InvoiceID?: string;
  InvoiceNumber?: string;
  Type: 'ACCREC' | 'ACCPAY';
  Contact: { ContactID?: string; Name: string; EmailAddress?: string };
  LineItems: XeroLineItem[];
  Date?: string;
  DueDate?: string;
  CurrencyCode?: string;
  Status?: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED' | 'PAID' | 'VOIDED' | 'DELETED';
  Reference?: string;
  Total?: number;
  AmountDue?: number;
  AmountPaid?: number;
  UpdatedDateUTC?: string;
}

interface XeroContact {
  ContactID?: string;
  Name: string;
  EmailAddress?: string;
  Phones?: Array<{ PhoneType: string; PhoneNumber: string }>;
  Addresses?: Array<{ AddressType: string; AddressLine1?: string; City?: string; Region?: string; PostalCode?: string }>;
  CompanyNumber?: string;
}

interface XeroPayment {
  PaymentID?: string;
  Invoice: { InvoiceID: string };
  Account: { Code: string };
  Amount: number;
  Date?: string;
  Reference?: string;
  CurrencyRate?: number;
}

// ── Helper: API request ─────────────────────────────────────────────────────

async function xeroRequest<T>(
  method: 'GET' | 'POST' | 'PUT',
  path: string,
  accessToken: string,
  tenantId: string,
  body?: unknown
): Promise<T> {
  const url = `${XERO_API_URL}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'Xero-Tenant-Id': tenantId,
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
    throw new Error(`Xero API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ── Token refresh ───────────────────────────────────────────────────────────

export async function refreshToken(refreshTokenValue: string): Promise<XeroTokens> {
  const clientId = process.env.XERO_CLIENT_ID!;
  const clientSecret = process.env.XERO_CLIENT_SECRET!;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${XERO_IDENTITY_URL}/connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshTokenValue,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Xero token refresh failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<XeroTokens>;
}

// ── Revoke token ────────────────────────────────────────────────────────────

export async function revokeToken(token: string): Promise<void> {
  const clientId = process.env.XERO_CLIENT_ID!;
  const clientSecret = process.env.XERO_CLIENT_SECRET!;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  await fetch(`${XERO_IDENTITY_URL}/connect/revocation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({ token }),
  });
}

// ── Get connected tenants ───────────────────────────────────────────────────

export async function getTenants(accessToken: string): Promise<XeroTenant[]> {
  const res = await fetch('https://api.xero.com/connections', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to get Xero tenants: ${res.status}`);
  }

  return res.json() as Promise<XeroTenant[]>;
}

// ── Invoice operations ──────────────────────────────────────────────────────

/**
 * Map InvoiceAI invoice to Xero format and create/update.
 */
export async function pushInvoice(
  accessToken: string,
  tenantId: string,
  invoice: {
    id: string;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    currency: string;
    notes: string | null;
    items: Array<{ description: string; quantity: number; unit_price: number; amount: number }>;
    client: { name: string; email: string; company: string | null } | null;
    xero_invoice_id?: string;
  }
): Promise<{ xeroInvoiceId: string }> {
  const lineItems: XeroLineItem[] = invoice.items.map((item) => ({
    Description: item.description,
    Quantity: item.quantity,
    UnitAmount: item.unit_price,
    LineAmount: item.amount,
  }));

  const xeroInvoice: XeroInvoice = {
    Type: 'ACCREC',
    InvoiceNumber: invoice.invoice_number,
    Contact: {
      Name: invoice.client?.name ?? 'Unknown Customer',
      EmailAddress: invoice.client?.email,
    },
    LineItems: lineItems,
    Date: invoice.issue_date,
    DueDate: invoice.due_date,
    CurrencyCode: invoice.currency,
    Status: 'AUTHORISED',
    Reference: `InvoiceAI:${invoice.id}`,
  };

  if (invoice.xero_invoice_id) {
    xeroInvoice.InvoiceID = invoice.xero_invoice_id;
  }

  const endpoint = invoice.xero_invoice_id ? '/Invoices' : '/Invoices';
  const method = invoice.xero_invoice_id ? 'POST' : 'PUT';

  const result = await xeroRequest<{ Invoices: XeroInvoice[] }>(
    method,
    endpoint,
    accessToken,
    tenantId,
    { Invoices: [xeroInvoice] }
  );

  return { xeroInvoiceId: result.Invoices[0].InvoiceID! };
}

/**
 * Fetch invoices from Xero since a given date.
 */
export async function pullInvoices(
  accessToken: string,
  tenantId: string,
  since?: Date
): Promise<Array<{
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  contactName: string;
  contactId: string;
  total: number;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: string;
  lines: Array<{ description: string; quantity: number; unitAmount: number; lineAmount: number }>;
}>> {
  let path = '/Invoices?Statuses=AUTHORISED,PAID,SUBMITTED';
  if (since) {
    // Xero uses If-Modified-Since header, but we can also use where clause
    path += `&where=UpdatedDateUTC>DateTime(${since.getFullYear()},${since.getMonth() + 1},${since.getDate()})`;
  }
  path += '&order=UpdatedDateUTC DESC&pageSize=100';

  const result = await xeroRequest<{ Invoices: XeroInvoice[] }>(
    'GET',
    path,
    accessToken,
    tenantId
  );

  return (result.Invoices ?? [])
    .filter((inv) => inv.Type === 'ACCREC')
    .map((inv) => ({
      id: inv.InvoiceID!,
      invoiceNumber: inv.InvoiceNumber ?? '',
      date: inv.Date ?? '',
      dueDate: inv.DueDate ?? '',
      contactName: inv.Contact.Name,
      contactId: inv.Contact.ContactID ?? '',
      total: inv.Total ?? 0,
      amountDue: inv.AmountDue ?? 0,
      amountPaid: inv.AmountPaid ?? 0,
      currency: inv.CurrencyCode ?? 'USD',
      status: inv.Status ?? 'DRAFT',
      lines: inv.LineItems.map((l) => ({
        description: l.Description,
        quantity: l.Quantity,
        unitAmount: l.UnitAmount,
        lineAmount: l.LineAmount,
      })),
    }));
}

// ── Payment operations ──────────────────────────────────────────────────────

/**
 * Record a payment in Xero against an invoice.
 */
export async function pushPayment(
  accessToken: string,
  tenantId: string,
  payment: {
    amount: number;
    xero_invoice_id: string;
    date?: string;
    reference?: string;
    account_code?: string;
  }
): Promise<{ xeroPaymentId: string }> {
  const xeroPayment: XeroPayment = {
    Invoice: { InvoiceID: payment.xero_invoice_id },
    Account: { Code: payment.account_code ?? '090' }, // Default: bank account
    Amount: payment.amount,
    Date: payment.date ?? new Date().toISOString().split('T')[0],
    Reference: payment.reference,
  };

  const result = await xeroRequest<{ Payments: Array<{ PaymentID: string }> }>(
    'PUT',
    '/Payments',
    accessToken,
    tenantId,
    { Payments: [xeroPayment] }
  );

  return { xeroPaymentId: result.Payments[0].PaymentID };
}

// ── Contact (customer) operations ───────────────────────────────────────────

/**
 * Sync InvoiceAI clients to Xero contacts.
 */
export async function syncContacts(
  accessToken: string,
  tenantId: string,
  contacts: Array<{
    name: string;
    company: string | null;
    email: string;
    phone: string | null;
    address: string | null;
  }>
): Promise<{ created: number; updated: number; errors: string[] }> {
  const stats = { created: 0, updated: 0, errors: [] as string[] };

  for (const contact of contacts) {
    try {
      // Search for existing contact by name
      const searchPath = `/Contacts?where=Name=="${encodeURIComponent(contact.name)}"`;
      const existing = await xeroRequest<{ Contacts: XeroContact[] }>(
        'GET',
        searchPath,
        accessToken,
        tenantId
      );

      const xeroContact: XeroContact = {
        Name: contact.name,
        EmailAddress: contact.email,
        Phones: contact.phone
          ? [{ PhoneType: 'DEFAULT', PhoneNumber: contact.phone }]
          : undefined,
        Addresses: contact.address
          ? [{ AddressType: 'POBOX', AddressLine1: contact.address }]
          : undefined,
      };

      if (existing.Contacts?.length) {
        xeroContact.ContactID = existing.Contacts[0].ContactID;
        await xeroRequest('POST', '/Contacts', accessToken, tenantId, {
          Contacts: [xeroContact],
        });
        stats.updated++;
      } else {
        await xeroRequest('PUT', '/Contacts', accessToken, tenantId, {
          Contacts: [xeroContact],
        });
        stats.created++;
      }
    } catch (err) {
      stats.errors.push(`${contact.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return stats;
}
