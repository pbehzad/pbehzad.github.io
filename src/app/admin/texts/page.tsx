'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminTable from '../components/AdminTable';

export default function TextsAdmin() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    fetch('/api/admin/texts')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (item: Record<string, unknown>) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    await fetch('/api/admin/texts', {
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
          Texts
        </h1>
        <Link
          href="/admin/texts/new"
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
            { key: 'year', label: 'Year' },
            { key: 'type', label: 'Type' },
            {
              key: 'content_file',
              label: 'Body',
              render: (v) => (
                <span style={{ color: v ? '#4ade80' : '#555', fontSize: '12px' }}>
                  {v ? 'markdown' : 'external'}
                </span>
              ),
            },
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
          editHref={(item) => `/admin/texts/${item.id}`}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
