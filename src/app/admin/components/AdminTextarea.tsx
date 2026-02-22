'use client';

import React from 'react';

interface AdminTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}

export default function AdminTextarea({ label, value, onChange, rows = 4, placeholder }: AdminTextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-normal uppercase tracking-wider" style={{ color: '#888' }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="text-sm font-normal px-3 py-2 rounded outline-none transition-colors resize-vertical w-full"
        style={{
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          color: '#e5e5e5',
        }}
        onFocus={(e) => { e.target.style.borderColor = '#555'; }}
        onBlur={(e) => { e.target.style.borderColor = '#2a2a2a'; }}
      />
    </div>
  );
}
