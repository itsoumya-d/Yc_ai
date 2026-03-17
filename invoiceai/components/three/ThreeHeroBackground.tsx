'use client';

/**
 * ThreeHeroBackground — InvoiceAI
 * Lazy-loaded CashFlowScene injected as a fixed background behind the hero section.
 * Usage: place as first child inside the hero <section>.
 */
import dynamic from 'next/dynamic';

const CashFlowScene = dynamic(
  () => import('./CashFlowScene').then((m) => ({ default: m.CashFlowScene })),
  { ssr: false, loading: () => null },
);

export function ThreeHeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-30"
    >
      <CashFlowScene height="100%" />
    </div>
  );
}
