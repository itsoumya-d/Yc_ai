import { useEffect } from 'react';

/**
 * Registers the service worker in production builds.
 * Placed inside App so it only runs client-side.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((reg) => {
            console.log('[SW] registered, scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[SW] registration failed:', err);
          });
      });
    }
  }, []);

  return null;
}
