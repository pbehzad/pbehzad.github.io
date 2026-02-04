'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminTable from '../components/AdminTable';

export default function CompositionsAdmin() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    fetch('/api/admin/compositions')
      .then(r => r.json())
      .then(d => {
        d.sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
          String(b.year).localeCompare(String(a.year))
        );
        setData(d);
        setLoading(false);
      });
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (item: Record<string, unknown>) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    await fetch('/api/admin/compositions', {
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
          Compositions
        </h1>
        <Link
          href="/admin/compositions/new"
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
            { key: 'year', label: 'Date', render: (v) => String(v) },
            { key: 'instruments', label: 'Instruments' },
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
          editHref={(item) => `/admin/compositions/${item.id}`}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
