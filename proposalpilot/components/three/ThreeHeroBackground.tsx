'use client';

/**
 * ThreeHeroBackground — ProposalPilot
 * Lazy-loaded ProposalAssemblyScene injected as a fixed background behind the hero section.
 */
import dynamic from 'next/dynamic';

const ProposalAssemblyScene = dynamic(
  () => import('./ProposalAssemblyScene').then((m) => ({ default: m.ProposalAssemblyScene })),
  { ssr: false, loading: () => null },
);

export function ThreeHeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-30"
    >
      <ProposalAssemblyScene height="100%" />
    </div>
  );
}
