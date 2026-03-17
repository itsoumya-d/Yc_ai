'use client';

/**
 * ThreeHeroBackground — PetOS
 * Lazy-loaded PetAuraScene injected as a fixed background behind the hero section.
 */
import dynamic from 'next/dynamic';

const PetAuraScene = dynamic(
  () => import('./PetAuraScene').then((m) => ({ default: m.PetAuraScene })),
  { ssr: false, loading: () => null },
);

export function ThreeHeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-30"
    >
      <PetAuraScene height="100%" />
    </div>
  );
}
