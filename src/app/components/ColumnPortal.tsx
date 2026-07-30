'use client';

import dynamic from 'next/dynamic';
import { useLayoutEffect, useState } from 'react';
import MobilePortal from './MobilePortal';
import type { ColumnPortalData } from './PortalTypes';

export type { ColumnPortalData } from './PortalTypes';

// Mirrors Tailwind's `max-[961px]` range (`width < 961px`) exactly, so
// fractional widths cannot land between the mobile and desktop layouts.
const MOBILE_VIEWPORT_QUERY = '(width < 961px)';

const DesktopColumnPortal = dynamic(() => import('./DesktopColumnPortal'), {
  ssr: false,
  loading: () => (
    <main className="grid min-h-svh place-items-center bg-black text-white">
      <span className="text-xs font-light uppercase tracking-[0.18em] opacity-70">
        parham behzad
      </span>
    </main>
  ),
});

type ColumnPortalProps = {
  data: ColumnPortalData;
  initialPath?: string;
};

// Mobile is a separate composition rather than a compressed version of the
// six-column desktop portal. The mobile surface is also the deterministic
// server snapshot; wide screens swap to the separately loaded desktop portal
// in a layout effect before first paint.
export default function ColumnPortal(props: ColumnPortalProps) {
  const [mobileViewport, setMobileViewport] = useState<boolean | null>(null);

  useLayoutEffect(() => {
    const query = window.matchMedia(MOBILE_VIEWPORT_QUERY);
    const sync = () => setMobileViewport(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  if (mobileViewport === false) {
    return <DesktopColumnPortal {...props} />;
  }

  return (
    <div
      className="mobile-portal-bootstrap"
      data-hydrating={mobileViewport === null ? 'true' : 'false'}
    >
      <MobilePortal {...props} />
    </div>
  );
}
