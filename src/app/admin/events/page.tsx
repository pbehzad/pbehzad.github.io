'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminTable from '../components/AdminTable';

export default function EventsAdmin() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    fetch('/api/admin/events')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (item: Record<string, unknown>) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    await fetch('/api/admin/events', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id }),
    });
    loadData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xs font-normal uppercase tracking-wider opacity-40">
          Events
        </h1>
        <Link
          href="/admin/events/new"
          className="text-xs font-normal uppercase tracking-wider px-3 py-1.5 border border-white/20 hover:border-white/50 transition-colors"
        >
          + new
        </Link>
      </div>

      {loading ? (
        <div className="text-sm font-normal opacity-30">loading...</div>
      ) : (
        <AdminTable
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'date', label: 'Date' },
            { key: 'venue', label: 'Venue' },
            { key: 'city', label: 'City' },
            {
              key: 'status',
              label: 'Status',
              render: (v) => (
                <span className={`text-xs ${v === 'published' ? 'opacity-60' : 'opacity-30'}`}>
                  {String(v)}
                </span>
              ),
            },
          ]}
          data={data}
          editHref={(item) => `/admin/events/${item.id}`}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
