'use client';

import * as React from 'react';
import { Bell, BellOff, X } from 'lucide-react';

export function NotificationPermission() {
  const [permission, setPermission] = React.useState<NotificationPermission | 'unsupported'>('default');
  const [dismissed, setDismissed] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission);
    // Check if user dismissed before
    if (localStorage.getItem('push-dismissed') === '1') {
      setDismissed(true);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      // Subscribe to push (VAPID key to be configured)
      try {
        const reg = await navigator.serviceWorker.ready;
        // Push subscription would go here with real VAPID key
      } catch (err) {
        console.error('Push subscription failed:', err);
      }
    }
  };

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem('push-dismissed', '1');
  };

  if (!mounted || dismissed || permission === 'granted' || permission === 'denied' || permission === 'unsupported') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-border bg-card p-4 shadow-lg">
      <button
        onClick={dismiss}
        className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Stay in the loop</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Get notified about important updates instantly.</p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={requestPermission}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Enable notifications
            </button>
            <button
              onClick={dismiss}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
