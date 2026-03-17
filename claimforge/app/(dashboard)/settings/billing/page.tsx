'use client';

import { useState } from 'react';
import { ManageBillingButton } from '@/components/ManageBillingButton';
import { createCheckoutSession } from '@/lib/actions/billing';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    features: ['5 cases', 'Basic analysis', 'Document storage', 'PDF reports'],
    cta: 'Current Plan',
    highlighted: false,
    priceId: null,
  },
  {
    name: 'Pro',
    price: '$199',
    period: '/seat/month',
    features: ['Unlimited cases', "Benford's Law fraud engine", 'OCR document scanning', 'Network graph visualization', 'USASpending.gov API', 'Priority support'],
    cta: 'Upgrade to Pro',
    highlighted: true,
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID,
  },
  {
    name: 'Business',
    price: '$499',
    period: '/seat/month',
    features: ['Everything in Pro', 'Multi-investigator teams', 'Court-ready exports', 'Custom evidence workflows', 'Audit trail & chain of custody', 'Dedicated support'],
    cta: 'Upgrade to Business',
    highlighted: false,
    priceId: process.env.NEXT_PUBLIC_PADDLE_BUSINESS_PRICE_ID,
  },
];

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (priceId: string | null | undefined) => {
    if (!priceId) return;
    setLoading(priceId);
    try {
      await createCheckoutSession(priceId);
    } catch {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Billing &amp; Plans</h1>
        <p className="text-text-secondary mt-1">Manage your subscription and billing information</p>
      </div>

      {/* Current Plan Banner */}
      <div className="bg-primary-muted border border-primary/30 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-primary-light font-medium">Current Plan</p>
          <p className="text-xl font-bold text-text-primary">Free Plan</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-verified-green-muted text-verified-green text-sm font-medium px-3 py-1 rounded-full">Active</span>
          <ManageBillingButton />
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-6 flex flex-col ${
              plan.highlighted
                ? 'border-primary bg-primary-muted'
                : 'border-border-default bg-bg-surface'
            }`}
          >
            {plan.highlighted && (
              <span className="self-start bg-primary text-text-on-color text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                Most Popular
              </span>
            )}
            <h3 className="text-lg font-bold text-text-primary">{plan.name}</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-bold text-text-primary">{plan.price}</span>
              <span className="text-text-secondary text-sm">{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-verified-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade(plan.priceId)}
              disabled={!plan.priceId || loading === plan.priceId}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                plan.highlighted
                  ? 'bg-primary hover:bg-primary-hover text-text-on-color'
                  : plan.priceId
                  ? 'border border-border-default hover:bg-bg-surface-raised text-text-secondary'
                  : 'bg-bg-surface-raised text-text-tertiary cursor-not-allowed'
              }`}
            >
              {loading === plan.priceId ? 'Redirecting...' : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Billing History */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Billing History</h2>
        <div className="border border-border-default rounded-xl overflow-hidden">
          <div className="bg-bg-surface px-4 py-3 grid grid-cols-4 gap-4 text-xs font-medium text-text-tertiary uppercase tracking-wide">
            <span>Date</span>
            <span>Description</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-border-muted">
            <div className="px-4 py-6 text-sm text-text-tertiary text-center">
              No billing history yet. Invoices will appear here after your first payment.
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Payment Method</h2>
        <div className="border border-dashed border-border-default rounded-xl p-6 text-center">
          <p className="text-text-tertiary text-sm">No payment method on file</p>
          <button className="mt-3 text-primary-light hover:text-primary text-sm font-medium transition-colors">
            Add Payment Method
          </button>
        </div>
      </div>

      {/* Cancel */}
      <div className="border border-risk-high/30 bg-risk-high/5 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-risk-high">Cancel Subscription</h3>
            <p className="text-sm text-risk-high/80 mt-1">
              If you cancel, you&apos;ll be downgraded to the Free plan at the end of your billing period. All case data will be preserved.
            </p>
          </div>
          <ManageBillingButton />
        </div>
      </div>
    </div>
  );
}
