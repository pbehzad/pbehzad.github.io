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
    <div className="admin-field">
      <label className="admin-field-label">
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="admin-control"
      />
    </div>
  );
}
