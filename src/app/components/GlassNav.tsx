'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { contentGlassTuning, glassLens } from './GlassLens';

const LINKS = [
  { href: '/', label: 'home' },
  { href: '/compositions', label: 'works' },
  { href: '/events', label: 'events' },
  { href: '/texts', label: 'texts' },
  { href: '/about', label: 'about' },
  { href: '/contact', label: 'contact' },
];

// The name in the top-right corner. Desktop: hovering it opens a small glass
// dropdown with the site nav (the name itself still links home). Mobile: it
// becomes a button that opens a fullscreen glass menu.
export default function GlassNav() {
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [mobile, setMobile] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const materialTokenRef = useRef<object | null>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (open) setRendered(true);
  }, [open]);

  // Keep the material mounted through its closing dissolve so the package
  // lens can fade out with the panel.
  useEffect(() => {
    if (!rendered) return;
    const panel = panelRef.current;
    if (!panel) return;
    const token = {};
    materialTokenRef.current = token;

    glassLens.activate(token, panel, progressRef.current, {
      variant: 'navigation',
      freezesBreathing: false,
      interactionTarget: panel,
    });

    return () => {
      glassLens.release(token);
      materialTokenRef.current = null;
    };
  }, [rendered]);

  useEffect(() => {
    if (!rendered) return;
    const token = materialTokenRef.current;
    if (!token) return;

    const target = open ? 1 : 0;
    const from = progressRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const baseDuration = target > from ? contentGlassTuning.formMs * 0.75 : contentGlassTuning.meltMs;
    const duration = reducedMotion ? 0 : Math.max(1, baseDuration * Math.abs(target - from));
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = duration <= 0 ? 1 : Math.min(1, (now - start) / duration);
      const eased = target > from ? 1 - Math.pow(1 - t, 3) : t * t * (3 - 2 * t);
      progressRef.current = t >= 1 ? target : from + (target - from) * eased;
      glassLens.update(token, progressRef.current);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else if (target === 0) {
        setRendered(false);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [open, rendered]);

  return (
    <div
      className="fixed top-6 right-6 md:top-12 md:right-12 z-50"
      onPointerEnter={() => {
        if (!mobile) setOpen(true);
      }}
      onPointerLeave={() => {
        if (!mobile) setOpen(false);
      }}
    >
      {mobile ? (
        <button
          onClick={() => setOpen((v) => !v)}
          className="glass-detail-link select-none text-sm font-normal tracking-wide"
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '2px solid #ffffff',
            padding: 0,
            color: '#ffffff',
            WebkitTapHighlightColor: 'transparent',
          }}
          aria-expanded={open}
          aria-label="Open navigation"
        >
          parham behzad
        </button>
      ) : (
        <Link href="/" className="glass-detail-link text-sm font-normal tracking-wide hover:opacity-70 transition-opacity">
          parham behzad
        </Link>
      )}

      {rendered && (
        <div
          ref={panelRef}
          className={`glass-material glass-nav-panel ${mobile ? 'glass-nav-fullscreen' : 'glass-nav-dropdown'}`}
          data-glass-variant="navigation"
          aria-hidden={!open}
          inert={!open}
          style={{ pointerEvents: open ? 'auto' : 'none' }}
        >
          {mobile && (
            <button className="glass-nav-close" onClick={() => setOpen(false)} aria-label="Close navigation">
              &times;
            </button>
          )}
          <nav>
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="glass-detail-link" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
