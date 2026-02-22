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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-normal" style={{ color: '#e5e5e5' }}>
          Compositions
        </h1>
        <Link
          href="/admin/compositions/new"
          className="text-sm font-normal px-4 py-2 rounded transition-colors"
          style={{ background: '#ffffff', color: '#000000' }}
        >
          + New
        </Link>
      </div>

      {loading ? (
        <div className="text-sm" style={{ color: '#555' }}>Loading…</div>
      ) : (
        <AdminTable
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'year', label: 'Year', render: (v) => String(v) },
            { key: 'instruments', label: 'Instruments' },
            {
              key: 'status',
              label: 'Status',
              render: (v) => (
                <span style={{ color: v === 'published' ? '#4ade80' : '#888', fontSize: '12px' }}>
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
