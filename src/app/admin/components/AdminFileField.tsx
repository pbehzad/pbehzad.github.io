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
        <label className="admin-field-label">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setLibraryOpen((open) => !open)}
          className="admin-button !min-h-0 !px-3 !py-1.5"
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
          className="admin-control"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="admin-button shrink-0"
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
