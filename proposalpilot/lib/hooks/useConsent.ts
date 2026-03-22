'use client';

import { useState, useEffect } from 'react';

const CONSENT_KEY = 'cookie_consent_v1';

export function useConsent() {
  const [consent, setConsent] = useState<'pending' | 'accepted' | 'declined'>('pending');

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === 'accepted' || stored === 'declined') {
      setConsent(stored);
    }
  }, []);

  return {
    consentGiven: consent === 'accepted',
    consentDeclined: consent === 'declined',
    consentPending: consent === 'pending',
  };
}
