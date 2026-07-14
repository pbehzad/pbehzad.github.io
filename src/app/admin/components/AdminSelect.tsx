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
    <div className="admin-field">
      <label className="admin-field-label">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="admin-control"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
