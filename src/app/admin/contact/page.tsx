'use client';

import React, { useEffect, useState } from 'react';
import AdminInput from '../components/AdminInput';
import AdminForm from '../components/AdminForm';

export default function ContactAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [github, setGithub] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [soundcloud, setSoundcloud] = useState('');
  const [bandcamp, setBandcamp] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('');

  useEffect(() => {
    fetch('/api/admin/contact')
      .then(r => r.json())
      .then(data => {
        setEmail(data.email || '');
        setGithub(data.github || '');
        setWebsite(data.website || '');
        setLinkedin(data.linkedin || '');
        setSoundcloud(data.soundcloud || '');
        setBandcamp(data.bandcamp || '');
        setAvailabilityStatus(data.availability_status || '');
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          github: github || undefined,
          website: website || undefined,
          linkedin: linkedin || undefined,
          soundcloud: soundcloud || undefined,
          bandcamp: bandcamp || undefined,
          availability_status: availabilityStatus,
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

  if (loading) {
    return <div className="text-sm font-normal opacity-30">loading...</div>;
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xs font-normal uppercase tracking-wider opacity-40 mb-8">
        Contact
      </h1>

      <AdminForm onSave={handleSave} saving={saving} error={error} success={success}>
        <AdminInput label="Email" value={email} onChange={setEmail} type="email" required />
        <AdminInput label="GitHub" value={github} onChange={setGithub} placeholder="https://github.com/..." />
        <AdminInput label="Website" value={website} onChange={setWebsite} placeholder="https://..." />
        <AdminInput label="LinkedIn" value={linkedin} onChange={setLinkedin} placeholder="https://linkedin.com/in/..." />
        <AdminInput label="SoundCloud" value={soundcloud} onChange={setSoundcloud} />
        <AdminInput label="Bandcamp" value={bandcamp} onChange={setBandcamp} />
        <AdminInput label="Availability Status" value={availabilityStatus} onChange={setAvailabilityStatus} placeholder="e.g. Available for commissions" />
      </AdminForm>
    </div>
  );
}
