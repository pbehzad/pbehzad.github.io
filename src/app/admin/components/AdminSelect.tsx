'use client';

import React from 'react';

interface AdminSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export default function AdminSelect({ label, value, onChange, options }: AdminSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-normal uppercase tracking-wider" style={{ color: '#888' }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm font-normal px-3 py-2 rounded outline-none transition-colors w-full"
        style={{
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          color: '#e5e5e5',
        }}
        onFocus={(e) => { e.target.style.borderColor = '#555'; }}
        onBlur={(e) => { e.target.style.borderColor = '#2a2a2a'; }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: '#1a1a1a' }}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
