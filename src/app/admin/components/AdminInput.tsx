'use client';

import React from 'react';

interface AdminInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

export default function AdminInput({ label, value, onChange, type = 'text', placeholder, required }: AdminInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-normal uppercase tracking-wider" style={{ color: '#888' }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="text-sm font-normal px-3 py-2 rounded outline-none transition-colors w-full"
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
