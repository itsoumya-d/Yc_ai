'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { recordPaymentAction } from '@/lib/actions/invoices';
import { formatCurrency } from '@/lib/utils';

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber: string;
  amountDue: number;
  currency: string;
  onSuccess: () => void;
}

const PAYMENT_METHODS = [
  { value: 'manual', label: 'Cash' },
  { value: 'ach', label: 'Bank Transfer / ACH' },
  { value: 'card', label: 'Credit / Debit Card' },
  { value: 'other', label: 'Other' },
] as const;

type PaymentMethod = 'card' | 'ach' | 'manual' | 'other';

export function RecordPaymentDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
  amountDue,
  currency,
  onSuccess,
}: RecordPaymentDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(amountDue.toFixed(2));
  const [method, setMethod] = useState<PaymentMethod>('manual');
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [referenceNote, setReferenceNote] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const result = await recordPaymentAction(invoiceId, {
      amount: parsedAmount,
      payment_method: method,
      payment_date: paymentDate,
      reference_note: referenceNote.trim() || undefined,
    });
    setLoading(false);

    if (result.success) {
      toast({ title: 'Payment recorded', variant: 'success' });
      onOpenChange(false);
      onSuccess();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <Card className="relative z-10 w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Record Payment</CardTitle>
          <p className="text-sm text-[var(--muted-foreground)]">
            Invoice {invoiceNumber} · Balance due: {formatCurrency(amountDue, currency)}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Amount ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] text-sm">
                  $
                </span>
                <input
                  type="number"
                  min="0.01"
                  max={amountDue}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-7 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Payment Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            {/* Reference / Note */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Reference / Note{' '}
                <span className="text-[var(--muted-foreground)] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={referenceNote}
                onChange={(e) => setReferenceNote(e.target.value)}
                placeholder="Check #1234, wire reference, etc."
                maxLength={200}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Recording…' : 'Record Payment'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
