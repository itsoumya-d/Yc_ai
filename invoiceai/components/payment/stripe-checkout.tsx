'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface StripeCheckoutProps {
  invoiceId: string;
  amount: number;
  currency: string;
}

function CheckoutForm({ amount, currency }: { amount: number; currency: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? 'An error occurred.');
      setIsLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${window.location.pathname}?payment=success`,
      },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message ?? 'Payment failed. Please try again.');
    } else {
      setSucceeded(true);
    }
    setIsLoading(false);
  };

  if (succeeded) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="font-heading text-lg font-semibold text-green-600">Payment Successful!</h3>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Thank you for your payment of {formatCurrency(amount, currency)}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || !elements || isLoading}
      >
        {isLoading ? 'Processing…' : `Pay ${formatCurrency(amount, currency)}`}
      </Button>
    </form>
  );
}

export function StripeCheckout({ invoiceId, amount, currency }: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle redirect-back success from 3DS or redirecting payment methods
  const [paymentSuccess] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('payment') === 'success';
  });

  useEffect(() => {
    if (paymentSuccess) {
      setIsLoading(false);
      return;
    }

    async function initializePayment() {
      try {
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId }),
        });
        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? 'Failed to load payment form.');
          setIsLoading(false);
          return;
        }

        setStripePromise(
          loadStripe(data.publishableKey, { stripeAccount: data.connectedAccountId })
        );
        setClientSecret(data.clientSecret);
        setIsLoading(false);
      } catch {
        setError('Failed to load payment form. Please try again.');
        setIsLoading(false);
      }
    }

    initializePayment();
  }, [invoiceId, paymentSuccess]);

  if (paymentSuccess) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="font-heading text-lg font-semibold text-green-600">Payment Successful!</h3>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Thank you — this invoice is now paid.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-12 animate-pulse rounded-lg bg-[var(--muted)]" />
        <div className="h-12 animate-pulse rounded-lg bg-[var(--muted)]" />
        <div className="h-10 animate-pulse rounded-lg bg-[var(--muted)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Please contact the invoice sender for payment instructions.
        </p>
      </div>
    );
  }

  if (!clientSecret || !stripePromise) return null;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm amount={amount} currency={currency} />
    </Elements>
  );
}
