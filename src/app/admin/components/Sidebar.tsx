'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Compositions', href: '/admin/compositions' },
  { label: 'Events', href: '/admin/events' },
  { label: 'Profile', href: '/admin/profile' },
  { label: 'Contact', href: '/admin/contact' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <nav className="w-48 shrink-0 border-r border-white/10 h-screen sticky top-0 flex flex-col justify-between py-8 px-6">
      <div>
        <Link href="/" className="text-xs font-normal uppercase tracking-wider opacity-40 hover:opacity-100 transition-opacity">
          site
        </Link>

        <div className="mt-12 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-normal py-1.5 transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="text-xs font-normal uppercase tracking-wider opacity-30 hover:opacity-100 transition-opacity text-left"
      >
        logout
      </button>
    </nav>
  );
}
