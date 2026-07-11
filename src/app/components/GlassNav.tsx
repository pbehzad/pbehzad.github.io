'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { glassLens, glassTuning } from './GlassLens';

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
  const [mobile, setMobile] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // lens over the open panel: forms quickly, tracks geometry while open
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const token = {};
    const start = performance.now();
    const duration = Math.max(1, glassTuning.formMs * 0.5);
    let raf = 0;

    glassLens.activate(token, panel.getBoundingClientRect(), 0, null, { freezesBreathing: false });
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const progress = 1 - (1 - t) * (1 - t);
      panel.style.opacity = progress.toFixed(3);
      glassLens.update(token, panel.getBoundingClientRect(), progress);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      glassLens.release(token);
    };
  }, [open]);

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
          style={{ background: 'transparent', border: 'none', borderBottom: '2px solid #ffffff', padding: 0, color: '#ffffff' }}
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

      {open && (
        <div ref={panelRef} className={`glass-nav-panel ${mobile ? 'glass-nav-fullscreen' : 'glass-nav-dropdown'}`}>
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
