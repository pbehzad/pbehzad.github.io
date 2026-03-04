'use client';

import React, { useEffect, useState } from 'react';
import AdminTextarea from '../components/AdminTextarea';
import AdminForm from '../components/AdminForm';
import TiptapEditor from '../components/TiptapEditor';

export default function ProfileAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Visible fields
  const [bio, setBio] = useState('');
  const [htmlContent, setHtmlContent] = useState('');

  // Hidden fields — preserved on save so existing data is not lost
  const [preserved, setPreserved] = useState<Record<string, unknown>>({});

  useEffect(() => {
    fetch('/api/admin/profile')
      .then(r => r.json())
      .then(data => {
        setBio(data.bio || '');
        setHtmlContent(data.html_content || '');
        const { bio: _b, html_content: _h, ...rest } = data;
        setPreserved(rest);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...preserved,
          bio,
          html_content: htmlContent || null,
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
    return <div className="text-sm" style={{ color: '#555' }}>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-lg font-normal mb-6" style={{ color: '#e5e5e5' }}>
        Profile
      </h1>

      <AdminForm onSave={handleSave} saving={saving} error={error} success={success}>
        <AdminTextarea label="Bio" value={bio} onChange={setBio} rows={6} />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-normal uppercase tracking-wider" style={{ color: '#888' }}>
            Content
          </label>
          <TiptapEditor
            content={htmlContent}
            onChange={setHtmlContent}
            placeholder="Additional HTML content for the About page..."
          />
        </div>
      </AdminForm>
    </div>
  );
}
