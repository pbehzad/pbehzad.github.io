import React from 'react';
import Sidebar from './components/Sidebar';
import './admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <main className="admin-main min-w-0 flex-1 overflow-y-auto p-4 sm:p-7 md:p-10 lg:p-12">
        {children}
      </main>
    </div>
  );
}
