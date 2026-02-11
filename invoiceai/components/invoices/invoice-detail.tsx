'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { useToast } from '@/components/ui/toast';
import {
  updateInvoiceStatus,
  deleteInvoiceAction,
  duplicateInvoiceAction,
} from '@/lib/actions/invoices';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { InvoiceWithDetails, Invoice } from '@/types/database';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface InvoiceDetailProps {
  invoice: InvoiceWithDetails;
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState(false);

  const handleStatusChange = async (status: Invoice['status']) => {
    setActionLoading(true);
    const result = await updateInvoiceStatus(invoice.id, status);
    setActionLoading(false);

    if (result.success) {
      toast({
        title: `Invoice marked as ${status}`,
        variant: 'success',
      });
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleDuplicate = async () => {
    setActionLoading(true);
    const result = await duplicateInvoiceAction(invoice.id);
    setActionLoading(false);

    if (result.success && result.data) {
      toast({ title: 'Invoice duplicated', variant: 'success' });
      router.push(`/invoices/${result.data.id}`);
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this invoice? This cannot be undone.')) return;
    setActionLoading(true);
    const result = await deleteInvoiceAction(invoice.id);
    setActionLoading(false);

    if (result.success) {
      toast({ title: 'Invoice deleted', variant: 'success' });
      router.push('/invoices');
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const statusTimeline = [
    { label: 'Created', date: invoice.created_at, active: true },
    { label: 'Sent', date: invoice.sent_at, active: !!invoice.sent_at },
    { label: 'Viewed', date: invoice.viewed_at, active: !!invoice.viewed_at },
    { label: 'Paid', date: invoice.paid_at, active: !!invoice.paid_at },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/invoices')}
            className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
                {invoice.invoice_number}
              </h1>
              <Badge variant={invoice.status as 'paid' | 'overdue' | 'pending' | 'draft' | 'sent' | 'viewed' | 'partial' | 'cancelled'}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </Badge>
            </div>
            {invoice.client && (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {invoice.client.name}
                {invoice.client.company ? ` - ${invoice.client.company}` : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            PDF
          </Button>

          {invoice.status === 'draft' && (
            <Button onClick={() => handleStatusChange('sent')} disabled={actionLoading}>
              Send Invoice
            </Button>
          )}
          {['sent', 'viewed', 'overdue'].includes(invoice.status) && (
            <Button onClick={() => handleStatusChange('paid')} disabled={actionLoading}>
              Mark as Paid
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" disabled={actionLoading}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {invoice.status === 'draft' && (
                <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}/edit`)}>
                  Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDuplicate}>Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              {invoice.status !== 'cancelled' && (
                <DropdownMenuItem onClick={() => handleStatusChange('cancelled')}>
                  Cancel Invoice
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="mt-6">
        <div className="flex items-center gap-2">
          {statusTimeline.map((step, index) => (
            <div key={step.label} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                    step.active
                      ? 'bg-brand-600 text-white'
                      : 'border border-[var(--border)] text-[var(--muted-foreground)]'
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <p className={`text-sm font-medium ${step.active ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`}>
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {formatDate(step.date)}
                    </p>
                  )}
                </div>
              </div>
              {index < statusTimeline.length - 1 && (
                <div
                  className={`mx-3 h-px w-8 ${
                    step.active ? 'bg-brand-600' : 'bg-[var(--border)]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Amount Summary */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total" value={formatCurrency(invoice.total)} />
        <StatCard title="Paid" value={formatCurrency(invoice.amount_paid)} />
        <StatCard title="Balance Due" value={formatCurrency(invoice.amount_due)} />
      </div>

      {/* Content */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Line Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs font-medium uppercase text-[var(--muted-foreground)]">
                  <th className="pb-2">Description</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-right">Rate</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 text-sm">{item.description}</td>
                    <td className="py-3 text-right text-sm font-amount">{item.quantity}</td>
                    <td className="py-3 text-right text-sm font-amount">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="py-3 text-right text-sm font-amount font-medium">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[var(--border)]">
                  <td colSpan={3} className="pt-3 text-right text-sm text-[var(--muted-foreground)]">
                    Subtotal
                  </td>
                  <td className="pt-3 text-right text-sm font-amount">
                    {formatCurrency(invoice.subtotal)}
                  </td>
                </tr>
                {invoice.tax_rate > 0 && (
                  <tr>
                    <td colSpan={3} className="pt-1 text-right text-sm text-[var(--muted-foreground)]">
                      Tax ({invoice.tax_rate}%)
                    </td>
                    <td className="pt-1 text-right text-sm font-amount">
                      {formatCurrency(invoice.tax_amount)}
                    </td>
                  </tr>
                )}
                {invoice.discount_amount > 0 && (
                  <tr>
                    <td colSpan={3} className="pt-1 text-right text-sm text-[var(--muted-foreground)]">
                      Discount
                    </td>
                    <td className="pt-1 text-right text-sm font-amount text-green-600">
                      -{formatCurrency(invoice.discount_amount)}
                    </td>
                  </tr>
                )}
                <tr className="border-t border-[var(--border)]">
                  <td colSpan={3} className="pt-3 text-right font-heading text-base font-bold">
                    Total
                  </td>
                  <td className="pt-3 text-right font-amount text-base font-bold">
                    {formatCurrency(invoice.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* Details Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Issue Date</p>
                <p className="text-sm">{formatDate(invoice.issue_date, 'long')}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Due Date</p>
                <p className="text-sm">{formatDate(invoice.due_date, 'long')}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Payment Terms</p>
                <p className="text-sm">Net {invoice.payment_terms}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Currency</p>
                <p className="text-sm">{invoice.currency}</p>
              </div>
            </CardContent>
          </Card>

          {invoice.client && (
            <Card>
              <CardHeader>
                <CardTitle>Bill To</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{invoice.client.name}</p>
                {invoice.client.company && (
                  <p className="text-sm text-[var(--muted-foreground)]">{invoice.client.company}</p>
                )}
                <p className="text-sm text-[var(--muted-foreground)]">{invoice.client.email}</p>
                {invoice.client.address && (
                  <p className="text-sm text-[var(--muted-foreground)]">{invoice.client.address}</p>
                )}
              </CardContent>
            </Card>
          )}

          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-[var(--muted-foreground)]">
                  {invoice.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
