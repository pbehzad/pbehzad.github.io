'use client';

import { useState } from 'react';

interface AdminStringListProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}

export default function AdminStringList({
  label,
  values,
  onChange,
  placeholder = 'Add a value',
  addLabel = 'Add',
}: AdminStringListProps) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const value = draft.trim();
    if (!value || values.includes(value)) return;
    onChange([...values, value]);
    setDraft('');
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase tracking-wider" style={{ color: '#888' }}>{label}</label>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span key={value} className="flex items-center gap-2 rounded px-2.5 py-1 text-xs" style={{ background: '#1b1b1b', color: '#ccc' }}>
              {value}
              <button type="button" onClick={() => onChange(values.filter((item) => item !== value))} aria-label={`Remove ${value}`} style={{ color: '#777' }}>×</button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded px-3 py-2 text-sm outline-none"
          style={{ background: '#111', border: '1px solid #292929', color: '#eee' }}
        />
        <button type="button" onClick={add} className="rounded px-4 py-2 text-xs" style={{ background: '#242424', color: '#ddd' }}>{addLabel}</button>
      </div>
    </div>
  );
}
