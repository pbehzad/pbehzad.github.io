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
    <div className="admin-field">
      <label className="admin-field-label">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="admin-control resize-y"
      />
    </div>
  );
}
