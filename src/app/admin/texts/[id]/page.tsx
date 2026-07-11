'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminInput from '../../components/AdminInput';
import AdminTextarea from '../../components/AdminTextarea';
import AdminSelect from '../../components/AdminSelect';
import AdminForm from '../../components/AdminForm';

export default function EditText() {
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
  const [type, setType] = useState('essay');
  const [description, setDescription] = useState('');
  const [abstract, setAbstract] = useState('');
  const [publishedIn, setPublishedIn] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    fetch(`/api/admin/texts?id=${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then(({ item, markdown: md }) => {
        if (item) {
          setTitle(item.title);
          setSlug(item.slug || '');
          setYear(String(item.year));
          setType(item.type);
          setDescription(item.description || '');
          setAbstract(item.abstract || '');
          setPublishedIn(item.published_in || '');
          setExternalUrl(item.external_url || '');
          setPdfUrl(item.pdf_url || '');
          setMarkdown(md || '');
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
      const res = await fetch('/api/admin/texts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title,
          slug,
          year,
          type,
          description: description || null,
          abstract: abstract || null,
          published_in: publishedIn || null,
          external_url: externalUrl || null,
          pdf_url: pdfUrl || null,
          markdown,
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

    await fetch('/api/admin/texts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    router.push('/admin/texts');
  };

  if (loading) {
    return <div className="text-sm font-normal opacity-30">loading...</div>;
  }

  return (
    <div>
      <h1 className="text-xs font-normal uppercase tracking-wider opacity-40 mb-8">
        Edit Text
      </h1>

      <AdminForm
        onSave={handleSave}
        onCancel={() => router.push('/admin/texts')}
        onDelete={handleDelete}
        saving={saving}
        error={error}
        success={success}
      >
        <AdminInput label="Title" value={title} onChange={setTitle} required />
        <AdminInput label="Slug (URL)" value={slug} onChange={setSlug} />
        <AdminInput label="Year" value={year} onChange={setYear} type="number" required />
        <AdminSelect
          label="Type"
          value={type}
          onChange={setType}
          options={[
            { value: 'essay', label: 'Essay' },
            { value: 'article', label: 'Article' },
            { value: 'paper', label: 'Paper' },
            { value: 'note', label: 'Note' },
          ]}
        />
        <AdminInput label="Published in" value={publishedIn} onChange={setPublishedIn} />
        <AdminInput label="External URL" value={externalUrl} onChange={setExternalUrl} />
        <AdminInput label="PDF URL" value={pdfUrl} onChange={setPdfUrl} />
        <AdminTextarea label="Description" value={description} onChange={setDescription} rows={3} />
        <AdminTextarea label="Abstract" value={abstract} onChange={setAbstract} rows={4} />
        <AdminTextarea label="Content (Markdown)" value={markdown} onChange={setMarkdown} rows={18} />
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
