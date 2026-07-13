'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { glassLens } from './GlassLens';

// Always-on regular material for detail pages. CSS supplies the surface on
// first paint; the package engine adds live refraction after hydration.
export default function GlassPanel({ children, className }: { children: ReactNode; className?: string }) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const token = {};
    glassLens.activate(token, panel, 1, {
      variant: 'regular',
      freezesBreathing: false,
      interactionTarget: panel,
    });

    return () => {
      glassLens.release(token);
    };
  }, []);

  return (
    <div
      ref={panelRef}
      className={`glass-material glass-detail-panel ${className ?? ''}`}
      data-glass-variant="regular"
    >
      {children}
    </div>
  );
}
