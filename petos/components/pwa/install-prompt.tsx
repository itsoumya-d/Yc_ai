'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Shows an install prompt banner when the PWA is installable.
 * Captures the beforeinstallprompt event and defers it.
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    if (localStorage.getItem('pwa-install-dismissed')) {
      setDismissed(true);
      return;
    }

    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', '1');
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 p-4 border-[var(--color-brand-300)] bg-orange-50 z-50 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-500)] flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Install PetOS</h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Add PetOS to your home screen for quick access and offline features.
          </p>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={handleInstall}>Install</Button>
            <Button size="sm" variant="outline" onClick={handleDismiss}>
              Not now
            </Button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          <X className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}
