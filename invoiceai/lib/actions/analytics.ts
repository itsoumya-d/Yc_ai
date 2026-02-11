'use server';

import { createClient } from '@/lib/supabase/server';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export interface RevenueDataPoint {
  date: string;
  paid: number;
  outstanding: number;
}

export interface ClientRevenueData {
  client_id: string;
  client_name: string;
  company: string | null;
  total_revenue: number;
  invoice_count: number;
  avg_invoice_value: number;
  payment_behavior: 'excellent' | 'good' | 'fair' | 'poor';
  trend_data: number[];
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  total_amount: number;
  percentage: number;
}

export interface CashFlowForecast {
  date: string;
  expected_inflow: number;
  recurring_revenue: number;
  pipeline_potential: number;
  total_forecast: number;
}

export interface InvoiceStatusBreakdown {
  status: string;
  count: number;
  amount: number;
}

export interface PaymentAgingBucket {
  label: string;
  count: number;
  amount: number;
  color: string;
}

export interface MRRData {
  currentMRR: number;
  previousMRR: number;
  activeRecurring: number;
  projectedAnnual: number;
}

export interface AnalyticsData {
  // Overview metrics
  total_revenue: number;
  total_outstanding: number;
  avg_invoice_value: number;
  avg_days_to_payment: number;

  // Time series
  revenue_trend: RevenueDataPoint[];

  // Client insights
  top_clients: ClientRevenueData[];

  // Payment analysis
  payment_methods: PaymentMethodBreakdown[];

  // Cash flow
  cash_flow_forecast: CashFlowForecast[];

  // Period comparison
  revenue_vs_last_period: number; // percentage change
  invoices_vs_last_period: number;

  // New: Invoice status breakdown
  invoice_status_breakdown: InvoiceStatusBreakdown[];

  // New: Payment aging buckets
  payment_aging: PaymentAgingBucket[];

  // New: MRR data
  mrr: MRRData;
}

