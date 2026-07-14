'use client';

import React, { useEffect, useState } from 'react';
import AdminTextarea from '../components/AdminTextarea';
import AdminInput from '../components/AdminInput';
import AdminForm from '../components/AdminForm';
import TiptapEditor from '../components/TiptapEditor';
import AdminStringList from '../components/AdminStringList';
import AdminObjectList from '../components/AdminObjectList';

type SkillRow = { category: string; items: string };
type EducationRow = { degree: string; institution: string; year: string };
type AwardRow = { title: string; year: string; organization: string };

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
  const [htmlContent, setHtmlContent] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [education, setEducation] = useState<EducationRow[]>([]);
  const [awards, setAwards] = useState<AwardRow[]>([]);

  useEffect(() => {
    fetch('/api/admin/profile')
      .then(r => r.json())
      .then(data => {
        setName(data.name || '');
        setTitle(data.title || '');
        setSubtitle(data.subtitle || '');
        setTagline(data.tagline || '');
        setBio(data.bio || '');
        setHtmlContent(data.html_content || '');
        setSpecializations(data.specializations || []);
        setSkills((data.skills || []).map((item: { category: string; items: string[] }) => ({ category: item.category, items: item.items.join(', ') })));
        setEducation(data.education || []);
        setAwards((data.awards || []).map((item: AwardRow) => ({ ...item, organization: item.organization || '' })));
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
          name,
          title,
          subtitle,
          tagline,
          bio,
          html_content: htmlContent || null,
          specializations,
          skills: skills.map((item) => ({ category: item.category, items: item.items.split(',').map((value) => value.trim()).filter(Boolean) })),
          education,
          awards: awards.map((item) => ({ ...item, organization: item.organization || undefined })),
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput label="Name" value={name} onChange={setName} required />
          <AdminInput label="Professional title" value={title} onChange={setTitle} />
          <AdminInput label="Subtitle" value={subtitle} onChange={setSubtitle} />
          <AdminInput label="Tagline" value={tagline} onChange={setTagline} />
        </div>
        <AdminTextarea label="Bio" value={bio} onChange={setBio} rows={6} />
        <AdminStringList label="Specializations" values={specializations} onChange={setSpecializations} placeholder="Add specialization" />
        <AdminObjectList<SkillRow>
          label="Skills"
          values={skills}
          onChange={setSkills}
          createValue={() => ({ category: '', items: '' })}
          fields={[{ key: 'category', label: 'Category' }, { key: 'items', label: 'Items', placeholder: 'Comma-separated' }]}
          addLabel="Add skill group"
        />
        <AdminObjectList<EducationRow>
          label="Education"
          values={education}
          onChange={setEducation}
          createValue={() => ({ degree: '', institution: '', year: '' })}
          fields={[{ key: 'degree', label: 'Degree' }, { key: 'institution', label: 'Institution' }, { key: 'year', label: 'Year' }]}
          addLabel="Add education"
        />
        <AdminObjectList<AwardRow>
          label="Awards"
          values={awards}
          onChange={setAwards}
          createValue={() => ({ title: '', year: '', organization: '' })}
          fields={[{ key: 'title', label: 'Award' }, { key: 'year', label: 'Year' }, { key: 'organization', label: 'Organization' }]}
          addLabel="Add award"
        />

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
