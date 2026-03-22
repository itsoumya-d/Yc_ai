'use client';
import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { Search } from 'lucide-react';
import { CommandPalette, useCommandPaletteShortcut } from '@/components/CommandPalette';

export function DashboardContent({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  useCommandPaletteShortcut(() => setPaletteOpen(true));

  return (
    <>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="mx-auto max-w-6xl px-8 py-8"
      >
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-border-default bg-bg-surface-raised px-3 py-1.5 text-sm text-text-tertiary shadow-sm transition-colors hover:bg-bg-surface-raised/80 hover:text-text-secondary"
            aria-label="Open command palette"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border-default bg-bg-surface px-1.5 font-mono text-[10px]">
              <span>⌘</span>K
            </kbd>
          </button>
        </div>
        {children}
      </motion.div>
    </>
  );
}
