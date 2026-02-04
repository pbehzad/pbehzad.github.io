'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminInput from '../../components/AdminInput';
import AdminTextarea from '../../components/AdminTextarea';
import AdminSelect from '../../components/AdminSelect';
import AdminForm from '../../components/AdminForm';
import TiptapEditor from '../../components/TiptapEditor';

export default function NewComposition() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [year, setYear] = useState(new Date().toISOString().split('T')[0]);
  const [instruments, setInstruments] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [programNotes, setProgramNotes] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [status, setStatus] = useState('draft');

  const handleSave = async () => {
    if (!title || !instruments) {
      setError('Title and instruments are required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/compositions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        router.push('/admin/compositions');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create');
      }
    } catch {
      setError('Failed to create');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xs font-normal uppercase tracking-wider opacity-40 mb-8">
        New Composition
      </h1>

      <AdminForm
        onSave={handleSave}
        onCancel={() => router.push('/admin/compositions')}
        saving={saving}
        error={error}
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
