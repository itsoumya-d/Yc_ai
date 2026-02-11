'use client';

import { useState } from 'react';
import Link from 'next/link';

const PLANS = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Perfect for getting started',
    features: [
      '5 invoices per month',
      '1 client',
      'Classic template',
      'PDF download',
      'Basic dashboard',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 12.99,
    annualPrice: 10.39,
    description: 'For growing freelancers',
    features: [
      'Unlimited invoices',
      'Unlimited clients',
      'All 5 templates',
      'AI invoice drafting',
      'Stripe payments',
      'Email delivery & tracking',
      'Automated reminders',
      'Expense tracking',
      'Reports & analytics',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Business',
    monthlyPrice: 24.99,
    annualPrice: 19.99,
    description: 'For teams and agencies',
    features: [
      'Everything in Pro',
      'Team members (up to 5)',
      'Custom branding & logo',
      'Recurring invoices',
      'Multi-currency support',
      'API access',
      'Priority support',
      'Custom invoice templates',
      'Advanced reporting',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
];

const FAQS = [
  {
    question: 'Can I switch plans anytime?',
    answer:
      'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we\'ll prorate the difference.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Yes! Pro and Business plans come with a 14-day free trial. No credit card required to start.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through Stripe.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Absolutely. You can cancel your subscription at any time with no cancellation fees. Your account will remain active until the end of your billing period.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'We offer a 30-day money-back guarantee. If you\'re not satisfied, contact us for a full refund.',
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-xl font-bold text-green-600">
            InvoiceAI
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Start free, upgrade when you&apos;re ready. No hidden fees.
          </p>
        </div>

        {/* Annual Toggle */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className={`text-sm ${!annual ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              annual ? 'bg-green-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                annual ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${annual ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
            Annual
          </span>
          {annual && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Save 20%
            </span>
          )}
        </div>

        {/* Plans Grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {PLANS.map((plan) => {
            const price = annual ? plan.annualPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 ${
                  plan.highlighted
                    ? 'border-green-600 shadow-lg shadow-green-100'
                    : 'border-gray-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white">
                    Most Popular
                  </div>
                )}

                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{plan.description}</p>

                <div className="mt-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ${price.toFixed(price === 0 ? 0 : 2)}
                  </span>
                  {price > 0 && (
                    <span className="text-sm text-gray-500">/month</span>
                  )}
                </div>

                <Link
                  href="/signup"
                  className={`mt-6 block w-full rounded-lg py-2.5 text-center text-sm font-medium ${
                    plan.highlighted
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                      <svg
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600"
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
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Frequently asked questions
          </h2>
          <div className="mx-auto mt-12 max-w-3xl divide-y divide-gray-200">
            {FAQS.map((faq) => (
              <div key={faq.question} className="py-6">
                <h3 className="text-base font-medium text-gray-900">{faq.question}</h3>
                <p className="mt-2 text-sm text-gray-500">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 rounded-2xl bg-green-600 px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-white">Ready to get paid faster?</h2>
          <p className="mt-2 text-green-100">
            Join thousands of freelancers who use InvoiceAI to manage their billing.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-block rounded-lg bg-white px-8 py-3 text-sm font-medium text-green-600 hover:bg-green-50"
          >
            Start for Free
          </Link>
        </div>
      </div>
    </div>
  );
}
