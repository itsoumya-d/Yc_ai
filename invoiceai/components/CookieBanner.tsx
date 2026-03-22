'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type ConsentState = 'pending' | 'accepted' | 'declined';

const CONSENT_KEY = 'cookie_consent_v1';

export function CookieBanner() {
  const [consent, setConsent] = useState<ConsentState>('pending');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(CONSENT_KEY) as ConsentState | null;
    if (stored === 'accepted' || stored === 'declined') {
      setConsent(stored);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setConsent('accepted');
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setConsent('declined');
  };

  if (!mounted || consent !== 'pending') return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-describedby="cookie-desc"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
    >
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            🍪 We use cookies
          </p>
          <p id="cookie-desc" className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            We use analytics cookies to understand how you use our app and improve your experience. See our{' '}
            <Link href="/privacy" className="underline text-blue-600 dark:text-blue-400 hover:no-underline">
              Privacy Policy
            </Link>{' '}
            for details.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
