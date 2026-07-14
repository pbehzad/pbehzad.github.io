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
      <div className="flex items-end justify-between gap-4 mb-7">
        <div><h1>Texts</h1><p className="mt-1.5 text-sm" style={{ color: '#77766f' }}>Essays, articles, papers, notes, and their PDF editions.</p></div>
        <Link
          href="/admin/texts/new"
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
            { key: 'year', label: 'Year' },
            { key: 'type', label: 'Type' },
            {
              key: 'content_file',
              label: 'Body',
              render: (v) => (
                <span className={`admin-status ${v ? 'admin-status-published' : ''}`}>
                  {v ? 'markdown' : 'external'}
                </span>
              ),
            },
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
          editHref={(item) => `/admin/texts/${item.id}`}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
