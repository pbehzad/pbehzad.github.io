'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminInput from '../../components/AdminInput';
import AdminTextarea from '../../components/AdminTextarea';
import AdminSelect from '../../components/AdminSelect';
import AdminForm from '../../components/AdminForm';
import AdminFileField from '../../components/AdminFileField';
import AdminStringList from '../../components/AdminStringList';
import AdminCheckbox from '../../components/AdminCheckbox';
import TiptapEditor from '../../components/TiptapEditor';

export default function NewText() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [type, setType] = useState('essay');
  const [description, setDescription] = useState('');
  const [abstract, setAbstract] = useState('');
  const [publishedIn, setPublishedIn] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [relatedCompositions, setRelatedCompositions] = useState<string[]>([]);
  const [htmlContent, setHtmlContent] = useState('');
  const [status, setStatus] = useState('draft');

  const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          year,
          type,
          description: description || null,
          abstract: abstract || null,
          published_in: publishedIn || null,
          external_url: externalUrl || null,
          pdf_url: pdfUrl || null,
          tags,
          featured,
          related_compositions: relatedCompositions,
          html_content: htmlContent || null,
          status,
        }),
      });

      if (res.ok) {
        router.push('/admin/texts');
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
      <h1 className="text-xs font-normal uppercase tracking-wider opacity-40 mb-8">
        New Text
      </h1>

      <AdminForm
        onSave={handleSave}
        onCancel={() => router.push('/admin/texts')}
        saving={saving}
        error={error}
      >
        <AdminInput label="Title" value={title} onChange={(v) => { setTitle(v); setSlug(toSlug(v)); }} required />
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
        <AdminFileField label="PDF" value={pdfUrl} onChange={setPdfUrl} kind="pdf" />
        <AdminStringList label="Tags" values={tags} onChange={setTags} placeholder="Add tag" />
        <AdminStringList label="Related composition IDs" values={relatedCompositions} onChange={setRelatedCompositions} placeholder="Add composition ID" />
        <AdminCheckbox label="Featured text" checked={featured} onChange={setFeatured} description="Show this text in featured placements on the public site." />
        <AdminTextarea label="Description" value={description} onChange={setDescription} rows={3} />
        <AdminTextarea label="Abstract" value={abstract} onChange={setAbstract} rows={4} />
        <div className="admin-field">
          <label className="admin-field-label">Content</label>
          <TiptapEditor content={htmlContent} onChange={setHtmlContent} placeholder="Write the text body in HTML…" />
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
