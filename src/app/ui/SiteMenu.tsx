'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { MenuButton, MenuButtonFace } from './MenuButton';
import { getCurrentState } from './navigation';
import type { NavigationSection } from './navigation';

const PANEL_ID = 'site-menu';

const subscribeNever = () => () => {};

// False during server rendering and hydration, true once the client has
// taken over. Before that, the control is a plain link that opens the menu
// through CSS :target, so navigation works without JavaScript.
function useIsEnhanced() {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}

type SiteMenuProps = {
  sections: readonly NavigationSection[];
  contentId: string;
};

export function SiteMenu({ sections, contentId }: SiteMenuProps) {
  const pathname = usePathname();
  const isEnhanced = useIsEnhanced();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  // The menu is open only for the path it was opened on, so any route
  // change closes it without an effect.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const isOpen = openPath === pathname;

  const close = useCallback((returnFocus: boolean) => {
    setOpenPath(null);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const content = document.getElementById(contentId);
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    content?.setAttribute('inert', '');
    root.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      content?.removeAttribute('inert');
      root.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, contentId, close]);

  // Keep Tab within the button and the open list.
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!isOpen || event.key !== 'Tab') return;
    const links = panelRef.current?.querySelectorAll<HTMLAnchorElement>('a[href]');
    const button = buttonRef.current;
    if (!links?.length || !button) return;
    const first = button;
    const last = links[links.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  // Any click on the layer that is not on a link counts as outside the menu.
  const onPanelClick = (event: ReactMouseEvent<HTMLElement>) => {
    if (!(event.target as Element).closest('a')) close(true);
  };

  return (
    <div className="ui-site-menu" onKeyDown={onKeyDown}>
      <div className="ui-site-menu__control">
        {isEnhanced ? (
          <MenuButton
            ref={buttonRef}
            controls={PANEL_ID}
            expanded={isOpen}
            onClick={() => (isOpen ? close(false) : setOpenPath(pathname))}
          />
        ) : (
          <a className="ui-menu-button" href={`#${PANEL_ID}`}>
            <MenuButtonFace label="Menu" />
          </a>
        )}
      </div>

      <nav
        ref={panelRef}
        id={PANEL_ID}
        className="ui-site-menu__panel"
        aria-label="Site"
        data-enhanced={isEnhanced ? '' : undefined}
        data-open={isOpen ? '' : undefined}
        onClick={onPanelClick}
      >
        <ul className="ui-site-menu__list">
          {sections.map((section) => (
            <li key={section.href}>
              <Link
                className="ui-site-menu__link"
                href={section.href}
                aria-current={getCurrentState(pathname, section.href)}
                onClick={() => close(false)}
              >
                {section.label}
              </Link>
            </li>
          ))}
        </ul>
        {!isEnhanced && (
          <a className="ui-site-menu__fallback-close" href={`#${contentId}`}>
            Close menu
          </a>
        )}
      </nav>
    </div>
  );
}
