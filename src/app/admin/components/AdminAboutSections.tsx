'use client';

import TiptapEditor from './TiptapEditor';
import AdminInput from './AdminInput';
import AdminCheckbox from './AdminCheckbox';
import AdminFileField from './AdminFileField';
import type { AboutSection } from '@/data/types/profile.types';

interface AdminAboutSectionsProps {
  sections: AboutSection[];
  onChange: (sections: AboutSection[]) => void;
}

function newSection(): AboutSection {
  return {
    id: `section-${Date.now().toString(36)}`,
    title: 'New section',
    html_content: '',
    link_url: null,
    link_label: '',
    visible: true,
    initially_open: false,
  };
}

export default function AdminAboutSections({ sections, onChange }: AdminAboutSectionsProps) {
  const update = (index: number, patch: Partial<AboutSection>) => {
    onChange(sections.map((section, itemIndex) => itemIndex === index ? { ...section, ...patch } : section));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="admin-field-label">Additional About sections</div>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: '#77766f' }}>
            Ordered sections shown after the short bio, such as Long bio, German bio, or CV.
          </p>
        </div>
        <button type="button" onClick={() => onChange([...sections, newSection()])} className="admin-button shrink-0">+ Add section</button>
      </div>

      {sections.length === 0 && (
        <div className="rounded-lg border border-dashed px-4 py-8 text-center text-xs" style={{ borderColor: '#c8c5bb', color: '#77766f' }}>
          No additional About sections yet.
        </div>
      )}

      {sections.map((section, index) => (
        <section key={section.id} className="rounded-xl border p-4" style={{ borderColor: '#dcdad2', background: '#f7f6f2' }}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-medium" style={{ color: '#55544e' }}>Section {index + 1}</span>
            <div className="flex gap-1.5">
              <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="admin-button !min-h-0 !px-2.5 !py-1.5 disabled:opacity-30" aria-label="Move section up">↑</button>
              <button type="button" disabled={index === sections.length - 1} onClick={() => move(index, 1)} className="admin-button !min-h-0 !px-2.5 !py-1.5 disabled:opacity-30" aria-label="Move section down">↓</button>
              <button type="button" onClick={() => onChange(sections.filter((_, itemIndex) => itemIndex !== index))} className="admin-button admin-button-danger !min-h-0 !py-1.5">Remove</button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <AdminInput label="Section title" value={section.title} onChange={(title) => update(index, { title })} required />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AdminCheckbox label="Visible" checked={section.visible} onChange={(visible) => update(index, { visible })} description="Show this section publicly." />
              <AdminCheckbox label="Open by default" checked={Boolean(section.initially_open)} onChange={(initially_open) => update(index, { initially_open })} description="Expand this section when About opens." />
            </div>
            <div className="admin-field">
              <label className="admin-field-label">Section content</label>
              <TiptapEditor content={section.html_content} onChange={(html_content) => update(index, { html_content })} placeholder="Write this About section in HTML…" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AdminInput label="Link label" value={section.link_label || ''} onChange={(link_label) => update(index, { link_label })} placeholder="e.g. Download CV" />
              <AdminFileField label="Optional PDF or link" value={section.link_url || ''} onChange={(linkUrl) => update(index, { link_url: linkUrl || null })} kind="pdf" />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
