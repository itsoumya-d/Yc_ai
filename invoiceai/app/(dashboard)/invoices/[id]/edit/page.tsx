'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { getInvoice, updateInvoiceAction, type InvoiceItemInput } from '@/lib/actions/invoices';
import { getClients } from '@/lib/actions/clients';
import { formatCurrency } from '@/lib/utils';
import type { Client, InvoiceWithDetails } from '@/types/database';

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  const [selectedClientId, setSelectedClientId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState(30);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [items, setItems] = useState<InvoiceItemInput[]>([
    { description: '', quantity: 1, unit_price: 0 },
  ]);

  useEffect(() => {
    async function loadData() {
      const [invoiceResult, clientsResult] = await Promise.all([
        getInvoice(invoiceId),
        getClients({ status: 'active', pageSize: 100 }),
      ]);

      if (!invoiceResult.success || !invoiceResult.data) {
        toast({ title: 'Invoice not found', variant: 'destructive' });
        router.push('/invoices');
        return;
      }

      const inv = invoiceResult.data;

      // Guard: only allow editing draft or sent invoices
      if (inv.status !== 'draft' && inv.status !== 'sent') {
        toast({
          title: 'Cannot edit',
          description: `This invoice has status "${inv.status}" and cannot be edited.`,
          variant: 'destructive',
        });
        router.push(`/invoices/${invoiceId}`);
        return;
      }

      setInvoice(inv);
      setClients(clientsResult.clients);

      // Pre-populate fields
      setSelectedClientId(inv.client_id ?? '');
      setIssueDate(inv.issue_date);
      setDueDate(inv.due_date);
      setPaymentTerms(inv.payment_terms);
      setTaxRate(inv.tax_rate ?? 0);
      setNotes(inv.notes ?? '');
      setTerms(inv.terms ?? '');

      if (inv.items && inv.items.length > 0) {
        setItems(
          inv.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            sort_order: item.sort_order,
          }))
        );
      }

      setLoading(false);
    }

    loadData();
  }, [invoiceId, router, toast]);

  const handlePaymentTermsChange = (newTerms: number) => {
    setPaymentTerms(newTerms);
    const issue = new Date(issueDate);
    const due = new Date(issue.getTime() + newTerms * 86400000);
    setDueDate(due.toISOString().split('T')[0]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItemInput, value: string | number) => {
    setItems(
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async () => {
    if (!selectedClientId) {
      toast({ title: 'Select a client', variant: 'destructive' });
      return;
    }

    const validItems = items.filter((item) => item.description.trim() && item.unit_price > 0);
    if (validItems.length === 0) {
      toast({ title: 'Add at least one line item', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const result = await updateInvoiceAction(invoiceId, {
      client_id: selectedClientId,
      issue_date: issueDate,
      due_date: dueDate,
      payment_terms: paymentTerms,
      tax_rate: taxRate,
      notes: notes || undefined,
      terms: terms || undefined,
      items: validItems,
    });
    setSaving(false);

    if (result.success) {
      toast({ title: 'Invoice updated', variant: 'success' });
      router.push(`/invoices/${invoiceId}`);
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">Loading invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/invoices/${invoiceId}`)}
            className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
              Edit Invoice {invoice?.invoice_number}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Update invoice details and line items.
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Left Panel - Form */}
        <div className="space-y-6 lg:col-span-3">
          {/* Client & Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Client *
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                      {client.company ? ` (${client.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Issue Date"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
                <Input
                  label="Due Date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                    Payment Terms
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => handlePaymentTermsChange(parseInt(e.target.value))}
                    className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value={7}>Net 7</option>
                    <option value={15}>Net 15</option>
                    <option value={30}>Net 30</option>
                    <option value={45}>Net 45</option>
                    <option value={60}>Net 60</option>
                  </select>
                </div>
              </div>

              <Input
                label="Tax Rate (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={taxRate.toString()}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              />
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Line Items</CardTitle>
                <Button variant="outline" size="sm" onClick={addItem}>
                  <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 text-xs font-medium uppercase text-[var(--muted-foreground)]">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-2">Rate</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-1" />
                </div>

                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 items-center gap-2">
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Service description"
                        className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, 'quantity', parseFloat(e.target.value) || 0)
                        }
                        min="0"
                        step="0.5"
                        className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)
                        }
                        min="0"
                        step="0.01"
                        className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div className="col-span-2 text-right font-amount text-sm">
                      {formatCurrency(item.quantity * item.unit_price)}
                    </div>
                    <div className="col-span-1 text-center">
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="rounded p-1 text-[var(--muted-foreground)] hover:text-red-600"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes & Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Notes & Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any notes for the client..."
              />
              <Textarea
                label="Terms"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={3}
                placeholder="Payment terms and conditions..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">
                      Items ({items.filter((i) => i.description.trim()).length})
                    </span>
                    <span className="font-amount">{formatCurrency(subtotal)}</span>
                  </div>
                  {taxRate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--muted-foreground)]">Tax ({taxRate}%)</span>
                      <span className="font-amount">{formatCurrency(taxAmount)}</span>
                    </div>
                  )}
                  <div className="border-t border-[var(--border)] pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="font-amount">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                {selectedClientId && (
                  <div className="rounded-lg bg-[var(--muted)] p-3">
                    <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">
                      Bill To
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {clients.find((c) => c.id === selectedClientId)?.name}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {clients.find((c) => c.id === selectedClientId)?.email}
                    </p>
                  </div>
                )}

                <div className="space-y-1 text-xs text-[var(--muted-foreground)]">
                  <div className="flex justify-between">
                    <span>Invoice #</span>
                    <span>{invoice?.invoice_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Issue Date</span>
                    <span>{issueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Due Date</span>
                    <span>{dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Terms</span>
                    <span>Net {paymentTerms}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
