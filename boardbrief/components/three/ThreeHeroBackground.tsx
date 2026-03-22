'use client';

/**
 * ThreeHeroBackground — BoardBrief
 * Lazy-loaded AgendaOrbitScene injected as a fixed background behind the hero section.
 */
import dynamic from 'next/dynamic';

const AgendaOrbitScene = dynamic(
  () => import('./AgendaOrbitScene').then((m) => ({ default: m.AgendaOrbitScene })),
  { ssr: false, loading: () => null },
);

export function ThreeHeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-30"
    >
      <AgendaOrbitScene height="100%" />
    </div>
  );
}
