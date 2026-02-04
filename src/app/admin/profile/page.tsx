'use client';

import React, { useEffect, useState } from 'react';
import AdminInput from '../components/AdminInput';
import AdminTextarea from '../components/AdminTextarea';
import AdminForm from '../components/AdminForm';

export default function ProfileAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [specializations, setSpecializations] = useState('');
  const [skillsRaw, setSkillsRaw] = useState('');

  useEffect(() => {
    fetch('/api/admin/profile')
      .then(r => r.json())
      .then(data => {
        setName(data.name || '');
        setTitle(data.title || '');
        setSubtitle(data.subtitle || '');
        setTagline(data.tagline || '');
        setBio(data.bio || '');
        setSpecializations((data.specializations || []).join('\n'));
        setSkillsRaw(
          (data.skills || [])
            .map((g: { category: string; items: string[] }) => `${g.category}: ${g.items.join(', ')}`)
            .join('\n')
        );
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const skills = skillsRaw
      .split('\n')
      .filter(line => line.includes(':'))
      .map(line => {
        const [category, ...rest] = line.split(':');
        return {
          category: category.trim(),
          items: rest.join(':').split(',').map(s => s.trim()).filter(Boolean),
        };
      });

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          title,
          subtitle,
          tagline,
          bio,
          specializations: specializations.split('\n').map(s => s.trim()).filter(Boolean),
          skills,
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
        Profile
      </h1>

      <AdminForm onSave={handleSave} saving={saving} error={error} success={success}>
        <AdminInput label="Name" value={name} onChange={setName} />
        <AdminInput label="Title" value={title} onChange={setTitle} />
        <AdminInput label="Subtitle" value={subtitle} onChange={setSubtitle} />
        <AdminInput label="Tagline" value={tagline} onChange={setTagline} />
        <AdminTextarea label="Bio" value={bio} onChange={setBio} rows={6} />
        <AdminTextarea
          label="Specializations (one per line)"
          value={specializations}
          onChange={setSpecializations}
          rows={4}
        />
        <AdminTextarea
          label="Skills (format: Category: item1, item2)"
          value={skillsRaw}
          onChange={setSkillsRaw}
          rows={6}
          placeholder="Composition: orchestral, chamber, electronic&#10;Technology: Max/MSP, Web Audio"
        />
      </AdminForm>
    </div>
  );
}
