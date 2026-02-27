'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker for PWA functionality.
 * Renders nothing — purely side-effect component.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Check for updates periodically
          setInterval(() => registration.update(), 60 * 60 * 1000); // every hour
        })
        .catch((err) => {
          console.error('SW registration failed:', err);
        });
    }
  }, []);

  return null;
}
