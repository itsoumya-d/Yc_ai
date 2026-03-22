'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

// ── Page transition wrapper ──────────────────────────────────────────────────
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// ── Fade in with stagger for list items ──────────────────────────────────────
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

export const fadeUpItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

export function StaggerList({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeUpItem} className={className}>
      {children}
    </motion.div>
  );
}

// ── Skeleton loading components ───────────────────────────────────────────────
function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-lg ${className ?? ''}`}
      style={{
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
      <Shimmer className="h-4 w-3/4" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <Shimmer key={i} className={`h-3 ${i === lines - 2 ? 'w-1/2' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-lg">
          <Shimmer className="h-4 w-1/4" />
          <Shimmer className="h-4 w-1/3" />
          <Shimmer className="h-4 w-1/4 ml-auto" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonKPIGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <Shimmer className="h-3 w-1/2" />
          <Shimmer className="h-8 w-3/4" />
          <Shimmer className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

// ── Slide in from side ────────────────────────────────────────────────────────
export function SlideIn({ children, from = 'right' }: { children: ReactNode; from?: 'left' | 'right' | 'bottom' }) {
  const initial =
    from === 'left' ? { x: -24, opacity: 0 }
    : from === 'right' ? { x: 24, opacity: 0 }
    : { y: 24, opacity: 0 };
  return (
    <motion.div initial={initial} animate={{ x: 0, y: 0, opacity: 1 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
      {children}
    </motion.div>
  );
}

// ── Global shimmer keyframes (inject once) ────────────────────────────────────
export function AnimationStyles() {
  return (
    <style>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  );
}
