'use client';

import { useState } from 'react';
import { ManageBillingButton } from '@/components/ManageBillingButton';
import { createCheckoutSession } from '@/lib/actions/billing';
import { useTranslations } from 'next-intl';

export default function BillingPage() {
  const t = useTranslations('billing');

  const PLANS = [
    {
      name: t('free'),
      price: '$0',
      period: t('perMonth'),
      features: [t('features.freeProposals'), t('features.basicTemplates'), t('features.pdfExport'), t('features.clientViewLinks')],
      cta: t('currentPlanCta'),
      highlighted: false,
      priceId: null,
    },
    {
      name: t('pro'),
      price: '$29',
      period: t('perMonth'),
      features: [t('features.unlimitedProposals'), t('features.aiGeneration'), t('features.eSignatures'), t('features.analyticsTracking'), t('features.teamCollaboration'), t('features.customBranding')],
      cta: t('upgradeToPro'),
      highlighted: true,
      priceId: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID,
    },
    {
      name: t('business'),
      price: '$79',
      period: t('perMonth'),
      features: [t('features.everythingInPro'), t('features.unlimitedTeamSeats'), t('features.crmIntegrations'), t('features.customDomain'), t('features.advancedReporting'), t('features.dedicatedSupport')],
      cta: t('upgradeToBusiness'),
      highlighted: false,
      priceId: process.env.NEXT_PUBLIC_PADDLE_BUSINESS_PRICE_ID,
    },
  ];
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('description')}</p>
      </div>

      {/* Current Plan Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{t('currentPlan')}</p>
          <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{t('freePlan')}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-sm font-medium px-3 py-1 rounded-full">{t('active')}</span>
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
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-100 dark:shadow-none'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
          >
            {plan.highlighted && (
              <span className="self-start bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                {t('mostPopular')}
              </span>
            )}
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{plan.name}</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{plan.price}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : plan.priceId
                  ? 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading === plan.priceId ? t('redirecting') : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Billing History */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('billingHistory')}</h2>
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 grid grid-cols-4 gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            <span>{t('date')}</span>
            <span>{t('descriptionCol')}</span>
            <span>{t('amount')}</span>
            <span>{t('status')}</span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400 text-center">
              {t('noBillingHistory')}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('paymentMethod')}</h2>
        <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('noPaymentMethod')}</p>
          <button className="mt-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors">
            {t('addPaymentMethod')}
          </button>
        </div>
      </div>

      {/* Cancel */}
      <div className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-red-700 dark:text-red-400">{t('cancelSubscription')}</h3>
            <p className="text-sm text-red-600 dark:text-red-500 mt-1">
              {t('cancelDescription')}
            </p>
          </div>
          <ManageBillingButton />
        </div>
      </div>
    </div>
  );
}
