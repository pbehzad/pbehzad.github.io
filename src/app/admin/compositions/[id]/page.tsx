'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminInput from '../../components/AdminInput';
import AdminTextarea from '../../components/AdminTextarea';
import AdminSelect from '../../components/AdminSelect';
import AdminForm from '../../components/AdminForm';
import TiptapEditor from '../../components/TiptapEditor';
import AdminFileField from '../../components/AdminFileField';
import AdminFileListField from '../../components/AdminFileListField';
import AdminStringList from '../../components/AdminStringList';
import AdminCheckbox from '../../components/AdminCheckbox';

export default function EditComposition() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [year, setYear] = useState('');
  const [instruments, setInstruments] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [programNotes, setProgramNotes] = useState('');
  const [scoreUrl, setScoreUrl] = useState('');
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [premiereDate, setPremiereDate] = useState('');
  const [premiereLocation, setPremiereLocation] = useState('');
  const [premierePerformers, setPremierePerformers] = useState('');
  const [relatedTexts, setRelatedTexts] = useState<string[]>([]);
  const [htmlContent, setHtmlContent] = useState('');
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    fetch(`/api/admin/compositions/${id}`)
      .then(r => r.json())
      .then(item => {
        if (item && !item.error) {
          setTitle(item.title);
          setSlug(item.slug || '');
          setYear(item.year);
          setInstruments(item.instruments);
          setDuration(item.duration || '');
          setDescription(item.description || '');
          setProgramNotes(item.program_notes || '');
          setScoreUrl(item.score_url || '');
          setAudioUrls(item.audio_urls || []);
          setVideoUrl(item.video_url || '');
          setTags(item.tags || []);
          setFeatured(Boolean(item.featured));
          setPremiereDate(item.premiere?.date || '');
          setPremiereLocation(item.premiere?.location || '');
          setPremierePerformers(item.premiere?.performers || '');
          setRelatedTexts(item.related_texts || []);
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
          slug,
          year,
          instruments,
          duration: duration || null,
          description: description || null,
          program_notes: programNotes || null,
          score_url: scoreUrl || null,
          audio_urls: audioUrls,
          video_url: videoUrl || null,
          tags,
          featured,
          premiere: premiereDate || premiereLocation || premierePerformers ? {
            date: premiereDate,
            location: premiereLocation,
            performers: premierePerformers,
          } : null,
          related_texts: relatedTexts,
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
    return <div className="text-sm" style={{ color: '#555' }}>Loading…</div>;
  }

  return (
    <div>
      <h1 className="text-lg font-normal mb-6" style={{ color: '#e5e5e5' }}>
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
        {/* Metadata — compact grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminInput label="Title" value={title} onChange={setTitle} required />
          <AdminInput label="Date" value={year} onChange={setYear} type="date" required />
          <AdminInput label="Instruments" value={instruments} onChange={setInstruments} required />
          <AdminInput label="Duration" value={duration} onChange={setDuration} placeholder="e.g. 12'" />
        </div>

        <AdminInput label="Slug (URL)" value={slug} onChange={setSlug} placeholder="composition-url" />

        <div className="grid grid-cols-2 gap-4">
          <AdminTextarea label="Description" value={description} onChange={setDescription} rows={3} />
          <AdminTextarea label="Program Notes" value={programNotes} onChange={setProgramNotes} rows={3} />
        </div>

        <AdminFileField label="Score PDF" value={scoreUrl} onChange={setScoreUrl} kind="pdf" />
        <AdminFileListField label="Audio files" values={audioUrls} onChange={setAudioUrls} kind="audio" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput label="Video URL" value={videoUrl} onChange={setVideoUrl} placeholder="https://…" />
          <AdminStringList label="Tags" values={tags} onChange={setTags} placeholder="Add tag" />
        </div>

        <div className="rounded-lg p-4 flex flex-col gap-4" style={{ border: '1px solid #dcdad2', background: '#f7f6f2' }}>
          <span className="admin-field-label">Premiere</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminInput label="Date" value={premiereDate} onChange={setPremiereDate} type="date" />
            <AdminInput label="Location" value={premiereLocation} onChange={setPremiereLocation} />
            <AdminInput label="Performers" value={premierePerformers} onChange={setPremierePerformers} />
          </div>
        </div>

        <AdminStringList label="Related text IDs" values={relatedTexts} onChange={setRelatedTexts} placeholder="Add text ID" />
        <AdminCheckbox label="Featured composition" checked={featured} onChange={setFeatured} description="Show this work in featured placements on the public site." />

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
          <label className="admin-field-label">
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
