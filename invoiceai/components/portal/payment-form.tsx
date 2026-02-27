'use client';

import { useState, useCallback } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { formatCurrency } from '@/lib/utils';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
);

function CheckoutForm({
  amountDue,
  invoiceNumber,
  currency,
}: {
  amountDue: number;
  invoiceNumber: string;
  currency: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!stripe || !elements) return;

      setIsProcessing(true);
      setErrorMessage(null);

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}${window.location.pathname}?status=success`,
        },
      });

      // This runs only if there's an immediate error (e.g. card declined)
      // Otherwise the user is redirected to the return_url
      if (error) {
        setErrorMessage(error.message ?? 'An unexpected error occurred.');
        setIsProcessing(false);
      }
    },
    [stripe, elements]
  );

  if (isComplete) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </div>
        <h2 className="font-heading text-lg font-semibold text-green-600">
          Payment Successful
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Thank you! Invoice {invoiceNumber} has been paid.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">
          Pay This Invoice
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Complete your payment of{' '}
          <span className="font-amount font-semibold text-[var(--foreground)]">
            {formatCurrency(amountDue, currency)}
          </span>{' '}
          for invoice {invoiceNumber}.
        </p>
      </div>

      <PaymentElement
        options={{
          layout: 'tabs',
        }}
        onChange={(event) => {
          if (event.complete) {
            setIsComplete(false); // Reset if user changes card
          }
        }}
      />

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          `Pay ${formatCurrency(amountDue, currency)}`
        )}
      </button>

      <p className="text-center text-xs text-[var(--muted-foreground)]">
        <svg
          className="mb-0.5 inline-block h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>{' '}
        Payments are processed securely by Stripe.
      </p>
    </form>
  );
}

export function PaymentForm({
  invoiceId,
  amountDue,
  invoiceNumber,
  currency = 'USD',
}: {
  invoiceId: string;
  amountDue: number;
  invoiceNumber: string;
  currency?: string;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitiated, setHasInitiated] = useState(false);

  // Check if we're returning from a successful payment
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'success' || params.get('redirect_status') === 'succeeded') {
      return (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          </div>
          <h2 className="font-heading text-lg font-semibold text-green-600">
            Payment Successful
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Thank you! Your payment for invoice {invoiceNumber} has been received.
          </p>
        </div>
      );
    }
  }

  const handlePayClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? 'Failed to initialize payment');
        setIsLoading(false);
        return;
      }

      setClientSecret(data.clientSecret);
      setHasInitiated(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">
          Pay This Invoice
        </h2>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <button
          onClick={() => {
            setError(null);
            handlePayClick();
          }}
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!hasInitiated || !clientSecret) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">
          Pay This Invoice
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Pay{' '}
          <span className="font-amount font-semibold text-[var(--foreground)]">
            {formatCurrency(amountDue, currency)}
          </span>{' '}
          securely with credit card, debit card, or bank transfer.
        </p>
        <button
          onClick={handlePayClick}
          disabled={isLoading}
          className="rounded-lg bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Initializing...
            </span>
          ) : (
            `Pay ${formatCurrency(amountDue, currency)}`
          )}
        </button>
        <p className="text-xs text-[var(--muted-foreground)]">
          <svg
            className="mb-0.5 inline-block h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>{' '}
          Payments are processed securely by Stripe.
        </p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#6366f1',
            colorBackground: '#ffffff',
            borderRadius: '8px',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSizeBase: '14px',
          },
        },
      }}
    >
      <CheckoutForm amountDue={amountDue} invoiceNumber={invoiceNumber} currency={currency} />
    </Elements>
  );
}
