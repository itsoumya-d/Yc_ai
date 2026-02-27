'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCurrencyAmount } from '@/lib/utils/currency';

interface PaymentFormProps {
  invoiceId:     string;
  amountDue:     number;
  currency:      string;
  invoiceNumber: string;
  clientEmail:   string;
}

type PaymentTab = 'card' | 'bank';
type FormState  = 'idle' | 'processing' | 'success' | 'error';

export function PaymentForm({
  invoiceId,
  amountDue,
  currency,
  invoiceNumber,
  clientEmail,
}: PaymentFormProps) {
  const [tab,       setTab]       = useState<PaymentTab>('card');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg,  setErrorMsg]  = useState('');

  // Card fields
  const [cardNumber,  setCardNumber]  = useState('');
  const [expiry,      setExpiry]      = useState('');
  const [cvc,         setCvc]         = useState('');
  const [nameOnCard,  setNameOnCard]  = useState('');
  const [email,       setEmail]       = useState(clientEmail);

  // Bank fields
  const [accountName, setAccountName] = useState('');
  const [routingNum,  setRoutingNum]  = useState('');
  const [accountNum,  setAccountNum]  = useState('');

  function formatCardNumber(raw: string) {
    return raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  }

  function formatExpiry(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  function getCardBrand(num: string): string {
    const d = num.replace(/\s/g, '');
    if (/^4/.test(d)) return 'Visa';
    if (/^5[1-5]/.test(d)) return 'MC';
    if (/^3[47]/.test(d)) return 'Amex';
    if (/^6011/.test(d)) return 'Disc';
    return '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState('processing');
    setErrorMsg('');

    try {
      // In production this calls /api/stripe/pay or similar
      await new Promise((resolve) => setTimeout(resolve, 1800));
      setFormState('success');
    } catch {
      setErrorMsg('Payment failed. Please check your details and try again.');
      setFormState('error');
    }
  }

  if (formState === 'success') {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="font-heading text-xl font-semibold text-green-700">Payment Successful!</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {formatCurrencyAmount(amountDue, currency)} received for {invoiceNumber}.
          A receipt has been sent to {email}.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">
          Pay Invoice
        </h2>
        <span className="text-2xl font-bold text-[var(--foreground)]">
          {formatCurrencyAmount(amountDue, currency)}
        </span>
      </div>

      {/* Tab switcher */}
      <div className="mb-6 flex rounded-lg border border-[var(--border)] p-1">
        {(['card', 'bank'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
              tab === t
                ? 'bg-[var(--foreground)] text-[var(--background)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            )}
          >
            {t === 'card' ? '💳 Card' : '🏦 Bank Transfer'}
          </button>
        ))}
      </div>

      {formState === 'error' && errorMsg && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="block w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {tab === 'card' ? (
          <>
            {/* Card number */}
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required
                  className="block w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 pr-16 font-mono text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                {getCardBrand(cardNumber) && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--muted-foreground)]">
                    {getCardBrand(cardNumber)}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
                  Expiry
                </label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                  className="block w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 font-mono text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
                  CVC
                </label>
                <input
                  type="text"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  maxLength={4}
                  required
                  className="block w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 font-mono text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
                Name on Card
              </label>
              <input
                type="text"
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                placeholder="Jane Smith"
                required
                className="block w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
                Account Holder Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
                className="block w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
                  Routing Number
                </label>
                <input
                  type="text"
                  value={routingNum}
                  onChange={(e) => setRoutingNum(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  placeholder="021000021"
                  required
                  className="block w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 font-mono text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountNum}
                  onChange={(e) => setAccountNum(e.target.value.replace(/\D/g, '').slice(0, 17))}
                  required
                  className="block w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 font-mono text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          </>
        )}

        <Button
          type="submit"
          disabled={formState === 'processing'}
          className="w-full"
          size="lg"
        >
          {formState === 'processing' ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing…
            </span>
          ) : (
            `Pay ${formatCurrencyAmount(amountDue, currency)}`
          )}
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-[var(--muted-foreground)]">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          Secured by 256-bit SSL encryption
        </p>
      </form>
    </div>
  );
}
