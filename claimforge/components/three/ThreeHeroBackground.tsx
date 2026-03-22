'use client';

/**
 * ThreeHeroBackground — ClaimForge
 * Lazy-loaded ClaimFlowScene injected as a fixed background behind the hero section.
 */
import dynamic from 'next/dynamic';

const ClaimFlowScene = dynamic(
  () => import('./ClaimFlowScene').then((m) => ({ default: m.ClaimFlowScene })),
  { ssr: false, loading: () => null },
);

export function ThreeHeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-30"
    >
      <ClaimFlowScene height="100%" />
    </div>
  );
}
