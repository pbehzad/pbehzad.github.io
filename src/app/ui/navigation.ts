export type NavigationSection = {
  href: string;
  label: string;
};

// Public sections in menu order. Routes are unchanged; only labels are UI copy.
export const PUBLIC_SECTIONS: readonly NavigationSection[] = [
  { href: '/compositions', label: 'Works' },
  { href: '/events', label: 'Events' },
  { href: '/texts', label: 'Texts' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function getCurrentState(pathname: string, href: string): 'page' | 'true' | undefined {
  if (pathname === href) return 'page';
  if (pathname.startsWith(`${href}/`)) return 'true';
  return undefined;
}
