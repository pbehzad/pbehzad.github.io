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
    <div>
      <h1 className="text-lg font-normal mb-6" style={{ color: '#e5e5e5' }}>
        New Composition
      </h1>

      <AdminForm
        onSave={handleSave}
        onCancel={() => router.push('/admin/compositions')}
        saving={saving}
        error={error}
      >
        {/* Metadata — compact grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminInput label="Title" value={title} onChange={setTitle} required />
          <AdminInput label="Date" value={year} onChange={setYear} type="date" required />
          <AdminInput label="Instruments" value={instruments} onChange={setInstruments} required />
          <AdminInput label="Duration" value={duration} onChange={setDuration} placeholder="e.g. 12'" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AdminTextarea label="Description" value={description} onChange={setDescription} rows={3} />
          <AdminTextarea label="Program Notes" value={programNotes} onChange={setProgramNotes} rows={3} />
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

        {/* Full-width HTML editor */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-normal uppercase tracking-wider" style={{ color: '#888' }}>
            Content
          </label>
          <TiptapEditor
            content={htmlContent}
            onChange={setHtmlContent}
            placeholder="Write detailed composition page content..."
          />
        </div>
      </AdminForm>
    </div>
  );
}
