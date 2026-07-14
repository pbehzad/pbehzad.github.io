'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminForm from '../components/AdminForm';
import AdminInput from '../components/AdminInput';
import AdminTextarea from '../components/AdminTextarea';
import AdminSelect from '../components/AdminSelect';
import AdminCheckbox from '../components/AdminCheckbox';
import AdminStringList from '../components/AdminStringList';
import AdminFileField from '../components/AdminFileField';

export default function ToolEditor({ id }: { id?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [url, setUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/tools?id=${encodeURIComponent(id)}`).then((response) => response.json()).then((item) => {
      if (item.error) setError(item.error);
      else {
        setName(item.name || ''); setSlug(item.slug || ''); setYear(item.year || '');
        setDescription(item.description || ''); setCategory(item.category || 'other');
        setTechnologies(item.technologies || []); setUrl(item.url || ''); setGithubUrl(item.github_url || '');
        setImageUrl(item.image_url || ''); setFeatured(Boolean(item.featured)); setStatus(item.status || 'draft');
      }
      setLoading(false);
    });
  }, [id]);

  const save = async () => {
    if (!name) { setError('Name is required'); return; }
    setSaving(true); setError(null); setSuccess(null);
    const response = await fetch('/api/admin/tools', {
      method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, slug, year, description: description || null, category, technologies, url: url || null, github_url: githubUrl || null, image_url: imageUrl || null, featured, status }),
    });
    const data = await response.json();
    if (response.ok) {
      if (!id) router.push('/admin/tools'); else setSuccess('Saved');
    } else setError(data.error || 'Failed to save');
    setSaving(false);
  };

  const remove = id ? async () => {
    if (!confirm(`Delete "${name}"?`)) return;
    await fetch('/api/admin/tools', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    router.push('/admin/tools');
  } : undefined;

  if (loading) return <div className="text-sm" style={{ color: '#555' }}>Loading…</div>;
  return (
    <div>
      <h1 className="mb-6 text-lg" style={{ color: '#e5e5e5' }}>{id ? 'Edit tool' : 'New tool'}</h1>
      <AdminForm onSave={save} onCancel={() => router.push('/admin/tools')} onDelete={remove} saving={saving} error={error} success={success}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AdminInput label="Name" value={name} onChange={setName} required />
          <AdminInput label="Slug (URL)" value={slug} onChange={setSlug} placeholder="Generated from name if blank" />
          <AdminInput label="Year" value={year} onChange={setYear} />
        </div>
        <AdminTextarea label="Description" value={description} onChange={setDescription} rows={4} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AdminSelect label="Category" value={category} onChange={setCategory} options={[
            { value: 'web-audio', label: 'Web Audio' }, { value: 'max-msp', label: 'Max/MSP' },
            { value: 'notation', label: 'Notation' }, { value: 'composition', label: 'Composition' }, { value: 'other', label: 'Other' },
          ]} />
          <AdminSelect label="Status" value={status} onChange={setStatus} options={[
            { value: 'draft', label: 'Draft' }, { value: 'in-progress', label: 'In progress' },
            { value: 'published', label: 'Published' }, { value: 'archived', label: 'Archived' },
          ]} />
        </div>
        <AdminStringList label="Technologies" values={technologies} onChange={setTechnologies} placeholder="Add technology" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AdminInput label="Project URL" value={url} onChange={setUrl} placeholder="https://…" />
          <AdminInput label="GitHub URL" value={githubUrl} onChange={setGithubUrl} placeholder="https://…" />
        </div>
        <AdminFileField label="Cover image" value={imageUrl} onChange={setImageUrl} kind="image" />
        <AdminCheckbox label="Featured tool" checked={featured} onChange={setFeatured} description="Show this tool in featured placements on the public site." />
      </AdminForm>
    </div>
  );
}
