'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import AdminTable from '../components/AdminTable';

export default function ToolsAdmin() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => fetch('/api/admin/tools').then((response) => response.json()).then((items) => { setData(items); setLoading(false); }), []);
  useEffect(() => { load(); }, [load]);
  const remove = async (item: Record<string, unknown>) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    await fetch('/api/admin/tools', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id }) });
    load();
  };
  return (
    <div>
      <div className="mb-7 flex items-end justify-between gap-4">
        <div><h1>Tools</h1><p className="mt-1.5 text-sm" style={{ color: '#77766f' }}>Software, experiments, utilities, and ongoing projects.</p></div>
        <Link href="/admin/tools/new" className="admin-button admin-button-primary">+ New</Link>
      </div>
      {loading ? <div className="text-sm" style={{ color: '#555' }}>Loading…</div> : <AdminTable columns={[
        { key: 'name', label: 'Name' }, { key: 'year', label: 'Year' }, { key: 'category', label: 'Category' }, { key: 'status', label: 'Status' },
      ]} data={data} editHref={(item) => `/admin/tools/${item.id}`} onDelete={remove} />}
    </div>
  );
}
