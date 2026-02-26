'use client';

import { useEffect, useRef } from 'react';
import { recordProposalView, updateProposalView } from '@/lib/actions/analytics';

interface ViewTrackerProps {
  proposalId: string;
  sectionIds: string[];
}

/**
 * Invisible component that tracks engagement metrics for shared proposals.
 * Records: page view, time spent, scroll depth, sections viewed.
 */
export function ViewTracker({ proposalId, sectionIds }: ViewTrackerProps) {
  const viewIdRef = useRef<string | null>(null);
  const startTimeRef = useRef(Date.now());
  const maxScrollRef = useRef(0);
  const sectionsViewedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Detect device type
    const ua = navigator.userAgent;
    const isMobile = /Mobi|Android/i.test(ua);
    const isTablet = /Tablet|iPad/i.test(ua);
    const device_type = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

    // Detect browser
    let browser = 'unknown';
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'chrome';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'safari';
    else if (ua.includes('Firefox')) browser = 'firefox';
    else if (ua.includes('Edg')) browser = 'edge';

    // Record initial view
    recordProposalView(proposalId, {
      device_type,
      browser,
      duration_seconds: 0,
      scroll_depth: 0,
      sections_viewed: [],
    }).then((result) => {
      if (result.data) {
        viewIdRef.current = result.data.id;
      }
    });

    // Track scroll depth
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const depth = Math.round((scrollTop / docHeight) * 100);
        maxScrollRef.current = Math.max(maxScrollRef.current, depth);
      }

      // Check which sections are visible
      sectionIds.forEach((id) => {
        const el = document.getElementById(`section-${id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            sectionsViewedRef.current.add(id);
          }
        }
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Update view data periodically and on unload
    function sendUpdate() {
      if (!viewIdRef.current) return;
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      updateProposalView(viewIdRef.current, {
        duration_seconds: duration,
        scroll_depth: maxScrollRef.current,
        sections_viewed: Array.from(sectionsViewedRef.current),
      });
    }

    // Send updates every 30 seconds
    const interval = setInterval(sendUpdate, 30000);

    // Send on page visibility change or unload
    function handleVisibilityChange() {
      if (document.hidden) sendUpdate();
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
      sendUpdate();
    };
  }, [proposalId, sectionIds]);

  return null; // Invisible tracking component
}
