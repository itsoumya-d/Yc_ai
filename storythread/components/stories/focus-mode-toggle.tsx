'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2 } from 'lucide-react';

export function FocusModeToggle() {
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    if (focusMode) {
      document.body.setAttribute('data-focus-mode', 'true');
    } else {
      document.body.removeAttribute('data-focus-mode');
    }
    return () => {
      document.body.removeAttribute('data-focus-mode');
    };
  }, [focusMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focusMode) {
        setFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode]);

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence>
        {focusMode && (
          <motion.span
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className="text-xs text-[var(--muted-foreground)]"
          >
            Focus Mode — press <kbd className="rounded border border-[var(--border)] bg-[var(--muted)] px-1 py-0.5 font-mono text-[10px]">Esc</kbd> to exit
          </motion.span>
        )}
      </AnimatePresence>
      <button
        onClick={() => setFocusMode(!focusMode)}
        title={focusMode ? 'Exit Focus Mode (Esc)' : 'Enter Focus Mode'}
        aria-label={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
        className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm text-[var(--muted-foreground)] shadow-sm transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
      >
        {focusMode ? (
          <Minimize2 className="h-3.5 w-3.5" />
        ) : (
          <Maximize2 className="h-3.5 w-3.5" />
        )}
        <span className="hidden sm:inline">{focusMode ? 'Exit Focus' : 'Focus Mode'}</span>
      </button>
    </div>
  );
}