export async function getAnalyticsData(
  dateRange: { start: string; end: string } = {
    start: startOfMonth(subMonths(new Date(), 11)).toISOString().split('T')[0],
    end: endOfMonth(new Date()).toISOString().split('T')[0],
  }
): Promise<ActionResult<AnalyticsData>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Get all invoices in date range
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(id, name, company),
        payments(*)
      `)
      .eq('user_id', user.id)
      .gte('issue_date', dateRange.start)
      .lte('issue_date', dateRange.end);

    if (invoicesError) throw invoicesError;

    // Get recurring invoices for forecasting
    const { data: recurringInvoices, error: recurringError } = await supabase
      .from('recurring_invoices')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (recurringError) throw recurringError;

    // Calculate overview metrics
    const paidInvoices = invoices?.filter(i => i.status === 'paid') || [];
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalOutstanding = invoices?.filter(i => ['sent', 'viewed', 'overdue'].includes(i.status))
      .reduce((sum, inv) => sum + inv.amount_due, 0) || 0;
    const avgInvoiceValue = paidInvoices.length > 0 ? totalRevenue / paidInvoices.length : 0;

    // Calculate average days to payment
    const paidWithDates = paidInvoices.filter(i => i.paid_at && i.sent_at);
    const avgDaysToPayment = paidWithDates.length > 0
      ? paidWithDates.reduce((sum, inv) => {
          const days = Math.floor((new Date(inv.paid_at!).getTime() - new Date(inv.sent_at!).getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / paidWithDates.length
      : 0;

    // Build revenue trend (monthly)
    const revenueTrend: RevenueDataPoint[] = [];
    const months = 12;
    for (let i = months - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(subMonths(new Date(), i));
      const monthKey = format(monthStart, 'yyyy-MM');

      const monthInvoices = invoices?.filter(inv => {
        const issueDate = new Date(inv.issue_date);
        return issueDate >= monthStart && issueDate <= monthEnd;
      }) || [];

      const paid = monthInvoices
        .filter(i => i.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0);

      const outstanding = monthInvoices
        .filter(i => ['sent', 'viewed', 'overdue'].includes(i.status))
        .reduce((sum, inv) => sum + inv.amount_due, 0);

      revenueTrend.push({
        date: monthKey,
        paid,
        outstanding,
      });
    }

    // Top clients by revenue
    const clientMap = new Map<string, any>();
    paidInvoices.forEach(inv => {
      if (inv.client) {
        const existing = clientMap.get(inv.client.id);
        if (existing) {
          existing.total_revenue += inv.total;
          existing.invoice_count += 1;
          existing.invoices.push(inv);
        } else {
          clientMap.set(inv.client.id, {
            client_id: inv.client.id,
            client_name: inv.client.name,
            company: inv.client.company,
            total_revenue: inv.total,
            invoice_count: 1,
            invoices: [inv],
          });
        }
      }
    });

    const topClients: ClientRevenueData[] = Array.from(clientMap.values())
      .map(client => {
        // Calculate average days to payment for this client
        const clientPaidInvoices = client.invoices.filter((i: any) => i.paid_at && i.sent_at);
        const avgDays = clientPaidInvoices.length > 0
          ? clientPaidInvoices.reduce((sum: number, inv: any) => {
              const days = Math.floor((new Date(inv.paid_at).getTime() - new Date(inv.sent_at).getTime()) / (1000 * 60 * 60 * 24));
              return sum + days;
            }, 0) / clientPaidInvoices.length
          : 30;

        // Determine payment behavior
        let payment_behavior: 'excellent' | 'good' | 'fair' | 'poor';
        if (avgDays <= 7) payment_behavior = 'excellent';
        else if (avgDays <= 15) payment_behavior = 'good';
        else if (avgDays <= 30) payment_behavior = 'fair';
        else payment_behavior = 'poor';

        // Get last 6 months trend
        const trend_data = [];
        for (let i = 5; i >= 0; i--) {
          const monthStart = startOfMonth(subMonths(new Date(), i));
          const monthEnd = endOfMonth(subMonths(new Date(), i));
          const monthTotal = client.invoices
            .filter((inv: any) => {
              const issueDate = new Date(inv.issue_date);
              return inv.status === 'paid' && issueDate >= monthStart && issueDate <= monthEnd;
            })
            .reduce((sum: number, inv: any) => sum + inv.total, 0);
          trend_data.push(monthTotal);
        }

        return {
          client_id: client.client_id,
          client_name: client.client_name,
          company: client.company,
          total_revenue: client.total_revenue,
          invoice_count: client.invoice_count,
          avg_invoice_value: client.total_revenue / client.invoice_count,
          payment_behavior,
          trend_data,
        };
      })
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 10);

    // Payment method breakdown
    const paymentMethodMap = new Map<string, { count: number; total: number }>();
    paidInvoices.forEach(inv => {
      inv.payments?.forEach((payment: any) => {
        if (payment.status === 'succeeded') {
          const method = payment.payment_method || 'manual';
          const existing = paymentMethodMap.get(method);
          if (existing) {
            existing.count += 1;
            existing.total += payment.amount;
          } else {
            paymentMethodMap.set(method, { count: 1, total: payment.amount });
          }
        }
      });
    });

    const totalPayments = Array.from(paymentMethodMap.values()).reduce((sum, m) => sum + m.total, 0);
    const paymentMethods: PaymentMethodBreakdown[] = Array.from(paymentMethodMap.entries())
      .map(([method, data]) => ({
        method: method.charAt(0).toUpperCase() + method.slice(1),
        count: data.count,
        total_amount: data.total,
        percentage: totalPayments > 0 ? (data.total / totalPayments) * 100 : 0,
      }))
      .sort((a, b) => b.total_amount - a.total_amount);

    // Cash flow forecast (next 90 days)
    const cashFlowForecast: CashFlowForecast[] = [];
    const today = new Date();

    for (let i = 0; i < 90; i += 30) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      const dateKey = format(forecastDate, 'yyyy-MM-dd');

      // Expected inflow from existing outstanding invoices
      const expectedInflow = invoices?.filter(inv => {
        if (!['sent', 'viewed'].includes(inv.status)) return false;
        const dueDate = new Date(inv.due_date);
        const windowStart = new Date(today);
        windowStart.setDate(today.getDate() + i);
        const windowEnd = new Date(windowStart);
        windowEnd.setDate(windowStart.getDate() + 30);
        return dueDate >= windowStart && dueDate < windowEnd;
      }).reduce((sum, inv) => sum + inv.amount_due, 0) || 0;

      // Recurring revenue (assuming monthly billing)
      const recurringRevenue = recurringInvoices?.reduce((sum, rec) => sum + rec.invoice_template.total, 0) || 0;

      // Pipeline potential (draft invoices with 50% probability)
      const pipelinePotential = invoices?.filter(inv => inv.status === 'draft')
        .reduce((sum, inv) => sum + (inv.total * 0.5), 0) || 0;

      cashFlowForecast.push({
        date: dateKey,
        expected_inflow: expectedInflow,
        recurring_revenue: recurringRevenue,
        pipeline_potential: pipelinePotential / 3, // Spread over 3 months
        total_forecast: expectedInflow + recurringRevenue + (pipelinePotential / 3),
      });
    }

    // Compare to last period
    const currentPeriodDays = Math.floor((new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / (1000 * 60 * 60 * 24));
    const lastPeriodStart = new Date(dateRange.start);
    lastPeriodStart.setDate(lastPeriodStart.getDate() - currentPeriodDays);
    const lastPeriodEnd = new Date(dateRange.start);
    lastPeriodEnd.setDate(lastPeriodEnd.getDate() - 1);

    const { data: lastPeriodInvoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .gte('issue_date', lastPeriodStart.toISOString().split('T')[0])
      .lte('issue_date', lastPeriodEnd.toISOString().split('T')[0]);

    const lastPeriodRevenue = lastPeriodInvoices?.filter(i => i.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0) || 0;
    const lastPeriodInvoiceCount = lastPeriodInvoices?.length || 0;

    const revenueVsLastPeriod = lastPeriodRevenue > 0
      ? ((totalRevenue - lastPeriodRevenue) / lastPeriodRevenue) * 100
      : 0;
    const invoicesVsLastPeriod = lastPeriodInvoiceCount > 0
      ? ((paidInvoices.length - lastPeriodInvoiceCount) / lastPeriodInvoiceCount) * 100
      : 0;

    // Invoice status breakdown
    const statusMap = new Map<string, { count: number; amount: number }>();
    invoices?.forEach(inv => {
      const existing = statusMap.get(inv.status);
      if (existing) {
        existing.count += 1;
        existing.amount += inv.total;
      } else {
        statusMap.set(inv.status, { count: 1, amount: inv.total });
      }
    });
    const invoiceStatusBreakdown: InvoiceStatusBreakdown[] = Array.from(statusMap.entries())
      .map(([status, data]) => ({ status, count: data.count, amount: data.amount }))
      .sort((a, b) => b.count - a.count);

    // Payment aging buckets
    const agingBuckets: PaymentAgingBucket[] = [
      { label: 'Current', count: 0, amount: 0, color: '#16a34a' },
      { label: '1-30 days', count: 0, amount: 0, color: '#f59e0b' },
      { label: '31-60 days', count: 0, amount: 0, color: '#f97316' },
      { label: '61-90 days', count: 0, amount: 0, color: '#ef4444' },
      { label: '90+ days', count: 0, amount: 0, color: '#991b1b' },
    ];

    const outstandingInvoices = invoices?.filter(inv =>
      ['sent', 'viewed', 'overdue', 'partial'].includes(inv.status)
    ) || [];

    outstandingInvoices.forEach(inv => {
      const dueDate = new Date(inv.due_date);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      let bucketIndex: number;
      if (daysOverdue <= 0) bucketIndex = 0; // Current (not yet due)
      else if (daysOverdue <= 30) bucketIndex = 1;
      else if (daysOverdue <= 60) bucketIndex = 2;
      else if (daysOverdue <= 90) bucketIndex = 3;
      else bucketIndex = 4;

      agingBuckets[bucketIndex].count += 1;
      agingBuckets[bucketIndex].amount += inv.amount_due;
    });

    // MRR from recurring invoices
    const activeRecurringCount = recurringInvoices?.length || 0;
    const currentMRR = recurringInvoices?.reduce((sum, rec) => {
      const template = rec.invoice_template;
      const total = template?.total || 0;
      // Normalize to monthly based on frequency
      switch (rec.frequency) {
        case 'weekly': return sum + (total * 4.33);
        case 'biweekly': return sum + (total * 2.17);
        case 'monthly': return sum + total;
        case 'quarterly': return sum + (total / 3);
        case 'semiannually': return sum + (total / 6);
        case 'annually': return sum + (total / 12);
        default: return sum + total;
      }
    }, 0) || 0;

    // Estimate previous MRR (simple: assume same structure, look at last month's recurring payments)
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
    const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
    const lastMonthRecurringRevenue = paidInvoices.filter(inv => {
      const issueDate = new Date(inv.issue_date);
      return issueDate >= lastMonthStart && issueDate <= lastMonthEnd && inv.recurring_invoice_id;
    }).reduce((sum, inv) => sum + inv.total, 0);

    const projectedAnnual = currentMRR * 12;

    return {
      data: {
        total_revenue: totalRevenue,
        total_outstanding: totalOutstanding,
        avg_invoice_value: avgInvoiceValue,
        avg_days_to_payment: avgDaysToPayment,
        revenue_trend: revenueTrend,
        top_clients: topClients,
        payment_methods: paymentMethods,
        cash_flow_forecast: cashFlowForecast,
        revenue_vs_last_period: revenueVsLastPeriod,
        invoices_vs_last_period: invoicesVsLastPeriod,
        invoice_status_breakdown: invoiceStatusBreakdown,
        payment_aging: agingBuckets,
        mrr: {
          currentMRR,
          previousMRR: lastMonthRecurringRevenue,
          activeRecurring: activeRecurringCount,
          projectedAnnual,
        },
      },
    };
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return { error: error.message || 'Failed to fetch analytics' };
  }
}

// Export analytics data to CSV
export async function exportAnalyticsToCSV(dateRange: { start: string; end: string }): Promise<ActionResult<string>> {
  try {
    const result = await getAnalyticsData(dateRange);
    if (result.error || !result.data) {
      return { error: result.error || 'No data to export' };
    }

    const data = result.data;

    // Build CSV content
    let csv = 'InvoiceAI Analytics Report\n';
    csv += `Period: ${dateRange.start} to ${dateRange.end}\n\n`;

    csv += 'OVERVIEW METRICS\n';
    csv += `Total Revenue,$${data.total_revenue.toFixed(2)}\n`;
    csv += `Total Outstanding,$${data.total_outstanding.toFixed(2)}\n`;
    csv += `Average Invoice Value,$${data.avg_invoice_value.toFixed(2)}\n`;
    csv += `Average Days to Payment,${data.avg_days_to_payment.toFixed(1)}\n\n`;

    csv += 'REVENUE TREND (Monthly)\n';
    csv += 'Month,Paid,Outstanding\n';
    data.revenue_trend.forEach(point => {
      csv += `${point.date},$${point.paid.toFixed(2)},$${point.outstanding.toFixed(2)}\n`;
    });
    csv += '\n';

    csv += 'TOP CLIENTS\n';
    csv += 'Client,Company,Revenue,Invoices,Avg Value,Payment Behavior\n';
    data.top_clients.forEach(client => {
      csv += `${client.client_name},"${client.company || 'N/A'}",$${client.total_revenue.toFixed(2)},${client.invoice_count},$${client.avg_invoice_value.toFixed(2)},${client.payment_behavior}\n`;
    });
    csv += '\n';

    csv += 'CASH FLOW FORECAST (90 Days)\n';
    csv += 'Date,Expected Inflow,Recurring Revenue,Pipeline,Total Forecast\n';
    data.cash_flow_forecast.forEach(forecast => {
      csv += `${forecast.date},$${forecast.expected_inflow.toFixed(2)},$${forecast.recurring_revenue.toFixed(2)},$${forecast.pipeline_potential.toFixed(2)},$${forecast.total_forecast.toFixed(2)}\n`;
    });

    return { data: csv };
  } catch (error: any) {
    console.error('Error exporting analytics:', error);
    return { error: error.message || 'Failed to export analytics' };
  }
}
