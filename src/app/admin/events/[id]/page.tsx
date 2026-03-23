'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminInput from '../../components/AdminInput';
import AdminTextarea from '../../components/AdminTextarea';
import AdminSelect from '../../components/AdminSelect';
import AdminForm from '../../components/AdminForm';
import TiptapEditor from '../../components/TiptapEditor';

export default function EditEvent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [role, setRole] = useState('');
  const [program, setProgram] = useState('');
  const [ensemble, setEnsemble] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    fetch('/api/admin/events')
      .then(r => r.json())
      .then(data => {
        const item = data.find((e: { id: string }) => e.id === id);
        if (item) {
          setTitle(item.title);
          setDate(item.date);
          setVenue(item.venue);
          setCity(item.city);
          setCountry(item.country || '');
          setRole(item.role);
          setProgram(item.program || '');
          setEnsemble(item.ensemble || '');
          setUrl(item.url || '');
          setDescription(item.description || '');
          setHtmlContent(item.html_content || '');
          setStatus(item.status);
        }
        setLoading(false);
      });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title,
          date,
          venue,
          city,
          country: country || null,
          role,
          program: program || null,
          ensemble: ensemble || null,
          url: url || null,
          description: description || null,
          html_content: htmlContent || null,
          status,
        }),
      });

      if (res.ok) {
        setSuccess('Saved');
        setTimeout(() => setSuccess(null), 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save');
      }
    } catch {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${title}"?`)) return;

    await fetch('/api/admin/events', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    router.push('/admin/events');
  };

  if (loading) {
    return <div className="text-sm font-normal opacity-30">loading...</div>;
  }

  return (
    <div>
      <h1 className="text-xs font-normal uppercase tracking-wider opacity-40 mb-8">
        Edit Event
      </h1>

      <AdminForm
        onSave={handleSave}
        onCancel={() => router.push('/admin/events')}
        onDelete={handleDelete}
        saving={saving}
        error={error}
        success={success}
      >
        <AdminInput label="Title" value={title} onChange={setTitle} required />
        <AdminInput label="Date" value={date} onChange={setDate} type="date" required />
        <AdminInput label="Venue" value={venue} onChange={setVenue} required />
        <AdminInput label="City" value={city} onChange={setCity} required />
        <AdminInput label="Country" value={country} onChange={setCountry} />
        <AdminInput label="Role" value={role} onChange={setRole} required />
        <AdminInput label="Program" value={program} onChange={setProgram} />
        <AdminInput label="Ensemble" value={ensemble} onChange={setEnsemble} />
        <AdminInput label="URL" value={url} onChange={setUrl} />
        <AdminTextarea label="Description" value={description} onChange={setDescription} rows={4} />
        <AdminSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
          ]}
        />
      </AdminForm>

      <div className="mt-8">
        <div className="text-xs font-normal uppercase tracking-wider opacity-40 mb-4">HTML Content</div>
        <TiptapEditor content={htmlContent} onChange={setHtmlContent} />
      </div>
    </div>
  );
}
