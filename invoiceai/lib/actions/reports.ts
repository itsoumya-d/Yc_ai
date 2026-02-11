'use server';

import { createClient } from '@/lib/supabase/server';

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
}

export async function getReportData(): Promise<{ data?: ReportData; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Get all invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, client:clients(name)')
    .order('created_at', { ascending: false });

  if (!invoices) {
    return {
      data: {
        revenue: { total: 0, thisMonth: 0, lastMonth: 0, trend: 0 },
        outstanding: { total: 0, count: 0 },
        overdue: { total: 0, count: 0 },
        avgDaysToPayment: 0,
        invoicesByStatus: [],
        monthlyRevenue: [],
        topClients: [],
      },
    };
  }

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Revenue calculations
  const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

  const thisMonthRevenue = paidInvoices
    .filter((inv) => inv.paid_at && new Date(inv.paid_at) >= thisMonthStart)
    .reduce((sum, inv) => sum + inv.total, 0);

  const lastMonthRevenue = paidInvoices
    .filter(
      (inv) =>
        inv.paid_at &&
        new Date(inv.paid_at) >= lastMonthStart &&
        new Date(inv.paid_at) <= lastMonthEnd
    )
    .reduce((sum, inv) => sum + inv.total, 0);

  const trend = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : 0;

  // Outstanding
  const outstandingInvoices = invoices.filter((inv) =>
    ['sent', 'viewed', 'partial'].includes(inv.status)
  );
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.amount_due, 0);

  // Overdue
  const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue');
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.amount_due, 0);

  // Average days to payment
  const paidWithDates = paidInvoices.filter((inv) => inv.sent_at && inv.paid_at);
  const avgDays =
    paidWithDates.length > 0
      ? Math.round(
          paidWithDates.reduce((sum, inv) => {
            const sent = new Date(inv.sent_at!).getTime();
            const paid = new Date(inv.paid_at!).getTime();
            return sum + (paid - sent) / 86400000;
          }, 0) / paidWithDates.length
        )
      : 0;

  // Invoices by status
  const statusMap = new Map<string, { count: number; amount: number }>();
  for (const inv of invoices) {
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

  for (const inv of paidInvoices) {
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
  for (const inv of paidInvoices) {
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

  return {
    data: {
      revenue: {
        total: totalRevenue,
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        trend,
      },
      outstanding: { total: totalOutstanding, count: outstandingInvoices.length },
      overdue: { total: totalOverdue, count: overdueInvoices.length },
      avgDaysToPayment: avgDays,
      invoicesByStatus,
      monthlyRevenue,
      topClients,
    },
  };
}
