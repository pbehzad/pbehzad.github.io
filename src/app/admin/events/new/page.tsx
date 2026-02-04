'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminInput from '../../components/AdminInput';
import AdminSelect from '../../components/AdminSelect';
import AdminForm from '../../components/AdminForm';

export default function NewEvent() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [role, setRole] = useState('Composer');
  const [program, setProgram] = useState('');
  const [ensemble, setEnsemble] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('draft');

  const handleSave = async () => {
    if (!title || !date || !venue || !city || !role) {
      setError('Title, date, venue, city, and role are required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          date,
          venue,
          city,
          country: country || null,
          role,
          program: program || null,
          ensemble: ensemble || null,
          url: url || null,
          status,
        }),
      });

      if (res.ok) {
        router.push('/admin/events');
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
    <div className="max-w-lg">
      <h1 className="text-xs font-normal uppercase tracking-wider opacity-40 mb-8">
        New Event
      </h1>

      <AdminForm
        onSave={handleSave}
        onCancel={() => router.push('/admin/events')}
        saving={saving}
        error={error}
      >
        <AdminInput label="Title" value={title} onChange={setTitle} required />
        <AdminInput label="Date" value={date} onChange={setDate} type="date" required />
        <AdminInput label="Venue" value={venue} onChange={setVenue} required />
        <AdminInput label="City" value={city} onChange={setCity} required />
        <AdminInput label="Country" value={country} onChange={setCountry} />
        <AdminInput label="Role" value={role} onChange={setRole} required />
        <AdminInput label="Program" value={program} onChange={setProgram} placeholder="piece being performed" />
        <AdminInput label="Ensemble" value={ensemble} onChange={setEnsemble} />
        <AdminInput label="URL" value={url} onChange={setUrl} placeholder="https://..." />
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
