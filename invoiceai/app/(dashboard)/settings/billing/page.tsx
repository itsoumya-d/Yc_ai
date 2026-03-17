'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, CreditCard, Download, ChevronDown, ChevronUp, Zap, Shield } from 'lucide-react';
import { ManageBillingButton } from '@/components/ManageBillingButton';
import { createCheckoutSession } from '@/lib/actions/billing';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    current: true,
    priceId: null as string | null,
    features: ['5 invoices/month', 'AI drafting (3/month)', 'Basic templates', 'PDF export'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$12.99',
    period: '/month',
    current: false,
    popular: true,
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID ?? null,
    features: ['Unlimited invoices', 'Unlimited AI drafting', 'Automatic payment reminders', 'All templates', 'Client portal', 'Priority email support'],
  },
  {
    id: 'business',
    name: 'Business',
    price: '$24.99',
    period: '/month',
    current: false,
    priceId: process.env.NEXT_PUBLIC_PADDLE_BUSINESS_PRICE_ID ?? null,
    features: ['Everything in Pro', 'Cash flow forecasting', 'Team accounts (5 members)', 'Advanced analytics', 'White-label invoices', 'Priority phone support'],
  },
];

const BILLING_HISTORY = [
  { id: 'inv-001', date: 'Mar 1, 2026', description: 'InvoiceAI Pro — March 2026', amount: '$12.99', status: 'Paid' },
  { id: 'inv-002', date: 'Feb 1, 2026', description: 'InvoiceAI Pro — February 2026', amount: '$12.99', status: 'Paid' },
  { id: 'inv-003', date: 'Jan 1, 2026', description: 'InvoiceAI Pro — January 2026', amount: '$12.99', status: 'Paid' },
  { id: 'inv-004', date: 'Dec 1, 2025', description: 'InvoiceAI Pro — December 2025', amount: '$12.99', status: 'Paid' },
];

const statusColors: Record<string, string> = {
  Paid: 'text-green-600 bg-green-50',
  Pending: 'text-amber-600 bg-amber-50',
  Failed: 'text-red-600 bg-red-50',
};

export default function BillingPage() {
  const [annual, setAnnual] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (priceId: string | null) => {
    if (!priceId) return;
    setLoading(priceId);
    try {
      await createCheckoutSession(priceId);
    } catch {
      setLoading(null);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/settings" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Billing</h1>
          <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">Manage your subscription and payment methods.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Current Plan */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[var(--foreground)]">Current Plan</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-0.5">You are currently on the <span className="font-semibold text-[var(--foreground)]">Free</span> plan.</p>
            </div>
            <ManageBillingButton />
          </div>
          <div className="p-5">
            {/* Annual toggle */}
            <div className="flex items-center gap-3 mb-6">
              <span className={`text-sm font-medium ${!annual ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`}>Monthly</span>
              <button
                onClick={() => setAnnual(v => !v)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${annual ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
                role="switch"
                aria-checked={annual}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${annual ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <span className={`text-sm font-medium ${annual ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`}>
                Annual <span className="ml-1 text-xs text-green-600 font-semibold">Save 17%</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PLANS.map((plan) => {
                const price = annual && plan.id !== 'free'
                  ? `$${(parseFloat(plan.price.replace('$', '')) * 10).toFixed(0)}`
                  : plan.price;
                const period = annual && plan.id !== 'free' ? '/year' : plan.period;

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl border-2 p-5 flex flex-col ${
                      plan.current
                        ? 'border-[var(--border)] bg-[var(--muted)]/50'
                        : plan.popular
                        ? 'border-[var(--primary)]'
                        : 'border-[var(--border)]'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                    {plan.current && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)] text-xs font-semibold px-3 py-0.5 rounded-full">
                        Current Plan
                      </span>
                    )}
                    <div className="mb-4">
                      <h3 className="font-heading font-bold text-[var(--foreground)]">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-bold text-[var(--foreground)]">{price}</span>
                        <span className="text-sm text-[var(--muted-foreground)]">{period}</span>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-5 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                          <CheckCircle2 size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {plan.current ? (
                      <button disabled className="w-full py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--muted-foreground)] cursor-default">
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan.priceId)}
                        disabled={!plan.priceId || loading === plan.priceId}
                        className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                          plan.popular
                            ? 'bg-[var(--primary)] hover:opacity-90 text-white'
                            : 'border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]'
                        }`}
                      >
                        {loading === plan.priceId ? 'Redirecting...' : `Upgrade to ${plan.name}`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-center text-xs text-[var(--muted-foreground)]">
              Cancel anytime · No hidden fees · Secure billing via Paddle
            </p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[var(--foreground)]">Payment Method</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Manage how you pay for your subscription.</p>
            </div>
            <button
              onClick={() => setShowCard(v => !v)}
              className="flex items-center gap-1 text-sm text-[var(--primary)] hover:opacity-80 font-medium transition-opacity"
            >
              {showCard ? 'Cancel' : 'Add Card'}
              {showCard ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-[var(--muted)] mb-4">
              <CreditCard size={20} className="text-[var(--muted-foreground)]" />
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">No payment method on file</p>
                <p className="text-xs text-[var(--muted-foreground)]">Add a card to upgrade your plan.</p>
              </div>
            </div>

            {showCard && (
              <div className="space-y-4 border-t border-[var(--border)] pt-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Card Number</label>
                  <input
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Expiry</label>
                    <input
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      placeholder="MM / YY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">CVC</label>
                    <input
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <Shield size={12} />
                  Secured by Paddle. Paddle is a Merchant of Record — we never store your card details.
                </div>
                <button className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">
                  Save Card
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Billing History */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <div className="p-5 border-b border-[var(--border)]">
            <h2 className="text-base font-semibold text-[var(--foreground)]">Billing History</h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Your past invoices and payment receipts.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {['Date', 'Description', 'Amount', 'Status', ''].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-[var(--muted-foreground)] px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BILLING_HISTORY.map((row) => (
                  <tr key={row.id} className="border-b last:border-0 border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors">
                    <td className="px-5 py-3 text-sm text-[var(--muted-foreground)]">{row.date}</td>
                    <td className="px-5 py-3 text-sm text-[var(--foreground)]">{row.description}</td>
                    <td className="px-5 py-3 text-sm font-medium text-[var(--foreground)]">{row.amount}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColors[row.status] ?? ''}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button className="flex items-center gap-1 text-xs text-[var(--primary)] hover:opacity-80 font-medium transition-opacity">
                        <Download size={12} />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-red-700">Cancel Subscription</h3>
              <p className="text-sm text-red-600 mt-1">
                If you cancel, you'll be downgraded to the Free plan at the end of your billing period. Your data will be preserved.
              </p>
            </div>
            <ManageBillingButton />
          </div>
        </div>
      </div>
    </div>
  );
}
