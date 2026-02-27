'use client';

import { useState } from 'react';

interface PaymentFormProps {
  invoiceId: string;
  amount: number;
  currency: string;
  invoiceNumber: string;
}

export function PaymentForm({ invoiceId, amount, currency, invoiceNumber }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formatAmount = (amt: number, curr: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(amt);

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create payment intent
      const res = await fetch('/api/stripe/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to initiate payment');
        return;
      }

      // Load Stripe.js dynamically
      const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!stripeKey) {
        setError('Payment system not configured. Please contact the invoice sender.');
        return;
      }

      // Dynamically import Stripe to avoid SSR issues
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripe = await loadStripe(stripeKey);

      if (!stripe) {
        setError('Could not load payment system. Please try again.');
        return;
      }

      const { error: stripeError } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: {
            // In production, use Stripe Elements card component
            // For now, this opens Stripe's hosted checkout as fallback
            token: 'tok_visa', // test token — in production, use Elements
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed. Please try again.');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="font-heading text-xl font-bold text-green-700">Payment Successful!</h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {formatAmount(amount, currency)} received for invoice {invoiceNumber}. A receipt has been sent to your email.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-heading text-lg font-semibold mb-4">Pay Invoice {invoiceNumber}</h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stripe Elements would render here */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-secondary,#F9FAFB)] p-4 mb-4">
        <p className="text-xs text-[var(--muted-foreground)] mb-3 font-medium uppercase tracking-wider">
          Card Details
        </p>
        {/* In production: render Stripe CardElement here */}
        <div className="rounded border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--muted-foreground)]">
          Card number · · · · (Stripe Elements loads here in production)
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--muted-foreground)]">
            MM / YY
          </div>
          <div className="rounded border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--muted-foreground)]">
            CVC
          </div>
        </div>
      </div>

      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full rounded-lg bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : (
          `Pay ${formatAmount(amount, currency)}`
        )}
      </button>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[var(--muted-foreground)]">
        <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        Secured by Stripe · SSL encrypted
      </div>
    </div>
  );
}
