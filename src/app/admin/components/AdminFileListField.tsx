'use client';

import { useState } from 'react';
import AdminFileLibrary, { type FileKind } from './AdminFileLibrary';

interface AdminFileListFieldProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  kind: FileKind;
}

export default function AdminFileListField({ label, values, onChange, kind }: AdminFileListFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-wider" style={{ color: '#888' }}>{label}</label>
        <button type="button" onClick={() => setOpen(true)} className="text-xs" style={{ color: '#aaa' }}>Choose or upload</button>
      </div>
      {values.length === 0 ? (
        <div className="rounded px-3 py-3 text-xs" style={{ border: '1px dashed #333', color: '#666' }}>No files selected.</div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {values.map((value) => (
            <div key={value} className="flex items-center gap-3 rounded px-3 py-2" style={{ background: '#111', border: '1px solid #292929' }}>
              <span className="min-w-0 flex-1 truncate text-xs" style={{ color: '#bbb' }}>{value}</span>
              <button type="button" onClick={() => onChange(values.filter((item) => item !== value))} className="text-xs" style={{ color: '#888' }}>Remove</button>
            </div>
          ))}
        </div>
      )}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,.82)' }} onMouseDown={() => setOpen(false)}>
          <div className="max-h-[88vh] w-full max-w-5xl overflow-auto rounded-lg p-5" style={{ background: '#0d0d0d', border: '1px solid #333' }} onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm" style={{ color: '#eee' }}>Select {label}</h2>
              <button type="button" onClick={() => setOpen(false)} style={{ color: '#888' }}>Close</button>
            </div>
            <AdminFileLibrary
              kind={kind}
              showDelete={false}
              onSelect={(file) => {
                if (!values.includes(file.url)) onChange([...values, file.url]);
                setOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
