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
    <nav
      className="w-56 shrink-0 h-screen sticky top-0 flex flex-col justify-between py-8 px-5"
      style={{ background: '#0a0a0a', borderRight: '1px solid #222' }}
    >
      <div>
        <div className="mb-8">
          <span className="text-xs font-normal uppercase tracking-widest" style={{ color: '#555' }}>
            Admin
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-normal px-3 py-2 rounded transition-colors"
                style={{
                  color: isActive ? '#ffffff' : '#888',
                  background: isActive ? '#1e1e1e' : 'transparent',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-8 pt-6" style={{ borderTop: '1px solid #1a1a1a' }}>
          <Link
            href="/"
            className="text-xs font-normal px-3 py-2 rounded block transition-colors"
            style={{ color: '#555' }}
          >
            ← View site
          </Link>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="text-xs font-normal px-3 py-2 rounded text-left transition-colors"
        style={{ color: '#555' }}
      >
        Sign out
      </button>
    </nav>
  );
}
