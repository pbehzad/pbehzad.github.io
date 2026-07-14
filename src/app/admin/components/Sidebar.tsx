'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navGroups = [
  {
    label: 'Workspace',
    items: [
      { label: 'Overview', href: '/admin' },
      { label: 'Home page', href: '/admin/home' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Compositions', href: '/admin/compositions' },
      { label: 'Events', href: '/admin/events' },
      { label: 'Texts', href: '/admin/texts' },
      { label: 'Tools', href: '/admin/tools' },
      { label: 'File library', href: '/admin/files' },
    ],
  },
  {
    label: 'Site',
    items: [
      { label: 'Profile', href: '/admin/profile' },
      { label: 'Contact', href: '/admin/contact' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <nav
      className="admin-sidebar w-full shrink-0 flex flex-col justify-between px-4 py-4 md:sticky md:top-0 md:h-screen md:w-60 md:px-4 md:py-5"
      style={{ borderRight: '1px solid' }}
    >
      <div>
        <div className="mb-5 flex items-center gap-3 px-2 md:mb-8">
          <span className="admin-brand-mark">PB</span>
          <span className="flex flex-col">
            <span className="text-sm font-medium tracking-tight">Parham Behzad</span>
            <span className="text-[11px]" style={{ color: '#73736d' }}>Site administration</span>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 md:flex md:flex-col md:gap-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="admin-section-label mb-2 px-2">{group.label}</div>
              <div className="grid grid-cols-2 gap-0.5 sm:flex sm:flex-col">
                {group.items.map((item) => {
                  const isActive = pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <Link key={item.href} href={item.href} data-active={isActive} className="admin-nav-link px-2.5 py-2">
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 md:mt-8" style={{ borderTop: '1px solid #2b2b27' }}>
          <Link
            href="/"
            className="admin-nav-link block px-2.5 py-2"
          >
            View live site ↗
          </Link>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="admin-nav-link mt-3 rounded px-2.5 py-2 text-left md:mt-0"
      >
        Sign out
      </button>
    </nav>
  );
}
