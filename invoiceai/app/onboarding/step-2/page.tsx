'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CURRENCIES = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'INR', label: 'INR — Indian Rupee' },
];

export default function OnboardingStep2Page() {
  const router = useRouter();
  const [yourName, setYourName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [invoicePrefix, setInvoicePrefix] = useState('INV-');

  function handleContinue() {
    sessionStorage.setItem('onboarding_your_name', yourName);
    sessionStorage.setItem('onboarding_business_name', businessName);
    sessionStorage.setItem('onboarding_currency', currency);
    sessionStorage.setItem('onboarding_invoice_prefix', invoicePrefix);
    router.push('/onboarding/step-3');
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-[var(--shadow-card)]">
      <div className="h-1 bg-[var(--muted)]">
        <div className="h-full bg-brand-600 transition-all duration-500" style={{ width: '66%' }} />
      </div>
      <div className="p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-1">
          Step 2 of 3
        </p>
        <h1 className="font-heading text-2xl font-bold text-[var(--card-foreground)] mb-1">
          Your business info
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          This will appear on your invoices and client communications.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
              Your Name *
            </label>
            <input
              type="text"
              value={yourName}
              onChange={(e) => setYourName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Jane Smith Design Studio"
              className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                Invoice Prefix
              </label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                placeholder="INV-"
                className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
          <div className="rounded-lg border border-brand-200 bg-brand-50 p-3 text-xs text-brand-700">
            Your first invoice will be numbered <strong>{invoicePrefix}001</strong>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => router.push('/onboarding/step-1')}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!yourName.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
