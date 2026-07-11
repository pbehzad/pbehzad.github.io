import Link from 'next/link';
import type { ReactNode } from 'react';
import AsciiSpace from './AsciiSpace';
import GlassPanel from './GlassPanel';
import GlassTunerPanel from './GlassTunerPanel';

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

      <div className="fixed top-6 right-6 md:top-12 md:right-12 z-50">
        <Link href="/" className="glass-detail-link text-sm font-normal tracking-wide hover:opacity-70 transition-opacity">
          parham behzad
        </Link>
      </div>

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

      <GlassTunerPanel />
    </main>
  );
}
