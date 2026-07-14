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
        <label className="admin-field-label">{label}</label>
        <button type="button" onClick={() => setOpen(true)} className="admin-button !min-h-0 !px-3 !py-1.5">Choose or upload</button>
      </div>
      {values.length === 0 ? (
        <div className="rounded-lg border border-dashed px-3 py-4 text-center text-xs" style={{ borderColor: '#c8c5bb', color: '#77766f' }}>No files selected.</div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {values.map((value) => (
            <div key={value} className="flex items-center gap-3 rounded-lg border px-3 py-2.5" style={{ background: '#fff', borderColor: '#dcdad2' }}>
              <span className="min-w-0 flex-1 truncate text-xs" style={{ color: '#55544e' }}>{value}</span>
              <button type="button" onClick={() => onChange(values.filter((item) => item !== value))} className="text-xs" style={{ color: '#963a32' }}>Remove</button>
            </div>
          ))}
        </div>
      )}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,.82)' }} onMouseDown={() => setOpen(false)}>
          <div className="max-h-[88vh] w-full max-w-5xl overflow-auto rounded-xl p-5" style={{ background: '#f2f1ed', border: '1px solid #dcdad2' }} onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium" style={{ color: '#292824' }}>Select {label}</h2>
              <button type="button" onClick={() => setOpen(false)} className="admin-button !min-h-0 !px-3 !py-1.5">Close</button>
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
