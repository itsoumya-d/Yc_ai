'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { CommandPalette, useCommandPaletteShortcut } from '@/components/CommandPalette';
import { Search } from 'lucide-react';

export function DashboardContent({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  useCommandPaletteShortcut(() => setPaletteOpen(true));

  return (
    <>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* Top bar with ⌘K trigger */}
      <div className="sticky top-0 z-10 flex h-14 items-center justify-end border-b border-border bg-background/80 px-8 backdrop-blur-sm">
        <button
          onClick={() => setPaletteOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search...</span>
          <kbd className="ml-2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="mx-auto max-w-6xl px-8 py-8"
      >
        {children}
      </motion.div>
    </>
  );
}
