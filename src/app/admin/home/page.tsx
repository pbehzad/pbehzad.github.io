'use client';

import { useEffect, useState } from 'react';
import AdminForm from '../components/AdminForm';
import AdminInput from '../components/AdminInput';
import AdminObjectList from '../components/AdminObjectList';

type RecentWork = { title: string; year: string };

export default function HomeAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [recentWorks, setRecentWorks] = useState<RecentWork[]>([]);

  useEffect(() => {
    fetch('/api/admin/home').then((response) => response.json()).then((data) => {
      setName(data.hero?.name || '');
      setTitle(data.hero?.title || '');
      setSubtitle(data.hero?.subtitle || '');
      setTagline(data.hero?.tagline || '');
      setRecentWorks((data.recent_works || []).map((item: { title: string; year: number }) => ({ title: item.title, year: String(item.year) })));
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true); setError(null); setSuccess(null);
    const response = await fetch('/api/admin/home', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hero: { name, title, subtitle, tagline }, recent_works: recentWorks.map((item) => ({ title: item.title, year: Number(item.year) })) }),
    });
    const data = await response.json();
    if (response.ok) setSuccess('Saved'); else setError(data.error || 'Failed to save');
    setSaving(false);
  };

  if (loading) return <div className="text-sm" style={{ color: '#555' }}>Loading…</div>;
  return (
    <div>
      <h1 className="mb-6 text-lg" style={{ color: '#e5e5e5' }}>Home page</h1>
      <AdminForm onSave={save} saving={saving} error={error} success={success}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AdminInput label="Name" value={name} onChange={setName} required />
          <AdminInput label="Title" value={title} onChange={setTitle} required />
          <AdminInput label="Subtitle" value={subtitle} onChange={setSubtitle} required />
          <AdminInput label="Tagline" value={tagline} onChange={setTagline} required />
        </div>
        <AdminObjectList<RecentWork>
          label="Recent works"
          values={recentWorks}
          onChange={setRecentWorks}
          createValue={() => ({ title: '', year: String(new Date().getFullYear()) })}
          fields={[{ key: 'title', label: 'Title' }, { key: 'year', label: 'Year' }]}
          addLabel="Add work"
        />
      </AdminForm>
    </div>
  );
}
