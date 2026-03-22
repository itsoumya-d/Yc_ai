'use client';

import { useEffect } from 'react';

export function useServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      } catch (err) {
        // SW registration is non-critical — fail silently
        console.debug('SW registration failed:', err);
      }
    };

    // Delay registration to not block initial page load
    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }
  }, []);
}
