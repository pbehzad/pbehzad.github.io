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
      <label className="admin-field-label">{label}</label>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span key={value} className="flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs" style={{ background: '#f5f4ef', borderColor: '#dcdad2', color: '#4b4a44' }}>
              {value}
              <button type="button" onClick={() => onChange(values.filter((item) => item !== value))} aria-label={`Remove ${value}`} style={{ color: '#8b8980' }}>×</button>
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
          className="admin-control min-w-0 flex-1"
        />
        <button type="button" onClick={add} className="admin-button">{addLabel}</button>
      </div>
    </div>
  );
}
