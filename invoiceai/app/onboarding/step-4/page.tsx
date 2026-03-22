'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

const PRIMARY = '#6366F1';
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD'];
const PAYMENT_TERMS = ['Due on receipt', 'Net 7', 'Net 14', 'Net 30', 'Net 60'];

export default function OnboardingStep4Page() {
  const router = useRouter();
  const [currency, setCurrency] = useState('USD');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [taxRate, setTaxRate] = useState('0');
  const [taxName, setTaxName] = useState('VAT');
  const [lateFeePct, setLateFeePct] = useState('');

  const handleContinue = () => {
    sessionStorage.setItem('onboarding_currency', currency);
    sessionStorage.setItem('onboarding_payment_terms', paymentTerms);
    sessionStorage.setItem('onboarding_tax_rate', taxRate);
    router.push('/onboarding/step-5');
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
      <div className="mb-6">
        <div className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 mb-3">
          Step 4 of 5
        </div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">Invoice defaults</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Save time with pre-filled invoice settings</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Currency</label>
          <div className="grid grid-cols-3 gap-2">
            {CURRENCIES.map(c => (
              <button key={c} onClick={() => setCurrency(c)}
                className="rounded-lg border-2 py-2 text-sm font-semibold transition-all"
                style={{ borderColor: currency === c ? PRIMARY : 'var(--border)', color: currency === c ? PRIMARY : 'var(--muted-foreground)', backgroundColor: currency === c ? `${PRIMARY}10` : 'transparent' }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Default payment terms</label>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_TERMS.map(t => (
              <button key={t} onClick={() => setPaymentTerms(t)}
                className="rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all"
                style={{ borderColor: paymentTerms === t ? PRIMARY : 'var(--border)', color: paymentTerms === t ? PRIMARY : 'var(--muted-foreground)', backgroundColor: paymentTerms === t ? `${PRIMARY}10` : 'transparent' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Tax name</label>
            <input value={taxName} onChange={e => setTaxName(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:border-brand-500"
              placeholder="VAT, GST, Tax..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Tax rate (%)</label>
            <input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} min="0" max="100"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:border-brand-500"
              placeholder="0" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Late fee (% per month) <span className="text-[var(--muted-foreground)] font-normal">optional</span></label>
          <input type="number" value={lateFeePct} onChange={e => setLateFeePct(e.target.value)} min="0" max="10" step="0.5"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:border-brand-500"
            placeholder="e.g. 1.5" />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={() => router.push('/onboarding/step-3')}
          className="flex items-center gap-1 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)]">
          <ChevronLeft size={16} /> Back
        </button>
        <button onClick={handleContinue}
          className="flex-1 rounded-xl py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: PRIMARY }}>
          Continue
        </button>
      </div>
    </div>
  );
}
