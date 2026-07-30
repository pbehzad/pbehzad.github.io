'use client';

import { useEffect, useRef } from 'react';
import { glassLens } from './GlassLens';

// A real mobile lens used both as the fixed section-page surface and as a
// document-flow pane for the home previews. Flow panes resync their lens
// position while scrolling against the fixed ASCII source underneath.
export default function MobileSectionGlass({
  className = 'mobile-section-glass',
  trackScroll = false,
}: {
  className?: string;
  trackScroll?: boolean;
}) {
  const paneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;

    const token = {};
    let active = false;
    let observer: MutationObserver | null = null;
    const reposition = () => glassLens.reposition();

    const activate = () => {
      if (active) return true;
      const root = pane.closest('main');
      if (!root?.querySelector('.ascii-space-host')) return false;

      glassLens.activate(token, pane, 1, {
        variant: 'regular',
        freezesBreathing: false,
        interactionTarget: pane,
      });
      active = true;
      return true;
    };

    if (!activate()) {
      observer = new MutationObserver(() => {
        if (activate()) {
          observer?.disconnect();
          observer = null;
        }
      });
      observer.observe(pane.closest('main') ?? document.body, {
        childList: true,
        subtree: true,
      });
    }

    if (trackScroll) {
      window.addEventListener('scroll', reposition, { passive: true });
      window.visualViewport?.addEventListener('scroll', reposition, { passive: true });
      window.visualViewport?.addEventListener('resize', reposition, { passive: true });
    }

    return () => {
      observer?.disconnect();
      if (trackScroll) {
        window.removeEventListener('scroll', reposition);
        window.visualViewport?.removeEventListener('scroll', reposition);
        window.visualViewport?.removeEventListener('resize', reposition);
      }
      if (active) glassLens.release(token);
    };
  }, [trackScroll]);

  return (
    <div
      ref={paneRef}
      className={`${className} glass-material`}
      data-glass-variant="regular"
      aria-hidden="true"
    />
  );
}
