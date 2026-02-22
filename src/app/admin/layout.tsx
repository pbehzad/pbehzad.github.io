import React from 'react';
import Sidebar from './components/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: '#0d0d0d', color: '#e5e5e5' }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 md:p-10">
        {children}
      </main>
    </div>
  );
}
