'use client';

/**
 * ThreeHeroBackground — StoryThread
 * Lazy-loaded InkFlowScene injected as a fixed background behind the hero section.
 */
import dynamic from 'next/dynamic';

const InkFlowScene = dynamic(
  () => import('./InkFlowScene').then((m) => ({ default: m.InkFlowScene })),
  { ssr: false, loading: () => null },
);

export function ThreeHeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-30"
    >
      <InkFlowScene height="100%" />
    </div>
  );
}
