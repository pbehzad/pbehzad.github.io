'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminInput from '../../components/AdminInput';
import AdminTextarea from '../../components/AdminTextarea';
import AdminSelect from '../../components/AdminSelect';
import AdminForm from '../../components/AdminForm';
import TiptapEditor from '../../components/TiptapEditor';

export default function EditComposition() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [instruments, setInstruments] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [programNotes, setProgramNotes] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    fetch(`/api/admin/compositions/${id}`)
      .then(r => r.json())
      .then(item => {
        if (item && !item.error) {
          setTitle(item.title);
          setYear(item.year);
          setInstruments(item.instruments);
          setDuration(item.duration || '');
          setDescription(item.description || '');
          setProgramNotes(item.program_notes || '');
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
      const res = await fetch('/api/admin/compositions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title,
          year,
          instruments,
          duration: duration || null,
          description: description || null,
          program_notes: programNotes || null,
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

    await fetch('/api/admin/compositions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    router.push('/admin/compositions');
  };

  if (loading) {
    return <div className="text-sm font-normal opacity-30">loading...</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xs font-normal uppercase tracking-wider opacity-40 mb-8">
        Edit Composition
      </h1>

      <AdminForm
        onSave={handleSave}
        onCancel={() => router.push('/admin/compositions')}
        onDelete={handleDelete}
        saving={saving}
        error={error}
        success={success}
      >
        <AdminInput label="Title" value={title} onChange={setTitle} required />
        <AdminInput label="Date" value={year} onChange={setYear} type="date" required />
        <AdminInput label="Instruments" value={instruments} onChange={setInstruments} required />
        <AdminInput label="Duration" value={duration} onChange={setDuration} placeholder="e.g. 12'" />
        <AdminTextarea label="Description" value={description} onChange={setDescription} />
        <AdminTextarea label="Program Notes" value={programNotes} onChange={setProgramNotes} rows={6} />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-normal uppercase tracking-wider opacity-40">
            Content
          </label>
          <TiptapEditor
            content={htmlContent}
            onChange={setHtmlContent}
            placeholder="Write detailed composition page content..."
          />
        </div>

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
    </div>
  );
}
