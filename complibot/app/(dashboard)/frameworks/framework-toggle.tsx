'use client';

import { useState, useTransition } from 'react';
import { toggleFramework } from '@/lib/actions/frameworks';
import type { FrameworkType } from '@/types/database';

interface FrameworkToggleProps {
  frameworkType: FrameworkType;
  enabled: boolean;
  orgId?: string;
}

export function FrameworkToggle({ frameworkType, enabled, orgId }: FrameworkToggleProps) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [isPending, startTransition] = useTransition();

  if (!orgId) {
    return (
      <button
        disabled
        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 opacity-50 cursor-not-allowed"
      >
        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
      </button>
    );
  }

  function handleToggle() {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    startTransition(async () => {
      const { error } = await toggleFramework(frameworkType, newEnabled);
      if (error) {
        // Revert on error
        setIsEnabled(!newEnabled);
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      role="switch"
      aria-checked={isEnabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-60 ${
        isEnabled ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          isEnabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
