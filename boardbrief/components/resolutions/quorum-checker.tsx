'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuorumCheckerProps {
  totalBoardMembers: number;
  resolutionCount: number;
}

const QUORUM_THRESHOLD = 0.6;

export function QuorumChecker({ totalBoardMembers, resolutionCount }: QuorumCheckerProps) {
  const [boardSize, setBoardSize] = useState(totalBoardMembers);
  const [expanded, setExpanded] = useState(true);

  const minVotesNeeded = Math.ceil(boardSize * QUORUM_THRESHOLD);
  const pct = boardSize > 0 ? Math.round((minVotesNeeded / boardSize) * 100) : 0;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--muted)]/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
            <Users className="w-4 h-4 text-navy-700" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[var(--foreground)]">Quorum Requirements</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              60% threshold &mdash; {minVotesNeeded} of {boardSize} votes needed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-2.5 py-1 rounded-full">
            <Info className="w-3 h-3" />
            {resolutionCount} resolution{resolutionCount !== 1 ? 's' : ''}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[var(--muted-foreground)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="quorum-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-[var(--border)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
                {/* Board size selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
                    Board Size
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBoardSize((n) => Math.max(1, n - 1))}
                      className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors text-lg leading-none"
                      aria-label="Decrease board size"
                    >
                      &minus;
                    </button>
                    <span className="w-12 text-center font-data text-2xl font-bold text-[var(--foreground)]">
                      {boardSize}
                    </span>
                    <button
                      onClick={() => setBoardSize((n) => n + 1)}
                      className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors text-lg leading-none"
                      aria-label="Increase board size"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">Active voting members</p>
                </div>

                {/* Quorum threshold */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
                    Quorum Threshold
                  </label>
                  <div className="flex items-end gap-1">
                    <span className="font-data text-2xl font-bold text-[var(--foreground)]">60</span>
                    <span className="text-sm text-[var(--muted-foreground)] mb-0.5">%</span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">Standard board governance</p>
                </div>

                {/* Minimum votes needed */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
                    Minimum Votes Needed
                  </label>
                  <div className="flex items-end gap-1">
                    <span className="font-data text-2xl font-bold text-navy-700">
                      {minVotesNeeded}
                    </span>
                    <span className="text-sm text-[var(--muted-foreground)] mb-0.5">
                      of {boardSize}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    = &lceil;{boardSize} &times; 0.6&rceil; = {minVotesNeeded}
                  </p>
                </div>
              </div>

              {/* Progress bar showing quorum fraction */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-1.5">
                  <span>Quorum fraction of board</span>
                  <span className="font-data font-semibold text-navy-700">{pct}%</span>
                </div>
                <div className="h-2.5 bg-[var(--muted)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-navy-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Any resolution requires at least{' '}
                  <strong className="text-[var(--foreground)]">{minVotesNeeded} affirmative votes</strong>{' '}
                  to achieve quorum and be considered valid.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
