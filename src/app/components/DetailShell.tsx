import Link from 'next/link';
import type { ReactNode } from 'react';
import AsciiSpace from './AsciiSpace';
import GlassPanel from './GlassPanel';

// Shared shell for detail pages (composition / event / text): the ASCII
// space fills the viewport, a large glass panel sits flush-left, and the
// page content scrolls on top of the glass.
export default function DetailShell({
  backHref,
  backLabel,
  children,
}: {
  backHref: string;
  backLabel: string;
  children: ReactNode;
}) {
  return (
    <main className="relative h-dvh w-screen overflow-hidden bg-black text-white">
      <AsciiSpace />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-black/20" />

      <Link
        href="/"
        aria-label="Return to Parham Behzad home"
        className="glass-detail-link fixed top-6 right-6 z-20 text-sm font-normal tracking-wide transition-opacity hover:opacity-70 md:top-12 md:right-12"
      >
        parham behzad
      </Link>

      <GlassPanel>
        <div className="glass-detail-scroll">
          <Link
            href={backHref}
            className="glass-detail-link inline-block text-xs uppercase tracking-[0.2em] opacity-45 hover:opacity-80 transition-opacity"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.4)' }}
          >
            {backLabel}
          </Link>
          {children}
        </div>
      </GlassPanel>
    </main>
  );
}
