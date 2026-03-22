'use server';

import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ReconciliationMatch {
  invoiceId: string;
  invoiceNumber: string;
  invoiceAmount: number;
  paymentAmount: number;
  matchConfidence: number;
  matchType: 'exact' | 'partial' | 'possible' | 'unmatched';
  discrepancy: number;
  suggestedAction: string;
  paymentDate?: string;
  paymentReference?: string;
}

export interface ReconciliationResult {
  matched: ReconciliationMatch[];
  unmatched: ReconciliationMatch[];
  summary: {
    totalInvoiced: number;
    totalReceived: number;
    outstanding: number;
    overpaid: number;
    reconciliationRate: number;
    aiInsights: string[];
  };
}

export async function reconcilePayments(
  bankStatementData: string,
  dateRange: { from: string; to: string }
): Promise<{ success: boolean; data?: ReconciliationResult; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  // Fetch invoices in date range
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, total_amount, status, due_date, client_id, clients(name)')
    .eq('user_id', user.id)
    .gte('due_date', dateRange.from)
    .lte('due_date', dateRange.to)
    .in('status', ['sent', 'overdue', 'paid']);

  if (!invoices?.length) {
    return { success: false, error: 'No invoices found in the selected date range' };
  }

  const invoiceSummary = invoices.map(inv => ({
    id: inv.id,
    number: inv.invoice_number,
    amount: inv.total_amount,
    status: inv.status,
    client: (inv.clients as any)?.name,
  }));

  // Use AI to match bank statement against invoices
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert accountant AI specializing in accounts receivable reconciliation.
        Analyze bank statement entries against invoices and identify matches, partial payments, and discrepancies.
        Return a JSON object with matched and unmatched items, and actionable insights.`,
      },
      {
        role: 'user',
        content: `Match these bank statement transactions against our invoices and provide reconciliation analysis.

INVOICES:
${JSON.stringify(invoiceSummary, null, 2)}

BANK STATEMENT TRANSACTIONS:
${bankStatementData}

Return JSON:
{
  "matched": [{
    "invoiceId": "uuid",
    "invoiceNumber": "INV-001",
    "invoiceAmount": 1500.00,
    "paymentAmount": 1500.00,
    "matchConfidence": 0.98,
    "matchType": "exact|partial|possible|unmatched",
    "discrepancy": 0,
    "suggestedAction": "Mark as paid",
    "paymentDate": "2026-03-10",
    "paymentReference": "REF123"
  }],
  "unmatched": [],
  "summary": {
    "totalInvoiced": 5000,
    "totalReceived": 4500,
    "outstanding": 500,
    "overpaid": 0,
    "reconciliationRate": 0.90,
    "aiInsights": ["3 invoices match exactly", "Client Acme Corp has a $50 underpayment"]
  }
}`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 4096,
  });

  const result = JSON.parse(response.choices[0].message.content ?? '{}') as ReconciliationResult;

  // Auto-update invoice statuses for exact matches
  // Build a set of valid invoice IDs from our query to validate AI output
  const validInvoiceIds = new Set(invoices.map(inv => inv.id));
  const exactMatches = result.matched.filter(m => m.matchType === 'exact' && m.matchConfidence > 0.95);
  for (const match of exactMatches) {
    // Validate that the AI-returned invoiceId actually belongs to the user's invoices
    if (!validInvoiceIds.has(match.invoiceId)) continue;
    await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: match.paymentDate,
        payment_reference: match.paymentReference,
        reconciled_at: new Date().toISOString(),
      })
      .eq('id', match.invoiceId)
      .eq('user_id', user.id);
  }

  return { success: true, data: result };
}

export async function getReconciliationHistory() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, data: [] };

  const { data } = await supabase
    .from('invoices')
    .select('id, invoice_number, total_amount, reconciled_at, payment_reference')
    .eq('user_id', user.id)
    .eq('status', 'paid')
    .not('reconciled_at', 'is', null)
    .order('reconciled_at', { ascending: false })
    .limit(20);

  return { success: true, data: data ?? [] };
}
