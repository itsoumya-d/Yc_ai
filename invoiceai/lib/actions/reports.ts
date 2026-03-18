'use server';

import { createClient } from '@/lib/supabase/server';

export interface ARAgingBucket {
  label: string;
  amount: number;
  count: number;
  color: string;
}

export interface ReportData {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    trend: number;
  };
  outstanding: {
    total: number;
    count: number;
  };
  overdue: {
    total: number;
    count: number;
  };
  avgDaysToPayment: number;
  invoicesByStatus: { status: string; count: number; amount: number }[];
  monthlyRevenue: { month: string; revenue: number; invoices: number }[];
  topClients: { name: string; revenue: number; invoices: number }[];
  arAging: ARAgingBucket[];
}

export async function getReportData(): Promise<{ data?: ReportData; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString().split('T')[0];

  // Run all independent queries in parallel; select only the columns needed for each computation
  const [
    { data: paidInvoices },
    { data: outstandingInvoices },
    { data: overdueInvoices },
    { data: allStatusInvoices },
  ] = await Promise.all([
    // Paid invoices: need total, paid_at, sent_at, client name, recurring_invoice_id (for MRR)
    supabase
      .from('invoices')
      .select('total, amount_due, paid_at, sent_at, issue_date, client:clients(name)')
      .eq('user_id', user.id)
      .eq('status', 'paid')
      .gte('issue_date', twelveMonthsAgo)
      .order('issue_date', { ascending: false }),

    // Outstanding invoices: amount_due + due_date for AR aging
    supabase
      .from('invoices')
      .select('amount_due, due_date', { count: 'exact' })
      .eq('user_id', user.id)
      .in('status', ['sent', 'viewed', 'partial']),

    // Overdue invoices: only need amount_due for summing
    supabase
      .from('invoices')
      .select('amount_due', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('status', 'overdue'),

    // Status breakdown: need status + total for grouping
    supabase
      .from('invoices')
      .select('status, total')
      .eq('user_id', user.id),
  ]);

  const paid = paidInvoices ?? [];
  const outstanding = outstandingInvoices ?? [];
  const overdue = overdueInvoices ?? [];
  const allStatuses = allStatusInvoices ?? [];

  const empty: ReportData = {
    revenue: { total: 0, thisMonth: 0, lastMonth: 0, trend: 0 },
    outstanding: { total: 0, count: 0 },
    overdue: { total: 0, count: 0 },
    avgDaysToPayment: 0,
    invoicesByStatus: [],
    monthlyRevenue: [],
    topClients: [],
    arAging: [],
  };

  if (allStatuses.length === 0) {
    return { data: empty };
  }

  // Revenue calculations (paid invoices within 12-month window)
  const totalRevenue = paid.reduce((sum, inv) => sum + inv.total, 0);

  const thisMonthRevenue = paid
    .filter((inv) => inv.paid_at && inv.paid_at >= thisMonthStart)
    .reduce((sum, inv) => sum + inv.total, 0);

  const lastMonthRevenue = paid
    .filter(
      (inv) =>
        inv.paid_at &&
        inv.paid_at >= lastMonthStart &&
        inv.paid_at <= lastMonthEnd
    )
    .reduce((sum, inv) => sum + inv.total, 0);

  const trend =
    lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;

  // Outstanding / overdue aggregates
  const totalOutstanding = outstanding.reduce((sum, inv) => sum + inv.amount_due, 0);
  const totalOverdue = overdue.reduce((sum, inv) => sum + inv.amount_due, 0);

  // Average days to payment
  const paidWithDates = paid.filter((inv) => inv.sent_at && inv.paid_at);
  const avgDays =
    paidWithDates.length > 0
      ? Math.round(
          paidWithDates.reduce((sum, inv) => {
            const sent = new Date(inv.sent_at!).getTime();
            const paidAt = new Date(inv.paid_at!).getTime();
            return sum + (paidAt - sent) / 86400000;
          }, 0) / paidWithDates.length
        )
      : 0;

  // Invoices by status
  const statusMap = new Map<string, { count: number; amount: number }>();
  for (const inv of allStatuses) {
    const existing = statusMap.get(inv.status) ?? { count: 0, amount: 0 };
    existing.count++;
    existing.amount += inv.total;
    statusMap.set(inv.status, existing);
  }
  const invoicesByStatus = Array.from(statusMap.entries()).map(([status, data]) => ({
    status,
    ...data,
  }));

  // Monthly revenue (last 12 months)
  const monthlyMap = new Map<string, { revenue: number; invoices: number }>();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    monthlyMap.set(key, { revenue: 0, invoices: 0 });
  }

  for (const inv of paid) {
    if (!inv.paid_at) continue;
    const d = new Date(inv.paid_at);
    const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const existing = monthlyMap.get(key);
    if (existing) {
      existing.revenue += inv.total;
      existing.invoices++;
    }
  }

  const monthlyRevenue = Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month,
    ...data,
  }));

  // Top clients
  const clientMap = new Map<string, { revenue: number; invoices: number }>();
  for (const inv of paid) {
    const clientName = (inv.client as { name: string } | null)?.name ?? 'Unknown';
    const existing = clientMap.get(clientName) ?? { revenue: 0, invoices: 0 };
    existing.revenue += inv.total;
    existing.invoices++;
    clientMap.set(clientName, existing);
  }

  const topClients = Array.from(clientMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // AR aging buckets from outstanding invoices
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const arAgingBuckets: ARAgingBucket[] = [
    { label: '0-30 days',  amount: 0, count: 0, color: '#16a34a' },
    { label: '31-60 days', amount: 0, count: 0, color: '#f59e0b' },
    { label: '61-90 days', amount: 0, count: 0, color: '#f97316' },
    { label: '90+ days',   amount: 0, count: 0, color: '#dc2626' },
  ];

  for (const inv of outstanding) {
    const amountDue = inv.amount_due ?? 0;
    if (!inv.due_date) {
      // No due date: treat as current (0-30)
      arAgingBuckets[0].amount += amountDue;
      arAgingBuckets[0].count++;
      continue;
    }
    const dueDate = new Date(inv.due_date);
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / 86400000);

    if (daysOverdue <= 30) {
      arAgingBuckets[0].amount += amountDue;
      arAgingBuckets[0].count++;
    } else if (daysOverdue <= 60) {
      arAgingBuckets[1].amount += amountDue;
      arAgingBuckets[1].count++;
    } else if (daysOverdue <= 90) {
      arAgingBuckets[2].amount += amountDue;
      arAgingBuckets[2].count++;
    } else {
      arAgingBuckets[3].amount += amountDue;
      arAgingBuckets[3].count++;
    }
  }

  return {
    data: {
      revenue: {
        total: totalRevenue,
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        trend,
      },
      outstanding: { total: totalOutstanding, count: outstanding.length },
      overdue: { total: totalOverdue, count: overdue.length },
      avgDaysToPayment: avgDays,
      invoicesByStatus,
      monthlyRevenue,
      topClients,
      arAging: arAgingBuckets,
    },
  };
}
