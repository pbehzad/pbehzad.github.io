'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { glassLens, glassTuning } from './GlassLens';

// Always-on glass region for detail pages: the lens sits at full strength
// from mount (the identity-column exception applies here too — glass is
// instant, no formation). The .glass-detail-panel CSS carries the visible
// surface from the very first paint; this component only adds the live
// refraction of the ASCII space behind it.
export default function GlassPanel({ children, className }: { children: ReactNode; className?: string }) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const token = {};
    const sync = () => {
      glassLens.update(token, panel.getBoundingClientRect(), 1);
    };

    // the CSS fallback tint is static; pick up the live tuning value here
    panel.style.background = `rgba(255, 255, 255, ${glassTuning.tint})`;
    glassLens.activate(token, panel.getBoundingClientRect(), 1, null, { freezesBreathing: false });

    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(panel);
    window.addEventListener('resize', sync);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', sync);
      glassLens.release(token);
    };
  }, []);

  return (
    <div ref={panelRef} className={`glass-detail-panel ${className ?? ''}`}>
      {children}
    </div>
  );
}
