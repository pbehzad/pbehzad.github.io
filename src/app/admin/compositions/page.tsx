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
      <div className="flex items-end justify-between gap-4 mb-7">
        <div><h1>Compositions</h1><p className="mt-1.5 text-sm" style={{ color: '#77766f' }}>Manage works, scores, recordings, and publication status.</p></div>
        <Link
          href="/admin/compositions/new"
          className="admin-button admin-button-primary"
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
                <span className={`admin-status ${v === 'published' ? 'admin-status-published' : ''}`}>
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
