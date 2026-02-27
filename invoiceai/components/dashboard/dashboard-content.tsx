'use client';

import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AnimatedStatCard } from '@/components/ui/animated-stat-card';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { TopClientsTable } from '@/components/dashboard/top-clients-table';
import { CashFlowForecast } from '@/components/dashboard/cash-flow-forecast';
import { PaymentMethodsChart } from '@/components/dashboard/payment-methods-chart';
import { InvoiceStatusChart } from '@/components/dashboard/invoice-status-chart';
import { PaymentAgingChart } from '@/components/dashboard/payment-aging-chart';
import { MRRWidget } from '@/components/dashboard/mrr-widget';
import { DateRangeFilter } from '@/components/dashboard/date-range-filter';
import { formatCurrency } from '@/lib/utils';
import { exportAnalyticsToCSV } from '@/lib/actions/analytics';
import type { AnalyticsData } from '@/lib/actions/analytics';
import type { ReportData } from '@/lib/actions/reports';

interface DashboardContentProps {
  analytics: AnalyticsData;
  report: ReportData;
}

export function DashboardContent({ analytics, report }: DashboardContentProps) {
  const searchParams = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = useCallback(async () => {
    setIsExporting(true);
    try {
      const start = searchParams.get('start') || undefined;
      const end = searchParams.get('end') || undefined;

      const dateRange = start && end
        ? { start, end }
        : undefined;

      const result = await exportAnalyticsToCSV(
        dateRange ?? {
          start: new Date(new Date().setMonth(new Date().getMonth() - 11)).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0],
        }
      );

      if (result.data) {
        const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoiceai-analytics-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      {/* Date Range Filter + Export */}
      <DateRangeFilter onExportCSV={handleExportCSV} isExporting={isExporting} />

      {/* Stats Grid — 4 animated cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatedStatCard
          title="Revenue This Month"
          value={formatCurrency(report.revenue.thisMonth)}
          index={0}
          trend={
            report.revenue.trend
              ? {
                  value: report.revenue.trend,
                  isPositive: report.revenue.trend > 0,
                }
              : undefined
          }
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
        <AnimatedStatCard
          title="Outstanding"
          value={formatCurrency(report.outstanding.total)}
          index={1}
          description={`${report.outstanding.count ?? 0} invoices`}
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
        <AnimatedStatCard
          title="Overdue"
          value={formatCurrency(report.overdue.total)}
          index={2}
          description={report.overdue.count > 0 ? `${report.overdue.count} invoices need attention` : 'All clear!'}
          className={report.overdue.count > 0 ? 'border-red-200 bg-red-50/30' : ''}
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          }
        />
        <AnimatedStatCard
          title="Avg Days to Pay"
          value={
            report.avgDaysToPayment
              ? `${report.avgDaysToPayment} days`
              : 'N/A'
          }
          index={3}
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          }
        />
      </div>

      {/* Revenue Trend Chart — full width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <RevenueChart data={analytics.revenue_trend} />
      </motion.div>

      {/* Three-column: Invoice Status + Payment Aging + MRR */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <InvoiceStatusChart data={analytics.invoice_status_breakdown} />
        <PaymentAgingChart data={analytics.payment_aging} />
        <MRRWidget
          currentMRR={analytics.mrr.currentMRR}
          previousMRR={analytics.mrr.previousMRR}
          activeRecurring={analytics.mrr.activeRecurring}
          projectedAnnual={analytics.mrr.projectedAnnual}
        />
      </div>

      {/* Cash Flow + Payment Methods — 2:1 grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <CashFlowForecast data={analytics.cash_flow_forecast} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <PaymentMethodsChart data={analytics.payment_methods} />
        </motion.div>
      </div>

      {/* Top Clients Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
      >
        <TopClientsTable clients={analytics.top_clients} />
      </motion.div>
    </div>
  );
}
