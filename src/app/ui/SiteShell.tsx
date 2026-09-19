import type { ReactNode } from 'react';
import { BrandLink } from './BrandLink';
import { SiteMenu } from './SiteMenu';
import { SkipLink } from './SkipLink';
import { PUBLIC_SECTIONS } from './navigation';

const MAIN_ID = 'main';

type SiteShellProps = {
  brandName: string;
  isHome?: boolean;
  children: ReactNode;
};

/**
 * Shared public shell: brand at top left, menu control at top right, and one
 * main landmark. All navigation is present in the server-rendered HTML.
 */
export function SiteShell({ brandName, isHome = false, children }: SiteShellProps) {
  return (
    <div className="ui ui-shell">
      <SkipLink targetId={MAIN_ID} />
      <header className="ui-shell__header">
        <BrandLink name={brandName} isCurrent={isHome} />
        <SiteMenu sections={PUBLIC_SECTIONS} contentId={MAIN_ID} />
      </header>
      <main id={MAIN_ID} tabIndex={-1} className="ui-shell__main">
        {children}
      </main>
    </div>
  );
}
