'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import Stripe from 'stripe';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export interface KPIs {
  mrr: number;
  arr: number;
  mrrGrowth: number;
  churnRate: number;
  newCustomers: number;
  totalCustomers: number;
  avgRevenuePerCustomer: number;
  payingCustomers: number;
}

export async function getStripeKPIs(): Promise<ActionResult<KPIs>> {
  const stripe = getStripe();
  if (!stripe) return { error: 'Stripe not configured' };

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get active subscriptions for MRR
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
      expand: ['data.items.data.price'],
    });

    let mrr = 0;
    for (const sub of subscriptions.data) {
      for (const item of sub.items.data) {
        const price = item.price;
        const amount = price.unit_amount ?? 0;
        if (price.recurring?.interval === 'year') {
          mrr += amount / 12;
        } else if (price.recurring?.interval === 'month') {
          mrr += amount;
        }
      }
    }
    mrr = Math.round(mrr / 100); // cents to dollars
    const arr = mrr * 12;

    // New customers this month
    const newCustomers = await stripe.customers.list({
      created: { gte: Math.floor(startOfMonth.getTime() / 1000) },
      limit: 100,
    });

    const totalCustomers = await stripe.customers.list({ limit: 1 });
    const total = totalCustomers.has_more ? 9999 : totalCustomers.data.length;

    // Churn (cancelled subscriptions this month)
    const cancelled = await stripe.subscriptions.list({
      status: 'canceled',
      created: { gte: Math.floor(startOfLastMonth.getTime() / 1000), lt: Math.floor(endOfLastMonth.getTime() / 1000) },
      limit: 100,
    });
    const churnRate = subscriptions.data.length > 0
      ? parseFloat(((cancelled.data.length / subscriptions.data.length) * 100).toFixed(1))
      : 0;

    // Last month MRR for growth calculation
    const lastMonthSubs = await stripe.subscriptions.list({
      status: 'active',
      created: { lt: Math.floor(startOfMonth.getTime() / 1000) },
      limit: 100,
    });
    let lastMrr = 0;
    for (const sub of lastMonthSubs.data) {
      for (const item of sub.items.data) {
        const amount = item.price.unit_amount ?? 0;
        if (item.price.recurring?.interval === 'year') lastMrr += amount / 12;
        else if (item.price.recurring?.interval === 'month') lastMrr += amount;
      }
    }
    lastMrr = Math.round(lastMrr / 100);
    const mrrGrowth = lastMrr > 0 ? parseFloat((((mrr - lastMrr) / lastMrr) * 100).toFixed(1)) : 0;

    return {
      data: {
        mrr,
        arr,
        mrrGrowth,
        churnRate,
        newCustomers: newCustomers.data.length,
        totalCustomers: total,
        avgRevenuePerCustomer: subscriptions.data.length > 0 ? Math.round(mrr / subscriptions.data.length) : 0,
        payingCustomers: subscriptions.data.length,
      },
    };
  } catch (err) {
    return { error: String(err) };
  }
}

// ─── QuickBooks Integration ────────────────────────────────────────────────

export interface PLSummary {
  revenue: number;
  expenses: number;
  netIncome: number;
  grossProfit: number;
  startDate: string;
  endDate: string;
}

export async function getQuickBooksPL(): Promise<ActionResult<PLSummary>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: conn } = await supabase
    .from('qb_connections')
    .select('access_token, realm_id, token_expires_at')
    .eq('user_id', user.id)
    .single();

  if (!conn) return { error: 'QuickBooks not connected' };

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().slice(0, 10);
  const endDate = now.toISOString().slice(0, 10);

  const resp = await fetch(
    `https://quickbooks.api.intuit.com/v3/company/${conn.realm_id}/reports/ProfitAndLoss?start_date=${startDate}&end_date=${endDate}&summarize_column_by=Total`,
    {
      headers: {
        Authorization: `Bearer ${conn.access_token}`,
        Accept: 'application/json',
      },
    }
  );

  if (!resp.ok) return { error: `QuickBooks API error: ${resp.status}` };

  const report = await resp.json();
  const rows = report.Rows?.Row ?? [];

  const findTotal = (label: string): number => {
    for (const row of rows) {
      if (row.type === 'Section' && row.Header?.ColData?.[0]?.value?.toLowerCase().includes(label.toLowerCase())) {
        const summary = row.Summary?.ColData?.[1]?.value;
        return parseFloat(summary ?? '0');
      }
    }
    return 0;
  };

  const revenue = findTotal('income');
  const expenses = findTotal('expense');
  const grossProfit = findTotal('gross profit');
  const netIncome = findTotal('net income');

  return {
    data: { revenue, expenses, netIncome, grossProfit, startDate, endDate },
  };
}

export async function getQuickBooksAuthUrl(): Promise<ActionResult<string>> {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!clientId || !appUrl) return { error: 'QuickBooks not configured' };

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    scope: 'com.intuit.quickbooks.accounting',
    redirect_uri: `${appUrl}/api/auth/quickbooks/callback`,
    state: 'boardbrief',
  });
  return { data: `https://appcenter.intuit.com/connect/oauth2?${params}` };
}

export async function saveKPIsSnapshot(kpis: KPIs) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('kpi_snapshots').insert({
    user_id: user.id,
    mrr: kpis.mrr,
    arr: kpis.arr,
    mrr_growth: kpis.mrrGrowth,
    churn_rate: kpis.churnRate,
    new_customers: kpis.newCustomers,
    total_customers: kpis.totalCustomers,
    snapshot_date: new Date().toISOString().slice(0, 10),
  });
}
