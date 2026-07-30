import Link from 'next/link';
import type { ReactNode } from 'react';
import AsciiSpace from './AsciiSpace';
import GlassPanel from './GlassPanel';

// Shared shell for detail pages (composition / event / text). Desktop keeps
// the viewport-sized glass composition; mobile lets the document scroll and
// uses a compact sticky navigation bar.
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
    <main className="relative h-dvh w-screen overflow-hidden bg-black text-white max-[961px]:!h-auto max-[961px]:min-h-dvh max-[961px]:!w-full max-[961px]:!overflow-x-clip max-[961px]:!overflow-y-visible">
      <AsciiSpace mobileMode="ambient" fixedOnMobile />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-black/30 max-[961px]:fixed" />

      <header className="sticky top-0 z-30 grid min-h-[calc(44px+env(safe-area-inset-top))] grid-cols-[minmax(0,1fr)_auto] items-end gap-3 border-b border-white/10 bg-black/80 !pt-[env(safe-area-inset-top)] !pr-[max(1rem,env(safe-area-inset-right))] !pl-[max(1rem,env(safe-area-inset-left))] backdrop-blur-xl min-[961px]:hidden">
        <Link
          href={backHref}
          aria-label={`Back to ${backLabel}`}
          className="glass-detail-link flex min-h-11 min-w-0 items-center gap-2 border-0 text-xs uppercase tracking-[0.16em] opacity-70 transition-opacity hover:opacity-100"
          style={{ borderBottom: 'none' }}
        >
          <span aria-hidden="true" className="ml-1 shrink-0 text-base leading-none">
            ←
          </span>
          <span className="truncate">{backLabel}</span>
        </Link>

        <Link
          href="/"
          aria-label="Return to Parham Behzad home"
          className="glass-detail-link flex min-h-11 shrink-0 items-center border-0 text-xs font-normal tracking-wide whitespace-nowrap opacity-80 transition-opacity hover:opacity-100"
          style={{ borderBottom: 'none' }}
        >
          parham behzad
        </Link>
      </header>

      <Link
        href="/"
        aria-label="Return to Parham Behzad home"
        className="glass-detail-link fixed top-6 right-6 z-20 hidden text-sm font-normal tracking-wide transition-opacity hover:opacity-70 min-[961px]:block md:top-12 md:right-12"
      >
        parham behzad
      </Link>

      <div className="contents max-[961px]:relative max-[961px]:z-10 max-[961px]:block max-[961px]:!pt-3 max-[961px]:!pr-[max(0.75rem,env(safe-area-inset-right))] max-[961px]:!pb-[max(0.75rem,env(safe-area-inset-bottom))] max-[961px]:!pl-[max(0.75rem,env(safe-area-inset-left))]">
        <GlassPanel className="max-[961px]:!relative max-[961px]:!inset-auto max-[961px]:!h-auto max-[961px]:!w-full">
          <div className="glass-detail-scroll max-[961px]:!h-auto max-[961px]:!overflow-visible max-[961px]:!px-4 max-[961px]:!pt-6 max-[961px]:!pb-[max(4rem,calc(env(safe-area-inset-bottom)+2rem))]">
            <Link
              href={backHref}
              className="glass-detail-link hidden text-xs uppercase tracking-[0.2em] opacity-45 transition-opacity hover:opacity-80 min-[961px]:inline-block"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.4)' }}
            >
              {backLabel}
            </Link>
            <div className="min-w-0 max-[961px]:[&>header:first-child]:mt-2 max-[961px]:[&_h1]:text-[clamp(1.75rem,7.6vw,2.25rem)] max-[961px]:[&_h1]:leading-[1.08] max-[961px]:[&_h1]:break-words">
              {children}
            </div>
          </div>
        </GlassPanel>
      </div>
    </main>
  );
}
