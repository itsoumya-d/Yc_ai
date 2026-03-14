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

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

interface PaymentFormInnerProps {
  amountDue: number;
  currency: string;
  onSuccess: () => void;
}

function PaymentFormInner({ amountDue, currency, onSuccess }: PaymentFormInnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message ?? 'Payment failed. Please try again.');
      setIsProcessing(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      onSuccess();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: 'tabs',
          defaultValues: { billingDetails: { address: { country: 'US' } } },
        }}
      />

      {errorMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing…
          </span>
        ) : (
          `Pay ${formatCurrency(amountDue, currency)}`
        )}
      </Button>

      <p className="text-center text-xs text-[var(--muted-foreground)]">
        Payments are processed securely by Stripe. Your card details are never stored.
      </p>
    </form>
  );
}

interface PaymentFormProps {
  invoiceId: string;
  portalToken: string;
  amountDue: number;
  currency: string;
  onSuccess: () => void;
}

export function PaymentForm({ invoiceId, portalToken, amountDue, currency, onSuccess }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stripe/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId, token: portalToken }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setFetchError(data.error);
        } else {
          setClientSecret(data.clientSecret);
        }
      })
      .catch(() => setFetchError('Failed to initialize payment. Please refresh and try again.'))
      .finally(() => setLoading(false));
  }, [invoiceId, portalToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <svg className="animate-spin h-6 w-6 text-[var(--primary)]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
        <p className="text-sm text-red-600">{fetchError}</p>
      </div>
    );
  }

  if (!clientSecret) return null;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#16a34a',
            borderRadius: '8px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          },
        },
      }}
    >
      <PaymentFormInner amountDue={amountDue} currency={currency} onSuccess={onSuccess} />
    </Elements>
  );
}
