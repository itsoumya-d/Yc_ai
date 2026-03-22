'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { useConsent } from '@/lib/hooks/useConsent';
import { useServiceWorker } from '@/lib/hooks/useServiceWorker';
import { NotificationPermission } from '@/components/NotificationPermission';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { consentGiven, consentDeclined } = useConsent();
  useServiceWorker();

  // Initialize PostHog once with opt-out by default (GDPR safe — no data sent until consent)
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
    if (!key || typeof window === 'undefined') return;

    posthog.init(key, {
      api_host: host,
      person_profiles: 'identified_only',
      capture_pageview: false,
      capture_pageleave: true,
      opt_out_capturing_by_default: true, // Do not track until consent given
    });
  }, []);

  // React to consent changes — opt in/out whenever the user decides
  useEffect(() => {
    if (consentGiven) {
      posthog.opt_in_capturing();
    } else if (consentDeclined) {
      posthog.opt_out_capturing();
    }
  }, [consentGiven, consentDeclined]);

  return (
    <PHProvider client={posthog}>
      {children}
      <NotificationPermission />
    </PHProvider>
  );
}
