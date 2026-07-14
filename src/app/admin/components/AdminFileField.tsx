'use client';

import React, { useState } from 'react';
import AdminFileLibrary from './AdminFileLibrary';

interface AdminFileFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  kind?: 'pdf' | 'image' | 'audio';
  placeholder?: string;
}

export default function AdminFileField({
  label,
  value,
  onChange,
  kind = 'pdf',
  placeholder = 'Choose a managed file or paste an external URL',
}: AdminFileFieldProps) {
  const [libraryOpen, setLibraryOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-normal uppercase tracking-wider" style={{ color: '#888' }}>
          {label}
        </label>
        <button
          type="button"
          onClick={() => setLibraryOpen((open) => !open)}
          className="text-[11px] font-normal"
          style={{ color: '#aaa', borderBottom: '1px solid #555' }}
        >
          {libraryOpen ? 'Close library' : 'Choose or upload'}
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded px-3 py-2 text-sm font-normal outline-none transition-colors"
          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e5e5e5' }}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="shrink-0 rounded px-3 py-2 text-xs font-normal"
            style={{ background: 'transparent', border: '1px solid #333', color: '#888' }}
          >
            Clear
          </button>
        )}
      </div>

      {libraryOpen && (
        <AdminFileLibrary
          kind={kind}
          selectedUrl={value}
          onSelect={(file) => {
            onChange(file.url);
            setLibraryOpen(false);
          }}
        />
      )}
    </div>
  );
}
