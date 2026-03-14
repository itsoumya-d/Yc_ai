'use client';

import { useState } from 'react';
import { PaymentForm } from './payment-form';

interface PaymentSectionProps {
  invoiceId: string;
  portalToken: string;
  amountDue: number;
  currency: string;
}

export function PaymentSection({ invoiceId, portalToken, amountDue, currency }: PaymentSectionProps) {
  const [paid, setPaid] = useState(false);

  if (paid) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="font-heading text-lg font-semibold text-green-600">Payment Successful!</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Your payment has been processed. You&apos;ll receive a receipt shortly.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-heading text-lg font-semibold mb-4">Pay This Invoice</h2>
      <PaymentForm
        invoiceId={invoiceId}
        portalToken={portalToken}
        amountDue={amountDue}
        currency={currency}
        onSuccess={() => setPaid(true)}
      />
    </div>
  );
}
